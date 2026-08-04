import { useOrganStore } from '@/store';
import axios from 'axios';
import { ApiResponse } from '@/utils/request';
import type { DeptItem, RoleItem, UserItem } from '@/store/modules/organ';

let cache = {
  loaded: false,
};

interface OrganOptions {
  depts: DeptItem[];
  roles: RoleItem[];
  users: UserItem[];
}

export async function loadOrgan(force = false) {
  if (!cache.loaded || force) {
    const { setDepts, setRoles, setUsers } = useOrganStore();
    const resp = await axios.get<void, ApiResponse<OrganOptions>>(
      '/api/OaOrganization/options'
    );
    setDepts(resp.data.depts);
    setRoles(resp.data.roles);
    setUsers(resp.data.users);
    cache.loaded = true;
  }
}
