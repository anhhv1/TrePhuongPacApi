import {  ApiPropertyOptional } from '@nestjs/swagger';
import {  IsNotEmpty } from 'class-validator';
import { EOrderStatus } from '~/constants';

export class UpdateOrderDto {
  @ApiPropertyOptional({ type: String })
  @IsNotEmpty({ message: 'ID is required' })
  status: EOrderStatus;
}
