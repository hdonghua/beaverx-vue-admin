// @ts-nocheck
"use strict";
import { ASSIGNEE, NODE, WIDGET } from "@/components/flow/common/FlowConstant";
import { formulaWidgetVerify, Widget } from "@/components/flow/common/FlowFormula";
import { isArray, isNull, isNumber, isObject, isString, isUndefined } from "@/utils/is";
import uniq from "lodash/uniq";
import validator from "validator";

/** 基础信息类型 */
interface BaseInfo {
  name?: string;
  icon?: string;
  groupId?: string;
  flowAdminIds?: string[];
}

/**
 * 校验基础信息
 * @param baseInfo - 基础信息对象
 * @returns 错误信息数组
 */
const verifyBaseInfo = (baseInfo: BaseInfo): string[] => {
  console.log("校验基本信息", baseInfo);
  let errs: string[] = [];
  const prefix = "【基础信息】";
  let { name, icon, groupId, flowAdminIds } = baseInfo || {};
  if (!isString(icon) || validator.isEmpty(icon)) errs.push(`${prefix} 请选择流程图标`);
  if (!isString(name) || validator.isEmpty(name)) errs.push(`${prefix} 请设置流程名称`);
  if (!isString(groupId) || validator.isEmpty(groupId)) errs.push(`${prefix} 请选择流程分组`);
  if (!isArray(flowAdminIds) || flowAdminIds.length == 0) errs.push(`${prefix} 请添加流程管理员`);
  return errs;
};

/**
 * 校验表单信息
 * @param flowWidgets - 表单控件列表
 * @returns 错误信息数组
 */
const verifyFormInfo = (flowWidgets: Widget[]): string[] => {
  console.log("校验表单", flowWidgets);
  let errs: string[] = [];
  const prefix = "【表单设计】";
  if (!isArray(flowWidgets) || flowWidgets.length == 0) {
    errs.push(`${prefix} 请设计流程表单`);
  } else {
    // 选项校验函数
    const valifySelectWidgetOptions = (widget: Widget): void => {
      if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(widget.type)) {
        let { options } = widget;
        if (!isArray(options) || options.length == 0) {
          errs.push(`${prefix} 请为控件（${widget.label}）添加选择项`);
        } else {
          if (uniq(options).length == options.length) {
            options.forEach((option) => {
              if (!isString(option) || validator.isEmpty(option)) {
                errs.push(`${prefix} 控件（${widget.label}）的选项不能为空`);
              }
            });
          } else {
            // 存在重复选项
            errs.push(`${prefix} 控件（${widget.label}）的选项不能重复`);
          }
        }
      }
    };

    // 校验选项空间是否合法
    let flowWidgetNameLabelKv: Record<string, string> = {}; // 组件name:label键值对
    const fieldKeys = new Set<string>();
    const validateFieldKey = (flowWidget: Widget): void => {
      const fieldKey = flowWidget.name;
      if (!isString(fieldKey) || !/^[A-Za-z][A-Za-z0-9_]*$/.test(fieldKey)) {
        errs.push(`${prefix} 控件（${flowWidget.label || ""}）的字段标识格式不正确`);
      } else if (fieldKeys.has(fieldKey)) {
        errs.push(`${prefix} 字段标识不能重复：${fieldKey}`);
      } else {
        fieldKeys.add(fieldKey);
      }
    };

    flowWidgets.forEach((flowWidget) => {
      validateFieldKey(flowWidget);
      flowWidgetNameLabelKv[flowWidget.name] = flowWidget.label || "";
      if ([WIDGET.DETAIL].includes(flowWidget.type)) {
        // 校验明细组件
        let { details } = flowWidget;
        if (!isArray(details) || details.length == 0) {
          errs.push(`${prefix} 请为明细控件（${flowWidget.label}）添加控件`);
        } else {
          details.forEach((detail) => {
            validateFieldKey(detail);
            flowWidgetNameLabelKv[detail.name] = detail.label || "";
            valifySelectWidgetOptions(detail);
          });
        }
      } else if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(flowWidget.type)) {
        // 校验选择框选项
        valifySelectWidgetOptions(flowWidget);
      }
    });

    // 校验公式组件
    let formulaErrorWidgetNameList = formulaWidgetVerify(flowWidgets);
    if (!!formulaErrorWidgetNameList && formulaErrorWidgetNameList.length) {
      formulaErrorWidgetNameList.forEach((widgetName) => {
        errs.push(`${prefix} 控件（${flowWidgetNameLabelKv[widgetName]}）计算公式设置有误`);
      });
    }
  }
  return errs;
};

