/**
 * 金额转换为人民币大写
 * @param money - 金额数值或字符串
 * @returns 人民币大写字符串
 */
const toRmb = (money: string | number): string => {
  // 定义汉字的数组
  const cnNums = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); // 存储数字的大写 从零开始 是因为index从0开始计数
  const cnIntRadice = new Array("", "拾", "佰", "仟"); // 基础计数
  const cnIntUnits = new Array("", "万", "亿", "兆"); //  量级
  const cnDecUnits = new Array("角", "分", "毫", "厘"); // 小数位的金额单位
  const cnInt = "整";
  const cnIntLast = "元";
  const maxNum = 999999999999999.9999;
  let integerNum: string; // 存储金额的整数部分
  let decimalNum: string; // 存储金额的小数部分
  let cnMoney = ""; // 最终返回的大写金额
  let parts: string[]; // 存储金额整数部分和小数部分的数组

  // 金额为""时返空
  if (money === "") {
    return "";
  }

  // 金额大于最大金额返空
  money = parseFloat(String(money));
  if (money >= maxNum) {
    return "";
  }

  // 金额为零时直接返回零元整
  if (money === 0) {
    cnMoney = cnNums[0] + cnIntLast + cnInt;
    return cnMoney;
  }

  // 解析小数部分
  money = money.toString(); //  转换为字符串
  if (money.indexOf(".") === -1) {
    // 金额为整数时
    integerNum = money;
    decimalNum = "";
  } else {
    // 金额为浮点数时
    parts = money.split(".");
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4); // 小数位计数单位，精确到角分毫厘
  }

  // 格式化整数部分
  if (parseInt(integerNum, 10) > 0) {
    // 整数化为 十进制整数 大于零
    let zeroCount = 0; //  金额里的数字 0
    const IntLen = integerNum.length; // 整数数字的长度有多长
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1); // 截出i的这一项
      const p = IntLen - i - 1; // 对应下标  i后面还有几位没有处理
      const q = p / 4; // i 后面有几个 四位 看能不能用上仟以上的计量
      const m = p % 4; // 取余 四个为一组 剩下的余数 就是 当前这一项 所要从 cnIntRadice 个十百千 所对应的是十分位还是百分位还是千分位
      if (n === "0") {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          // 每次循环到这里发现上一项是零 先给大写字符串加个零 再把 记录金额0的清空一下
          cnMoney += cnNums[0];
        }
        zeroCount = 0; //  归零
        cnMoney += cnNums[parseInt(n)] + cnIntRadice[m]; // 数字所对应的大写+数字多对应的基础计数
      }
      if (m === 0 && zeroCount < 4) {
        // m为0没有余数表示i项之后  要么少于四位 要么有多个四位
        cnMoney += cnIntUnits[q]; // q为1的话表示i项之后还有1组四位 当前的i项在 万 级别
      }
    }
    cnMoney += cnIntLast; // 加上 单位元
  }

  // 格式化小数部分
  if (decimalNum !== "") {
    // 小数部分不为空
    const decLen = decimalNum.length; // 小数部分长度
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1); // 截出i的这一项
      if (n !== "0") {
        // 这个数字不等于零时
        cnMoney += cnNums[Number(n)] + cnDecUnits[i]; // 先匹配数字的金额大写再匹配金额单位
      }
    }
  }

  // 加元和整字
  if (cnMoney === "") {
    // 化为金额大写的字段为空时 直接 零元整
    cnMoney += cnNums[0] + cnIntLast + cnInt;
  } else if (decimalNum === "") {
    cnMoney += cnInt; // ＋整字
  }

  return cnMoney;
};

/**
 * 换行符转换为HTML换行
 * @param text - 原始文本
 * @returns 带HTML换行的字符串
 */
const newline = (text?: string): string => {
  return text?.replace(/\n/g, "<br/>") ?? "";
};

export { newline, toRmb };
