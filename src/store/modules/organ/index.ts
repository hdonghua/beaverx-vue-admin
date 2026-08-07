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

const findDepartment = (departments: DeptItem[], departmentId: string): DeptItem | undefined => {
  for (const department of departments) {
    if (String(department.id) === String(departmentId)) return department;
    const child = findDepartment(department.children || [], departmentId);
    if (child) return child;
  }
  return undefined;
};

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
        findDepartment(state.depts, deptId) || createDefaultDept(deptId);
    },
    getRoleById: (state) => {
      return (roleId: string): RoleItem =>
        state.roles.find((role) => role.id === roleId) || createDefaultRole(roleId);
    },
    getById: (state) => {
      return (id: string): DeptItem | RoleItem | UserItem => {
        let item: DeptItem | RoleItem | UserItem | undefined;
        item = findDepartment(state.depts, id);
        if (item == null) item = state.roles.find((role) => String(role.id) === String(id));
        if (item == null) item = state.users.find((user) => String(user.id) === String(id));
        return item || ({ id: id, name: "未知" } as DeptItem);
      };
    },
    getByType: (state) => {
      return (id: string, type: number): DeptItem | RoleItem | UserItem => {
        if (type === 0) return findDepartment(state.depts, id) || createDefaultDept(id);
        if (type === 1) {
          return state.roles.find((role) => String(role.id) === String(id)) || createDefaultRole(id);
        }
        if (type === 2) {
          return state.users.find((user) => String(user.id) === String(id)) || createDefaultUser(id);
        }
        return { id, name: "未知" } as DeptItem;
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
