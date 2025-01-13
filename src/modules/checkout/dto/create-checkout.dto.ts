import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { UserCheckout, ProductCheckout } from '../dto';

export class CreateCheckoutDto {
  @ApiProperty({ type: UserCheckout })
  info: UserCheckout;

  @ApiProperty({ type: [ProductCheckout] })
  @IsArray()
  products: ProductCheckout[];
}
