import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/decorators';
import { EAccountRole, EAccountStatus } from '~/constants';

export const ACCOUNT_COLLECTION = 'accounts';

@BaseSchema({
  collection: ACCOUNT_COLLECTION,
})
export class Account extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @ApiProperty()
  fullname: string;

  @Prop({ default: EAccountRole.USER })
  @ApiProperty({ enum: EAccountRole, default: EAccountRole.USER })
  role: EAccountRole;

  @Prop({ default: null })
  @ApiProperty()
  otp: number;

  @Prop({ default: null })
  @ApiProperty()
  otpExpiredAt: Date;

  @Prop({ default: null })
  @ApiProperty()
  accessToken: string;

  @Prop({ default: null })
  @ApiProperty()
  refreshToken: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: EAccountStatus.ACTIVE })
  @ApiProperty({ enum: EAccountStatus, default: EAccountStatus.ACTIVE })
  status: EAccountStatus;

  @Prop({ default: new Date() })
  @ApiProperty()
  createdAt: Date;

  @Prop({ default: null })
  @ApiProperty()
  updatedAt: Date;

  @Prop({ default: false })
  @ApiProperty()
  isDeleted: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.pre<Account>(/(save|update)/i, (next) => {
  next();
});
