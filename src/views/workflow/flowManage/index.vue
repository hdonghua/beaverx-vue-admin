<template>
  <div class="fd-main-box" v-loading.fullscreen="loading">
    <!-- 检索区域 -->
    <div class="search-area">
      <div class="search-item">
        <a-input
          :style="{ minWidth: '240px' }"
          v-model:model-value="flowName"
          placeholder="请输入审批名称搜索"
          allow-clear
          :max-length="16"
        >
          <template #prefix> <icon-search /> </template>
        </a-input>
      </div>
      <div class="btns">
        <a-button @click="onNewFlowBtnClick()">
          新建分组
          <template #icon> <icon-layers /> </template>
        </a-button>
        <a-button type="primary" @click="onFlowCreate()">
          创建审批
          <template #icon> <icon-plus /> </template>
        </a-button>
      </div>
    </div>

    <!-- 流程列表区域 -->
    <div class="flow-groups-area">
      <a-card
        class="empty-flow-box general-card"
        v-if="!groups || groups.length == 0"
      >
        <a-empty />
      </a-card>
      <template v-else v-for="group in groups">
        <div class="group-item-box">
          <div class="group-header">
            <div class="name">
              <editable-text
                v-model:value="group.name"
                @change="onGroupNameChange($event, group)"
                :hoverable="true"
              />
            </div>
            <div class="operaion">
              <a-popconfirm
                v-if="
                  !group.flowDefinitions || group.flowDefinitions.length == 0
                "
                type="warning"
                content="确认删除该分组 ?"
                position="tr"
                @ok="onDeleteGroupClick(group)"
              >
                <a-button size="small">
                  <template #icon><icon-delete :size="18" /> </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
          <div class="group-body">
            <div
              class="flow-item"
              v-for="item in filteredFlows(group.flowDefinitions)"
            >
              <div class="name-icon flow-item-field">
                <flow-icon :icon="item.icon" :size="40"></flow-icon>
                <div class="name-desc">
                  <span>{{ item.name }}</span>
                  <span class="desc">{{ item.remark }}</span>
                </div>
                <div class="tag"
                  ><a-tag color="red" v-if="item.status == 1"
                    >已停用</a-tag
                  ></div
                >
              </div>
              <div class="version flow-item-field">
                <a-tag color="arcoblue">{{ `v${item.version}` }}</a-tag>
              </div>
              <div class="seeable flow-item-field">
                <template v-if="item.initiatorType == 0">全员可见</template>
                <template v-if="item.initiatorType == 1">
                  <a-tooltip
                    :content="formatFlowInitiator(item.flowInitiators)"
                  >
                    <span>{{ formatFlowInitiator(item.flowInitiators) }}</span>
                  </a-tooltip>
                </template>
                <template v-if="item.initiatorType == 2">均不可见</template>
              </div>
              <div class="operations flow-item-field">
                <template v-if="item.editable">
                  <a-button size="small" @click="onFlowEdit(item)">
                    <template #icon> <icon-edit :size="18" /> </template>
                  </a-button>
                  <a-button size="small" @click="onFlowCopy(item)">
                    <template #icon> <icon-copy :size="18" /> </template>
                  </a-button>
                  <a-popconfirm
                    v-if="item.status == 0"
                    type="warning"
                    content="确认禁用该审批流程？"
                    @ok="onFlowFreeze(item, group)"
                    position="tr"
                  >
                    <a-button size="small">
                      <template #icon> <icon-stop :size="18" /> </template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm
                    v-else
                    type="warning"
                    content="确认启用该流程 ?"
                    @ok="onFlowEnabled(item, group)"
                    position="tr"
                  >
                    <a-button size="small">
                      <template #icon>
                        <icon-check-circle :size="18" />
                      </template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm
                    type="warning"
                    content="确认删除该流程 ?"
                    @ok="onFlowDelete(item, group)"
                    position="tr"
                  >
                    <a-button size="small">
                      <template #icon> <icon-delete :size="18" /> </template>
                    </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <flow-group-edit
      ref="groupModel"
      v-model:group="group"
      @ok="onGroupAdded($event)"
    ></flow-group-edit>
    <flow-copy
      ref="flowDefCopyModel"
      v-model:flowDef="selectedFlowDef"
      @ok="onFlowCopyed($event)"
    ></flow-copy>
    <back-to-top target-container=".flow-groups-area"></back-to-top>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
  import {
    getFlowGroupWithDef,
    getProcessEditData,
    GetFlowGroupWithDefResponse,
    FlowDefinition,
  } from '@/api/server/workflow/approveManagement';
  import FlowManApi from '@/api/FlowManApi';
  import BackToTop from '@/components/common/BackToTop.vue';
  import EditableText from '@/components/common/EditableText.vue';
  import ArrayUtil from '@/components/flow/common/ArrayUtil';
  import FlowIcon from '@/components/icons/FlowIcon.vue';
  import { useFlowStore, useOrganStore, useUserStore } from '@/store';
  import { Notification } from '@arco-design/web-vue';
  import {
    IconCheckCircle,
    IconCopy,
    IconDelete,
    IconEdit,
    IconLayers,
    IconPlus,
    IconSearch,
    IconStop,
  } from '@arco-design/web-vue/es/icon';
  import { onBeforeMount, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import FlowCopy from './flow-copy.vue';
  import FlowGroupEdit from './flow-gorup-edit.vue';
  import { loadOrgan } from '@/api/server/organ';

  const router = useRouter();
  const flowStore = useFlowStore();
  const userStore = useUserStore();
  const { getByType } = useOrganStore();
  const loading = ref(false);

  /** 流程发起人 */
  interface FlowInitiatorItem {
    id: string;
    type: number;
    organId?: string;
  }

  /** 流程定义对象 */
  interface FlowDefType {
    workFlowDef: {
      name: null | string;
      icon: string;
      flowAdminIds: string[];
      cancelable: number;
    };
    nodeConfig: { name: string; type: number };
    flowPermission: { type: number };
  }

  let selectedFlowDef = ref<FlowDefinition>({} as FlowDefinition); // 当前选中的流程
  let flowName = ref(''); // 流程名称检索
  let groups = ref<GetFlowGroupWithDefResponse[]>([]);
  const loadGroups = () => {
    loading.value = true;
    getFlowGroupWithDef()
      .then((resp) => {
        groups.value = resp.data || [];
        loading.value = false;
      })
      .catch(() => (loading.value = false));
  };
  const filteredFlows = (flows: FlowDefinition[]) => {
    return (flows || []).filter((item) => item.name.includes(flowName.value));
  };

  // 流程发起者格式化
  const formatFlowInitiator = (flowInitiators: FlowInitiatorItem[]) => {
    return (flowInitiators || [])
      .map((item) => {
        const id = item.id || item.organId;
        return getByType(id, item.type).name || '未知';
      })
      .join('，');
  };

  // 分组相关
  let group = ref({});
  let groupModel = ref();
  const onNewFlowBtnClick = () => {
    groupModel.value.show();
  };
  const onGroupAdded = (newGroup: GetFlowGroupWithDefResponse) => {
    groups.value.push(newGroup);
  };
  const onGroupNameChange = (name: string, groupItem: GetFlowGroupWithDefResponse) => {
    if (!name || name == '') return;
    let oldName = groupItem.name;
    groupItem.name = name;
    FlowManApi.saveOrUpdateGroup({ id: groupItem.id, name }).catch(() => {
      groupItem.name = oldName;
    });
  };
  const onDeleteGroupClick = (groupItem: GetFlowGroupWithDefResponse) => {
    FlowManApi.deleteGroup({ id: groupItem.id }).then(() => {
      ArrayUtil.remove(groups.value, 'id', groupItem.id);
    });
  };

  // 流程相关
  const loadFlowConfig = (flowDefinition: FlowDefinition, callback: (flowDef: FlowDefType) => void) => {
    getProcessEditData(flowDefinition.id).then((res) => {
      const flowDefJson = JSON.parse(res.data.flowDefJson);
      let { workFlowDef } = flowDefJson;
      workFlowDef.id = res.data.flowDefId;
      callback && callback(flowDefJson);
    });
  };
  const onFlowCreate = () => {
    let flowDef: FlowDefType = {
      workFlowDef: {
        name: null,
        icon: 'approval.svg',
        flowAdminIds: userStore.accountId ? [userStore.accountId] : [],
        cancelable: 1,
      },
      nodeConfig: { name: '开始', type: 0 },
      flowPermission: { type: 0 },
    };
    flowStore.setFlowDef(flowDef);
    flowStore.setFlowGroups(groups.value);
    router.push('/workflow/flowmanedit');
  };
  const onFlowEdit = (flowDefinition: FlowDefinition) => {
    loadFlowConfig(flowDefinition, (flowDef) => {
      flowStore.setFlowDef(flowDef);
      flowStore.setFlowGroups(groups.value);
      router.push('/workflow/flowmanedit');
    });
  };
  const onFlowDelete = (flowDefinition: FlowDefinition, groupItem: GetFlowGroupWithDefResponse) => {
    FlowManApi.removeById({ flowDefId: flowDefinition.id }).then(() => {
      ArrayUtil.remove(groupItem.flowDefinitions, 'id', flowDefinition.id);
      Notification.success('流程删除成功');
    });
  };
  const onFlowFreeze = (flowDefinition: FlowDefinition, groupItem: GetFlowGroupWithDefResponse) => {
    FlowManApi.freezeById({ flowDefId: flowDefinition.id }).then(() => {
      flowDefinition.status = 1;
    });
  };
  const onFlowEnabled = (flowDefinition: FlowDefinition, groupItem: GetFlowGroupWithDefResponse) => {
    FlowManApi.enableById({ flowDefId: flowDefinition.id }).then(() => {
      flowDefinition.status = 0;
    });
  };

  // 流程复制
  const flowDefCopyModel = ref();
  const onFlowCopy = (flowDefinition: FlowDefinition) => {
    selectedFlowDef.value = flowDefinition;
    flowDefCopyModel.value.show();
  };
  const onFlowCopyed = (newFlowDef: FlowDefinition) => {
    loadGroups();
  };

  onMounted(() => {});

  onBeforeMount(() => {
    loadOrgan(); // 加载组织
    loadGroups();
  });
</script>
<script lang="ts">
  export default {
    name: 'FlowManage',
  };
</script>

<style scoped lang="less">
  @import '@/styles/variables.module.less';

  @SearchHeight: 55px;

  .fd-main-box {
    user-select: none;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: @Gap;
    // overflow: hidden auto;
    // overflow: hidden;
    // padding: 0 @Gap;

    .search-area {
      display: flex;
      justify-content: space-between;
      margin-bottom: @LayoutGap;
      border-radius: @BorderRadius;
      height: @SearchHeight;
      padding: 0 @Gap;
      background: #fff;
      display: flex;
      align-items: center;

      button {
        + button {
          margin-left: 10px;
        }
      }
    }

    .flow-groups-area {
      height: calc(100% - @SearchHeight - @LayoutGap);
      overflow: hidden auto;

      .empty-flow-box {
        border-radius: @BorderRadius;
        padding: 48px;
        background-color: #fff;
        border: 0;
      }

      .group-item-box {
        border-radius: @BorderRadius;
        // box-shadow: 0 0 3px 1px #eee;
        background-color: #fff;
        overflow: hidden;
        margin-bottom: @LayoutGap;

        .group-header {
          height: 48px;
          color: var(--color-text-2);
          background-color: #fafafa;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 @Gap;
          // border-bottom: 1px solid #efefef;
        }

        .group-body {
          .flow-item {
            padding: 10px @Gap;
            display: flex;
            align-items: center;
            border-top: 1px solid var(--color-neutral-2);
            transition: all 0.2s;
            gap: 10px;

            //   &:hover {
            //     background-color: #ededee;
            //   }

            .name-icon {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 10px;

              .name-desc {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                max-width: 400px;

                .desc {
                  font-size: 13px;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  color: #8f959e;
                  font-weight: 400;
                }
              }
            }

            .version {
              width: 60px;
            }

            .seeable {
              width: 30%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .operations {
              width: 160px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 10px;
            }
          }
        }
      }
    }
  }
</style>
