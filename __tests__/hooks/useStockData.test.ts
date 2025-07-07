import { renderHook, waitFor } from '@testing-library/react';
import { useStockQuote, useCompanyOverview, useStockChart, useMarketNews, useStockData } from '@/hooks/useStockData';
import * as api from '@/lib/api';
import { TimeRange } from '@/lib/types';
import { createMockStockQuote, createMockCompanyOverview, createMockChartData } from '../setup/test-utils';

// Mock the API functions
jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('Stock Data Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getCachedData.mockReturnValue(null); // No cache by default
  });

  describe('useStockQuote', () => {
    it('should fetch stock quote successfully', async () => {
      const mockQuote = createMockStockQuote();
      mockApi.getStockQuote.mockResolvedValue({ data: mockQuote, error: null, success: true });

      const { result } = renderHook(() => useStockQuote('AAPL'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(mockQuote);
        expect(result.current.error).toBe(null);
      });

      expect(mockApi.setCachedData).toHaveBeenCalledWith('quote-AAPL', mockQuote);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch quote';
      mockApi.getStockQuote.mockResolvedValue({ data: {} as any, error: errorMessage, success: false });

      const { result } = renderHook(() => useStockQuote('INVALID'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle API exceptions', async () => {
      const errorMessage = 'Network error';
      mockApi.getStockQuote.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useStockQuote('AAPL'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should use cached data when available', async () => {
      const mockQuote = createMockStockQuote();
      mockApi.getCachedData.mockReturnValue(mockQuote);

      const { result } = renderHook(() => useStockQuote('AAPL'));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockQuote);
      expect(mockApi.getStockQuote).not.toHaveBeenCalled();
    });

    it('should refetch when symbol changes', async () => {
      const mockQuote1 = createMockStockQuote({ symbol: 'AAPL' });
      const mockQuote2 = createMockStockQuote({ symbol: 'GOOGL' });

      mockApi.getStockQuote
        .mockResolvedValueOnce({ data: mockQuote1, error: null, success: true })
        .mockResolvedValueOnce({ data: mockQuote2, error: null, success: true });

      const { result, rerender } = renderHook(({ symbol }) => useStockQuote(symbol), { initialProps: { symbol: 'AAPL' } });

      await waitFor(() => expect(result.current.data).toEqual(mockQuote1));

      rerender({ symbol: 'GOOGL' });

      await waitFor(() => expect(result.current.data).toEqual(mockQuote2));

      expect(mockApi.getStockQuote).toHaveBeenCalledTimes(2);
    });
  });

  describe('useStockChart', () => {
    it('should refetch when timeRange changes', async () => {
      const mockChartData1D = createMockChartData();
      const mockChartData1M = createMockChartData();

      mockApi.getStockChart
        .mockResolvedValueOnce({ data: mockChartData1D, error: null, success: true })
        .mockResolvedValueOnce({ data: mockChartData1M, error: null, success: true });

      const { result, rerender } = renderHook(({ timeRange }) => useStockChart('AAPL', timeRange), { initialProps: { timeRange: '1D' as TimeRange } });

      await waitFor(() => expect(result.current.data).toEqual(mockChartData1D));

      rerender({ timeRange: '1M' as TimeRange });

      await waitFor(() => expect(result.current.data).toEqual(mockChartData1M));

      expect(mockApi.getStockChart).toHaveBeenCalledTimes(2);
    });

    it('should handle chart data errors', async () => {
      const errorMessage = 'Failed to fetch chart data';
      mockApi.getStockChart.mockResolvedValue({ data: [], error: errorMessage, success: false });

      const { result } = renderHook(() => useStockChart('AAPL', '1D'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });

  describe('useStockData (combined hook)', () => {
    it('should combine all stock data hooks', async () => {
      const mockQuote = createMockStockQuote();
      const mockOverview = createMockCompanyOverview();
      const mockNews = [{ title: 'Test News', url: 'https://test.com', time_published: '', authors: [], summary: '', banner_image: '', source: '', category_within_source: '', source_domain: '', topics: [], overall_sentiment_score: 0, overall_sentiment_label: '', ticker_sentiment: [] }];

      mockApi.getStockQuote.mockResolvedValue({ data: mockQuote, error: null, success: true });
      mockApi.getCompanyOverview.mockResolvedValue({ data: mockOverview, error: null, success: true });
      mockApi.getMarketNews.mockResolvedValue({ data: mockNews, error: null, success: true });

      const { result } = renderHook(() => useStockData('AAPL'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.quote).toEqual(mockQuote);
        expect(result.current.overview).toEqual(mockOverview);
        expect(result.current.news).toEqual(mockNews);
        expect(result.current.error).toBe(null);
      });
    });
  });
});
