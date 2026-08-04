// @ts-nocheck
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { useOrganStore } from "@/store/index";
import ArrayUtil from "./ArrayUtil";
import ObjectUtil from "./ObjectUtil";
import type { Widget, FormulaItem } from "./FlowFormula";

// 上面三个参数一一对应
export const operators = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 21] as const;

export type OperatorType = (typeof operators)[number];

export const names: Record<number, string> = {
  0: "等于",
  1: "不等于",
  2: "小于",
  3: "小于等于",
  4: "大于",
  5: "大于等于",
  10: "包含于",
  11: "不包含于",
  12: "等于",
  13: "不等于",
  14: "包含",
  15: "不包含",
  20: "属于",
  21: "不属于",
};

type ExpFunc = (v: string, t: string | string[]) => string;

export const exps: Record<number, ExpFunc> = {
  // 数值操作
  0: (v, t) => `${v}==${t}`,
  1: (v, t) => `${v}!=${t}`,
  2: (v, t) => `${v}<${t}`,
  3: (v, t) => `${v}<=${t}`,
  4: (v, t) => `${v}>${t}`,
  5: (v, t) => `${v}>=${t}`,
  // 字符串操作
  10: (v, t) => `fx.in0(${v},"${t}")`,
  11: (v, t) => `!fx.in0(${v},"${t}")`,
  12: (v, t) => `fx.eq0(${v},"${t}")`,
  13: (v, t) => `!fx.eq0(${v},"${t}")`,
  14: (v, t) => `fx.contain0(${v},"${t}")`,
  15: (v, t) => `!fx.contain0(${v},"${t}")`,
  // 数组操作
  20: (v, t) => {
    if (Array.isArray(t)) {
      const prams = t.map((v) => `"${v}"`).join(",");
      return `fx.has0(${v},${prams})`;
    } else {
      return `fx.has0(${v},"${t}")`;
    }
  },
  21: (v, t) => {
    if (Array.isArray(t)) {
      const prams = t.map((v) => `"${v}"`).join(",");
      return `!fx.has0(${v},${prams})`;
    } else {
      return `!fx.has0(${v},"${t}")`;
    }
  },
};

// 发起人变量名称
export const INITIATOR_VAR_NAME = "initiator";

const initiatorIn = (v: string, t: string[]): string => {
  const prams = t.map((v) => `"${v}"`).join(",");
  return `CustomRuleUtils.HasIntersection(${v},new string[] { ${prams} })`;
};

const initiatorNotIn = (v: string, t: string[]): string => {
  const prams = t.map((v) => `"${v}"`).join(",");
  return `!CustomRuleUtils.HasIntersection(${v},new string[] { ${prams} })`;
};

// ========== 类型定义 ==========

/** 条件 */
export interface Condition {
  id: string;
  varName: string | null;
  val: string[] | null;
  operator: number | null;
}

/** 条件组 */
export interface ConditionGroup {
  id: string;
  conditions: Condition[];
}

/** 分支节点 */
export interface BranchNode {
  conditionGroups: ConditionGroup[];
  [key: string]: any;
}

// ========== 函数实现 ==========

/**
 * 根据名称查询组件
 * @param flowWidgets - 表单组件列表
 * @param name - 组件名称
 * @returns 匹配的组件
 */
const lookupWidget = (flowWidgets: Widget[] | undefined, name: string): Widget | null => {
  if (flowWidgets && flowWidgets.length) {
    for (const flowWidget of flowWidgets) {
      if (flowWidget.name === name) return flowWidget;
      if (flowWidget.type === WIDGET.DETAIL) {
        for (const detail of flowWidget.details || []) {
          if (detail.name === name) return detail;
        }
      }
    }
  }
  return null;
};

/**
 * 获取组件名称
 * @param flowWidget - 表单组件
 * @returns 组件标签
 */
const lookupWidgetLabel = (flowWidget: Widget | null): string => {
  return flowWidget ? (flowWidget.label || "") : "";
};

