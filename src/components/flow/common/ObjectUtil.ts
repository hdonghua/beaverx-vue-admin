const toString = Object.prototype.toString;

/**
 * 对象复制（深拷贝）
 * @param o - 待拷贝对象
 * @returns 拷贝后的新对象
 */
function copy<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

/**
 * 正则表达式检测值是否为数值
 * @param value - 待检测值
 * @returns 是否为数值
 */
function isNumber(value: unknown): boolean {
  const regrex = new RegExp("^(-?\\d+)(\\.\\d+)?$");
  return typeof value === "number" ? true : regrex.test(String(value));
}

/**
 * 检测是否为普通对象
 * @param value - 待检测值
 * @returns 是否为普通对象
 */
function isObject(value: unknown): boolean {
  return Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * 驼峰转短横线
 * @param text - 驼峰字符串
 * @returns 短横线字符串
 */
function hyphenate(text: string): string {
  return text.replace(/\B([A-Z])/g, "-$1").toLowerCase();
}

/**
 * 检测是否为字符串
 * @param value - 待检测值
 * @returns 是否为字符串
 */
function isString(value: unknown): boolean {
  return typeof value === "string";
}

/**
 * 检测是否为数组
 * @param value - 待检测值
 * @returns 是否为数组
 */
function isArray(value: unknown): boolean {
  return toString.call(value) === "[object Array]";
}

/**
 * 检测是否不为 null/undefined
 * @param value - 待检测值
 * @returns 是否不为 null/undefined
 */
function isNotNull(value: unknown): boolean {
  return value != null;
}

/**
 * 检测是否非空
 * @param value - 待检测值
 * @returns 是否非空
 */
function isNotEmpty(value: unknown): boolean {
  // 1. 排除 null/undefined
  if (value == null) return false;
  // 2. 排除空字符串
  if (typeof value === "string" && value.trim() === "") return false;
  // 3. 排除空数组
  if (Array.isArray(value) && value.length === 0) return false;
  // 4. 排除空对象
  if (typeof value === "object" && Object.keys(value).length === 0) return false;
  // 其他情况视为非空
  return true;
}

/**
 * 格式化数字为千分位
 * @param number - 数字
 * @returns 千分位格式字符串
 */
function comma(number: string | number | null | undefined): string | number | null | undefined {
  if (number) {
    const values = (number + "").split(".");
    values[0] = values[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return values.join(".");
  } else {
    return number;
  }
}

/**
 * 限制数字精度
 * @param number - 数字
 * @param scale - 小数位数
 * @returns 精度限制后的值
 */
function limitScale(number: string | number, scale: number): string | number {
  const text = String(number);
  if (text.includes(".")) {
    return text.substring(0, text.indexOf(".") + 1 + scale);
  }
  return number;
}

export default { copy, isNumber, isObject, isArray, hyphenate, isString, comma, limitScale, isNotNull, isNotEmpty };
