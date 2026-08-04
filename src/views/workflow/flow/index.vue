<template>
  <div>
    <Flow></Flow>
  </div>
</template>

<script setup lang="ts">
  import Flow from '@/components/flow/index.vue';
  import { useFlowStore } from '@/store';
  import { onBeforeMount, onMounted } from 'vue';

  const flowStore = useFlowStore();
  onBeforeMount(() => {
    flowStore.setFlowDef({
      nodeConfig: {
        name: '开始',
        type: 0,
        childNode: {
          name: '审批',
          type: 1,
          backable: false,
          signable: false,
          assignees: [{ rid: '971342403770257408', assigneeType: 7 }],
          childNode: null,
          formAuths: [
            {
              name: 'FLOW_969538531246477312',
              type: 15,
              label: '关联审批',
              editable: false,
              readable: true,
            },
            {
              name: 'DETAIL_970973553631432704',
              type: 9,
              label: '明细',
              details: [
                {
                  name: 'INPUT_971300080961196032',
                  type: 0,
                  label: '单行文本',
                  editable: false,
                  readable: true,
                },
                {
                  name: 'MONEY_970973600389533696',
                  type: 4,
                  label: '金额',
                  editable: false,
                  readable: true,
                },
                {
                  name: 'NUM_970973589492731904',
                  type: 3,
                  label: '数字',
                  editable: false,
                  readable: true,
                },
              ],
            },
            {
              name: 'DATERANGE_971298329730224128',
              type: 8,
              label: '日期区间',
              editable: false,
              readable: true,
            },
            {
              name: 'FORMULA_970973613287018496',
              type: 23,
              label: '公式',
              editable: false,
              readable: true,
            },
            {
              name: 'NUM_970978279198560256',
              type: 3,
              label: '数字',
              editable: false,
              readable: true,
            },
            {
              name: 'MONEY_970978287117406208',
              type: 4,
              label: '金额',
              editable: false,
              readable: true,
            },
            {
              name: 'FORMULA_970978237335212032',
              type: 23,
              label: '公式',
              editable: false,
              readable: true,
            },
          ],
          assignable: false,
          approvalType: 0,
          flowNodeNoAuditorType: 0,
          flowNodeSelfAuditorType: 0,
          multiInstanceApprovalType: 1,
        },
      },
      flowWidgets: [
        {
          name: 'FLOW_969538531246477312',
          type: 15,
          label: '关联审批',
          placeholder: '请选择审批',
        },
        {
          name: 'DETAIL_970973553631432704',
          type: 9,
          label: '明细',
          details: [
            {
              name: 'INPUT_971300080961196032',
              type: 0,
              label: '单行文本',
              placeholder: '请输入',
            },
            {
              name: 'MONEY_970973600389533696',
              type: 4,
              label: '金额',
              required: true,
              placeholder: '请输入金额',
            },
            {
              name: 'NUM_970973589492731904',
              type: 3,
              label: '数字',
              required: true,
              placeholder: '请输入数字',
            },
          ],
        },
        {
          name: 'DATERANGE_971298329730224128',
          type: 8,
          label: '日期区间',
          format: 'YYYY-MM-DD HH:mm',
          required: false,
          placeholder: '请选择日期区间',
        },
        {
          name: 'FORMULA_970973613287018496',
          type: 23,
          label: '公式',
          formula: '${DETAIL_970973553631432704}',
          placeholder: '明细',
          formulaItems: [{ name: '明细', value: 'DETAIL_970973553631432704' }],
        },
        {
          name: 'NUM_970978279198560256',
          type: 3,
          label: '数字',
          placeholder: '请输入数字',
        },
        {
          name: 'MONEY_970978287117406208',
          type: 4,
          label: '金额',
          placeholder: '请输入金额',
        },
        {
          name: 'FORMULA_970978237335212032',
          type: 23,
          label: '公式',
          formula: '${DETAIL_970973553631432704*100}',
          placeholder: '明细×100',
          formulaItems: [
            { name: '明细', value: 'DETAIL_970973553631432704' },
            { name: '×', value: '*' },
            { name: '1', value: '1' },
            { name: '0', value: '0' },
            { name: '0', value: '0' },
          ],
        },
      ],
      workFlowDef: {
        id: '2049405525684310017',
        icon: 'approval',
        name: '规划局',
        remark: '阿萨德',
        groupId: '1858948748818903042',
        cancelable: 1,
        flowAdminIds: ['staffId-caiwubuzhang'],
      },
      flowPermission: { type: 0 },
    });
    flowStore.setFlowGroups([]);
  });
</script>

<script lang="ts">
  export default {
    name: 'Flow',
  };
</script>
