import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StoreHeader from './components/StoreHeader';
import ProductGrid from './components/ProductGrid';
import DisclaimerModal from './components/DisclaimerModal';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black transition-colors duration-500">
        <StoreHeader />
        
        <DisclaimerModal />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
              Digital excellence,<br />delivered directly.
            </h2>
            <p className="text-brand-gray-muted max-w-2xl text-lg font-medium">
              Zero-fee, Solana-native marketplace for digital creators.
              Fork, deploy, and own your distribution.
            </p>
          </div>

          <ProductGrid />
        </main>

        <footer className="border-t border-white/5 py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-tighter text-xl">ZeroCut</span>
              <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">v1.0-alpha</span>
            </div>
            <p className="text-brand-gray-muted text-sm">
              &copy; 2024 ZeroCut. Open-source under MIT.
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
