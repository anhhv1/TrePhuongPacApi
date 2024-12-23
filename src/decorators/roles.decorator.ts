import { SetMetadata } from '@nestjs/common';
import { EAccountRole } from '../constants';

export const Roles = (...roles: EAccountRole[]): any => SetMetadata('roles', roles);
