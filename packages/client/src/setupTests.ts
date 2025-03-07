// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the Redux store
vi.mock('./store', () => ({
  store: {
    getState: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
  persistor: {
    persist: vi.fn(),
  },
}));

// Mock the API utility
vi.mock('./utils/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  getMilestoneTemplates: vi.fn(),
  flagMilestoneTemplate: vi.fn(),
  unflagMilestoneTemplate: vi.fn(),
  getApplicationTypes: vi.fn(),
  getApplicationTypesByCategory: vi.fn(),
  createApplicationType: vi.fn(),
  flagApplicationType: vi.fn(),
  unflagApplicationType: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
}));

// Mock date-fns to ensure consistent date formatting in tests
vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  format: vi.fn().mockImplementation(() => 'Jan 1, 2023'),
  addDays: vi.fn().mockImplementation(() => new Date('2023-01-10')),
  addMonths: vi.fn().mockImplementation(() => new Date('2023-02-01')),
  parseISO: vi.fn().mockImplementation(() => new Date('2023-01-01')),
}));

// Global mocks for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}); 