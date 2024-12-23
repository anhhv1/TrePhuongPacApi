import { Body, Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../guards/jwtAuth.guard';
import { AuthService } from './auth.service';
import { CurrentAccount, Roles } from '../../decorators';
import { AppResponse, ResponseMessage } from '../../common/interfaces';
import { EAccountRole } from '../../constants';
import { Account } from '../account/account.schema';
import { ChangePasswordDto, CheckOTPDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, UpdateInfoDto, UpdatePasswordByOTPDto } from './dto';

export class LoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: Account })
  account: Account;
}

@ApiTags('[Admin] - Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(EAccountRole.ADMIN)
  @Post('/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ type: LoginResponse })
  async adminLogin(@Body() loginDto: LoginDto): Promise<AppResponse<LoginResponse> | Observable<never>> {
    return this.authService.loginAdmin(loginDto);
  }

  @Roles(EAccountRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'get admin profile' })
  @Get('/profile')
  async getAdminProfile(@CurrentAccount() account: Account): Promise<AppResponse<Account | null>> {
    return { content: account };
  }

  @Roles(EAccountRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('/change-password')
  @ApiOperation({ summary: 'Change password admin' })
  async adminChangePassword(
    @CurrentAccount() account: Account,
    @Body() data: ChangePasswordDto,
  ): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    return this.authService.changePassword(account._id, data);
  }

  @Roles(EAccountRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Put('/update-info')
  @ApiOperation({ summary: 'Update admin information' })
  async adminUpdateInfo(
    @CurrentAccount() account: Account,
    @Body() data: UpdateInfoDto,
  ): Promise<AppResponse<Account | null> | Observable<never>> {
    return this.authService.updateInfo(account, data);
  }
}

@ApiTags('[User] - Auth')
@Controller('user/auth')
export class UserAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ type: LoginResponse })
  async userLogin(@Body() loginDto: LoginDto): Promise<AppResponse<LoginResponse> | Observable<never>> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'get user profile' })
  @ApiResponse({ type: Account })
  @Get('/profile')
  async getUserProfile(@CurrentAccount() account: Account): Promise<AppResponse<Account> | null> {
    return { content: account };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('/change-password')
  @ApiOperation({ summary: 'Change password user' })
  @ApiResponse({ type: ResponseMessage })
  async userChangePassword(
    @CurrentAccount() account: Account,
    @Body() data: ChangePasswordDto,
  ): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    return this.authService.changePassword(account._id, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Put('/update-info')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ type: Account })
  async userUpdateInfo(
    @CurrentAccount() account: Account,
    @Body() data: UpdateInfoDto,
  ): Promise<AppResponse<Account | null> | Observable<never>> {
    return this.authService.updateInfo(account, data);
  }

  @Patch('/refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: AppResponse })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AppResponse<string> | Observable<never>> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('/sent-otp')
  @ApiOperation({ summary: 'Send code' })
  @ApiResponse({ type: AppResponse, status: 201 })
  async sendOTP(@Body() dto: ForgotPasswordDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    return this.authService.sendOTP(dto);
  }

  @Post('/check-otp')
  @ApiOperation({ summary: 'Update password by code' })
  @ApiResponse({ type: AppResponse, status: 201 })
  async checkOtp(@Body() dto: CheckOTPDto): Promise<AppResponse<{ isValid: boolean }> | Observable<never>> {
    return this.authService.checkOTP(dto);
  }

  @Patch('/update-password-by-otp')
  @ApiOperation({ summary: 'Update password by code' })
  @ApiResponse({ type: AppResponse, status: 200 })
  async resetPassword(@Body() dto: UpdatePasswordByOTPDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    return this.authService.updatePasswordByOTP(dto);
  }
}
