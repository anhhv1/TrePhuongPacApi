import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Uploads } from './upload.schema';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { PaginationResponse, AppResponse } from '~/common/interfaces'; // Import the common interface for pagination
import PaginationHelper from '~/helpers/pagination.helper'; // Helper for pagination
import { FindPaginateImage } from './dto/find-paginate-image.dto';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(@InjectModel(Uploads.name) private readonly uploadModel: Model<Uploads>) {}

  // Tạo mới upload từ file được gửi
  async create(file: Express.Multer.File): Promise<Uploads> {
    const createUploadDto: CreateUploadDto = {
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      size: file.size,
    };

    const upload = new this.uploadModel(createUploadDto);
    return upload.save();
  }

  // Lấy danh sách tất cả hình ảnh
  async findAll(): Promise<AppResponse<Uploads[]>> {
    const uploads = await this.uploadModel.find();
    console.log(uploads);
    
    return {
      content: uploads,
    };
  }

  async findPaginateImages(query: FindPaginateImage): Promise<AppResponse<PaginationResponse<Uploads>>> {
    const { filename, mimetype } = query;
    const { skip, perPage, page } = PaginationHelper.getQueryByPagination<Uploads, FindPaginateImage>(query);

    const match: any = {  };

    if (filename) {
      match.filename = { $regex: new RegExp(filename, 'i') };
    }

    if (mimetype) {
      match.mimetype = { $regex: new RegExp(mimetype, 'i') };
    }

    const [uploads, total] = await Promise.all([
      this.uploadModel.find(match).sort({ createdAt: 'desc' }).skip(skip).limit(perPage).lean(),
      this.uploadModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({
        page,
        perPage,
        total,
        data: uploads,
      }),
    };
  }

    async findByField(filter: object): Promise<Uploads> {
      const product = await this.uploadModel.findOne(filter).lean({ virtuals: true });
  
      if (!product) {
        throw new BadRequestException('File not exist');
      }
  
      return product;
    }

  // Lấy thông tin chi tiết của một hình ảnh theo ID
  async findOne(id: string): Promise<AppResponse<Uploads> | Observable<never>> {
    const upload = await this.findByField({ _id: id });    
    if (!upload) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }

    return {
      content: upload
    };
  }

  // Cập nhật thông tin file
  async update(id: string, updateUploadDto: UpdateUploadDto): Promise<Uploads> {
    const upload = await this.uploadModel.findByIdAndUpdate(id, updateUploadDto, { new: true }).exec();
    if (!upload) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }
    return upload;
  }

  // Xóa file (đánh dấu isActive = false)
  async remove(id: string): Promise<Uploads> {
    
    const upload = await this.uploadModel.findByIdAndRemove({ _id: id }
      
    );
    const filePath = path.resolve(upload.path);
    try {
      fs.unlinkSync(filePath); // Remove the file from the disk
    } catch (error) {
      throw new BadRequestException('Error while deleting the file from the file system');
    }

    if (!upload) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }
    return upload;
  }
}
