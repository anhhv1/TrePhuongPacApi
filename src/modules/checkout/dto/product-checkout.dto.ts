import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ProductCheckout {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'name is required' })
  name: string;


  @ApiProperty()
  @IsNotEmpty({ message: 'quantity is required' })
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @ApiProperty({ default: 0 })
  @ApiProperty()
  discount?: number;
}
