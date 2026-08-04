// @ts-nocheck
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { PagedResultDto, QueryPageRequest } from '@/types/page';
import { WIDGET } from '@/components/flow/common/FlowConstant';

// ========== 流程分组类型 ==========

export interface FlowDefinition {
  id: string;
  linkId: string;
  name: string;
  icon: string;
  initiatorType: number;
  version: number;
  groupId: string;
  remark?: string;
  cancelable: boolean;
  status: number;
  showInWorkbench: boolean;
  editable: boolean;
}

export interface FlowGroup {
  id: string;
  name: string;
  flowDefinitions: FlowDefinition[];
}

/** 获取启用的流程分组及定义 */
export function getEnabledFlowGroupWithDef() {
  return axios.get<void, ApiResponse<FlowGroup[]>>(
    '/api/workflow/getEnabledFlowGroupWithDef'
  );
}

// ========== 流程表单控件类型 ==========

export interface FlowFormField {
  id: string;
  flowDefId: string;
  name: string;
  label: string;
  placeholder: string;
  type: number;
  required: boolean;
  summary: boolean;
  locale: boolean;
  comma: boolean;
  format: string;
}

/** 获取流程表单控件 */
export function getFlowFormWidget(defId: string) {
  return axios.get<void, ApiResponse<FlowFormField[]>>(
    '/api/workflow/getFlowFormWidget?defId=' + defId
  );
}

// ========== 发起流程 ==========

export interface LaunchFlowRequest {
  flowDefId: string;
  flowValue: string;
  designees: Record<string, string[]>;
}

/** 发起流程 */
export function launchFlow(req: LaunchFlowRequest) {
  return axios.post<LaunchFlowRequest, ApiResponse<void>>('/api/workflow/lanunch', req);
}

// ========== 流程图 ==========

export interface FlowNodeInfo {
  id: string;
  name: string;
  nodeId: string;
  nodeType: number;
  approvalType: number;
  multiInstanceApprovalType: number;
  flowNodeNoAuditorType: number;
  userIds: string[];
  roleIds: string[];
  initatorChoice: boolean;
}

/** 查看流程图 */
export function viewProcessChart(defId: string) {
  return axios.get<void, ApiResponse<FlowNodeInfo[]>>(
    '/api/workflow/viewProcessChart?defId=' + defId
  );
}

// ========== 流程实例详情类型 ==========

export interface FlowFormWidget {
  id: string;
  flowDefId: string;
  name: string;
  label?: string;
  placeholder?: string;
  type: number;
  required: boolean;
  summary: boolean;
  locale: boolean;
  comma: boolean;
}

export interface FlowInstanceNode {
  id: string;
  name: string;
  flowInstId: string;
  flowNodeId: string;
  flowNodeName: string;
  userIds?: string[];
  underway: boolean;
  type: number;
  multiInstanceApprovalType: number;
}

export interface GetFlowInstanceDetailsResponse {
  formValue: string;
  formWidgets: FlowFormWidget[];
  futureNodes: FlowInstanceNode[];
  nodes: FlowInstanceNode[];
}

// 获取流程实例详情
export function getFlowInstanceDetails(instanceId: string) {
  return axios.get<string, ApiResponse<GetFlowInstanceDetailsResponse>>(
    '/api/workflow/getFlowInstanceDetails?instanceId=' + instanceId
  );
}

// ========== 待审批任务类型 ==========

export interface QuerypendingMyApprovalTaskResponse {
  flowDefId: string;
  name: string;
  groupId: string;
  cancelable: boolean;
  id: string;
  instanceNo: string;
  initiatorId: string;
  beginTime?: string;
  status: number;
  taskId: string | null;
  actNodeId: string | null;
  nodeSignType: number;
  assignable: boolean;
  signable: boolean;
  backable: boolean;
  signature: boolean;
  nodeType: number;
}

export interface QuerypendingMyApprovalTaskRequest extends QueryPageRequest {
  keyword?: string;
  page?: number;
  size?: number;
}

