import { defineStore } from "pinia";

/** 部门项 */
export interface DeptItem {
  id: string;
  name: string;
  parentId?: string | null;
  code?: string;
  children?: DeptItem[];
}

/** 角色项 */
export interface RoleItem {
  id: string;
  name: string;
  description?: string;
}

/** 用户项 */
export interface UserItem {
  id: string;
  name: string;
  userName?: string;
  avatar?: string;
}

/** 组织架构 Store State */
export interface OrganState {
  depts: DeptItem[];
  roles: RoleItem[];
  users: UserItem[];
}

/** 默认的空白项（用于找不到时的返回值） */
const createDefaultDept = (deptId: string): DeptItem => ({ id: deptId, name: "" });
const createDefaultRole = (roleId: string): RoleItem => ({ id: roleId, name: "" });
const createDefaultUser = (userId: string): UserItem => ({ id: userId, name: "" });

const useOrganStore = defineStore("organ", {
  state: (): OrganState => ({
    depts: [],
    roles: [],
    users: [],
  }),
  getters: {
    getUserById: (state) => {
      return (userId: string): UserItem =>
        state.users.find((user) => user.id === userId) || createDefaultUser(userId);
    },
    getDeptById: (state) => {
      return (deptId: string): DeptItem =>
        state.depts.find((dept) => dept.id === deptId) || createDefaultDept(deptId);
    },
    getRoleById: (state) => {
      return (roleId: string): RoleItem =>
        state.roles.find((role) => role.id === roleId) || createDefaultRole(roleId);
    },
    getById: (state) => {
      return (id: string): DeptItem | RoleItem | UserItem => {
        let item: DeptItem | RoleItem | UserItem | undefined;
        item = state.depts.find((dept) => dept.id === id);
        if (item == null) item = state.roles.find((role) => role.id === id);
        if (item == null) item = state.users.find((user) => user.id === id);
        return item || ({ id: id, name: "未知" } as DeptItem);
      };
    },
  },
  actions: {
    setDepts(depts: DeptItem[] | null): void {
      this.depts = depts || [];
    },
    setRoles(roles: RoleItem[] | null): void {
      this.roles = roles || [];
    },
    setUsers(users: UserItem[] | null): void {
      this.users = users || [];
    },
    getDepts(): DeptItem[] {
      return JSON.parse(JSON.stringify(this.depts));
    },
    getRoles(): RoleItem[] {
      return JSON.parse(JSON.stringify(this.roles));
    },
    getUsers(): UserItem[] {
      return JSON.parse(JSON.stringify(this.users));
    },
  },
});

export default useOrganStore;