/** 流程发起人类型 */
interface FlowInitiator {
  id: string;
  type: number;
  organId?: string;
}

/** 流程权限类型 */
interface FlowPermission {
  type: number;
  flowInitiators?: FlowInitiator[];
}

/** 流程节点基类 */
interface FlowNodeBase {
  name: string;
  type: number;
  childNode?: FlowNodeBase | null;
  conditionNodes?: FlowConditionNode[];
}

/** 条件节点 */
interface FlowConditionNode extends FlowNodeBase {
  priorityLevel: number;
  conditionGroups?: FlowConditionGroup[];
  conditionExpression?: string;
}

/** 条件组 */
interface FlowConditionGroup {
  id: string;
  conditions?: FlowCondition[];
}

/** 条件 */
interface FlowCondition {
  id: string;
  val?: string[] | string | null;
  varName?: string;
  operator?: number;
  operators?: number[];
}

/** 审批人/办理人/抄送人 */
interface AssigneeItem {
  assigneeType: number;
  assignees?: string[];
  roles?: { rid: string }[];
}

/** 抄送 */
interface Cc {
  ccType: number;
  assignees?: string[];
  roles?: { rid: string }[];
}

/** 办理人 */
interface Transactor {
  transactorType: number;
  assignees?: string[];
  roles?: { rid: string }[];
}

/** 审批/抄送/办理节点 */
interface FlowOperateNode extends FlowNodeBase {
  assignees?: AssigneeItem[];
  ccs?: Cc[];
  transactors?: Transactor[];
  flowNodeNoAuditorType?: number;
  flowNodeNoAuditorAssignee?: string;
  flowNodeAuditAdmin?: string;
  serviceTaskHandlers?: string[];
}

/** 开始节点 */
interface FlowStartNode {
  name: string;
  type: number;
  childNode?: FlowNodeBase | null;
}

/**
 * 校验流程信息
 * @param startNode - 开始节点
 * @param flowPermission - 流程权限
 * @returns 错误信息数组
 */
const verifyFlowInfo = (startNode: FlowStartNode, flowPermission: FlowPermission | null): string[] => {
  // console.log("校验节点", startNode);
  let errs: string[] = [];
  const prefix = "【流程设计】";

  // 检查流程发起人
  if (!isObject(flowPermission)) {
    errs.push(`${prefix} 请配置发起节点`);
  } else {
    let { flowInitiators, type } = flowPermission;
    if (type == 1 && !(isArray(flowInitiators) && flowInitiators.length > 0)) {
      errs.push(`${prefix} 流程发起人为指定成员时, 发起人列表不能为空`);
    }
  }

  // 检查流程节点
  let { childNode } = startNode;
  if (!isObject(childNode)) errs.push(`${prefix} 流程至少添加一个审批节点`);
  verifyFlowNodeInfo(childNode as FlowNodeBase, prefix, errs);
  return errs;
};

/**
 * 校验流程节点信息
 * @param flowNode - 流程节点
 * @param prefix - 错误前缀
 * @param errs - 错误信息数组
 * @param isLastBranchNode - 是否为最后一个分支节点
 */
