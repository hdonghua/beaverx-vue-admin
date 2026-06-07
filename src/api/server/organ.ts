import { useOrganStore } from '@/store';
import { getDeptOptions } from './dept';
import { queryRoleOptions } from './role';
import { getUserOptions } from './user';

let cache = {
  loaded: false,
};

export function loadOrgan() {
  if (!cache.loaded) {
    const { setDepts, setRoles, setUsers } = useOrganStore();
    getDeptOptions().then((resp) => {
      setDepts(resp.data);
    });
    queryRoleOptions().then((resp) => {
      setRoles(resp.data);
    });
    getUserOptions().then((resp) => {
      setUsers(resp.data);
    });
    cache.loaded = true;
  }
}
