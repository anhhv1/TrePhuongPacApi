// dto/create-promotion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';


export class ValidatePromotionDto {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Promotion code',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(3)
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @ApiProperty({
    example: 100000,
    description: 'Order amount',
  })
  @IsNotEmpty()
  @IsNumber()
  orderAmount: number;
}
