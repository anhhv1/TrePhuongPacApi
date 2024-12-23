import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class BaseMongo {
  @Prop()
  @ApiProperty()
  id: string;

  @Prop({ type: Date })
  @ApiProperty()
  createdAt: Date;

  @Prop({ type: Date })
  @ApiProperty()
  updatedAt: Date;
}
