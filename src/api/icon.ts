import axios from 'axios';
import { Msg } from '@/api/interceptor';

/** 获取图标svg */
export function getIconSvgs() {
  return axios.get<void, Msg<string[]>>('/api/approveManagement/getSvgIcons');
}

export const ICON_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/icon/svg/';