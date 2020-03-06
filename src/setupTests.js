import '@testing-library/jest-dom/extend-expect';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

global.fetchMock.mockResponse(
  JSON.stringify({ defaultMockResponse: true }),
);
