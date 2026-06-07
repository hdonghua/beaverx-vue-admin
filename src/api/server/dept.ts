import axios from 'axios';
import { Msg } from '@/api/interceptor';
import { OrganOption } from './type';

// 添加部门请求
export interface AddDeptRequest {
  name: string;
  parentId: number;
}

// 更新部门请求
export interface UpdateDeptRequest extends AddDeptRequest {
  id: number;
}

// 查询部门请求
export interface QueryDeptRequest {}

// 部门信息
export interface DeptInfo {
  id: number;
  name: string;
  parentId: number;
  children?: DeptInfo[];
}

// 查询部门响应
export interface QueryDeptResponse extends DeptInfo {}

// 添加部门
export function addDept(data: AddDeptRequest) {
  return axios.post<void, Msg>('/api/dept/add', data);
}

// 查询部门列表
export function queryDepts(params?: QueryDeptRequest) {
  return axios.get<void, Msg<QueryDeptResponse[]>>('/api/dept/list', {
    params,
  });
}

// 更新部门
export function updateDept(data: UpdateDeptRequest) {
  return axios.put<void, Msg>('/api/dept/update', data);
}

// 删除部门
export function deleteDept(deptId: number) {
  return axios.delete<void, Msg>(`/api/dept/delete/${deptId}`);
}

// 获取所有部门
export function getAllDepts() {
  return axios.get<void, Msg<DeptInfo[]>>('/api/dept/allDept');
}

// 部门选项
export function getDeptOptions() {
  return axios.get<void, Msg<OrganOption[]>>('/api/dept/options');
}
