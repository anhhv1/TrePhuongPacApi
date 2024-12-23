import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACCOUNT_MESSAGES, EAccountStatus } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const headers = context.switchToHttp().getRequest().headers;
    
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (user.status !== EAccountStatus.ACTIVE) {
      throw new ForbiddenException(ACCOUNT_MESSAGES.ACCOUNT_INACTIVE);
    }

    return user;
  }
}
