export enum EAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EAccountRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const ACCOUNT_MESSAGES = {
  EMAIL_OR_PASSWORD_INVALID: 'Email address or password is incorrect.',
  PASSWORD_INVALID: 'Password is different. Please enter the correct password.',
  ACCOUNT_EXPIRED: 'Account is expired',
  ACCOUNT_NOT_FOUND: 'E-mail address is incorrect.',
  CHANGED_PASSWORD: 'Password changed successfully',
  ACCOUNT_INVALID: 'Account is invalid',
  EMAIL_EXISTED: 'This email address has already been registered.',
  ACCOUNT_INACTIVE: 'Account inactive',
  LOST_DATA_EDUCATION: 'Lost data education',
  LOST_EXPIRED_TIME: 'Lost expired time',
  EMAIL_CANT_BE_EMPTY: 'Email address is not allowed to empty',
  EMAIL_INVALID: 'Email address is invalid',
  FULLNAME_INVALID: 'Special characters are not allowed in the name.',
  NOT_PERMISSION: 'Not permission',
  OTP_REQUIRED: 'Please enter the verification code.',
};
