import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const formatUtcDateTime = (value?: string | Date | null) =>
  value ? dayjs.utc(value).local().format('YYYY-MM-DD HH:mm:ss') : '-';