const verifyFlowNodeInfo = (
  flowNode: FlowNodeBase | null | undefined,
  prefix: string,
  errs: string[],
  isLastBranchNode: boolean = false
): void => {
  // console.log("校验节点", flowNode);
  // 校验当前节点
  if (flowNode && isObject(flowNode)) {
    let { type, name, conditionGroups } = flowNode;
    if (!isString(name) || validator.isEmpty(name)) errs.push(`${prefix} 请为${name}节点设置名称`);
    if (type == NODE.CONDITION) {
      //校验分支节点, 最后一个默认分支不校验
      if (!isLastBranchNode) {
        if (!(isArray(conditionGroups) && conditionGroups.length > 0)) {
          errs.push(`${prefix} 请为${name}节点设置分组条件`);
        } else {
          conditionGroups.forEach((conditionGroup) => {
            let { conditions } = conditionGroup;
            if (isArray(conditions) && conditions.length > 0) {
              conditions.forEach((condition) => {
                // 校验单个条件
                let { varName, operator, val } = condition;
                if (!isString(varName) || validator.isEmpty(varName)) errs.push(`${prefix} 请为${name}节点选择变量`);
                if (!isNumber(operator)) errs.push(`${prefix} 请为${name}节点选择操作符`);
                if (isUndefined(val) || isNull(val) || (isString(val) && validator.isEmpty(val)) || (isArray(val) && val.length == 0)) {
                  errs.push(`${prefix} 请为${name}节点添加比较值`);
                }
              });
            } else {
              errs.push(`${prefix} 请为${name}节点设置分组条件`);
            }
          });
        }
      }
    } else if (type == NODE.APPROVE) {
      //校验审批节点
      let node = flowNode as FlowOperateNode;
      let { flowNodeNoAuditorType, flowNodeNoAuditorAssignee, flowNodeAuditAdmin, assignees } = node;
      assignees?.forEach((assignee) => {
        let { assigneeType, assignees: assigneeList, roles } = assignee;
        if (assigneeType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择审批角色`);
        if (assigneeType == ASSIGNEE.ASSIGNEE && !(assigneeList && assigneeList.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定审批人`);
      });
      if (flowNodeNoAuditorType == 1) {
        if (!isString(flowNodeNoAuditorAssignee) || validator.isEmpty(flowNodeNoAuditorAssignee)) {
          errs.push(`${prefix} 请为${name}节点选择审批人为空时的指定办理成员`);
        }
      } else if (flowNodeNoAuditorType == 2) {
        if (!isString(flowNodeAuditAdmin) || validator.isEmpty(flowNodeAuditAdmin)) {
          errs.push(`${prefix} 请为${name}节点选择审批人为空时的审批管理员`);
        }
      }
    } else if (type == NODE.COPY) {
      // 校验抄送节点
      let node = flowNode as FlowOperateNode;
      let { ccs } = node;
      ccs?.forEach((cc) => {
        let { ccType, assignees: assigneeList, roles } = cc;
        if (ccType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择抄送角色`);
        if (ccType == ASSIGNEE.ASSIGNEE && !(assigneeList && assigneeList.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定抄送人`);
      });
    } else if (type == NODE.TRANSACT) {
      // 校验办理节点
      let node = flowNode as FlowOperateNode;
      let { flowNodeNoAuditorType, flowNodeNoAuditorAssignee, flowNodeAuditAdmin, transactors } = node;
      transactors?.forEach((transactor) => {
        let { transactorType, assignees: assigneeList, roles } = transactor;
        if (transactorType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择办理角色`);
        if (transactorType == ASSIGNEE.ASSIGNEE && !(assigneeList && assigneeList.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定办理人`);
      });
      if (flowNodeNoAuditorType == 1) {
        if (!isString(flowNodeNoAuditorAssignee) || validator.isEmpty(flowNodeNoAuditorAssignee)) {
          errs.push(`${prefix} 请为${name}节点选择办理人为空时的指定办理成员`);
        }
      } else if (flowNodeNoAuditorType == 2) {
        if (!isString(flowNodeAuditAdmin) || validator.isEmpty(flowNodeAuditAdmin)) {
          errs.push(`${prefix} 请为${name}节点选择办理人为空时的审批管理员`);
        }
      }
    } else if (type == NODE.SERVICE_TASK) {
      const { serviceTaskHandlers } = flowNode as FlowOperateNode;
      if (!(isArray(serviceTaskHandlers) && serviceTaskHandlers.length > 0)) {
        errs.push(`${prefix} 请为${name}节点选择处理器`);
      }
    }

    // 校验子节点和条件分支
    let { childNode, conditionNodes } = flowNode;
    // 校验分支条件
    if (isArray(conditionNodes) && conditionNodes.length > 0) {
      // conditionNodes.forEach((node) => verifyFlowNodeInfo(node, prefix, errs));
      for (let idx = 0; idx < conditionNodes.length; idx++) {
        const node = conditionNodes[idx];
        verifyFlowNodeInfo(node, prefix, errs, idx + 1 == conditionNodes.length);
      }
    }
    // 校验子节点
    verifyFlowNodeInfo(childNode, prefix, errs);
  }
};

export default { verifyBaseInfo, verifyFormInfo, verifyFlowInfo };
// @ts-nocheck
