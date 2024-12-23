import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from '~/modules/account/account.schema';
import { CreateFeedbackDto } from '~/modules/feedbacks/dto';

@Injectable()
export class MailService {
  constructor(
    private service: MailerService,
    private configService: ConfigService,
  ) {}

  public MAILER_INCOMING_USER = this.configService.get('MAILER_INCOMING_USER', 'anhhv@1bitlab.io');

  public async forgotPassword(account: Account, code: number): Promise<any | null> {
    return this.service
      .sendMail({
        sender: this.MAILER_INCOMING_USER,
        to: account.email,
        from: this.MAILER_INCOMING_USER,
        subject: '[AMOR AGENCY] Forgot password',
        text: `   We will inform you of the authentication code to change your password.
                  4 digit authentication code：${code}    
                  Amor Agency`,
        html: `   <p>We will inform you of the authentication code to change your password.</p>
                  <p>4 digit authentication code：<b>${code}</b></p><br>
                  <p>Amor Agency</p>`,
      })
      .then((res) => {
        console.log('res', res);
        return res;
      })
      .catch((err) => {
        console.log('err', err);
        return null;
      });
  }

  public async registerUser(user: Account): Promise<any | null> {
    return this.service
      .sendMail({
        sender: this.MAILER_INCOMING_USER,
        to: user.email,
        from: this.MAILER_INCOMING_USER,
        subject: '[AMOR AGENCY] Welcome to Amor Agency',
        html: `   <p>Password: ${user}</p>
                  <p>Amor Agency</p>`,
      })
      .then((res) => {
        // console.log('res', res);
        return res;
      })
      .catch((err) => {
        console.log('err', err);
        return null;
      });
  }

  public async sendFeedBack(feedback: CreateFeedbackDto) {
    return await this.service.sendMail({
      to: this.MAILER_INCOMING_USER,
      subject: '[AMOR AGENCY] FEEDBACK',
      template: './feedback',
      context: {
        feedback: feedback,
      },
    });
  }

  public async sendRepliedFeedBack(feedback: any) {
    return await this.service.sendMail({
      to: feedback?.email,
      subject: '[AMOR AGENCY] REPLY FEEDBACK',
      template: './replied_feedback',
      context: {
        feedback: feedback,
      },
    });
  }

  public async recieveOrder(email: any) {
    return await this.service.sendMail({
      to: email,
      subject: '[AMOR AGENCY] RECIEVE ORDER',
      template: './recieve_order',
      context: {
        content: 'Your order is being processed, we will contact you as soon as possible!',
      },
    });
  }

  public async confirmOrder(email: any) {
    return await this.service.sendMail({
      to: email,
      subject: '[AMOR AGENCY] CONFIRM ORDER',
      template: './confirm_order',
      context: {
        content: 'Your order has been confirmed...',
      },
    });
  }
}
