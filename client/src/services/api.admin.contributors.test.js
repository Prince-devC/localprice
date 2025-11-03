/**
 * Tests pour adminService.getContributors
 */
const axios = require('axios');

jest.mock('axios');

describe('adminService.getContributors', () => {
  let adminService;

  beforeEach(() => {
    const mockGet = jest.fn().mockResolvedValue({ data: { success: true, data: [{ id: 'u1' }] } });
    axios.create.mockReturnValue({
      get: mockGet,
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    });
    // Importer après avoir mocké axios.create
    const apiModule = require('./api');
    adminService = apiModule.adminService;
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('envoie les bons paramètres (pagination + active_only)', async () => {
    const apiInstance = axios.create.mock.results[0].value;
    const { get } = apiInstance;

    const params = { limit: 10, offset: 20, active_only: true };
    const resp = await adminService.getContributors(params);

    expect(get).toHaveBeenCalledWith('/admin/contributors', { params });
    expect(resp.data.success).toBe(true);
    expect(resp.data.data.length).toBe(1);
  });

  test('gère une réponse vide', async () => {
    const apiInstance = axios.create.mock.results[0].value;
    apiInstance.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
    const resp = await adminService.getContributors({ limit: 5, offset: 0 });
    expect(resp.data.data).toEqual([]);
  });
});