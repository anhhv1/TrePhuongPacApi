import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type ServicesDocument = Services & Document;

@BaseSchema()
export class Services extends BaseMongo {
  @Prop({ required: true })
  @ApiProperty()
  type: string;

  @Prop({ default: null })
  @ApiProperty()
  category: string;

  @Prop({ default: null })
  @ApiProperty()
  status: string;

  @Prop({ default: null })
  @ApiProperty()
  title: string;

  @Prop({ default: null })
  @ApiProperty()
  content: string;
}

export const ServicesSchema = SchemaFactory.createForClass(Services);
ServicesSchema.plugin(mongooseLeanVirtuals);