/**
 * 条件节点卡片上的展示文字
 * @param branchNode - 分支节点
 * @param flowWidgets - 表单组件列表
 * @returns 展示文本
 */
export const showExpNodeContent = (branchNode: BranchNode, flowWidgets: Widget[]): string => {
  const { getById, getDeptById, getUserById } = useOrganStore();
  const { conditionGroups } = branchNode;
  return (
    "当 " +
    conditionGroups
      .map((conditionGroup) => {
        const { conditions } = conditionGroup;
        return conditions
          .filter((e) => ObjectUtil.isNotNull(e.varName) && ObjectUtil.isNotNull(e.operator) && ObjectUtil.isNotNull(e.val))
          .map((condition) => {
            let name: string;
            let operatorName: string;
            let newVal: string;
            if (condition.varName === INITIATOR_VAR_NAME) {
              name = "发起人";
              operatorName = names[condition.operator as number];
              newVal = (condition.val as string[]).map((i) => getById(i).name).join("/");
            } else {
              const widget = lookupWidget(flowWidgets, condition.varName as string);
              name = lookupWidgetLabel(widget);
              operatorName = names[condition.operator as number];
              if (widget && widget.type === WIDGET.DEPARTMENT) {
                newVal = ObjectUtil.isArray(condition.val)
                  ? (condition.val as string[]).map((id) => getDeptById(id).name).join("/")
                  : getDeptById(condition.val as string).name;
              } else if (widget && widget.type === WIDGET.EMPLOYEE) {
                newVal = ObjectUtil.isArray(condition.val)
                  ? (condition.val as string[]).map((id) => getUserById(id).name).join("/")
                  : getUserById(condition.val as string).name;
              } else {
                newVal = [20, 21].includes(condition.operator as number)
                  ? (condition.val as string[]).join("/")
                  : (condition.val as string[]).join("");
              }
            }
            return `${name} ${operatorName} ${newVal}`;
          })
          .join(" 且 ");
      })
      .join(" 或 ")
  );
};

/**
 * 组装分支表达式
 * @param nodeConfig - 节点配置
 */
export const initBranchExp = (nodeConfig: Record<string, any>): void => {
  recursiveBranchNode(nodeConfig);
};

/**
 * 遍历所有的分支节点
 * @param node - 节点
 */
const recursiveBranchNode = (node: Record<string, any> | undefined): void => {
  if (!node) return;
  const { childNode, conditionNodes } = node;
  // 任务节点
  if (childNode) recursiveBranchNode(childNode);
  // 分支
  if (conditionNodes && conditionNodes.length > 0) {
    conditionNodes.forEach((conditionNode: Record<string, any>) => {
      const { childNode: childNode2, conditionNodes: conditionNodes2, conditionGroups } = conditionNode;
      if (childNode2) recursiveBranchNode(childNode2); // 任务节点
      if (conditionNodes2 && conditionNodes2.length > 0)
        conditionNodes2.forEach((conditionNode2: Record<string, any>) => recursiveBranchNode(conditionNode2));
      // 条件组
      if (conditionGroups && conditionGroups.length > 0) initExp(conditionNode);
    });
  }
};

/**
 * 构造分支条件表达式
 * @param branchNode - 分支节点
 */
export const initExp = (branchNode: Record<string, any>): void => {
  const exp = (branchNode.conditionGroups as ConditionGroup[])
    .map((conditionGroup) => {
      const { conditions } = conditionGroup;
      const subExp = conditions
        .filter((e) => ObjectUtil.isNotNull(e.varName) && ObjectUtil.isNotNull(e.operator) && ObjectUtil.isNotNull(e.val))
        .map((condition) => {
          let fun: ExpFunc;
          let newVal: string[];
          let segexp: string;
          if (condition.varName === INITIATOR_VAR_NAME) {
            fun = condition.operator === 20 ? initiatorIn : initiatorNotIn;
            newVal = [...(condition.val as string[])];
            segexp = fun(condition.varName, newVal);
          } else {
            fun = exps[condition.operator as number];
            newVal = [...(condition.val as string[])];
            segexp = fun(condition.varName as string, newVal);
          }
          return segexp;
        })
        .join("&&");
      return `(${subExp})`;
    })
    .join("||");
  branchNode.conditionExpression = exp;
};

