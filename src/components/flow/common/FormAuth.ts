import { NODE, WIDGET } from "@/components/flow/common/FlowConstant";
import { INITIATOR_VAR_NAME } from "./FormExp";
import type { Widget } from "./FlowFormula";

// ========== 类型定义 ==========

/** 条件 */
export interface Condition {
  id: string;
  varName: string;
  val: string[];
  operator: number;
  operators?: number[];
}

/** 条件组 */
export interface ConditionGroup {
  id: string;
  conditions?: Condition[];
}

/** 条件分支节点 */
export interface ConditionNode {
  name: string;
  type: number;
  childNode?: FlowNode;
  conditionNodes?: ConditionNode[];
  conditionGroups?: ConditionGroup[];
  priorityLevel?: number;
}

/** 流程节点 */
export interface FlowNode {
  name: string;
  type: number;
  childNode?: FlowNode;
  conditionNodes?: ConditionNode[];
  formAuths?: FormAuth[];
  [key: string]: any;
}

/** 明细表单项权限 */
export interface DetailFormAuth {
  name: string;
  type: number;
  label?: string;
  readable: boolean;
  editable: boolean;
}

/** 表单项权限 */
export interface FormAuth {
  name: string;
  type: number;
  label?: string;
  readable?: boolean;
  editable?: boolean;
  details?: DetailFormAuth[];
}

// ========== 函数实现 ==========

/**
 * 筛选出所有作为条件的组件
 *
 * @param startNode - 流程开始节点
 * @param conditionWidgets - 空的数组，用于收集条件组件名称
 */
export function filterConditionWidgets(startNode: FlowNode | undefined, conditionWidgets: string[]): void {
  const { childNode, conditionNodes } = startNode || {};
  if (childNode) filterConditionWidgets(childNode, conditionWidgets);
  (conditionNodes || []).forEach((conditionNode) => {
    if (conditionNode.childNode) filterConditionWidgets(conditionNode.childNode, conditionWidgets);
    (conditionNode.conditionGroups || []).forEach((conditionGroup) => {
      (conditionGroup.conditions || []).forEach((condition) => {
        const { varName } = condition;
        if (varName && varName !== INITIATOR_VAR_NAME) conditionWidgets.push(varName);
      });
    });
  });
}

/**
 * 根据名称筛选出组件
 *
 * @param widgets - 表单组件列表
 * @param name - 组件名称
 * @returns 匹配的组件
 */
const filterFormAuth = (widgets: Widget[], name: string): Widget | null => {
  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    if (widget.type === WIDGET.DETAIL) {
      const details = widget.details || [];
      for (let ii = 0; ii < details.length; ii++) {
        const detail = details[ii];
        if (detail.name === name) return detail;
      }
    } else {
      if (widget.name === name) return widget;
    }
  }
  return null;
};

/**
 * 重新设置所有节点的表单权限
 *
 * @param startNode - 流程开始节点
 * @param widgets - 所有表单组件
 * @param conditionWidgets - 条件节点使用的表单组件数组
 */
export function resetAllNodeFormAuth(startNode: FlowNode, widgets: Widget[], conditionWidgets: string[]): void {
  if (!startNode) return;
  const { childNode, conditionNodes, type } = startNode;
  if ([NODE.APPROVE, NODE.TRANSACT, NODE.COPY].includes(type)) {
    initNodeFormAuth(startNode, widgets, conditionWidgets);
  }
  if (childNode) resetAllNodeFormAuth(childNode, widgets, conditionWidgets);
  if (conditionNodes) conditionNodes.forEach((conditionNode) => resetAllNodeFormAuth(conditionNode, widgets, conditionWidgets));
}

/**
 * 初始化节点的标签权限
 * 表单选项写到节点的formAuths属性下面
 *
 * @param node - 需要设置表单权限的节点
 * @param widgets - 所有表单组件
 * @param conditionWidgets - 条件节点使用的表单组件数组
 */
export function initNodeFormAuth(node: FlowNode, widgets: Widget[], conditionWidgets: string[]): void {
  let formAuths = node.formAuths;
  if (!formAuths) {
    formAuths = (widgets || []).map((widget) => {
      const { name, label, type } = widget;
      let formAuth: FormAuth;
      if (type === WIDGET.DETAIL) {
        formAuth = { name, type, label };
        formAuth.details = (widget.details || []).map((detail) => {
          return { name: detail.name, type: detail.type, label: detail.label, readable: true, editable: false };
        });
      } else {
        formAuth = { name, type, label, readable: true, editable: false };
      }
      return formAuth;
    });
  } else {
    formAuths = (widgets || []).map((widget) => {
      const { name, label, type } = widget;
      let formAuth: FormAuth;
      if (type === WIDGET.DETAIL) {
        formAuth = { name, type, label };
        formAuth.details = (widget.details || []).map((detail) => {
          const item = filterFormAuth(widgets, detail.name) as FormAuth | null;
          const readable = item ? item.readable ?? true : true;
          let editable = item ? item.editable ?? false : false;
          if (conditionWidgets.includes(detail.name)) editable = false;
          return { name: detail.name, type: detail.type, label: detail.label, readable, editable };
        });
      } else {
        const item = filterFormAuth(widgets, name) as FormAuth | null;
        const readable = item ? item.readable ?? true : true;
        let editable = item ? item.editable ?? false : false;
        if (conditionWidgets.includes(name)) editable = false;
        formAuth = { name, type, label, readable, editable };
      }
      return formAuth;
    });
  }
  node.formAuths = formAuths;
}
