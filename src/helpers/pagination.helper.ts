import { FilterQuery, Types } from 'mongoose';
import { PaginationBodyDto } from '../common/dto';

interface PaginationParams {
  page: number;
  perPage: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  search?: {
    field: string;
    value: string | number;
  }[];
}

interface PaginationBody<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}

export interface PaginationResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}

export interface QueryByPagination<Doc> {
  page: number;
  perPage: number;
  match: FilterQuery<Doc>;
  sort: { [key: string]: 'asc' | 'desc' };
  skip: number;
  rest: any;
}

const PaginationHelper = {
  getPaginationParams(paginationDto: PaginationBodyDto): PaginationParams {
    const { page = 1, perPage = 10, sort, search } = paginationDto;
    return { page, perPage, sort, search };
  },

  getQueryByPagination<T, PaginationDto extends PaginationBodyDto>(
    paginationDto: PaginationDto,
    initialMatch?: FilterQuery<T>,
  ): QueryByPagination<T> {
    const { page = 1, perPage = 10, sort: sortParams, search: searchParams, ...rest } = paginationDto;
    const skip = (page - 1) * perPage;
    let sort: { [key: string]: 'asc' | 'desc' } = { _id: 'asc' };
    if (sortParams) {
      sort = { [sortParams.field]: sortParams.order };
    }
    let match: FilterQuery<T> = initialMatch || {};
    if (searchParams && searchParams.length > 0) {
      searchParams.forEach((searchItem) => {
        if (typeof searchItem.value === 'number') {
          match = { ...match, [searchItem.field]: searchItem.value };
        } else if (Types.ObjectId.isValid(searchItem.value)) {
          match = { ...match, [searchItem.field]: new Types.ObjectId(searchItem.value) };
        } else {
          match = { ...match, [searchItem.field]: searchItem.value };
        }
      });
    }

    return { page: +page, perPage: +perPage, sort, match, skip, rest };
  },

  getPaginationResponse<T>(body: PaginationBody<T>): PaginationResponse<T> {
    const { page, perPage, data, total } = body;
    return {
      page: page,
      items: data,
      total: total,
      perPage: perPage,
      totalPage: Math.ceil(total / perPage),
    };
  },
};

export default PaginationHelper;
