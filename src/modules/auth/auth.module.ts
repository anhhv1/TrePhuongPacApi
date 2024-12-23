import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Account, AccountSchema } from '../account/account.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminAuthController, UserAuthController } from './auth.controller';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY', 'AmORAgeCyZDUwYzU3MzEzN2Q5ZjYyMjJhMDRhOTk2ZGM'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRES','1d')}`,
        },
      }),
    }),
    MailModule
  ],
  controllers: [AdminAuthController, UserAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
