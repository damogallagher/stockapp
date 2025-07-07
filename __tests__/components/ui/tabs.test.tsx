import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

describe('Tabs Components', () => {
  const TabsExample = () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" disabled>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  )

  describe('TabsList', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList data-testid="tabs-list">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      
      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toBeInTheDocument()
      expect(tabsList).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center', 'rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground')
    })

    it('renders with custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList className="custom-tabs-list" data-testid="tabs-list">
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      
      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass('custom-tabs-list')
    })
  })

  describe('TabsTrigger', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger value="test">Test Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      
      const trigger = screen.getByRole('tab', { name: 'Test Tab' })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-sm', 'px-3', 'py-1.5', 'text-sm', 'font-medium')
    })

    it('renders with custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger value="test" className="custom-trigger">Test Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      
      const trigger = screen.getByRole('tab', { name: 'Test Tab' })
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('can be disabled', () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger value="test" disabled>Disabled Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      
      const trigger = screen.getByRole('tab', { name: 'Disabled Tab' })
      expect(trigger).toHaveAttribute('disabled')
      expect(trigger).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })
  })

  describe('TabsContent', () => {
    it('renders with default classes', () => {
      render(
        <Tabs defaultValue="test">
          <TabsContent value="test" data-testid="tabs-content">
            Test Content
          </TabsContent>
        </Tabs>
      )
      
      const content = screen.getByTestId('tabs-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('mt-2', 'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2')
    })

    it('renders with custom className', () => {
      render(
        <Tabs defaultValue="test">
          <TabsContent value="test" className="custom-content" data-testid="tabs-content">
            Test Content
          </TabsContent>
        </Tabs>
      )
      
      const content = screen.getByTestId('tabs-content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('Tabs Integration', () => {
    it('renders complete tabs structure', () => {
      render(<TabsExample />)
      
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
      
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument()
      expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument()
    })

    it('switches between tabs', async () => {
      render(<TabsExample />)
      
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      
      // Initial state - Tab 1 content should be visible
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument()
      expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument()
      
      // Click Tab 2 and use keyboard interaction
      await act(async () => {
        fireEvent.click(tab2)
        fireEvent.keyDown(tab2, { key: 'Enter' })
      })
      
      // Wait for Tab 2 to become active and content to appear
      await waitFor(() => {
        expect(tab2).toHaveAttribute('aria-selected', 'true')
      })
      
      await waitFor(() => {
        expect(screen.getByText('Content for Tab 2')).toBeInTheDocument()
      })
      
      // Tab 1 content should be hidden
      expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument()
    })

    it('handles disabled tabs', () => {
      render(<TabsExample />)
      
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })
      expect(tab3).toHaveAttribute('disabled')
      
      fireEvent.click(tab3)
      
      expect(tab3).toHaveAttribute('aria-selected', 'false')
      expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
      render(<TabsExample />)
      
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      
      await act(async () => {
        tab1.focus()
        fireEvent.keyDown(tab1, { key: 'ArrowRight' })
      })
      
      await waitFor(() => {
        expect(tab2).toHaveFocus()
      })
      
      await act(async () => {
        fireEvent.keyDown(tab2, { key: 'Enter' })
      })
      
      await waitFor(() => {
        expect(tab2).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByText('Content for Tab 2')).toBeInTheDocument()
      })
    })

    it('supports controlled tabs', async () => {
      const ControlledTabs = () => {
        const [activeTab, setActiveTab] = React.useState('tab1')
        
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </Tabs>
        )
      }
      
      render(<ControlledTabs />)
      
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      
      await act(async () => {
        fireEvent.click(tab2)
        // Ensure keyboard events as well for Radix UI
        fireEvent.keyDown(tab2, { key: 'Enter' })
        fireEvent.keyDown(tab2, { key: ' ' })
      })
      
      // Check that Tab 2 is selected
      await waitFor(() => {
        expect(tab2).toHaveAttribute('aria-selected', 'true')
      })
      
      // Look for the content or verify that Tab 1 content is hidden
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      
      // Check that Content 2 is visible or the tab panel for tab2 exists
      const tab2Panel = screen.getByRole('tabpanel')
      expect(tab2Panel).toBeInTheDocument()
    })
  })
})