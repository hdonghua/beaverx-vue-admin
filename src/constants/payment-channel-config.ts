import { PaymentProviderType } from '@/api/server/payment-channel';

export interface PaymentChannelConfigField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'input' | 'textarea';
  rows?: number;
}

export const PAYMENT_CHANNEL_CONFIG_FIELDS: Record<
  PaymentProviderType,
  PaymentChannelConfigField[]
> = {
  [PaymentProviderType.Sandbox]: [],
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
      rows: 4,
      required: true,
      placeholder: '-----BEGIN PRIVATE KEY-----',
    },
    {
      key: 'platformCert',
      label: '微信平台证书',
      type: 'textarea',
      rows: 4,
      required: true,
      placeholder: '-----BEGIN CERTIFICATE-----',
    },
  ],
  [PaymentProviderType.Alipay]: [
    { key: 'appId', label: 'AppId', required: true, placeholder: '支付宝 AppId' },
    {
      key: 'privateKey',
      label: '应用私钥',
      type: 'textarea',
      rows: 4,
      required: true,
      placeholder: 'RSA2 应用私钥',
    },
    {
      key: 'alipayPublicKey',
      label: '支付宝公钥（公钥模式）',
      type: 'textarea',
      rows: 4,
      placeholder: '公钥模式必填，证书模式可留空',
    },
    {
      key: 'merchantCertPath',
      label: '应用公钥证书路径（证书模式）',
      placeholder: '如 /data/cert/appCertPublicKey.crt',
    },
    {
      key: 'alipayPublicCertPath',
      label: '支付宝公钥证书路径（证书模式）',
      placeholder: '如 /data/cert/alipayCertPublicKey_RSA2.crt',
    },
    {
      key: 'alipayRootCertPath',
      label: '支付宝根证书路径（证书模式）',
      placeholder: '如 /data/cert/alipayRootCert.crt',
    },
    {
      key: 'signType',
      label: '签名类型',
      placeholder: 'RSA2',
    },
    {
      key: 'gateway',
      label: '网关地址',
      placeholder: 'https://openapi.alipay.com/gateway.do',
    },
  ],
};

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
    const value = values[field.key]?.trim() || '';
    if (value) {
      payload[field.key] = value;
    }
  });

  if (providerType === PaymentProviderType.Alipay) {
    payload.signType = values.signType?.trim() || 'RSA2';
    payload.gateway =
      values.gateway?.trim() || 'https://openapi.alipay.com/gateway.do';
  }

  return JSON.stringify(payload);
}

export function createEmptyChannelConfig(
  providerType: PaymentProviderType
): Record<string, string> {
  const fields = PAYMENT_CHANNEL_CONFIG_FIELDS[providerType] || [];
  const values: Record<string, string> = {};
  fields.forEach((field) => {
    values[field.key] = field.key === 'signType' ? 'RSA2' : '';
  });
  if (providerType === PaymentProviderType.Alipay) {
    values.gateway = 'https://openapi.alipay.com/gateway.do';
  }
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
    .filter((field) => field.required && !values[field.key]?.trim())
    .map((field) => field.label);
  if (missing.length) {
    return `请填写：${missing.join('、')}`;
  }

  if (providerType === PaymentProviderType.Alipay) {
    const certMode =
      values.merchantCertPath?.trim() &&
      values.alipayPublicCertPath?.trim() &&
      values.alipayRootCertPath?.trim();
    if (!certMode && !values.alipayPublicKey?.trim()) {
      return '公钥模式需填写支付宝公钥，或完整填写三项证书路径';
    }
  }

  return null;
}
