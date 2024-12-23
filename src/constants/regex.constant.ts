export const RegexConstant = {
  password: new RegExp(/^[^\s\r\n\t]+$/),
  email: new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ),
  personalId: new RegExp(/JM[0-9]{8}/),
  sha256: new RegExp(/^[a-f0-9]{64}$/),
  fullname: new RegExp(/^[^_\\.,\\(\\)&^%$#@!\\*]+$/),
};
