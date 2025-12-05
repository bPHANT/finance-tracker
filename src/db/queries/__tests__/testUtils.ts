import { jest } from "@jest/globals"
import type { Mock } from "jest-mock"

export interface MockDb {
  select: Mock
  from: Mock
  innerJoin: Mock
  leftJoin: Mock
  where: Mock
  limit: Mock
  then: Mock
  catch: Mock
  insert: Mock
  values: Mock
  returning: Mock
  update: Mock
  set: Mock
  delete: Mock
  transaction: Mock
  onConflictDoUpdate: Mock
}

export interface MockState {
  error: Error | null
  loading: boolean
  setError: Mock
  setLoading: Mock
}

/**
 * Creates a mock database instance with all common methods
 */
export function createMockDb(): MockDb {
  return {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn(),
    catch: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    transaction: jest.fn(),
    onConflictDoUpdate: jest.fn().mockReturnThis(),
  }
}

/**
 * Creates mock state handlers for error and loading
 */
export function createMockState(): MockState {
  let mockError: Error | null = null
  let mockLoading = false

  const mockSetError = jest.fn((error: any) => {
    mockError = error
  })

  const mockSetLoading = jest.fn((loading: any) => {
    mockLoading = loading
  })

  return {
    error: mockError,
    loading: mockLoading,
    setError: mockSetError,
    setLoading: mockSetLoading,
  }
}

/**
 * Mocks useState to work with our mock state handlers
 */
export function mockUseState(useState: any, mockState: MockState) {
  ;(useState as jest.MockedFunction<typeof useState>).mockImplementation(((
    initialValue: any
  ) => {
    if (initialValue === false) {
      return [mockState.loading, mockState.setLoading]
    }
    return [mockState.error, mockState.setError]
  }) as any)
}
