// dto/create-promotion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate, IsEnum, IsBoolean, Min, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export class CreatePromotionDto {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Promotion code'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(3)
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @ApiProperty({
    example: 'Summer Sale 2024',
    description: 'Promotion name'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Get 20% off for all bamboo products',
    description: 'Promotion description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: PromotionType,
    example: PromotionType.PERCENTAGE,
    description: 'Type of discount'
  })
  @IsNotEmpty()
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({
    example: 20,
    description: 'Discount value'
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({
    example: '2024-06-01',
    description: 'Promotion start date'
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    example: '2024-08-31',
    description: 'Promotion end date'
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Minimum order amount'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumOrder?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Maximum discount amount'
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumDiscount?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the promotion is active'
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 100,
    description: 'Usage limit (-1 for unlimited)'
  })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;
}


