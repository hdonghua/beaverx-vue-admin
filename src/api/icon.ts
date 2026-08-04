import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export function getIconSvgs() {
  return axios.get<void, ApiResponse<string[]>>(
    '/api/approveManagement/getSvgIcons'
  );
}

export const ICON_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/icon/svg/`;
