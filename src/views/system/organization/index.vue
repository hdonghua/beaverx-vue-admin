<template>
  <PageContainer class="organization-container">
    <div class="organization-page">
      <aside class="department-panel">
        <div class="panel-header">
          <div class="panel-title">组织架构</div>
          <a-space size="mini">
            <a-tooltip content="刷新">
              <a-button type="text" :loading="treeLoading" @click="loadDepartments">
                <template #icon><icon-refresh /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="新增部门">
              <a-button type="text" v-permission="[Permissions.System.Organization.Manage]" @click="openCreateDepartment">
                <template #icon><icon-plus /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </div>
        <a-input v-model="treeKeyword" allow-clear placeholder="搜索部门">
          <template #prefix><icon-search /></template>
        </a-input>
        <div class="tree-area">
          <a-spin :loading="treeLoading" class="tree-spin">
            <a-tree
              v-if="filteredTree.length"
              v-model:selected-keys="selectedKeys"
              :data="filteredTree"
              :field-names="{ key: 'id', title: 'name', children: 'children' }"
              default-expand-all
              block-node
            />
            <a-empty v-else description="暂无部门" />
          </a-spin>
        </div>
      </aside>

      <main class="department-content">
        <template v-if="selectedDepartmentId">
          <section class="department-summary">
            <div class="summary-heading">
              <div>
                <h2>{{ details?.name || '-' }}</h2>
                <a-space size="small">
                  <a-tag v-if="details?.code">{{ details.code }}</a-tag>
                  <span class="secondary">上级部门：{{ details?.parentName || '无' }}</span>
                  <span class="secondary">{{ details?.memberCount || 0 }} 名成员</span>
                </a-space>
              </div>
              <a-space v-permission="[Permissions.System.Organization.Manage]">
                <a-button @click="openEditDepartment">
                  <template #icon><icon-edit /></template>
                  编辑部门
                </a-button>
                <a-popconfirm content="确定删除该部门？部门存在下级或成员时不能删除。" @ok="removeDepartment">
                  <a-button status="danger">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>
            <div class="leader-setting">
              <div class="setting-label">部门负责人</div>
              <a-select
                v-model="leaderUserId"
                allow-clear
                allow-search
                :filter-option="false"
                :loading="userSearching"
                placeholder="从全公司用户中搜索"
                @search="handleUserSearch"
                @popup-visible-change="handleLeaderPopup"
              >
                <a-option v-for="user in leaderOptions" :key="user.id" :value="user.id">
                  <div class="user-option">
                    <a-avatar :size="24" :image-url="user.avatar || undefined">{{ user.name.slice(0, 1) }}</a-avatar>
                    <span>{{ user.name }}</span>
                    <span class="secondary">{{ user.userName }}</span>
                  </div>
                </a-option>
              </a-select>
              <a-button
                type="primary"
                :loading="leaderSaving"
                v-permission="[Permissions.System.Organization.Manage]"
                @click="saveLeader"
              >保存</a-button>
            </div>
          </section>

          <section class="member-section">
            <div class="member-toolbar">
              <div>
                <div class="section-title">成员列表</div>
              </div>
              <a-space>
                <a-input-search
                  v-model="memberKeyword"
                  allow-clear
                  placeholder="姓名或账号"
                  @search="searchMembers"
                  @clear="searchMembers"
                />
                <a-button
                  type="primary"
                  v-permission="[Permissions.System.Organization.Manage]"
                  @click="openAddMembers"
                >
                  <template #icon><icon-user-add /></template>
                  添加成员
                </a-button>
              </a-space>
            </div>
            <a-table
              row-key="userId"
              :data="members"
              :loading="membersLoading"
              :pagination="pagination"
              @page-change="handlePageChange"
            >
              <template #columns>
                <a-table-column title="成员" :width="240">
                  <template #cell="{ record }">
                    <div class="member-cell">
                      <a-avatar :size="32" :image-url="record.avatar || undefined">{{ record.name.slice(0, 1) }}</a-avatar>
                      <div>
                        <div>{{ record.name }}</div>
                        <div class="secondary">{{ record.userName }}</div>
                      </div>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="岗位" :width="140">
                  <template #cell="{ record }">
                    <a-tag v-if="record.isLeader" color="arcoblue">负责人</a-tag>
                    <a-tag v-else-if="record.isPrimary">主岗</a-tag>
                    <span v-else class="secondary">兼岗</span>
                  </template>
                </a-table-column>
                <a-table-column title="直属上级" :width="180">
                  <template #cell="{ record }">
                    <a-space size="mini">
                      <span>{{ record.managerName || '未设置' }}</span>
                      <a-button
                        v-if="record.isPrimary"
                        type="text"
                        size="mini"
                        v-permission="[Permissions.System.Organization.Manage]"
                        @click="openManagerDialog(record)"
                      >设置</a-button>
                    </a-space>
                  </template>
                </a-table-column>
                <a-table-column title="手机号" data-index="phone" />
                <a-table-column title="邮箱" data-index="email" />
                <a-table-column title="操作" align="right" :width="100">
                  <template #cell="{ record }">
                    <a-popconfirm content="确定从该部门移除此成员？" @ok="removeMember(record)">
                      <a-button
                        type="text"
                        status="danger"
                        :disabled="record.isLeader"
                        v-permission="[Permissions.System.Organization.Manage]"
                      >移除</a-button>
                    </a-popconfirm>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </section>
        </template>
        <a-empty v-else class="empty-state" description="请选择部门" />
      </main>
    </div>

    <a-modal v-model:visible="addVisible" title="添加部门成员" @before-ok="submitMembers" @close="resetMemberDialog">
      <a-form :model="{ selectedUserIds }" layout="vertical">
        <a-form-item label="选择员工" required>
          <a-select
            v-model="selectedUserIds"
            multiple
            allow-search
            :filter-option="false"
            :loading="userSearching"
            placeholder="输入姓名、账号或手机号搜索全公司用户"
            @search="handleUserSearch"
          >
            <a-option v-for="user in userOptions" :key="user.id" :value="user.id">
              {{ user.name }}（{{ user.userName }}）
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="managerVisible"
      title="设置直属上级"
      @before-ok="submitManager"
      @close="resetManagerDialog"
    >
      <a-form :model="{ managerUserId }" layout="vertical">
        <a-form-item label="员工">
          <a-input :model-value="managingMember?.name" disabled />
        </a-form-item>
        <a-form-item label="直属上级">
          <a-select
            v-model="managerUserId"
            allow-clear
            allow-search
            :filter-option="false"
            :loading="userSearching"
            placeholder="从全公司用户中搜索，留空则清除"
            @search="handleUserSearch"
            @popup-visible-change="(visible) => visible && handleUserSearch('')"
          >
            <a-option
              v-for="user in managerOptions"
              :key="user.id"
              :value="user.id"
              :disabled="user.id === managingMember?.userId"
            >{{ user.name }}（{{ user.userName }}）</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="departmentVisible"
      :title="editingDepartmentId ? '编辑部门' : '新增部门'"
      @before-ok="submitDepartment"
      @close="resetDepartmentForm"
    >
      <a-form ref="departmentFormRef" :model="departmentForm" layout="vertical">
        <a-form-item field="name" label="部门名称" :rules="[{ required: true, message: '请输入部门名称' }]">
          <a-input v-model="departmentForm.name" :max-length="100" />
        </a-form-item>
        <a-form-item field="code" label="部门编码">
          <a-input v-model="departmentForm.code" :max-length="64" placeholder="留空则不设置" />
        </a-form-item>
        <a-form-item field="parentId" label="上级部门">
          <a-select v-model="departmentForm.parentId" allow-clear placeholder="无上级部门">
            <a-option
              v-for="item in departmentOptions"
              :key="item.id"
              :value="item.id"
              :disabled="item.id === editingDepartmentId"
            >{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="departmentForm.sort" :min="0" :max="9999" />
        </a-form-item>
        <a-form-item field="isEnabled" label="状态">
          <a-switch v-model="departmentForm.isEnabled" checked-text="启用" unchecked-text="停用" />
        </a-form-item>
      </a-form>
    </a-modal>
  </PageContainer>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import { Permissions } from '@/constants/permissions';
  import type { EntityId } from '@/types/entity-id';
  import {
    addDepartmentMembers,
    createDepartment,
    deleteDepartment,
    DepartmentDetails,
    DepartmentItem,
    DepartmentMember,
    getDepartment,
    getDepartmentMembers,
    getDepartments,
    removeDepartmentMember,
    searchCompanyUsers,
    setDepartmentLeader,
    setMemberManager,
    updateDepartment,
    UserOption,
  } from '@/api/server/oa/organization';

  const treeLoading = ref(false);
  const treeKeyword = ref('');
  const departments = ref<DepartmentItem[]>([]);
  const selectedKeys = ref<EntityId[]>([]);
  const selectedDepartmentId = computed(() => selectedKeys.value[0]);
  const details = ref<DepartmentDetails>();
  const leaderUserId = ref<EntityId>();
  const leaderOptions = ref<UserOption[]>([]);
  const leaderSaving = ref(false);
  const userSearching = ref(false);
  const userOptions = ref<UserOption[]>([]);
  const managerOptions = ref<UserOption[]>([]);
  const members = ref<DepartmentMember[]>([]);
  const membersLoading = ref(false);
  const memberKeyword = ref('');
  const addVisible = ref(false);
  const selectedUserIds = ref<EntityId[]>([]);
  const managerVisible = ref(false);
  const managingMember = ref<DepartmentMember>();
  const managerUserId = ref<EntityId>();
  const pagination = reactive({ current: 1, pageSize: 20, total: 0 });
  const departmentVisible = ref(false);
  const editingDepartmentId = ref<EntityId>();
  const departmentFormRef = ref<FormInstance>();
  const departmentForm = reactive({ parentId: undefined as EntityId | undefined, name: '', code: '', sort: 0, isEnabled: true });

  const flattenDepartments = (items: DepartmentItem[], level = 0): Array<{ id: EntityId; label: string }> =>
    items.flatMap((item) => [{ id: item.id, label: `${'　'.repeat(level)}${item.name}` }, ...flattenDepartments(item.children || [], level + 1)]);
  const departmentOptions = computed(() => flattenDepartments(departments.value));

  const filterTree = (items: DepartmentItem[], keyword: string): DepartmentItem[] => items.reduce<DepartmentItem[]>((result, item) => {
    const children = filterTree(item.children || [], keyword);
    if (item.name.toLowerCase().includes(keyword) || children.length) result.push({ ...item, children });
    return result;
  }, []);
  const filteredTree = computed(() => {
    const keyword = treeKeyword.value.trim().toLowerCase();
    return keyword ? filterTree(departments.value, keyword) : departments.value;
  });

  const loadDepartments = async () => {
    treeLoading.value = true;
    try {
      const { data } = await getDepartments();
      departments.value = data;
      if (!selectedKeys.value.length && data.length) selectedKeys.value = [data[0].id];
    } finally {
      treeLoading.value = false;
    }
  };

  const loadDetails = async () => {
    if (!selectedDepartmentId.value) return;
    const { data } = await getDepartment(selectedDepartmentId.value);
    details.value = data;
    leaderUserId.value = data.leaderUserId || undefined;
    leaderOptions.value = data.leaderUserId ? [{ id: data.leaderUserId, name: data.leaderName || '', userName: '' }] : [];
  };

  const loadMembers = async () => {
    if (!selectedDepartmentId.value) return;
    membersLoading.value = true;
    try {
      const { data } = await getDepartmentMembers(selectedDepartmentId.value, {
        keyword: memberKeyword.value || undefined,
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      members.value = data.items;
      pagination.total = data.total ?? data.totalCount ?? 0;
    } finally {
      membersLoading.value = false;
    }
  };

  const handleUserSearch = async (keyword: string) => {
    userSearching.value = true;
    try {
      const { data } = await searchCompanyUsers(keyword);
      userOptions.value = data;
      leaderOptions.value = data;
      managerOptions.value = data;
    } finally {
      userSearching.value = false;
    }
  };
  const handleLeaderPopup = (visible: boolean) => {
    if (visible) handleUserSearch('');
  };

  const resetDepartmentForm = () => {
    editingDepartmentId.value = undefined;
    departmentForm.parentId = undefined;
    departmentForm.name = '';
    departmentForm.code = '';
    departmentForm.sort = 0;
    departmentForm.isEnabled = true;
    departmentFormRef.value?.clearValidate();
  };
  const openCreateDepartment = () => {
    resetDepartmentForm();
    departmentForm.parentId = selectedDepartmentId.value;
    departmentVisible.value = true;
  };
  const openEditDepartment = () => {
    if (!details.value) return;
    editingDepartmentId.value = details.value.id;
    departmentForm.parentId = details.value.parentId || undefined;
    departmentForm.name = details.value.name;
    departmentForm.code = details.value.code || '';
    departmentForm.sort = details.value.sort;
    departmentForm.isEnabled = details.value.isEnabled;
    departmentVisible.value = true;
  };
  const submitDepartment = async (done: (closed: boolean) => void) => {
    if (await departmentFormRef.value?.validate()) {
      done(false);
      return;
    }
    try {
      const payload = { ...departmentForm, parentId: departmentForm.parentId || null, code: departmentForm.code || null };
      if (editingDepartmentId.value) {
        await updateDepartment(editingDepartmentId.value, payload);
        Message.success('部门已更新');
      } else {
        const { data: id } = await createDepartment(payload);
        selectedKeys.value = [id];
        Message.success('部门已创建');
      }
      done(true);
      await loadDepartments();
      if (selectedDepartmentId.value) await loadDetails();
    } catch {
      done(false);
    }
  };
  const removeDepartment = async () => {
    if (!selectedDepartmentId.value) return;
    await deleteDepartment(selectedDepartmentId.value);
    Message.success('部门已删除');
    selectedKeys.value = [];
    details.value = undefined;
    members.value = [];
    await loadDepartments();
  };

  const saveLeader = async () => {
    if (!selectedDepartmentId.value) return;
    leaderSaving.value = true;
    try {
      await setDepartmentLeader(selectedDepartmentId.value, leaderUserId.value);
      Message.success('负责人已更新');
      await Promise.all([loadDetails(), loadMembers()]);
    } finally {
      leaderSaving.value = false;
    }
  };

  const searchMembers = () => {
    pagination.current = 1;
    loadMembers();
  };
  const handlePageChange = (page: number) => {
    pagination.current = page;
    loadMembers();
  };
  const openAddMembers = () => {
    selectedUserIds.value = [];
    addVisible.value = true;
    handleUserSearch('');
  };
  const resetMemberDialog = () => {
    selectedUserIds.value = [];
    userOptions.value = [];
  };
  const submitMembers = async (done: (closed: boolean) => void) => {
    if (!selectedDepartmentId.value || !selectedUserIds.value.length) {
      Message.warning('请选择员工');
      done(false);
      return;
    }
    try {
      await addDepartmentMembers(selectedDepartmentId.value, selectedUserIds.value);
      Message.success('成员已添加');
      done(true);
      await Promise.all([loadDetails(), loadMembers()]);
    } catch {
      done(false);
    }
  };
  const removeMember = async (member: DepartmentMember) => {
    if (!selectedDepartmentId.value) return;
    await removeDepartmentMember(selectedDepartmentId.value, member.userId);
    Message.success('成员已移除');
    await Promise.all([loadDetails(), loadMembers()]);
  };

  const openManagerDialog = (member: DepartmentMember) => {
    managingMember.value = member;
    managerUserId.value = member.managerUserId || undefined;
    managerOptions.value = member.managerUserId
      ? [{ id: member.managerUserId, name: member.managerName || '', userName: '' }]
      : [];
    managerVisible.value = true;
  };
  const resetManagerDialog = () => {
    managingMember.value = undefined;
    managerUserId.value = undefined;
    managerOptions.value = [];
  };
  const submitManager = async (done: (closed: boolean) => void) => {
    if (!selectedDepartmentId.value || !managingMember.value) {
      done(false);
      return;
    }
    try {
      await setMemberManager(
        selectedDepartmentId.value,
        managingMember.value.userId,
        managerUserId.value
      );
      Message.success('直属上级已更新');
      done(true);
      await loadMembers();
    } catch {
      done(false);
    }
  };

  watch(selectedDepartmentId, async () => {
    pagination.current = 1;
    memberKeyword.value = '';
    await Promise.all([loadDetails(), loadMembers()]);
  });
  onMounted(loadDepartments);
</script>

<style scoped lang="less">
  .organization-container { height: 100%; min-height: 0; }
  .organization-container :deep(.page-container-body) { height: 100%; min-height: 0; }
  .organization-page { height: 100%; min-height: 0; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; background: transparent; }
  .department-panel { height: 100%; min-height: 0; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; padding: 20px 16px; background: #fff; border: 1px solid var(--color-border-2); border-radius: 6px; }
  .panel-header, .member-toolbar, .summary-heading, .leader-setting { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .panel-title, .section-title { font-size: 16px; font-weight: 600; color: var(--color-text-1); }
  .secondary { font-size: 12px; color: var(--color-text-3); }
  .tree-area, .tree-spin { flex: 1; min-height: 0; overflow: auto; }
  .department-content { min-width: 0; min-height: 0; overflow: auto; background: transparent; }
  .department-summary, .member-section { padding: 20px; background: #fff; border: 1px solid var(--color-border-2); border-radius: 6px; }
  .department-summary h2 { margin: 0 0 8px; font-size: 20px; letter-spacing: 0; }
  .leader-setting { justify-content: flex-start; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border-1); }
  .leader-setting .setting-label { width: 88px; color: var(--color-text-2); }
  .leader-setting :deep(.arco-select-view) { width: 360px; }
  .member-section { margin-top: 16px; }
  .member-toolbar { margin-bottom: 16px; }
  .member-cell, .user-option { display: flex; align-items: center; gap: 10px; }
  .empty-state { height: 100%; display: flex; align-items: center; justify-content: center; }
  @media (max-width: 1100px) { .organization-page { grid-template-columns: 240px minmax(0, 1fr); } .department-content { padding: 16px; } }
</style>
