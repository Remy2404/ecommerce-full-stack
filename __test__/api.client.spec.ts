const mockedAxios = {
  create: jest.fn(),
  post: jest.fn(),
};

jest.mock('axios', () => ({
  __esModule: true,
  default: mockedAxios,
}));

type InterceptorRejected = (error: any) => Promise<any>;

const setupClientModule = () => {
  let rejectedHandler: InterceptorRejected | null = null;

  const requestUse = jest.fn();
  const responseUse = jest.fn((_: any, onRejected: InterceptorRejected) => {
    rejectedHandler = onRejected;
  });

  const apiInstance: any = jest.fn();
  apiInstance.interceptors = {
    request: { use: requestUse },
    response: { use: responseUse },
  };

  mockedAxios.create.mockReturnValue(apiInstance);

  let moduleExports: any;
  jest.isolateModules(() => {
    moduleExports = require('@/services/api/client');
  });

  if (!rejectedHandler) {
    throw new Error('Failed to capture axios response interceptor');
  }

  return {
    apiInstance,
    rejectedHandler,
    moduleExports,
  };
};

describe('api client refresh interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes once and retries original request on 401', async () => {
    const { apiInstance, rejectedHandler, moduleExports } = setupClientModule();

    mockedAxios.post.mockResolvedValue({ data: { token: 'new-access-token' } });
    apiInstance.mockResolvedValue({ data: { ok: true } });

    const originalRequest = { url: '/orders', headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    const result = await rejectedHandler(error);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    expect(apiInstance).toHaveBeenCalledTimes(1);
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
    expect(moduleExports.getAccessToken()).toBe('new-access-token');
    expect(result).toEqual({ data: { ok: true } });
  });

  it('uses a single refresh call for concurrent 401 responses', async () => {
    const { apiInstance, rejectedHandler, moduleExports } = setupClientModule();

    let resolveRefresh: ((value: any) => void) | undefined;
    mockedAxios.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );
    apiInstance.mockResolvedValue({ data: { ok: true } });

    const req1 = { url: '/orders', headers: {} as Record<string, string> };
    const req2 = { url: '/cart', headers: {} as Record<string, string> };
    const err1 = { config: req1, response: { status: 401 } };
    const err2 = { config: req2, response: { status: 401 } };

    const p1 = rejectedHandler(err1);
    const p2 = rejectedHandler(err2);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    resolveRefresh?.({ data: { token: 'shared-token' } });
    await Promise.all([p1, p2]);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(apiInstance).toHaveBeenCalledTimes(2);
    expect(req1.headers.Authorization).toBe('Bearer shared-token');
    expect(req2.headers.Authorization).toBe('Bearer shared-token');
    expect(moduleExports.getAccessToken()).toBe('shared-token');
  });

  it('does not attempt refresh for /auth/refresh endpoint itself', async () => {
    const { rejectedHandler } = setupClientModule();
    const originalRequest = { url: '/auth/refresh', headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(rejectedHandler(error)).rejects.toBe(error);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('treats refresh failure as terminal and clears access token', async () => {
    const { rejectedHandler, moduleExports } = setupClientModule();
    moduleExports.setAccessToken('old-access-token');

    mockedAxios.post.mockRejectedValue(new Error('refresh failed'));
    const originalRequest = { url: '/orders', headers: {} as Record<string, string> };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(rejectedHandler(error)).rejects.toBeTruthy();
    expect(moduleExports.getAccessToken()).toBeNull();
  });
});
