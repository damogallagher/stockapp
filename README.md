# 📈 StockApp - Professional Stock Market Analytics Platform

A comprehensive Next.js 14 application for stock market analysis, portfolio tracking, and investment insights. Built with modern web technologies and professional-grade components.

![StockApp Preview](https://via.placeholder.com/1200x600/1f2937/ffffff?text=StockApp+Dashboard)

## ✨ Features

### 🔍 **Stock Search & Discovery**
- Real-time search with autocomplete suggestions
- Search by ticker symbol or company name
- Popular/trending stocks section
- Recent searches history
- Major market indices display (S&P 500, NASDAQ, DOW)

### 📊 **Stock Information Dashboard**
- Real-time stock quotes and pricing
- Price movement indicators with color coding
- Comprehensive key metrics:
  - Market Cap, P/E Ratio, EPS
  - 52-week high/low
  - Volume and average volume
  - Dividend yield (when applicable)
  - Beta, ROE, Debt-to-Equity ratio

### 📈 **Interactive Charts**
- Multiple timeframes: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y, MAX
- Chart types: Line, Area, Volume
- Technical indicators and moving averages
- Responsive mobile-friendly interactions
- Zoom and pan capabilities

### 🏢 **Company Information**
- Detailed company descriptions and business overview
- Recent news articles and market sentiment
- Financial highlights and key statistics
- Executive information and company details
- Sector and industry classification

### ⭐ **Watchlist Functionality**
- Add/remove stocks to personal watchlist
- Local storage persistence
- Quick performance overview
- Sortable watchlist table with multiple views
- Real-time price updates

### 🌍 **Market Overview**
- Pre-market and after-hours indicators
- Market status (Open/Closed with session times)
- Top gainers/losers of the day
- Most active stocks
- Major indices tracking

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: Alpha Vantage (free tier)
- **Deployment**: Vercel/Netlify ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-app.git
   cd stock-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Alpha Vantage API key to `.env.local`:
   ```env
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
   NEXT_PUBLIC_ALPHA_VANTAGE_BASE_URL=https://www.alphavantage.co/query
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 API Configuration

### Alpha Vantage Setup

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Add the key to your `.env.local` file
4. Free tier limitations:
   - 5 API requests per minute
   - 500 requests per day

### API Rate Limiting

The application includes:
- Built-in caching (1-minute cache duration)
- Retry mechanisms for failed requests
- Rate limiting awareness and user feedback
- Error handling for API failures

## 🏗 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Home dashboard
│   ├── stock/[symbol]/    # Individual stock pages
│   ├── watchlist/         # Watchlist page
│   ├── market/            # Market overview page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Chart components
│   ├── layout/            # Layout components
│   └── stock/             # Stock-related components
├── lib/
│   ├── api.ts             # API functions
│   ├── types.ts           # TypeScript interfaces
│   ├── utils.ts           # Utility functions
│   └── store.ts           # Zustand store
└── hooks/
    ├── useStockData.ts    # Stock data hooks
    └── useWatchlist.ts    # Watchlist hooks
```

## 🎨 Components Overview

### Core Components

- **StockSearch**: Autocomplete search with suggestions
- **StockDashboard**: Comprehensive stock information display
- **StockChart**: Interactive charts with multiple timeframes
- **CompanyInfo**: Detailed company information and financials
- **Watchlist**: Portfolio tracking and management
- **MarketOverview**: Market indices and top movers

### UI Components

Built with shadcn/ui for consistent, accessible design:
- Cards, Buttons, Input fields
- Tabs, Badges, Skeletons
- Responsive navigation
- Dark/Light mode toggle

## 📱 Responsive Design

- **Mobile-first approach**
- **Responsive breakpoints**: sm, md, lg, xl
- **Touch-friendly interactions**
- **Optimized for tablets and phones**
- **Progressive loading on slower connections**

## 🎯 Performance Optimizations

- **Image optimization** with Next.js Image component
- **Lazy loading** for charts and heavy components
- **Debounced search** functionality
- **Efficient re-rendering** patterns
- **Code splitting** and dynamic imports
- **Caching strategies** for API calls

## 🔐 Security Features

- **Environment variable protection**
- **Input validation and sanitization**
- **XSS protection**
- **CSRF protection**
- **Secure API key handling**

## 🧪 Testing & Development

### Development Tools

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD [\"npm\", \"start\"]
```

## 📊 API Endpoints Used

### Alpha Vantage Endpoints

- **Symbol Search**: `SYMBOL_SEARCH`
- **Quote**: `GLOBAL_QUOTE`
- **Company Overview**: `OVERVIEW`
- **Time Series**: `TIME_SERIES_DAILY`, `TIME_SERIES_INTRADAY`
- **News Sentiment**: `NEWS_SENTIMENT`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for financial data API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for interactive charts
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email support@stockapp.com or join our Slack channel.

---

**Built with ❤️ by the StockApp Team**