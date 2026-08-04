import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import { getFlowInstanceDetails } from '@/api/server/workflow/flow';
import { useOrganStore } from '@/store';

const FlowDataApi = {
  async listFlowInstAssignees({ flowInstId }: { flowInstId: string }) {
    const response = await getFlowInstanceDetails(flowInstId);
    const organStore = useOrganStore();
    const ids = response.data.nodes
      .filter((node: any) => node.underway)
      .flatMap((node: any) => node.userIds || []);
    return {
      code: 1,
      msg: '',
      data: [...new Set(ids)].map((id) => organStore.getUserById(String(id))),
    };
  },
  transfer(input: any) {
    return axios.post<any, ApiResponse<void>>(
      '/api/approveManagement/transfer',
      input
    );
  },
};

export default FlowDataApi;