// 查询待审批任务
export function queryPendingMyApprovalTasks(
  req: QuerypendingMyApprovalTaskRequest
) {
  return axios.get<
    QuerypendingMyApprovalTaskRequest,
    ApiResponse<PagedResultDto<QuerypendingMyApprovalTaskResponse>>
  >('/api/workflow/queryPendingMyApprovalFlowInsts', {
    params: { ...req, page: req.current || req.page, pageSize: req.pageSize || req.size },
  });
}

// 我的申请审批
export function queryMyApplyFlowInstances(
  req: QuerypendingMyApprovalTaskRequest
) {
  return axios.get<
    QuerypendingMyApprovalTaskRequest,
    ApiResponse<PagedResultDto<QuerypendingMyApprovalTaskResponse>>
  >('/api/workflow/queryMyApplyFlowInstances', {
    params: { ...req, page: req.current || req.page, pageSize: req.pageSize || req.size },
  });
}

// 我收到的审批
export function queryCcMimeFlowInstanceAsync(
  req: QuerypendingMyApprovalTaskRequest
) {
  return axios.get<
    QuerypendingMyApprovalTaskRequest,
    ApiResponse<PagedResultDto<QuerypendingMyApprovalTaskResponse>>
  >('/api/workflow/queryCcMimeFlowInstanceAsync', {
    params: { ...req, page: req.current || req.page, pageSize: req.pageSize || req.size },
  });
}

// 我已审批
export function queryMimeAuditFlowInstance(
  req: QuerypendingMyApprovalTaskRequest
) {
  return axios.get<
    QuerypendingMyApprovalTaskRequest,
    ApiResponse<PagedResultDto<QuerypendingMyApprovalTaskResponse>>
  >('/api/workflow/queryMimeAuditFlowInstance', {
    params: { ...req, page: req.current || req.page, pageSize: req.pageSize || req.size },
  });
}

export function formWidgetListToMap(flowWidgets) {
  let _flowWidgetMap = {};
  flowWidgets.forEach((flowWidget) => {
    let { name, type, details } = flowWidget;
    _flowWidgetMap[name] = flowWidget;
    if (type == WIDGET.DETAIL)
      details.forEach((detail) => (_flowWidgetMap[detail.name] = detail));
  });
  return _flowWidgetMap;
}

export interface CommentRequest {
  instanceId: string;
  taskId?: string;
  content: string;
  attachment: string;
}

// 评论
export function comment(req: CommentRequest) {
  return axios.post<CommentRequest, ApiResponse<void>>('/api/workflow/comment', req);
}

export interface AssignRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
  assignee: string;
  comment: string;
}

// 转交
export function assign(req: AssignRequest) {
  return axios.post<AssignRequest, ApiResponse<void>>('/api/workflow/assign', req);
}

// 加签
export interface AddSignRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
  userId: string;
  comment: string;
}

// 加签
export function addSign(req: AddSignRequest) {
  return axios.post<AddSignRequest, ApiResponse<void>>('/api/workflow/addSign', req);
}

export interface DelSignRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
}

// 减签
export function delSign(req: DelSignRequest) {
  return axios.post<DelSignRequest, ApiResponse<void>>('/api/workflow/delSign', req);
}

export interface JumpRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
}

// 减签
export function jump(req: JumpRequest) {
  return axios.post<JumpRequest, ApiResponse<void>>('/api/workflow/jump', req);
}

export interface ApproveRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
  comment?: string;
}

// 审批（通过/拒绝）
export function approve(req: ApproveRequest) {
  return axios.post<ApproveRequest, ApiResponse<void>>('/api/workflow/approve', req);
}

export interface CancelRequest {
  flowInstId: string;
  taskId: string;
  flowCmd: number;
  fileIds?: string[];
  comment?: string;
}

// 撤销流程
export function cancel(req: CancelRequest) {
  return axios.post<CancelRequest, ApiResponse<void>>('/api/workflow/cancel', req);
}
