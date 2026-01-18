/**
 * Tests de rendu pour la section Contributeurs dans AdminDashboard
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import AdminDashboard from './AdminDashboard';

// Mock des contextes
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-id', user_metadata: { username: 'admin' }, email: 'admin@example.com' },
    hasRole: (role) => role === 'admin' || role === 'super_admin',
    isAuthenticated: true,
  })
}));

jest.mock('../contexts/SeoContext', () => ({
  useSeo: () => ({ setTitle: jest.fn(), refresh: jest.fn() })
}));

// Mock des services API utilisés par AdminDashboard
const mockGetContributors = jest.fn();

jest.mock('../services/api', () => ({
  adminService: {
    getDashboard: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    getPendingPrices: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getContributionRequests: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getUsers: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getContributors: (...args) => mockGetContributors(...args),
    addUserRole: jest.fn().mockResolvedValue({ data: { success: true } }),
    removeUserRole: jest.fn().mockResolvedValue({ data: { success: true } }),
    approveContributionRequest: jest.fn().mockResolvedValue({ data: { success: true } }),
    rejectContributionRequest: jest.fn().mockResolvedValue({ data: { success: true } }),
    getOffers: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    updateOfferStatus: jest.fn().mockResolvedValue({ data: { success: true } }),
    createOffer: jest.fn().mockResolvedValue({ data: { success: true } }),
    updateOffer: jest.fn().mockResolvedValue({ data: { success: true } }),
    deleteOffer: jest.fn().mockResolvedValue({ data: { success: true } }),
    banUsers: jest.fn().mockResolvedValue({ data: { success: true } }),
    deleteUsers: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
  seoService: {
    getSettings: jest.fn().mockResolvedValue({ data: { data: {} } }),
    updateSettings: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
  agriculturalPriceService: {
    getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getPending: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    validate: jest.fn().mockResolvedValue({ data: { success: true } }),
    reject: jest.fn().mockResolvedValue({ data: { success: true } }),
  },
  productCategoryService: { getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
  languageService: { getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
  localityService: { getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }), getByRegion: jest.fn() },
  unitService: { getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
  filterOptionsService: {
    getAll: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    getProducts: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getLocalities: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getRegions: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getCategories: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    getPeriods: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
  productService: { getAll: jest.fn().mockResolvedValue({ data: { success: true, data: [] } }) },
  settingsService: { getKoboSettings: jest.fn().mockResolvedValue({ data: { success: true, data: {} } }) },
  authService: {
    getProfile: jest.fn().mockResolvedValue({ data: { data: { role: 'super_admin' } } }),
  },
}));

const setup = async () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
  await waitForElementToBeRemoved(() =>
    screen.getByText(/Chargement de l'espace admin/i)
  );
  const link = screen.getByTestId('nav-contributors');
  fireEvent.click(link);
};

describe('AdminDashboard contributors section', () => {
  beforeEach(() => {
    mockGetContributors.mockReset();
  });

  test('affiche la liste des contributeurs', async () => {
    mockGetContributors.mockResolvedValue({ data: { success: true, data: [
      { id: 'c1', email: 'c1@example.com', username: 'c1', display_name: 'Contrib 1', total_prices: 0 },
      { id: 'c2', email: 'c2@example.com', username: 'c2', display_name: 'Contrib 2', total_prices: 3 },
    ] } });

    await setup();

    // Titre et lignes
    expect(await screen.findByText(/Contributeurs \(acceptés\)/i)).toBeInTheDocument();
    expect(await screen.findByText('c1@example.com')).toBeInTheDocument();
    expect(await screen.findByText('c2@example.com')).toBeInTheDocument();
  });

  test('affiche un message quand la liste est vide', async () => {
    mockGetContributors.mockResolvedValue({ data: { success: true, data: [] } });
    await setup();
    expect(await screen.findByText(/Aucun contributeur trouvé/i)).toBeInTheDocument();
  });

  test('affiche une erreur en cas d’échec', async () => {
    mockGetContributors.mockRejectedValue(new Error('Network error'));
    await setup();
    expect(await screen.findByText(/Erreur lors du chargement des contributeurs/i)).toBeInTheDocument();
  });

  test('le bouton Rafraîchir relance la requête', async () => {
    mockGetContributors.mockResolvedValue({ data: { success: true, data: [] } });
    await setup();
    const refresh = await screen.findByRole('button', { name: /Rafraîchir/i });
    fireEvent.click(refresh);
    await waitFor(() => {
      expect(mockGetContributors).toHaveBeenCalledTimes(2);
    });
  });
});
