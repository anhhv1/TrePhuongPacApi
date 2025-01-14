import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products, ProductsDocument } from './products.schema';
import { Model } from 'mongoose';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import { Observable } from 'rxjs';
import PaginationHelper from '~/helpers/pagination.helper';
import { FindPaginateProduct } from './dto';
import { escapeRegex } from '~/helpers';
import { Categories } from '../categories/categories.schema';
import { Uploads } from '../upload/upload.schema';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) readonly productsModel: Model<ProductsDocument>,
    @InjectModel(Categories.name) private categoryModel: Model<Categories>,
    @InjectModel(Uploads.name) private uploadModel: Model<Uploads>
  ) { }

  private readonly SPECIAL_CATEGORIES = ['Đũa tre', 'Thớt tre', 'Thìa', 'Bát', 'Cốc'];

  async create(createProductDto: CreateProductDto): Promise<AppResponse<Products> | Observable<never>> {
    const { name } = createProductDto;
    const nameTrim = name.trim();

    return {
      content: await this.productsModel.create({
        ...createProductDto,
        name: nameTrim,
      }),
    };
  }

  async findPaginateProducts(dto: FindPaginateProduct): Promise<AppResponse<PaginationResponse<Products>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Products, FindPaginateProduct>(dto);

    const { name, type } = dto;

    if (name) {
      match.name = { $regex: new RegExp(escapeRegex(name), 'i') };
    }

    if (type) {
      match.type = { $regex: new RegExp(escapeRegex(type), 'i') };
    }

    const [products, count] = await Promise.all([
      this.productsModel
        .find(match)
        .populate('categoryId', 'name')
        .sort({ createdAt: 'desc' })
        .limit(perPage)
        .skip(skip)
        .lean({ virtuals: true }),
      this.productsModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({
        page: page,
        data: products,
        perPage: perPage,
        total: count,
      }),
    };
  }

  async findOne(id: string): Promise<AppResponse<Products> | Observable<never>> {
    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const populatedProduct = await this.productsModel
      .findById(id)
      .populate('categoryId', 'name')
      .lean({ virtuals: true });

    return {
      content: populatedProduct,
    };
  }

  async findByField(filter: object): Promise<Products | Observable<never>> {
    const product = await this.productsModel.findOne(filter).lean({ virtuals: true });

    if (!product) {
      throw new BadRequestException('Product not exist');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<AppResponse<Products | null> | Observable<never>> {
    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const data: any = { ...updateProductDto };

    const updatedProduct = await this.productsModel
      .findByIdAndUpdate({ _id: id }, { $set: data }, { new: true })
      .populate('categoryId', 'name')
      .lean({ virtuals: true });

    return {
      content: updatedProduct,
    };
  }

  async remove(id: string) {
    const product = await this.productsModel.findOne({
      _id: id,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return {
      content: await this.productsModel.findByIdAndRemove({ _id: id }),
    };
  }

  async findAll() {
    return {
      content: await this.productsModel
        .find({ quantity: { $gt: 0 } }) // Only return products with quantity > 0
        .populate('categoryId', 'name')
        .sort({ createdAt: 'desc' })
        .lean({ virtuals: true }),
    };
  }

  async findByCategory(categoryId: string) {
    const products = await this.productsModel
      .find({ categoryId })
      .populate('categoryId', 'name')
      .sort({ createdAt: 'desc' })
      .lean({ virtuals: true });

    return {
      content: products,
    };
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]+/g, '') // Remove invalid characters
      .replace(/\s+/g, '_')          // Replace spaces with underscore
      .replace(/,/g, '')             // Remove commas
      .replace(/=/g, '_')            // Replace = with underscore
      .normalize('NFD')              // Normalize Unicode
      .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accents
      .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Replace đ/Đ
  }

  private extractCategoryName(folderName: string): string {
    // Remove number prefix
    const nameWithoutNumber = folderName.substring(folderName.indexOf(' ') + 1);

    // Check if folder name contains special categories
    for (const specialCat of this.SPECIAL_CATEGORIES) {
      if (nameWithoutNumber.toLowerCase().startsWith(specialCat.toLowerCase())) {
        return specialCat;
      }
    }
    return 'Khác';
  }

  async importData(basePath: string) {
    try {
      const categories = fs.readdirSync(basePath);
      const importResults = {
        success: [] as string[],
        skipped: [] as string[],
        failed: [] as string[]
      };
  
      const categoryGroups = new Map<string, string[]>();
  
      // Helper function to generate random product data with fixed discount rates
      const generateRandomProductData = () => {
        const price = Math.floor(Math.random() * (1000000 - 10000) + 10000); // Random price between 10,000 and 1,000,000
        const quantity = Math.floor(Math.random() * 100) + 1; // Random quantity between 1 and 100
        
        // Fixed discount percentages
        const discountRates = [5, 10, 15, 20];
        const discount = discountRates[Math.floor(Math.random() * discountRates.length)];
        // const discount = Math.floor(price * (selectedRate / 100)); // Calculate discount based on selected rate
        
        return {
          price,
          quantity,
          discount
        };
      };
  
      // Group folders by category
      for (const folder of categories) {
        if (fs.statSync(path.join(basePath, folder)).isDirectory()) {
          const categoryName = this.extractCategoryName(folder);
          if (!categoryGroups.has(categoryName)) {
            categoryGroups.set(categoryName, []);
          }
          categoryGroups.get(categoryName)?.push(folder);
        }
      }
  
      // Import each category and its products
      for (const [categoryName, folders] of categoryGroups) {
        try {
          // Check if category exists
          let existingCategory = await this.categoryModel.findOne({
            name: categoryName
          });
  
          let category;
          if (existingCategory) {
            category = existingCategory;
            console.log(`Category "${categoryName}" already exists, updating...`);
          } else {
            const slug = this.generateSlug(categoryName);

            // Create new category without image first
            category = await this.categoryModel.create({
              name: categoryName,
              image: 'example.png',
              slug: slug,
            });
          }
  
          // Get first image from first folder for category thumbnail
          const firstFolder = folders[0];
          const folderPath = path.join(basePath, firstFolder);
          const productImages = fs.readdirSync(folderPath);
  
          if (productImages.length > 0) {
            // Upload first image as category image
            const firstImage = productImages[0];
            const imagePath = path.join(folderPath, firstImage);
  
            const timestamp = Math.floor(Date.now() / 1000);
            const sanitizedCategory = this.sanitizeFileName(categoryName);
            const sanitizedImageName = this.sanitizeFileName(firstImage);
            const categoryImageName = `category_${sanitizedCategory}_${timestamp}_${sanitizedImageName}`;
  
            const uploadDir = './uploads/images';
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
  
            const categoryImagePath = path.join(uploadDir, categoryImageName);
  
            await fs.promises.copyFile(imagePath, categoryImagePath);
            await this.categoryModel.findByIdAndUpdate({ _id: category._id }, {
              image: categoryImageName,
              name: category?.name,
              slug: category?.slug || this.generateSlug(category?.name) // Ensure slug exists even when updating
            });
            await this.uploadModel.create({
              filename: categoryImageName,
              mimetype: mime.lookup(imagePath) || 'image/jpeg',
              path: categoryImagePath,
              size: fs.statSync(imagePath).size,
            });
          }
  
          // Import products for each folder
          for (const folder of folders) {
            const folderPath = path.join(basePath, folder);
            const productImages = fs.readdirSync(folderPath);
  
            const uploadedImages = await Promise.all(
              productImages.map(async (imageName) => {
                const imagePath = path.join(folderPath, imageName);
                const fileStats = fs.statSync(imagePath);
  
                const timestamp = Math.floor(Date.now() / 1000);
                const sanitizedCategory = this.sanitizeFileName(categoryName);
                const sanitizedImageName = this.sanitizeFileName(imageName);
                const newFilename = `${sanitizedCategory}_${timestamp}_${sanitizedImageName}`;
  
                const uploadDir = './uploads/images';
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }
  
                const uploadPath = path.join(uploadDir, newFilename);
                await fs.promises.copyFile(imagePath, uploadPath);
                const uploadData = await this.uploadModel.create({
                  filename: newFilename,
                  mimetype: mime.lookup(imagePath) || 'image/jpeg',
                  path: uploadPath,
                  size: fileStats.size,
                });
  
                return uploadData;
              })
            );
  
            // Generate random product data with fixed discount rates
            const { price, quantity, discount } = generateRandomProductData();
  
            // Create product with random data
            await this.productsModel.create({
              name: folder.substring(folder.indexOf(' ') + 1),
              categoryId: category._id,
              images: uploadedImages.map((image) => image.filename),
              imageIds: uploadedImages.map((image) => image._id),
              thumbnails: uploadedImages.length > 0 ? [uploadedImages[0]?.filename] : [],
              price,
              quantity,
              discount,
              type: categoryName // Using category name as product type
            });
  
            console.log(`Created product with price: ${price}, quantity: ${quantity}, discount: ${discount} (${Math.round((discount/price) * 100)}% off)`);
          }
  
          console.log(`Successfully imported category: ${categoryName}`);
          importResults.success.push(categoryName);
  
        } catch (error) {
          console.error(`Failed to import category ${categoryName}:`, error);
          importResults.failed.push(categoryName);
        }
      }
  
      return {
        message: 'Import completed',
        results: {
          total: categoryGroups.size,
          success: importResults.success.length,
          skipped: importResults.skipped.length,
          failed: importResults.failed.length,
          details: {
            successList: importResults.success,
            skippedList: importResults.skipped,
            failedList: importResults.failed
          }
        }
      };
  
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  
  private generateSlug(name: string): string {
    return name
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove any remaining non-alphanumeric characters except hyphens
      .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single hyphen
  }
}