// 可以作为条件的组件
const branchWidgets = [
  WIDGET.SINGLELINE_TEXT,
  WIDGET.NUMBER,
  WIDGET.MONEY,
  WIDGET.SINGLE_CHOICE,
  WIDGET.MULTI_CHOICE,
  WIDGET.DATE,
  WIDGET.DATE_RANGE,
  WIDGET.DEPARTMENT,
  WIDGET.EMPLOYEE,
  WIDGET.DETAIL,
  WIDGET.FORMULA,
];

/**
 * 条件分支中，不可引用的组件需要被清除掉
 * @param flowWidgets - 表单组件列表
 * @param nodeConfig - 节点配置
 */
export const cleanUnrequiredWidget = (flowWidgets: Widget[], nodeConfig: Record<string, any>): void => {
  const quotable: Widget[] = []; // 可被作为变量的组件
  (flowWidgets || []).forEach((flowWidget) => {
    const { type, required, details, formulaItems } = flowWidget;
    if ((required && branchWidgets.includes(type)) || type === WIDGET.FORMULA) {
      quotable.push(flowWidget);
    } else if (type === WIDGET.DETAIL && details && details.length && formulaItems && formulaItems.length) {
      quotable.push(flowWidget);
    }
  });
  const quotableNames = quotable.map((i) => i.name);
  quotableNames.push(INITIATOR_VAR_NAME); // 添加固定的变量
  rmNotRequiredWidget(nodeConfig, quotableNames);
};

/**
 * 删除依赖非填项的分支条件
 * @param node - 节点
 * @param requireds - 必填项名称列表
 */
const rmNotRequiredWidget = (node: Record<string, any> | undefined, requireds: string[]): void => {
  if (!node) return;
  const { childNode, conditionNodes } = node;
  // 任务节点
  if (childNode) rmNotRequiredWidget(childNode, requireds);
  // 分支
  if (conditionNodes && conditionNodes.length > 0) {
    conditionNodes.forEach((conditionNode: Record<string, any>) => {
      const { childNode: childNode2, conditionNodes: conditionNodes2, conditionGroups } = conditionNode;
      if (childNode2) rmNotRequiredWidget(childNode2, requireds); // 任务节点
      if (conditionNodes2 && conditionNodes2.length > 0)
        conditionNodes2.forEach((conditionNode2: Record<string, any>) => rmNotRequiredWidget(conditionNode2, requireds));
      // 条件组
      if (conditionGroups && conditionGroups.length > 0) {
        const rmConditionGroupIds: string[] = [];
        (conditionGroups as ConditionGroup[]).forEach((conditionGroup) => {
          const { conditions, id } = conditionGroup;
          const rmConditionVarNames: string[] = [];
          if (conditions && conditions.length > 0) {
            conditions.forEach((condition) => {
              const { varName } = condition;
              if (!requireds.includes(varName as string)) rmConditionVarNames.push(varName as string);
            });
          }

          // 单个条件
          if (rmConditionVarNames.length > 0) {
            rmConditionVarNames.forEach((varName) => {
              ArrayUtil.remove(conditions as any[], "varName", varName);
            });
          }
          if (conditions.length === 0) rmConditionGroupIds.push(id);
        });

        // 删除空的条件组
        if (rmConditionGroupIds.length > 0) {
          rmConditionGroupIds.forEach((id) => {
            ArrayUtil.remove(conditionGroups as any[], "id", id);
          });
        }
      }
    });
  }
};
// @ts-nocheck
