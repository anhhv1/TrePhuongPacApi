// dto/update-promotion.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from './create-promotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
