import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Observable, throwError } from 'rxjs';
import { Account } from '~/modules/account/account.schema';
import { ACCOUNT_MESSAGES, EAccountStatus } from '~/constants';
import { AuthService } from '../auth.service';

interface JwtPayload {
  accountId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private authenticationService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY', 'AmORAgeCyZDUwYzU3MzEzN2Q5ZjYyMjJhMDRhOTk2ZGM'),
    });
  }

  async validate(payload: JwtPayload): Promise<Account | Observable<never>> {
    if (!payload.accountId) {
      return throwError(new ForbiddenException('Unauthenticated'));
    }
    const account = await this.authenticationService.find(payload.accountId);
    if (!account) {
      return throwError(new ForbiddenException('Unauthenticated'));
    }

    if (account.status !== EAccountStatus.ACTIVE) {
      return throwError(new ForbiddenException(ACCOUNT_MESSAGES.ACCOUNT_INACTIVE));
    }

    return account;
  }
}
