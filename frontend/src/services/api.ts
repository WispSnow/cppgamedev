// 接口请求：同源 GET，返回 JSON。非 2xx 时抛 HttpError，页面据此区分 404 和网络错误

export class HttpError extends Error {
  status: number;

  constructor(status: number, url: string) {
    super(`请求 ${url} 失败：HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** signal：页面离开或参数变化时用来取消请求，被取消时 Promise 以 AbortError 拒绝 */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new HttpError(response.status, url);
  }
  return response.json() as Promise<T>;
}

// 接口返回 404（课程或章节不存在）时为 true，用来和网络错误区分开
export const isNotFoundError = (error: unknown): boolean =>
  error instanceof HttpError && error.status === 404;
