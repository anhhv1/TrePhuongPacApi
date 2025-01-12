import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type CategoriesDocument = Categories & Document;

@BaseSchema()
export class Categories extends BaseMongo {
  @Prop({ required: true, unique: true })
  @ApiProperty()
  name: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop()
  slug?: string;
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories);
CategoriesSchema.plugin(mongooseLeanVirtuals);
