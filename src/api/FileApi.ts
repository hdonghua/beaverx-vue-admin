const apiBase = import.meta.env.VITE_API_BASE_URL || '';

export const FILE_BASE_URL = `${apiBase}/api/File`;
export const FILE_UPLOAD_URL = `${FILE_BASE_URL}/upload?folder=oa`;
export const FILE_DOWNLOAD_URL = `${FILE_BASE_URL}/download`;
export const FILE_PREVIEW_URL = FILE_DOWNLOAD_URL;

export function normalizeUploadResponse(response: any) {
  let source = response?.data ?? response ?? {};
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      source = {};
    }
  }
  const id = source.id || source.objectKey;
  return {
    ...source,
    id,
    name: source.fileName || source.name || id,
    url: source.proxyUrl || `${FILE_DOWNLOAD_URL}?id=${encodeURIComponent(id)}`,
  };
}

const FileApi = {
  batchMetadata({ ids }: { ids: string }) {
    const data = (ids || '')
      .split(',')
      .filter(Boolean)
      .map((id) => ({
        id,
        name: id.split('/').pop() || id,
        url: `${FILE_DOWNLOAD_URL}?id=${encodeURIComponent(id)}`,
      }));
    return Promise.resolve({ code: 1, msg: '', data });
  },
};

export default FileApi;
