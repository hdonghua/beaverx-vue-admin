import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import {
  getFlowInstanceDetails,
  queryPendingMyApprovalTasks,
  queryMyApplyFlowInstances,
  queryCcMimeFlowInstanceAsync,
  queryMimeAuditFlowInstance,
} from '@/api/server/workflow/flow';

const normalizePage = (query: any) => ({
  ...query,
  current: query.current || query.page || 1,
  pageSize: query.pageSize || query.size || 20,
});

const FlowInstApi = {
  getById({ flowInstId }: { flowInstId: string }) {
    return axios.get<void, ApiResponse<any>>(
      `/api/workflow/getFlowInstanceSummary?instanceId=${flowInstId}`
    );
  },
  listTasks(query: any) {
    return queryPendingMyApprovalTasks(normalizePage(query));
  },
  listMineFlowInsts(query: any) {
    return queryMyApplyFlowInstances(normalizePage(query));
  },
  listMineFlowInstCcs(query: any) {
    return queryCcMimeFlowInstanceAsync(normalizePage(query));
  },
  listMineAuditRecords(query: any) {
    return queryMimeAuditFlowInstance(normalizePage(query));
  },
  async listJumpableNodes({ flowInstId }: { flowInstId: string }) {
    const response = await getFlowInstanceDetails(flowInstId);
    return { code: 1, msg: '', data: response.data.nodes.filter((node: any) => !node.underway) };
  },
  async listRemoveableNodeAssignees({ flowInstId }: { flowInstId: string }) {
    const response = await getFlowInstanceDetails(flowInstId);
    const data = response.data.nodes.filter((node: any) => node.underway).flatMap((node: any) => node.userIds || []);
    return { code: 1, msg: '', data };
  },
  listFormEditRecords({ flowInstId }: { flowInstId: string }) {
    return axios.get<void, ApiResponse<any[]>>(
      '/api/workflow/listFormEditRecords',
      { params: { flowInstId } }
    );
  },
  hasFormEditRecord({ flowInstId }: { flowInstId: string }) {
    return axios.get<void, ApiResponse<boolean>>(
      '/api/workflow/hasFormEditRecord',
      { params: { flowInstId } }
    );
  },
  urge(input: { flowInstId: string }) {
    return axios.post<typeof input, ApiResponse<void>>('/api/workflow/urge', input);
  },
  formModify(input: any) {
    return axios.post<any, ApiResponse<void>>('/api/workflow/formModify', input);
  },
};

export default FlowInstApi;
