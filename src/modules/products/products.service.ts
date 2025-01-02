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
import { ProductType } from '~/constants';
import { Categories } from '../categories/categories.schema';
import * as fs from 'fs';
import * as path from 'path';
import { Uploads } from '../upload/upload.schema';
import mime from 'mime';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) readonly productsModel: Model<ProductsDocument>,
    @InjectModel(Categories.name) private categoryModel: Model<Categories>,
    @InjectModel(Uploads.name) private uploadModel: Model<Uploads>

  ) {}
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
    const { name } = updateProductDto;

    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const data: any = { ...updateProductDto };

    if (name) {
      data.name = name.trim();
    }

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
        .find()
        .populate('categoryId', 'name')
        .sort({ createdAt: 'desc' })
        .lean({ virtuals: true }),
    };
  }

  async findAllByType() {
    const [FACEBOOK_PROFILE, FACEBOOK_ADS_ACCOUNT, FACEBOOK_PAGES, FACEBOOK_BUSINESS_ACCOUNT] = await Promise.all([
      this.productsModel
        .find({ type: ProductType.FACEBOOK_PROFILE })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_ADS_ACCOUNT })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_PAGES })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_BUSINESS_ACCOUNT })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
    ]);

    return {
      content: {
        FACEBOOK_PROFILE,
        FACEBOOK_ADS_ACCOUNT,
        FACEBOOK_PAGES,
        FACEBOOK_BUSINESS_ACCOUNT,
      },
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
      .replace(/[<>:"/\\|?*]+/g, '') // Loại bỏ các ký tự không hợp lệ
      .replace(/\s+/g, '_')          // Thay khoảng trắng bằng dấu gạch dưới
      .replace(/,/g, '')             // Loại bỏ dấu phẩy
      .replace(/=/g, '_')            // Thay dấu = bằng gạch dưới
      .normalize('NFD')              // Chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
      .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Thay thế đ/Đ
  }

  private extractCategoryName(folderName: string): string {
    // Bỏ số thứ tự ở đầu
    const nameWithoutNumber = folderName.substring(folderName.indexOf(' ') + 1);
    
    // Kiểm tra nếu tên thư mục chứa các category đặc biệt
    for (const specialCat of this.SPECIAL_CATEGORIES) {
      if (nameWithoutNumber.toLowerCase().startsWith(specialCat.toLowerCase())) {
        return specialCat;
      }
    }

    // Nếu không phải category đặc biệt thì trả về "Khác"
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

      // Group folders by category
      const categoryGroups = new Map<string, string[]>();

      // Phân loại các thư mục vào các nhóm category
      for (const folder of categories) {
        if (fs.statSync(path.join(basePath, folder)).isDirectory()) {
          const categoryName = this.extractCategoryName(folder);
          if (!categoryGroups.has(categoryName)) {
            categoryGroups.set(categoryName, []);
          }
          categoryGroups.get(categoryName)?.push(folder);
        }
      }

      // Import từng category và các sản phẩm của nó
      for (const [categoryName, folders] of categoryGroups) {
        try {
          // Kiểm tra category đã tồn tại
          const existingCategory = await this.categoryModel.findOne({ 
            name: categoryName 
          });

          if (existingCategory) {
            console.log(`Category "${categoryName}" already exists, skipping...`);
            importResults.skipped.push(categoryName);
            continue;
          }

          // Tạo category mới
          const newCategory = await this.categoryModel.create({
            name: categoryName,
          });

          // Import ảnh từ tất cả thư mục của category này
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

            // Tạo product cho mỗi thư mục
            await this.productsModel.create({
              name: folder.substring(folder.indexOf(' ') + 1), // Tên đầy đủ của sản phẩm
              categoryId: newCategory._id,
              images: uploadedImages.map(img => img.path),
              thumbnails: uploadedImages.length > 0 ? [uploadedImages[0].path] : [],
            });
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

}
