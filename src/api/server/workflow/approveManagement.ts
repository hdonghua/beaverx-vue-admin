import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { PagedResultDto, QueryPageRequest } from '@/types/page';

export interface GetFlowGroupWithDefResponse {
  id: string;
  name: string;
  flowDefinitions: FlowDefinition[];
}

export interface FlowDefinition {
  id: string;
  linkId: string;
  name: string;
  icon: string;
  initiatorType: number;
  version: number;
  groupId: string;
  remark?: string | null;
  cancelable: boolean;
  status: number;
  showInWorkbench: boolean;
  editable: boolean;
  flowInitiators?: FlowInitiator[];
}

export interface GetFlowGroupRequest {
  name?: string;
}

export interface AddProcessGroupRequest {
  name: string;
}

export interface AddProcessGroupResponse {
  id: string;
  name: string;
}

export interface GetFlowGroupResponse {
  id: string;
  name: string;
}

/** 分组+流程 */
export function getFlowGroupWithDef(req?: GetFlowGroupRequest) {
  return axios.get<GetFlowGroupRequest, ApiResponse<GetFlowGroupWithDefResponse[]>>(
    '/api/approveManagement/getFlowGroupWithDef',
    {
      params: req,
    }
  );
}

/** 添加流程组 */
export function addProcessGroup(req: AddProcessGroupRequest) {
  return axios.post<AddProcessGroupRequest, ApiResponse<AddProcessGroupResponse>>(
    '/api/approveManagement/addProcessGroup',
    req
  );
}

/** 所有分组 */
export function getFlowGroups() {
  return axios.get<void, ApiResponse<GetFlowGroupResponse[]>>(
    '/api/approveManagement/getFlowGroups'
  );
}

// ========== 流程定义相关类型 ==========

/** 流程节点基础 */
export interface WorkFlowNodeBase {
  name: string;
  type: number;
  childNode?: FlowNode;
}

/** 流程节点 */
export interface FlowNode extends WorkFlowNodeBase {
  assignees?: Assignee[];
  conditionNodes?: FlowConditionNode[];
  approvalType: number;
  flowNodeNoAuditorType: number;
  flowNodeSelfAuditorType: number;
  flowNodeNoAuditorAssignee?: string;
  multiInstanceApprovalType: number;
  ccs?: Cc[];
  backable?: boolean;
  signable?: boolean;
  assignable?: boolean;
  signature?: boolean;
  serviceTaskHandlers?: string[];
}

export interface ServiceTaskHandler {
  key: string;
  name: string;
}

/** 流程条件节点 */
export interface FlowConditionNode extends WorkFlowNodeBase {
  priorityLevel: number;
  conditionGroups?: FlowConditionGroup[];
  conditionExpression?: string;
}

/** 流程节点配置 */
export interface FlowNodeConfig extends WorkFlowNodeBase {
  childNode: FlowNode;
}

/** 审批人 */
export interface Assignee {
  rid: string;
  assignees?: string[];
  assigneeType: number;
  roles?: string[];
}

/** 抄送人 */
export interface Cc {
  rid: string;
  ccType: number;
  assignees?: string[];
  roles?: string[];
}

/** 流程条件 */
export interface FlowCondition {
  id: string;
  val: string[];
  varName: string;
  operator: number;
  operators?: number[];
}

/** 流程条件组 */
export interface FlowConditionGroup {
  id: string;
  conditions?: FlowCondition[];
}

/** 流程定义 */
export interface WorkflowDef {
  id: string | null;
  processKey?: string;
  icon: string;
  name: string;
  groupId: string;
  cancelable: number;
  flowAdminIds: string[];
}

/** 流程发起人 */
export interface FlowInitiator {
  id: string;
  type: number;
}

/** 流程权限 */
export interface FlowPermission {
  type: number;
  flowInitiators?: FlowInitiator[];
}

/** 流程表单控件 */
export interface FlowWidget {
  name: string;
  type: number;
  label?: string;
  summary: boolean;
  required: boolean;
  placeholder?: string;
}

/** 添加流程请求 */
export interface AddProcessRequest {
  nodeConfig: FlowNodeConfig;
  flowWidgets: FlowWidget[];
  workFlowDef: WorkflowDef;
  flowPermission: FlowPermission;
  flowDefJson?: string;
}

export interface WorkflowKeyOption {
  key: string;
  name: string;
}

/** 添加流程 */
export function addProcess(req: AddProcessRequest) {
  return axios.post<AddProcessRequest, ApiResponse<void>>(
    '/api/approveManagement/addProcess',
    req
  );
}

/** 编辑流程 */
export function updateProcess(req: AddProcessRequest) {
  return axios.post<AddProcessRequest, ApiResponse<void>>(
    '/api/approveManagement/updateProcess',
    req
  );
}

export interface GetProcessEditDataResponse {
  flowDefId: string;
  flowDefJson: string;
}

/** 流程编辑数据 */
export function getProcessEditData(defId: string) {
  return axios.get<string, ApiResponse<GetProcessEditDataResponse>>(
    '/api/approveManagement/getProcessEditData',
    {
      params: {
        defId: defId,
      },
    }
  );
}

/** 可用于服务任务节点的代码处理器 */
export function getServiceTaskHandlers() {
  return axios.get<void, ApiResponse<ServiceTaskHandler[]>>(
    '/api/approveManagement/getServiceTaskHandlers'
  );
}

/** 业务代码中预定义的流程 Key */
export function getWorkflowKeyOptions() {
  return axios.get<void, ApiResponse<WorkflowKeyOption[]>>(
    '/api/approveManagement/getWorkflowKeyOptions'
  );
}

export interface QueryFlowInstsDataRequest extends QueryPageRequest {
  keyword?: string;
}

export interface QueryFlowInstsDataResponse {
  flowDefId: string;
  name: string;
  groupId: string;
  cancelable: boolean;
  id: string;
  initiatorId: string;
  beginTime: string;
  status: number;
}

/** 流程数据  */
export function queryFlowInstsData(req: QueryFlowInstsDataRequest) {
  return axios.get<
    QueryFlowInstsDataRequest,
    ApiResponse<PagedResultDto<QueryFlowInstsDataResponse>>
  >('/api/approveManagement/queryFlowInstsData', { params: req });
}
