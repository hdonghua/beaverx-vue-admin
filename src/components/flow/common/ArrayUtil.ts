/**
 * 删除某个元素
 *
 * @param arr - 目标数组
 * @param key - 属性名
 * @param value - 属性值
 */
function remove<T extends Record<string, any>>(arr: T[], key: keyof T, value: T[keyof T]): void {
  let idx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == value) {
      idx = i;
      break;
    }
  }

  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}

/**
 * 根据指定属性值获取某个元素
 *
 * @param arr - 目标数组
 * @param key - 属性名
 * @param val - 属性值
 * @returns 匹配的元素，未找到返回空对象
 */
function get<T extends Record<string, any>>(arr: T[], key: keyof T, val: T[keyof T]): T {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == val) return arr[i];
  }
  return {} as T;
}

/**
 * 是否为数组
 *
 * @param obj - 待检测对象
 * @returns 是否为数组
 */
function isArray(obj: unknown): obj is any[] {
  return Array.isArray(obj);
}

/**
 * 数组去重（根据指定字段）
 *
 * @param arr - 目标数组
 * @param field - 去重依据的字段名
 * @returns 去重后的数组
 */
function distinct<T extends Record<string, any>>(arr: T[], field: keyof T): T[] {
  const obj: Record<string, boolean> = {};
  arr = arr.reduce<T[]>((item, next) => {
    if (!obj[String(next[field])]) {
      obj[String(next[field])] = true;
      item.push(next);
    }
    return item;
  }, []);
  return arr;
}

/**
 * 两个数组的交集
 *
 * @param a - 数组A
 * @param b - 数组B
 * @returns 交集数组
 */
function intersection<T>(a: T[], b: T[]): T[] {
  return a.filter((v) => b.includes(v));
}

/**
 * 数组去重
 *
 * @param arr - 目标数组
 * @returns 去重后的数组
 */
const unique = <T>(arr: T[]): T[] => {
  const res = new Map<T, boolean>();
  return arr.filter((item) => {
    if (!res.has(item)) {
      res.set(item, true);
      return true;
    }
    return false;
  });
};

export default { remove, get, isArray, distinct, intersection, unique };
