import { RegexConstant } from '../constants';

export const StringHelper = {
  isEmail: (value: string): boolean => {
    return RegexConstant.email.test(value);
  },
  isValidPersonalId: (value: string): boolean => {
    return RegexConstant.personalId.test(value);
  },
  isValidFullname: (value: string): boolean => {
    return RegexConstant.fullname.test(value);
  },
};

export const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
