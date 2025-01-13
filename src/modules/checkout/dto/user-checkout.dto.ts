import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, IsOptional, ValidateNested, IsNumber, IsBoolean } from 'class-validator';

// Shipping Method DTO
export class ShippingMethodDto {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

// Promotion DTO
export class PromotionDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  discount: number;
}

// Main User Checkout DTO
export class UserCheckout {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  company: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  phone: string;

  @ApiProperty({ default: 'vietanh123456123@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Contact is required' })
  @IsString()
  contact: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({ type: () => ShippingMethodDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingMethodDto)
  shippingMethod?: ShippingMethodDto;

  @ApiProperty({ type: () => PromotionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionDto)
  promotion?: PromotionDto;
}