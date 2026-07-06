/**
 * Vitest setup file
 * Ce fichier est exécuté avant chaque test
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Global test timeout
const TEST_TIMEOUT = 10000;

// Set global test timeout
vi.setConfig({ testTimeout: TEST_TIMEOUT });

// Mock Date to make tests deterministic
const mockDate = new Date('2025-06-19T12:00:00Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterAll(() => {
  vi.useRealTimers();
});

// Mock next/headers globally
vi.mock('next/headers', () => ({
  headers: () => ({
    get: (name: string) => null,
    set: (name: string, value: string) => null,
    has: (name: string) => false,
    delete: (name: string) => null,
    entries: () => [],
    forEach: (callback: (value: string, key: string) => void) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
  }),
  cookies: () => ({
    get: (name: string) => null,
    set: (name: string, value: string, options?: { path?: string; domain?: string; expires?: Date; httpOnly?: boolean; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) => null,
    has: (name: string) => false,
    delete: (name: string) => null,
    entries: () => [],
    forEach: (callback: (value: { name: string; value: string }, key: string) => void) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
  }),
}));

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (name: string) => null,
    has: (name: string) => false,
    entries: () => [],
    forEach: (callback: Function) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
    toString: () => '',
  }),
  usePathname: () => '/',
  redirect: (url: string) => { throw new Error(`Redirect to: ${url}`); },
  permanentRedirect: (url: string) => { throw new Error(`Permanent redirect to: ${url}`); },
  notFound: () => { throw new Error('Not Found'); },
  useParams: () => ({}),
}));
