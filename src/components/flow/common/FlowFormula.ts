import { WIDGET } from "@/components/flow/common/FlowConstant";
import ObjectUtil from "@/components/flow/common/ObjectUtil";

// ========== 类型定义 ==========

/** 公式项 */
export interface FormulaItem {
  value: string;
  name: string;
}

/** 表单组件 */
export interface Widget {
  name: string;
  type: number;
  label?: string;
  required?: boolean;
  formula?: string;
  placeholder?: string;
  formulaItems?: FormulaItem[];
  details?: Widget[];
  editable?: boolean;
  options?: string[];
  format?: string;
  [key: string]: any;
}

/** 表单值类型 */
export type FormValue = Record<string, any>;

/** 明细行值类型 */
export type DetailValue = Record<string, any>;

// ========== 函数实现 ==========

/**
 * 校验表单组件的公式
 *
 * @param widgets - 表单组件列表
 * @returns 公式有错误的组件名称列表
 */
export const formulaWidgetVerify = (widgets: Widget[]): string[] => {
  const formulaErrorWidgetNameList: string[] = [];
  if (!widgets?.length) return formulaErrorWidgetNameList;

  widgets.forEach((widget) => {
    const { name, type, details, formulaItems } = widget;
    if (type === WIDGET.DETAIL) {
      // 筛选出可以作为公式的明细组件
      const formulaDetailWidgetKv: Record<string, string> = {};
      const formulaDetailWidgets = (details || []).filter((i) => {
        const { required, type, label, name } = i;
        if (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
          formulaDetailWidgetKv[name] = label || "";
        }
        return type === WIDGET.FORMULA;
      });

      // 校验明细组件的单项公式
      (formulaItems || []).forEach((i) => {
        const { value } = i;
        if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
        if (formulaDetailWidgetKv.hasOwnProperty(value)) {
          i.name = formulaDetailWidgetKv[value]; // 更新被引用组件的名称
        } else {
          formulaErrorWidgetNameList.push(name);
        }
      });

      (formulaDetailWidgets || []).forEach((formulaDetailWidget) => {
        const { formulaItems, name: formulaDetailName } = formulaDetailWidget;
        (formulaItems || []).forEach((i) => {
          const { value } = i;
          if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
          if (formulaDetailWidgetKv.hasOwnProperty(value)) {
            i.name = formulaDetailWidgetKv[value]; // 更新被引用组件的名称
          } else {
            formulaErrorWidgetNameList.push(formulaDetailName);
          }
        });
      });
    } else if (type === WIDGET.FORMULA && formulaItems?.length) {
      // 筛选出可以作为公式的组件
      const formulaWidgetKv: Record<string, string> = {};
      widgets.forEach((w) => {
        const { required, type, label, name } = w;
        if ((required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) || type === WIDGET.DETAIL) {
          formulaWidgetKv[name] = label || "";
        }
      });

      formulaItems.forEach((i) => {
        const { value } = i;
        if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
        if (formulaWidgetKv.hasOwnProperty(value)) {
          i.name = formulaWidgetKv[value]; // 更新被引用组件的名称
        } else {
          formulaErrorWidgetNameList.push(name);
        }
      });
    }
  });
  return formulaErrorWidgetNameList;
};

/**
 * 初始化公式组件公式
 *
 * @param widgets - 表单组件列表
 */
export const initWidgetFormula = (widgets: Widget[]): void => {
  (widgets || []).forEach((widget) => {
    const { type, formulaItems, details } = widget;
    if ([WIDGET.DETAIL, WIDGET.FORMULA].includes(type) && !!formulaItems?.length) {
      widget.formula = "${" + formulaItems.map((i) => i.value).join("") + "}";
      if (type === WIDGET.FORMULA) {
        widget.placeholder = formulaItems.map((i) => i.name).join("");
      }
    }

    if (type === WIDGET.DETAIL && !!details?.length) {
      initWidgetFormula(details);
    }
  });
};

