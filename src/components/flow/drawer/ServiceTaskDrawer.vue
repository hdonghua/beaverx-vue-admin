<template>
  <a-drawer
    v-model:visible="visible"
    title="服务任务设置"
    :width="520"
    :mask-closable="false"
    unmount-on-close
    @ok="saveServiceTask">
    <a-form layout="vertical">
      <a-form-item label="节点名称">
        <a-input v-model="flowNodeConfig.name" :maxlength="16" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="处理器">
        <div class="handler-list">
          <div v-for="(key, index) in flowNodeConfig.serviceTaskHandlers" :key="index" class="handler-row">
            <span class="handler-order">{{ index + 1 }}</span>
            <a-select
              v-model="flowNodeConfig.serviceTaskHandlers[index]"
              allow-search
              placeholder="请选择处理器">
              <a-option
                v-for="handler in handlers"
                :key="handler.key"
                :value="handler.key"
                :disabled="isSelectedByOther(handler.key, index)">
                {{ handler.name }}（{{ handler.key }}）
              </a-option>
            </a-select>
            <a-button type="text" :disabled="index === 0" title="上移" @click="move(index, -1)">
              <template #icon><icon-up /></template>
            </a-button>
            <a-button
              type="text"
              :disabled="index === flowNodeConfig.serviceTaskHandlers.length - 1"
              title="下移"
              @click="move(index, 1)">
              <template #icon><icon-down /></template>
            </a-button>
            <a-button type="text" status="danger" title="删除" @click="remove(index)">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
          <a-empty v-if="handlersLoaded && handlers.length === 0" description="暂无可用处理器" />
          <a-button v-else type="outline" long :disabled="flowNodeConfig.serviceTaskHandlers.length >= handlers.length" @click="add">
            <template #icon><icon-plus /></template>
            添加处理器
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { getServiceTaskHandlers } from "@/api/server/workflow/approveManagement";
import { useFlowStore } from "@/store/index";
import { Message } from "@arco-design/web-vue";
import { IconDelete, IconDown, IconPlus, IconUp } from "@arco-design/web-vue/es/icon";
import { computed, ref, toRaw, watch } from "vue";

const flowStore = useFlowStore();
const handlers = ref([]);
const handlersLoaded = ref(false);
const flowNodeConfig = ref({ serviceTaskHandlers: [] });
const nodeUid = ref(0);

const visible = computed({
  get: () => flowStore.isServiceTaskDrawerOpened,
  set: (value) => {
    if (!value) flowStore.showServiceTaskDrawer(false);
  },
});

const loadHandlers = async () => {
  if (handlersLoaded.value) return;
  const response = await getServiceTaskHandlers();
  handlers.value = response.data || [];
  handlersLoaded.value = true;
};

watch(
  () => flowStore.serviceTaskConfig0,
  async (config) => {
    if (!config?.value) return;
    flowNodeConfig.value = config.value;
    flowNodeConfig.value.serviceTaskHandlers ||= [];
    nodeUid.value = config.id;
    await loadHandlers();
  }
);

const isSelectedByOther = (key, index) =>
  flowNodeConfig.value.serviceTaskHandlers.some((selected, selectedIndex) => selectedIndex !== index && selected === key);

const add = () => {
  const next = handlers.value.find((handler) => !flowNodeConfig.value.serviceTaskHandlers.includes(handler.key));
  if (next) flowNodeConfig.value.serviceTaskHandlers.push(next.key);
};

const remove = (index) => flowNodeConfig.value.serviceTaskHandlers.splice(index, 1);

const move = (index, offset) => {
  const target = index + offset;
  const handlers = flowNodeConfig.value.serviceTaskHandlers;
  [handlers[index], handlers[target]] = [handlers[target], handlers[index]];
};

const saveServiceTask = () => {
  if (flowNodeConfig.value.serviceTaskHandlers.length === 0) {
    Message.warning("请至少选择一个处理器");
    return;
  }
  flowStore.setServiceTaskConfig({ value: toRaw(flowNodeConfig.value), flag: true, id: nodeUid.value });
  flowStore.showServiceTaskDrawer(false);
};
</script>

<style scoped lang="less">
.handler-list {
  width: 100%;
}

.handler-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 32px 32px 32px;
  gap: 4px;
  align-items: center;
  margin-bottom: 8px;
}

.handler-order {
  color: var(--color-text-3);
  text-align: center;
}
</style>
