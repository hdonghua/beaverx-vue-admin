import {
  PaymentProviderType,
} from '@/api/server/payment/channel';

export const PAYMENT_CHANNEL_CODES = {
  WeChatQrcode: 'wechat_qrcode',
  AlipayQrcode: 'alipay_qrcode',
  AlipayAppPay: 'alipay_app_pay',
} as const;

export const ALIPAY_CERT_FIELDS = [
  {
    urlKey: 'merchantCertUrl',
    fileNameKey: 'merchantCertFileName',
    pathKey: 'merchantCertPath',
    label: '应用公钥证书（证书模式）',
    hint: '上传后保存下载地址，首次支付时自动落盘到 cert/原文件名_渠道Id.crt',
  },
  {
    urlKey: 'alipayPublicCertUrl',
    fileNameKey: 'alipayPublicCertFileName',
    pathKey: 'alipayPublicCertPath',
    label: '支付宝公钥证书（证书模式）',
  },
  {
    urlKey: 'alipayRootCertUrl',
    fileNameKey: 'alipayRootCertFileName',
    pathKey: 'alipayRootCertPath',
    label: '支付宝根证书（证书模式）',
    hint: '证书模式三项需全部上传',
  },
] as const;

/** 与后端 AlipayPaymentConstants 保持一致 */
export const ALIPAY_SIGN_TYPE_OPTIONS = [
  { label: 'RSA2（推荐，SHA256WithRSA）', value: 'RSA2' },
  { label: 'RSA（旧版，SHA1WithRSA）', value: 'RSA' },
] as const;

export const ALIPAY_GATEWAY_OPTIONS = [
  {
    label: '生产环境',
    value: 'https://openapi.alipay.com/gateway.do',
  },
  {
    label: '沙箱环境',
    value: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
  },
] as const;

export const ALIPAY_DEFAULT_SIGN_TYPE = 'RSA2';
export const ALIPAY_DEFAULT_GATEWAY =
  'https://openapi.alipay.com/gateway.do';

export interface PaymentChannelConfigFieldOption {
  label: string;
  value: string;
}

export interface PaymentChannelConfigField {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: 'input' | 'textarea' | 'select' | 'cert-upload';
  fileNameKey?: string;
  pathKey?: string;
  rows?: number;
  colSpan?: number;
  options?: PaymentChannelConfigFieldOption[];
  defaultValue?: string;
}

const ALIPAY_CONFIG_FIELDS: PaymentChannelConfigField[] = [
  { key: 'appId', label: 'AppId', required: true, placeholder: '支付宝 AppId' },
  {
    key: 'signType',
    label: '签名类型',
    type: 'select',
    options: [...ALIPAY_SIGN_TYPE_OPTIONS],
    defaultValue: ALIPAY_DEFAULT_SIGN_TYPE,
    hint: '可选 RSA2、RSA；新应用请选 RSA2',
  },
  {
    key: 'gateway',
    label: '网关地址',
    type: 'select',
    options: [...ALIPAY_GATEWAY_OPTIONS],
    defaultValue: ALIPAY_DEFAULT_GATEWAY,
    hint: '生产环境用于正式交易，沙箱环境用于联调',
  },
  {
    key: 'privateKey',
    label: '应用私钥',
    type: 'textarea',
    rows: 3,
    colSpan: 12,
    required: true,
    placeholder: 'RSA2 应用私钥（PKCS#8 PEM 或 Base64）',
  },
  {
    key: 'alipayPublicKey',
    label: '支付宝公钥（公钥模式）',
    type: 'textarea',
    rows: 3,
    colSpan: 12,
    placeholder: '公钥模式必填，证书模式可留空',
    hint: '与证书模式二选一：公钥模式填此项，证书模式上传下方三项证书',
  },
  ...ALIPAY_CERT_FIELDS.map((item) => ({
    key: item.urlKey,
    fileNameKey: item.fileNameKey,
    pathKey: item.pathKey,
    label: item.label,
    type: 'cert-upload' as const,
    hint: item.hint,
  })),
];

export const PAYMENT_CHANNEL_CONFIG_FIELDS: Record<
  PaymentProviderType,
  PaymentChannelConfigField[]
> = {
  [PaymentProviderType.WeChat]: [
    { key: 'appId', label: 'AppId', required: true, placeholder: '微信 AppId' },
    { key: 'mchId', label: '商户号', required: true, placeholder: '微信支付商户号' },
    {
      key: 'apiV3Key',
      label: 'APIv3 密钥',
      required: true,
      placeholder: '32 位 APIv3 密钥',
    },
    {
      key: 'certSerialNo',
      label: '证书序列号',
      required: true,
      placeholder: '商户 API 证书序列号',
    },
    {
      key: 'privateKey',
      label: '商户私钥',
      type: 'textarea',
      rows: 3,
      colSpan: 12,
      required: true,
      placeholder: '-----BEGIN PRIVATE KEY-----',
    },
    {
      key: 'platformCert',
      label: '微信平台证书',
      type: 'textarea',
      rows: 3,
      colSpan: 12,
      required: true,
      placeholder: '-----BEGIN CERTIFICATE-----',
    },
  ],
  [PaymentProviderType.Alipay]: ALIPAY_CONFIG_FIELDS,
  [PaymentProviderType.AlipayApp]: ALIPAY_CONFIG_FIELDS,
};

