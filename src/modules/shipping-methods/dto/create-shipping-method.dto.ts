import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateShippingMethodDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Shipping method name cannot be empty' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Price cannot be empty' })
  price: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
