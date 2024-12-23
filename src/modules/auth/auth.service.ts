import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account } from '../account/account.schema';
import { ConfigService } from '@nestjs/config';
import { AppResponse, ResponseMessage } from '~/common/interfaces';
import { LoginResponse } from './auth.controller';
import { Observable, throwError } from 'rxjs';
import { ACCOUNT_MESSAGES, EAccountRole, EAccountStatus } from '~/constants';
import {
  ChangePasswordDto,
  CheckOTPDto,
  ForgotPasswordDto,
  LoginDto,
  UpdateInfoDto,
  UpdatePasswordByOTPDto,
} from './dto';
import TimeHelper from '~/helpers/time.helper';
import { MailService } from '~/mail/mail.service';

interface JwtPayload {
  accountId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async find(id: string): Promise<Account | null> {
    const account = await this.accountModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });

    if (!account) {
      throwError(new NotFoundException(ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND));
      return null;
    }

    return account;
  }

  isActivated(account: Account): boolean {
    return account.status === EAccountStatus.ACTIVE;
  }

  async isEmailExisted(currentAccountId: Types.ObjectId, emailToCheck: string): Promise<boolean> {
    const user = await this.accountModel.findOne({
      _id: { $ne: currentAccountId },
      email: emailToCheck.toLowerCase().trim(),
    });
    return !!user;
  }

  generateAccessTokenByAccount(account: Account): string {
    const payload = { accountId: account._id.toString() };
    return this.jwtService.sign(payload);
  }

  async generateRefreshTokenAndSave(account: Account): Promise<string> {
    const payload = { accountId: account._id.toString() };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.configService.get('JWT_RF_EXPIRES', '10d') });
    await this.accountModel.findByIdAndUpdate(account._id, { refreshToken });
    return refreshToken;
  }

  async refreshToken(refreshToken: string): Promise<AppResponse<string> | Observable<never>> {
    const accessToken = await this.generateAccessTokenByRefreshToken(refreshToken);
    if (!accessToken) {
      return throwError(new BadRequestException('Unauthorized'));
    }
    return { content: accessToken };
  }

  async generateAccessTokenByRefreshToken(refreshToken: string): Promise<string | null> {
    const checkToken = await this.accountModel.findOne({ refreshToken: refreshToken });
    if (!checkToken) {
      return null;
    }
    const jwtPayload: JwtPayload = this.jwtService.verify(refreshToken);
    if (!jwtPayload.accountId) {
      return null;
    }
    const account = await this.accountModel.findById(jwtPayload.accountId);
    if (!account) {
      return null;
    }
    const payload = { accountId: account._id.toString() };
    return this.jwtService.sign(payload);
  }

  async login(loginDto: LoginDto): Promise<AppResponse<LoginResponse> | Observable<never>> {
    var account = await this.accountModel.findOne({ email: loginDto.email, isDeleted: false }).select('+password');
    if (!account) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.EMAIL_OR_PASSWORD_INVALID));
    }

    if (!this.isActivated(account)) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.ACCOUNT_INACTIVE));
    }

    const isPasswordMatching = loginDto.password === account.password;

    if (!isPasswordMatching) {
      return throwError(new UnauthorizedException(ACCOUNT_MESSAGES.EMAIL_OR_PASSWORD_INVALID));
    }
    account = await this.accountModel.findOne({ email: loginDto.email, isDeleted: false });

    const accessToken = this.generateAccessTokenByAccount(account);
    const refreshToken = await this.generateRefreshTokenAndSave(account);

    return {
      content: {
        accessToken,
        refreshToken,
        account,
      },
    };
  }

  async loginAdmin(loginDto: LoginDto): Promise<AppResponse<LoginResponse> | Observable<never>> {
    var account = await this.accountModel
      .findOne({
        email: loginDto.email,
        role: { $in: [EAccountRole.ADMIN] },
        isDeleted: false,
      })
      .select('+password');

    if (!account) {
      return throwError(new NotFoundException(ACCOUNT_MESSAGES.EMAIL_OR_PASSWORD_INVALID));
    }
    if (!this.isActivated(account)) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.ACCOUNT_INACTIVE));
    }

    const accessToken = this.generateAccessTokenByAccount(account);
    const refreshToken = await this.generateRefreshTokenAndSave(account);
    
    account = await this.accountModel.findOne({
      email: loginDto.email,
      role: { $in: [EAccountRole.ADMIN] },
      isDeleted: false,
    });
    return {
      content: {
        accessToken,
        refreshToken,
        account,
      },
    };
  }

  async logout(id: Types.ObjectId): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    const account = await this.accountModel.findByIdAndUpdate(id, { refreshToken: '', accessToken: '' }, { new: true });
    if (!account) {
      return throwError(new NotFoundException(ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND));
    }
    return {
      content: {
        message: 'Logged out',
      },
    };
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    const account = await this.accountModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), password: data.password, isDeleted: false },
      { password: data.newPassword },
    );
    if (!account) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.PASSWORD_INVALID));
    }

    return { content: { message: ACCOUNT_MESSAGES.CHANGED_PASSWORD } };
  }

  async updateInfo(
    account: Account,
    updateInfoDto: UpdateInfoDto,
  ): Promise<AppResponse<Account | null> | Observable<never>> {
    const { email, fullname } = updateInfoDto;
    const isEmailExisted = await this.isEmailExisted(account._id, email);
    if (isEmailExisted) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.EMAIL_EXISTED));
    }

    return {
      content: await this.accountModel.findOneAndUpdate(
        { _id: account._id, isDeleted: false },
        { email, fullname },
        { new: true },
      ),
    };
  }

  async sendOTP(dto: ForgotPasswordDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    const account = await this.accountModel.findOne({ email: dto.email, isDeleted: false });
    if (!account) {
      return throwError(new NotFoundException(ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND));
    }
    const code = Math.floor(1000 + Math.random() * 9000);
    const [mail] = await Promise.all([
      this.mailService.forgotPassword(account, code),
      this.accountModel.findOneAndUpdate(
        { email: dto.email },
        { otp: code, otpExpiredAt: TimeHelper.moment().add(10, 'minutes').toDate() },
      ),
    ]);

    if (!mail) {
      return throwError(new InternalServerErrorException('Cant send mail'));
    }
    return { content: { message: 'Code sent' } };
  }

  async updatePasswordByOTP(dto: UpdatePasswordByOTPDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    const account = await this.accountModel.findOne({ email: dto.email, otp: dto.otp, isDeleted: false });
    if (!account) {
      return throwError(new NotFoundException('OTP_NOT_MATCH'));
    }
    if (TimeHelper.moment(account.otpExpiredAt) < TimeHelper.moment()) {
      return throwError(new BadRequestException('OTP_EXPIRED'));
    }
    await this.accountModel.findOneAndUpdate(
      { email: dto.email },
      { $set: { password: dto.newPassword }, $unset: { otp: null, otpExpiredAt: null } },
    );

    return { content: { message: ACCOUNT_MESSAGES.CHANGED_PASSWORD } };
  }

  async checkOTP(dto: CheckOTPDto): Promise<AppResponse<{ isValid: boolean }> | Observable<never>> {
    const account = await this.accountModel.findOne({ email: dto.email, otp: dto.otp, isDeleted: false });
    if (!account) {
      return throwError(new NotFoundException('OTP_NOT_MATCH'));
    }
    if (TimeHelper.moment(account.otpExpiredAt) < TimeHelper.moment()) {
      return throwError(new BadRequestException('OTP_EXPIRED'));
    }

    return { content: { isValid: true } };
  }
}