function isSupportedAlipaySignType(value?: string) {
  if (!value?.trim()) {
    return true;
  }
  return ALIPAY_SIGN_TYPE_OPTIONS.some(
    (item) => item.value.toUpperCase() === value.trim().toUpperCase()
  );
}

function isSupportedAlipayGateway(value?: string) {
  if (!value?.trim()) {
    return true;
  }
  const normalized = value.trim();
  return ALIPAY_GATEWAY_OPTIONS.some(
    (item) => item.value.toLowerCase() === normalized.toLowerCase()
  );
}

export function isAlipayProvider(providerType: PaymentProviderType) {
  return (
    providerType === PaymentProviderType.Alipay ||
    providerType === PaymentProviderType.AlipayApp
  );
}

export function hasUploadedAllAlipayCerts(values: Record<string, string>) {
  return ALIPAY_CERT_FIELDS.every(
    (item) => values[item.urlKey]?.trim() && values[item.fileNameKey]?.trim()
  );
}

export function parseChannelConfigJson(
  configJson?: string | null
): Record<string, string> {
  if (!configJson?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(configJson) as Record<string, unknown>;
    const result: Record<string, string> = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        result[key] = '';
      } else {
        result[key] = String(value);
      }
    });
    return result;
  } catch {
    return {};
  }
}

export function buildChannelConfigJson(
  providerType: PaymentProviderType,
  values: Record<string, string>
): string {
  const fields = PAYMENT_CHANNEL_CONFIG_FIELDS[providerType] || [];
  const payload: Record<string, string> = {};

  fields.forEach((field) => {
    if (field.type === 'cert-upload') {
      const url = values[field.key]?.trim();
      const fileName = field.fileNameKey
        ? values[field.fileNameKey]?.trim()
        : '';
      if (url) {
        payload[field.key] = url;
      }
      if (fileName && field.fileNameKey) {
        payload[field.fileNameKey] = fileName;
      }
      if (field.pathKey && values[field.pathKey]?.trim()) {
        payload[field.pathKey] = values[field.pathKey].trim();
      }
      return;
    }

    const value = values[field.key]?.trim() || '';
    if (value) {
      payload[field.key] = value;
    }
  });

  if (isAlipayProvider(providerType)) {
    payload.signType =
      values.signType?.trim().toUpperCase() || ALIPAY_DEFAULT_SIGN_TYPE;
    payload.gateway = values.gateway?.trim() || ALIPAY_DEFAULT_GATEWAY;
  }

  return JSON.stringify(payload);
}

export function createEmptyChannelConfig(
  providerType: PaymentProviderType
): Record<string, string> {
  const fields = PAYMENT_CHANNEL_CONFIG_FIELDS[providerType] || [];
  const values: Record<string, string> = {};
  fields.forEach((field) => {
    if (field.type === 'cert-upload') {
      values[field.key] = '';
      if (field.fileNameKey) {
        values[field.fileNameKey] = '';
      }
      if (field.pathKey) {
        values[field.pathKey] = '';
      }
      return;
    }
    values[field.key] = field.defaultValue ?? '';
  });
  return values;
}

export function mergeChannelConfig(
  providerType: PaymentProviderType,
  configJson?: string | null
): Record<string, string> {
  const base = createEmptyChannelConfig(providerType);
  const parsed = parseChannelConfigJson(configJson);
  return { ...base, ...parsed };
}

export function validateChannelConfig(
  providerType: PaymentProviderType,
  values: Record<string, string>
): string | null {
  const fields = PAYMENT_CHANNEL_CONFIG_FIELDS[providerType] || [];
  const missing = fields
    .filter(
      (field) =>
        field.required &&
        field.type !== 'cert-upload' &&
        !values[field.key]?.trim()
    )
    .map((field) => field.label);
  if (missing.length) {
    return `请填写：${missing.join('、')}`;
  }

  if (isAlipayProvider(providerType)) {
    if (!isSupportedAlipaySignType(values.signType)) {
      return `签名类型无效，仅支持：${ALIPAY_SIGN_TYPE_OPTIONS.map((item) => item.value).join('、')}`;
    }

    if (!isSupportedAlipayGateway(values.gateway)) {
      return `网关地址无效，仅支持：${ALIPAY_GATEWAY_OPTIONS.map((item) => item.value).join('、')}`;
    }

    const certMode = hasUploadedAllAlipayCerts(values);
    const hasAnyCert = ALIPAY_CERT_FIELDS.some(
      (item) => values[item.urlKey]?.trim() || values[item.pathKey]?.trim()
    );

    if (hasAnyCert && !certMode) {
      return '证书模式需上传完整三项证书';
    }

    if (certMode) {
      return null;
    }

    if (!values.alipayPublicKey?.trim()) {
      return '公钥模式需填写支付宝公钥，或上传完整三项证书';
    }
  }

  return null;
}

export function isQrPaymentProvider(providerType: PaymentProviderType) {
  return (
    providerType === PaymentProviderType.WeChat ||
    providerType === PaymentProviderType.Alipay
  );
}

export function isAppPaymentProvider(providerType: PaymentProviderType) {
  return providerType === PaymentProviderType.AlipayApp;
}
