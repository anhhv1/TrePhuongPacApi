import { BadRequestException, Injectable } from '@nestjs/common';
import { Account } from './account.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ACCOUNT_MESSAGES, EAccountRole } from '~/constants';
import { Observable, throwError } from 'rxjs';
import {
  DeleteUsersDto,
  RegisterAdminDto,
  SearchAccountDto,
  UpdateAdminDto,
  UpdateUserDto,
  registerUserdto,
} from './dto';
import { AppResponse, ResponseMessage } from '~/common/interfaces';
import { PaginationResponse, QueryByPagination, escapeRegex } from '~/helpers';
import PaginationHelper from '~/helpers/pagination.helper';

@Injectable()
export class AccountService {
  constructor(@InjectModel(Account.name) private accountModel: Model<Account>) {}

  getQuerySearchAccount(dto: SearchAccountDto): QueryByPagination<Account> {
    const filter: FilterQuery<Account> = { isDeleted: false };
    const $or: Array<FilterQuery<Account>> = [];
    const $and: Array<FilterQuery<Account>> = [];
    Object.keys(dto).forEach((key) => {
      const filterItem = dto[key];
      if (filterItem) {
        if (key === 'keyword' && dto.keyword.trim().length > 0) {
          const keyword = escapeRegex(dto.keyword);
          $or.push({ email: { $regex: new RegExp(keyword, 'i') } }, { fullname: { $regex: new RegExp(keyword, 'i') } });
        }
        if (key === 'role' && dto?.role !== undefined && dto?.role !== 'ALL') {
          $or.push({ role: dto?.role });
        }
      }
    });
    if ($or.length > 0) {
      filter.$or = $or;
    }
    if ($and.length > 0) {
      filter.$and = $and;
    }
    const { match, skip, rest, perPage, sort, page } = PaginationHelper.getQueryByPagination<Account, SearchAccountDto>(
      dto,
      filter,
    );
    return { match, skip, rest, perPage, sort, page };
  }

  async listAccounts(dto: SearchAccountDto): Promise<AppResponse<PaginationResponse<Account>>> {
    const { page, perPage, sort, match, skip } = this.getQuerySearchAccount(dto);

    const [accounts, count] = await Promise.all([
      this.accountModel.find(match).sort(sort).skip(skip).limit(perPage),
      this.accountModel.countDocuments(match),
    ]);
    return {
      content: PaginationHelper.getPaginationResponse({ page: page, data: accounts, perPage: perPage, total: count }),
    };
  }

  async register(
    registerDto: registerUserdto | RegisterAdminDto,
    role: EAccountRole,
  ): Promise<Account | Observable<never>> {
    const { email, fullname } = registerDto;
    let password = 'password' in registerDto ? registerDto.password : '';

    const checkExist = await this.accountModel.findOne({ email: email.trim().toLowerCase() });
    if (checkExist) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.EMAIL_EXISTED));
    }
    const user = new this.accountModel({
      email: email.toLowerCase(),
      fullname: fullname.trim(),
      role: role,
      password: password,
    });

    await user.save();

    return user;
  }

  async registerAdmin(registerDto: RegisterAdminDto): Promise<AppResponse<Account> | Observable<never>> {
    const admin = await this.register(registerDto, registerDto?.role);

    if (admin instanceof Observable) {
      return admin;
    }

    return { content: admin };
  }

  async registerUser(registerDto: registerUserdto): Promise<AppResponse<Account> | Observable<never>> {
    const user = await this.register(registerDto, EAccountRole.USER);
    if (user instanceof Observable) {
      return user;
    }
    return { content: user };
  }

  async deleteUsers(dto: DeleteUsersDto): Promise<AppResponse<ResponseMessage> | Observable<never>> {
    const { ids } = dto;
    const listIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
    const users = await this.accountModel.find({ _id: { $in: listIds }, isDeleted: false });
    await this.accountModel.updateMany(
      {
        _id: { $in: listIds },
        isDeleted: false,
      },
      { isDeleted: true },
    );

    return {
      content: { message: `Deleted ${users.length} users` },
    };
  }

  async findById(id: string): Promise<AppResponse<Account | null>> {
    return {
      content: await this.accountModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false }),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<AppResponse<Account | null> | Observable<never>> {
    const { email, fullname, status } = dto;
    const user = await this.accountModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });
    if (!user) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND));
    }
    const isEmailExisted = await this.accountModel.findOne({
      _id: { $ne: new Types.ObjectId(id) },
      email: dto.email.trim(),
    });
    if (isEmailExisted) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.EMAIL_EXISTED));
    }

    const userUpdated = await this.accountModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: false },
      {
        email: email.trim().toLowerCase(),
        fullname: fullname.trim(),
        status: status,
      },
      { new: true },
    );

    return {
      content: userUpdated,
    };
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<AppResponse<Account | null> | Observable<never>> {
    const { email, fullname, status, role } = dto;
    const user = await this.accountModel.findOne({ _id: new Types.ObjectId(id), isDeleted: false });

    if (!user) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.ACCOUNT_NOT_FOUND));
    }

    const isEmailExisted = await this.accountModel.findOne({
      _id: { $ne: new Types.ObjectId(id) },
      email: dto.email.trim(),
    });

    if (isEmailExisted) {
      return throwError(new BadRequestException(ACCOUNT_MESSAGES.EMAIL_EXISTED));
    }

    const dataUpdated = {
      email: email.trim().toLowerCase(),
      fullname: fullname.trim(),
      status: status,
      role: role,
    };

    const userUpdated = await this.accountModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: false },
      dataUpdated,
      { new: true },
    );

    return {
      content: userUpdated,
    };
  }
}
