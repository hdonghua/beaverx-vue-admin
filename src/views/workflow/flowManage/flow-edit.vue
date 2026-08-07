<template>
  <section class="flow-edit-box" v-loading.fullscreen="launching">
    <div class="fd-nav">
      <div class="fd-nav-left">
        <div class="back" @click="back()"><icon-left :size="16" /></div>
        <div class="name-desc" v-if="flowDefinition.workFlowDef">
          <div class="name">{{ flowDefinition.workFlowDef.name }}</div>
          <div class="desc">{{ flowDefinition.workFlowDef.remark }}</div>
        </div>
      </div>
      <div class="fd-nav-mid">
        <nav class="steps" aria-label="流程设计步骤">
          <template v-for="(item, index) in stepItems" :key="item.value">
            <button
              type="button"
              :class="['step-item', { active: step === item.value, completed: step > item.value }]"
              @click="hanldeStepClick(item.value)"
            >
              <span class="step-number">{{ item.value }}</span>
              <span class="step-label">{{ item.label }}</span>
            </button>
            <span v-if="index < stepItems.length - 1" class="step-line"></span>
          </template>
        </nav>
      </div>
      <div class="fd-nav-right">
        <a-button @click="deploy()" :disabled="launching">发 布</a-button>
      </div>
    </div>

    <div class="flow-edit-content">
      <div class="fd-main">
        <transition name="fade-transform" mode="out-in">
          <template v-if="step == 1" :key="1">
            <Base ref="baseBox"></Base>
          </template>
          <template v-else-if="step == 2" :key="2">
            <FormMake ref="formMakeBox"></FormMake>
          </template>
          <template v-else-if="step == 3" :key="3">
            <div class="fd-main-box" v-dragscroll
              ><Flow ref="flowBox"></Flow
            ></div>
          </template>
          <template v-else-if="step == 4" :key="4">
            <Setting ref="settingBox"></Setting>
          </template>
        </transition>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
// @ts-nocheck
  import { WIDGET } from '@/components/flow/common/FlowConstant';
  import { initWidgetFormula, Widget } from '@/components/flow/common/FlowFormula';
  import {
    filterConditionWidgets,
    resetAllNodeFormAuth,
  } from '@/components/flow/common/FormAuth';
  import {
    cleanUnrequiredWidget,
    initBranchExp,
  } from '@/components/flow/common/FormExp';
  import Flow from '@/components/flow/index.vue';
  import FormMake from '@/components/form-make/index.vue';
  import { useFlowStore } from '@/store/index';
  import { Notification } from '@arco-design/web-vue';
  import { IconLeft } from '@arco-design/web-vue/es/icon';
  import { onBeforeMount, ref, toRaw } from 'vue';
  import { useRouter } from 'vue-router';
  import Base from './base.vue';
  import FlowValidate from './flow-validate';
  import Setting from './setting.vue';
  import {
    addProcess,
    updateProcess,
  } from '@/api/server/workflow/approveManagement';

  /** 流程定义 */
  interface FlowDefType {
    workFlowDef: {
      id: string | null;
      processKey?: string;
      icon: string;
      name: string;
      groupId: string;
      cancelable: number;
      flowAdminIds: string[];
    };
    flowWidgets: Widget[];
    nodeConfig: any;
    flowPermission: any;
  }

  let { flowDefinition } = useFlowStore();
  const router = useRouter();

  let launching = ref(false); // 流程发布中
  let baseBox = ref(); // 基本信息组件
  let formMakeBox = ref(); // 表单设计组件
  let flowBox = ref(); // 流程组件
  let settingBox = ref(); // 更多设置组件
  let step = ref(1);
  const stepItems = [
    { value: 1, label: '基础信息' },
    { value: 2, label: '表单设计' },
    { value: 3, label: '流程设计' },
    { value: 4, label: '更多设置' },
  ];
  const hanldeStepClick = (nStep: number) => {
    if (step.value == 1) {
      baseBox.value.validate();
    } else if (step.value == 2) {
      let { nodeConfig, flowWidgets } = flowDefinition;
      cleanUnrequiredWidget(flowWidgets, nodeConfig);
      let ok = formMakeBox.value.validate();
      if (!ok) return;
    }
    step.value = nStep;
  };

  const back = () => {
    router.push('/workflow/flowManage');
  };

  const validate = (flowDef: FlowDefType): boolean => {
    let errs: string[] = [];
    let { workFlowDef, flowWidgets, nodeConfig, flowPermission } = flowDef;

    // 流程定义检查是否合法
    errs.push(...FlowValidate.verifyBaseInfo(workFlowDef));
    errs.push(...FlowValidate.verifyFormInfo(flowWidgets));
    errs.push(...FlowValidate.verifyFlowInfo(nodeConfig, flowPermission));

    // 基本信息组件内部校验
    baseBox.value && baseBox.value.validate();

    if (errs.length > 0) {
      for (let i = 0; i < errs.length; i++) {
        setTimeout(() => Notification.error(errs[i]), i * 50);
      }
      return false;
    }

    // 清除focus
    flowWidgets.forEach((widget) => {
      delete (widget as any).focus;
      if ([WIDGET.DETAIL].includes(widget.type))
        (widget.details || []).forEach((i) => delete (i as any).focus);
    });
    return true;
  };

  const initNodeConfig = (flowDef: FlowDefType) => {
    let { flowWidgets, nodeConfig } = flowDef;
    // 初始化分支表达式
    initBranchExp(nodeConfig);

    // 重新设置一下节点表单权限
    let conditionWidgets: Widget[] = [];
    filterConditionWidgets(nodeConfig, conditionWidgets);
    resetAllNodeFormAuth(nodeConfig, flowWidgets, conditionWidgets);
    // 组件重新生成一下计算表达式
    initWidgetFormula(flowWidgets);
  };

  const deploy = () => {
    launching.value = true;
    let flowDef = JSON.parse(JSON.stringify(toRaw(flowDefinition))) as FlowDefType;
    if (validate(flowDef)) {
      initNodeConfig(flowDef);
      const apiAction = flowDef.workFlowDef.id ? updateProcess : addProcess;
      apiAction({
        ...flowDef,
        flowDefJson: JSON.stringify(flowDef),
      }).then(
        () => {
          launching.value = false;
          Notification.success(
            `流程${flowDefinition.workFlowDef?.name}发布成功！`
          );
          router.push('/workflow/flowManage');
        },
        () => (launching.value = false)
      );
    } else {
      launching.value = false;
    }
  };

  onBeforeMount(async () => {
    if (flowDefinition.workFlowDef == undefined) {
      router.push('/workflow/flowManage');
    }
  });
