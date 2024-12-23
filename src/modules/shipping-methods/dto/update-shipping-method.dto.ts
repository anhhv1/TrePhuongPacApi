import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateShippingMethodDto } from './create-shipping-method.dto';

export class UpdateShippingMethodDto extends PartialType(CreateShippingMethodDto) {
  @ApiProperty({
    example: 'Express Delivery',
    description: 'The name of the shipping method',
    required: false
  })
  name?: string;

  @ApiProperty({
    example: 'Next day delivery service',
    description: 'Description of the shipping method',
    required: false
  })
  description?: string;

  @ApiProperty({
    example: 50000,
    description: 'Shipping price in VND',
    required: false
  })
  price?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the shipping method is active',
    required: false
  })
  isActive?: boolean;
}