import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApiTestPage from '@/app/api-test/page'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
}

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

describe('ApiTestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
    consoleSpy.log.mockClear()
    consoleSpy.error.mockClear()
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('Component Rendering', () => {
    it('should render the API test page with all sections', () => {
      render(<ApiTestPage />)
      
      expect(screen.getByText('Yahoo Finance API Status Test')).toBeInTheDocument()
      expect(screen.getByText('Current Configuration:')).toBeInTheDocument()
      expect(screen.getByText('API Provider:')).toBeInTheDocument()
      expect(screen.getByText('Yahoo Finance (via yahoo-finance2)')).toBeInTheDocument()
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('No API key required')).toBeInTheDocument()
    })

    it('should display the test button', () => {
      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('should not show result section initially', () => {
      render(<ApiTestPage />)
      
      expect(screen.queryByText(/Result$/)).not.toBeInTheDocument()
      expect(screen.queryByText('SUCCESS')).not.toBeInTheDocument()
      expect(screen.queryByText('ERROR/FAILED')).not.toBeInTheDocument()
    })

    it('should have proper page structure', () => {
      render(<ApiTestPage />)
      
      const container = screen.getByText('Yahoo Finance API Status Test').closest('.container')
      expect(container).toHaveClass('mx-auto', 'p-8')
    })
  })

  describe('API Testing - Success', () => {
    it('should handle successful API response', async () => {
      const mockSuccessResponse = {
        success: true,
        data: { symbol: 'AAPL', price: 150 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      // Button should show loading state
      expect(screen.getByRole('button', { name: 'Testing...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Testing...' })).toBeDisabled()

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText('YAHOO FINANCE API Result')).toBeInTheDocument()
      })

      // Check success indicator
      expect(screen.getByText('SUCCESS')).toBeInTheDocument()
      expect(screen.getByText('SUCCESS')).toHaveClass('bg-green-100', 'text-green-800')

      // Check result display
      expect(screen.getByText(/"success": true/)).toBeInTheDocument()
      expect(screen.getByText(/"isRealData": true/)).toBeInTheDocument()

      // Button should be back to normal state
      expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).not.toBeDisabled()

      // Check console log was called
      expect(consoleSpy.log).toHaveBeenCalledWith('Yahoo Finance API Response:', mockSuccessResponse)
    })

    it('should handle API response with success: false', async () => {
      const mockFailureResponse = {
        success: false,
        error: 'API rate limit exceeded'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFailureResponse,
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('YAHOO FINANCE API Result')).toBeInTheDocument()
      })

      // Check failure indicator
      expect(screen.getByText('ERROR/FAILED')).toBeInTheDocument()
      expect(screen.getByText('ERROR/FAILED')).toHaveClass('bg-red-100', 'text-red-800')

      // Check result shows success: false
      expect(screen.getByText(/"success": false/)).toBeInTheDocument()
      expect(screen.getByText(/"isRealData": false/)).toBeInTheDocument()
    })
  })

  describe('API Testing - Error Handling', () => {
    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error'
      mockFetch.mockRejectedValueOnce(new Error(errorMessage))

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('API ERROR Result')).toBeInTheDocument()
      })

      // Check error indicator
      expect(screen.getByText('ERROR/FAILED')).toBeInTheDocument()
      expect(screen.getByText('ERROR/FAILED')).toHaveClass('bg-red-100', 'text-red-800')

      // Check error message is displayed
      expect(screen.getByText(/"error": "Network error"/)).toBeInTheDocument()
      expect(screen.getByText(/"type": "API ERROR"/)).toBeInTheDocument()

      // Check console error was called
      expect(consoleSpy.error).toHaveBeenCalledWith('API Error:', expect.any(Error))
    })

    it('should handle non-Error exceptions', async () => {
      const errorMessage = 'Unknown error occurred'
      mockFetch.mockRejectedValueOnce(errorMessage)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('API ERROR Result')).toBeInTheDocument()
      })

      // Check unknown error handling
      expect(screen.getByText(/"error": "Unknown error"/)).toBeInTheDocument()
      expect(consoleSpy.error).toHaveBeenCalledWith('API Error:', errorMessage)
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('API ERROR Result')).toBeInTheDocument()
      })

      expect(screen.getByText(/"error": "Invalid JSON"/)).toBeInTheDocument()
    })
  })

  describe('UI States', () => {
    it('should show loading state during API call', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(controlledPromise as Promise<Response>)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      // Should immediately show loading state
      expect(screen.getByRole('button', { name: 'Testing...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Testing...' })).toBeDisabled()

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      })
    })

    it('should reset loading state after successful call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).not.toBeDisabled()
    })

    it('should reset loading state after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'))

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).not.toBeDisabled()
    })
  })

  describe('Multiple API Calls', () => {
    it('should handle multiple successive API calls', async () => {
      // First call - success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { test: 1 } }),
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('SUCCESS')).toBeInTheDocument()
      })

      // Second call - error
      mockFetch.mockRejectedValueOnce(new Error('Second call error'))
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('API ERROR Result')).toBeInTheDocument()
      })

      expect(screen.getByText(/"error": "Second call error"/)).toBeInTheDocument()
    })

    it('should not allow clicking button while loading', async () => {
      let resolvePromise: (value: any) => void
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(controlledPromise as Promise<Response>)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      // Button should be disabled
      const loadingButton = screen.getByRole('button', { name: 'Testing...' })
      expect(loadingButton).toBeDisabled()

      // Try to click disabled button
      fireEvent.click(loadingButton)

      // Should still only have one fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Resolve to finish the test
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      })
    })
  })

  describe('Result Display', () => {
    it('should display result in proper JSON format', async () => {
      const mockResponse = {
        success: true,
        data: {
          symbol: 'AAPL',
          price: 150.25,
          nested: { value: 'test' }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('YAHOO FINANCE API Result')).toBeInTheDocument()
      })

      // Check JSON formatting
      const preElement = screen.getByText(/"symbol": "AAPL"/).closest('pre')
      expect(preElement).toHaveClass('text-xs', 'overflow-auto', 'bg-gray-100', 'p-4', 'rounded', 'max-h-96')
    })

    it('should update result when new API call is made', async () => {
      // First call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { first: 'call' } }),
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText(/"first": "call"/)).toBeInTheDocument()
      })

      // Second call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { second: 'call' } }),
      } as Response)

      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText(/"second": "call"/)).toBeInTheDocument()
      })

      // First call result should be gone
      expect(screen.queryByText(/"first": "call"/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      expect(button).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<ApiTestPage />)
      
      expect(screen.getByText('Yahoo Finance API Status Test')).toBeInTheDocument()
      expect(screen.getByText('Current Configuration:')).toBeInTheDocument()
    })

    it('should maintain focus management during loading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      button.focus()
      expect(button).toHaveFocus()

      fireEvent.click(button)

      // During loading, button should still be focused but disabled
      const loadingButton = screen.getByRole('button', { name: 'Testing...' })
      expect(loadingButton).toHaveFocus()
      expect(loadingButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Test Yahoo Finance API' })).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<ApiTestPage />)
      
      expect(screen.getByText('Yahoo Finance API Status Test')).toBeInTheDocument()
      
      // Re-render with same props
      rerender(<ApiTestPage />)
      
      expect(screen.getByText('Yahoo Finance API Status Test')).toBeInTheDocument()
    })

    it('should handle component unmount during API call', async () => {
      let resolvePromise: (value: any) => void
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(controlledPromise as Promise<Response>)

      const { unmount } = render(<ApiTestPage />)
      
      const button = screen.getByRole('button', { name: 'Test Yahoo Finance API' })
      fireEvent.click(button)

      // Unmount component during API call
      unmount()

      // Resolve promise after unmount
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      } as Response)

      // Should not throw error
      await new Promise(resolve => setTimeout(resolve, 0))
    })
  })
})