</script>
<script lang="ts">
  export default {
    name: 'Flowmanedit',
  };
</script>

<style lang="less" scoped>
  @import '@/styles/variables.module.less';

  @header-height: 70px;
  @canvas-bg: @MainContentBg;

  .flow-edit-box {
    height: 100%;
    overflow: hidden;
  }

  .fd-nav {
    // position: fixed;
    // top: 0;
    // left: 0;
    // right: 0;
    // z-index: 1;
    width: 100%;
    height: @header-height;
    position: relative;
    z-index: 2;
    border-bottom: 1px solid var(--color-border-2);
    box-shadow: 0 2px 8px rgba(29, 33, 41, 0.08);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-sizing: border-box;
    background: #fff;
    user-select: none;

    .fd-nav-left {
      width: 240px;
      flex: 0 0 240px;
      display: flex;
      align-items: center;
      height: 100%;

      .back {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--color-text-2);
        background-color: var(--color-secondary);
        font-size: 14px;
        border-radius: var(--border-radius-small);

        &:hover {
          background-color: var(--color-secondary-hover);
        }
      }

      .name-desc {
        display: flex;
        flex-direction: column;
        max-width: 200px;
        margin-left: 15px;

        .name {
          font-size: 16px;
          height: 24px;
          line-height: 24px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .desc {
          line-height: 20px;
          font-size: 12px;
          color: #8f959e;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }

    .fd-nav-mid {
      flex: 1;
      min-width: 0;
      display: flex;
      justify-content: center;

      .steps {
        width: min(720px, 100%);
        display: flex;
        align-items: center;
      }

      .step-item {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--color-text-2);
        cursor: pointer;
        white-space: nowrap;
        font: inherit;

        .step-number {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--color-fill-2);
          color: var(--color-text-2);
          font-size: 14px;
        }

        &.active {
          color: var(--color-text-1);

          .step-number {
            color: #fff;
            background: rgb(var(--primary-6));
          }
        }

        &.completed .step-number {
          color: rgb(var(--primary-6));
          background: rgb(var(--primary-1));
        }
      }

      .step-line {
        flex: 1;
        min-width: 32px;
        max-width: 104px;
        height: 1px;
        margin: 0 16px;
        background: var(--color-border-2);
      }
    }

    .fd-nav-right {
      width: 240px;
      flex: 0 0 240px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .flow-edit-content {
    height: calc(100% - @header-height);
    overflow: hidden;
  }

  .fd-main {
    // position: fixed;
    // top: @header-height;
    // left: 0;
    // right: 0;
    // bottom: 0;
    height: 100%;
    background-color: @canvas-bg;
    overflow: hidden;

    .fd-main-box {
      height: 100%;
      overflow-y: auto;
    }
  }

  @media (max-width: 1200px) {
    .fd-nav {
      .fd-nav-left,
      .fd-nav-right {
        width: 180px;
        flex-basis: 180px;
      }

      .fd-nav-mid .step-line {
        margin: 0 8px;
      }
    }
  }
</style>
