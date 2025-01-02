import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as path from 'path';
import { diskStorage } from 'multer';
import { FindPaginateImage } from './dto/find-paginate-image.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const originalName = path.parse(file.originalname).name.replace(/\s+/g, '');
          const extension = path.extname(file.originalname);
          const timestamp = Math.floor(Date.now() / 1000); // Convert to Unix timestamp
          const filename = `${originalName}_${timestamp}${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (/(jpg|jpeg|png|gif)$/i.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only image files are allowed.'), false);
        }
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.create(file);
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Get paginated list of images' })
  async findPaginatedImages(@Query() query: FindPaginateImage) {
    return this.uploadService.findPaginateImages(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all images' })
  async removeAll() {
    return this.uploadService.removeAll();
  }
}