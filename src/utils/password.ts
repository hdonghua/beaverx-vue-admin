export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 32;

export const PASSWORD_RULE_MESSAGE =
  '密码长度须为 8-32 位，且须包含大小写字母、数字和特殊字符';

/** 8-32 位，含大小写字母、数字、特殊字符，不含空格 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,32}$/;

export function isValidPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}

export const passwordRequiredRule = {
  required: true,
  message: '请输入密码',
};

export const passwordFormatRule = {
  validator: (value: string, callback: (error?: string) => void) => {
    if (!value) {
      callback();
      return;
    }
    if (!isValidPassword(value)) {
      callback(PASSWORD_RULE_MESSAGE);
    } else {
      callback();
    }
  },
};

export const passwordRules = [passwordRequiredRule, passwordFormatRule];

export function createConfirmPasswordRules(
  getPassword: () => string,
  requiredMessage = '请确认密码',
  mismatchMessage = '两次输入的密码不一致'
) {
  return [
    { required: true, message: requiredMessage },
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (value !== getPassword()) {
          callback(mismatchMessage);
        } else {
          callback();
        }
      },
    },
  ];
}