/**
 * 解析公式表达式中的组件名称
 *
 * @param formula - 公式表达式
 * @returns 组件名称列表
 */
export const listFormulaWidgetNames = (formula: unknown): string[] => {
  if (!ObjectUtil.isNotEmpty(formula)) return [];
  const regex = /\b[A-Za-z][A-Za-z0-9_]*\b/g;
  const matches = String(formula).match(regex);
  return [...new Set(matches || [])];
};

/**
 * 计算公式结果
 *
 * @param formula - 公式表达式
 * @param vars - 变量上下文
 * @returns 计算结果
 */
export const formulaEval = (formula: unknown, vars: Record<string, any>): number => {
  if (!ObjectUtil.isNotEmpty(formula)) return 0;
  let exp = String(formula).replace("${", "").replace("}", "");
  const widgets = listFormulaWidgetNames(exp);
  widgets.forEach((name) => {
    const value = vars[name] || "0";
    exp = exp.replace(name, value);
  });
  let result = 0;
  try {
    result = eval(exp);
  } catch {
    // 忽略计算错误
  }
  // 最高4为精度
  return Math.round(result * Math.pow(10, 4)) / Math.pow(10, 4);
};

/**
 * 表单明细汇总计算
 *
 * @param detailValues - 明细行数据列表
 * @param formula - 公式表达式
 * @returns 计算结果
 */
export const formFormulaDetailCalc = (detailValues: DetailValue[], formula: unknown): number | string => {
  const detailWidgetNames = listFormulaWidgetNames(formula);
  if (!detailWidgetNames?.length || !detailValues?.length) return "";
  let amount = 0;
  for (const detailValue of detailValues) {
    const formDetailVarContext: Record<string, number | string> = {};
    detailWidgetNames.forEach((detailWidgetName) => {
      formDetailVarContext[detailWidgetName] = detailValue[detailWidgetName] || 0;
    });
    amount += formulaEval(formula, formDetailVarContext) || 0;
  }
  return amount;
};

/**
 * 表单公式自动计算
 *
 * @param formValue - 表单值对象
 * @param widgets - 表单组件列表
 */
export const formFormulaAutoCalc = (formValue: FormValue, widgets: Widget[]): void => {
  const formVarContext: Record<string, number> = {};
  widgets
    .filter((widget) => {
      const { name, type, formula, required, details: detailWidgets } = widget;
      if (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
        formVarContext[name] = (formValue[name] as number) || 0;
      } else if (type === WIDGET.DETAIL && detailWidgets?.length) {
        const detailValues: DetailValue[] = formValue[name] || [];
        for (let i = 0; i < detailValues.length; i++) {
          const formDetailVarContext: Record<string, number> = {};
          const detailValue = detailValues[i];
          detailWidgets
            .filter((detailWidget) => {
              const { type: detailType, formula: detailFormula, required: detailRequired, name: detailName } = detailWidget;
              if (detailRequired && [WIDGET.NUMBER, WIDGET.MONEY].includes(detailType)) {
                formDetailVarContext[detailName] = (detailValue[detailName] as number) || 0;
              }
              return detailType === WIDGET.FORMULA && detailFormula;
            })
            .forEach((detailWidget) => {
              // 处理公式
              const { name: detailName, formula: detailFormula } = detailWidget;
              const formualValue = formulaEval(detailFormula, formDetailVarContext) || 0;
              formDetailVarContext[detailName] = formualValue;
              (detailValue as Record<string, any>)[detailName] = formualValue;
            });

          let value = formVarContext[name] || 0;
          value += formulaEval(formula, formDetailVarContext) || 0;
          formVarContext[name] = value;
        }
      }
      return type === WIDGET.FORMULA && formula;
    })
    .forEach((widget) => {
      // 处理公式
      const { name, formula } = widget;
      const value = formulaEval(formula, formVarContext) || 0;
      formValue[name] = value;
    });
};
