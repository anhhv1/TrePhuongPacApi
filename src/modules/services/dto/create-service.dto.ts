import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EServiceCategory, EServiceStatus, EServiceType } from '~/constants';

export class CreateServiceDto {
  @ApiPropertyOptional({ enum: EServiceType })
  @IsString()
  @IsOptional()
  type: string;

  @ApiPropertyOptional({ enum: EServiceCategory })
  @IsString()
  @IsOptional()
  category: string;

  @ApiPropertyOptional({ default: null , enum: EServiceStatus})
  @IsOptional()
  status: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(255, {
    message: 'Title must not be greater than 255 characters.',
  })
  @MinLength(1)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255, {
    message: 'Title must not be greater than 255 characters.',
  })
  @MinLength(1)
  content: string;
}
