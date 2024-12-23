import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserCheckout, ProductCheckout } from '../dto';

export class CreateCheckoutDto {
  @ApiProperty({ type: UserCheckout })
  info: UserCheckout;

  @ApiProperty({ type: ProductCheckout, isArray: true })
  @IsOptional()
  products: any;
}
