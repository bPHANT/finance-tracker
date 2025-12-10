/* eslint-env jest */
/* global jest */

// Mock React Native modules that cause issues in tests
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  default: () => "light",
}))
