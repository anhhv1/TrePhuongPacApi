import { Module, Global } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';


@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const user = configService.get('MAILER_INCOMING_USER', 'anhhv@1bitlab.io');
        const pass = configService.get('MAILER_INCOMING_PASS', 'ljarleybszacduuj');
        const port = Number(configService.get('MAILER_INCOMING_PORT', '587'));
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: port,
            ignoreTLS: false,
            secure: false,
            auth: {
              user: user,
              pass: pass,
            },
          },
          defaults: {
            from: '"Amor Agency" <amor-agency@gmail.com>',
          },
          template: {
            dir: __dirname + '/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          preview: false,
        };
      },
    }),
  ],
  controllers: [],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
