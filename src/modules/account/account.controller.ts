import { Controller, Post, Body, UseGuards, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { EAccountRole } from '~/constants';
import { PaginationResponse } from '~/helpers';
import { AppResponse, ResponseMessage } from '~/common/interfaces';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '~/guards/jwtAuth.guard';
import { RolesGuard } from '~/guards/roles.guard';
import { Roles } from '~/decorators';
import { IdDto } from '~/common/dto';
import { Account } from './account.schema';
import {
  DeleteUsersDto,
  RegisterAdminDto,
  SearchAccountDto,
  UpdateAdminDto,
  UpdateUserDto,
  registerUserdto,
} from './dto';


@ApiTags('[Account] - All')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Roles(EAccountRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('/search')
  @ApiOperation({ summary: 'Search account' })
  @ApiResponse({ type: [Account], status: 200 })
  async search(
    @Query() searchAccountDto: SearchAccountDto,
  ): Promise<AppResponse<PaginationResponse<Account>>> {
    return this.accountService.listAccounts(searchAccountDto);
  }

  @Roles(EAccountRole.ADMIN)
  @Post('/register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Register admin', description: 'Create an Admin' })
  @ApiOkResponse({ type: Account, status: 201 })
  async createAdmin(@Body() registerDto: RegisterAdminDto): Promise<AppResponse<Account> | Observable<never>> {
    return this.accountService.registerAdmin(registerDto);
  }

  @Post('/register-user')
  @ApiOperation({ summary: 'Register user', description: 'Create an User' })
  @ApiOkResponse({ type: Account, status: 201 })
  async createUser(@Body() registerDto: registerUserdto): Promise<AppResponse<Account> | Observable<never>> {
    return this.accountService.registerUser(registerDto);
  }

  @Roles(EAccountRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Get('/:id/detail')
  @ApiOperation({ summary: 'Find account by ID' })
  @ApiResponse({ type: Account, status: 200 })
  async detail(@Param() dto: IdDto): Promise<AppResponse<Account | null>> {
    return this.accountService.findById(dto.id);
  }

  @Roles(EAccountRole.ADMIN)
  @Put('/:id/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update user', description: 'Update an user' })
  @ApiResponse({ type: Account, status: 200 })
  async updateUser(
    @Param() idDto: IdDto,
    @Body() dto: UpdateUserDto,
  ): Promise<AppResponse<Account | null> | Observable<never>> {
    return this.accountService.updateUser(idDto.id, dto);
  }

  @Roles(EAccountRole.ADMIN)
  @Put('/:id/update-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update admin', description: 'Update an admin' })
  @ApiResponse({ type: Account, status: 200 })
  async updateAdmin(
    @Param() idDto: IdDto,
    @Body() dto: UpdateAdminDto,
  ): Promise<AppResponse<Account | null> | Observable<never>> {
    return this.accountService.updateAdmin(idDto.id, dto);
  }

  @Roles(EAccountRole.ADMIN)
  @Delete('/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete user', description: 'Delete an user' })
  @ApiResponse({ type: ResponseMessage, status: 200 })
  async deleteUsers(@Body() dto: DeleteUsersDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    return this.accountService.deleteUsers(dto);
  }
}
