import {
  getEnabledFlowGroupWithDef,
  getFlowFormWidget,
} from '@/api/server/workflow/flow';
import {
  getFlowGroups,
  type FlowDefinition,
  type GetFlowGroupResponse,
} from '@/api/server/workflow/approveManagement';

const FlowManApi = {
  listGroups() {
    return getFlowGroups();
  },

  listGroupsWithEnabledFlowDefinition() {
    return getEnabledFlowGroupWithDef();
  },

  getFlowFormWidget({ flowDefId }: { flowDefId: string }) {
    return getFlowFormWidget(flowDefId);
  },

  saveOrUpdateGroup(input: { id: string; name: string }) {
    return axios.post<typeof input, ApiResponse<GetFlowGroupResponse>>('/api/approveManagement/saveOrUpdateGroup', input);
  },

  deleteGroup(input: { id: string }) {
    return axios.post<typeof input, ApiResponse<void>>('/api/approveManagement/deleteGroup', input);
  },

  removeById(input: { flowDefId: string }) {
    return axios.post<typeof input, ApiResponse<void>>('/api/approveManagement/removeById', input);
  },

  freezeById(input: { flowDefId: string }) {
    return axios.post<typeof input, ApiResponse<void>>('/api/approveManagement/freezeById', input);
  },

  enableById(input: { flowDefId: string }) {
    return axios.post<typeof input, ApiResponse<void>>('/api/approveManagement/enableById', input);
  },

  copy(input: { flowDefId: string; name: string }) {
    return axios.post<typeof input, ApiResponse<FlowDefinition>>('/api/approveManagement/copy', input);
  },

  async checkRelaunchable({ flowDefId }: { flowDefId: string }) {
    const response = await getEnabledFlowGroupWithDef();
    const flowDefinition = response.data
      .flatMap((group) => group.flowDefinitions || [])
      .find((flow) => String(flow.id) === String(flowDefId));

    return { code: 1, msg: '', data: flowDefinition };
  },
};

export default FlowManApi;
import axios from 'axios';
import type { ApiResponse } from '@/utils/request';
