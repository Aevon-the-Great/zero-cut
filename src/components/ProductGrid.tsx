import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react';

/**
 * Product interface for individual items
 */
interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // In SOL or USDC
    currency: 'SOL' | 'USDC';
    image?: string;
    downloadUrl?: string;
}

export const ProductGrid = () => {
    const { connected } = useWallet();

    // URL from environment variables
    const productJsonUrl = import.meta.env.VITE_PRODUCT_JSON_URL;

    const { data: products, isLoading, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!productJsonUrl) {
                // For testing/demonstration when env var is missing
                throw new Error('VITE_PRODUCT_JSON_URL environment variable is not defined.');
            }
            const response = await fetch(productJsonUrl);
            if (!response.ok) throw new Error('Failed to fetch product catalog');
            return response.json();
        },
        enabled: !!productJsonUrl,
        retry: 1,
    });

    const handlePay = (product: Product) => {
        if (!connected) return;
        console.log(`Initial payment logic placeholder for: ${product.name}`);
        alert(`Payment logic for ${product.name} would be triggered here. Connecting to @solana/web3.js for transaction...`);
        // Placeholder for future implementation:
        // 1. Create transaction (SystemProgram.transfer for SOL or Token.transfer for USDC)
        // 2. Request signature from useWallet().sendTransaction
        // 3. Confirm transaction
        // 4. Reveal download link
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-white w-10 h-10" />
                <p className="text-brand-gray-muted text-sm font-medium tracking-wide">Loading product catalog...</p>
            </div>
        );
    }

    // Error state
    if (error || !productJsonUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <AlertCircle className="text-white/40 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
                <p className="text-brand-gray-muted max-w-md mb-8">
                    {error instanceof Error ? error.message : 'Please set the VITE_PRODUCT_JSON_URL in your environment variables to load your products.'}
                </p>
                <div className="p-4 bg-white/5 rounded-subtle border border-white/10 text-xs font-mono text-left max-w-lg">
                    <p className="text-white/40 mb-2">// config example</p>
                    <p className="text-white/80">VITE_PRODUCT_JSON_URL="https://arweave.net/your-json-hash"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
            <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-1 bg-white/10"></div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-brand-gray-muted">Marketplace</h2>
                <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products?.map((product) => (
                    <div
                        key={product.id}
                        className="group bg-white/5 border border-white/10 rounded-subtle overflow-hidden flex flex-col transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                    >
                        {/* Image Placeholder or Actual Image */}
                        <div className="aspect-video w-full bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <ShoppingCart className="text-white/10 w-12 h-12" />
                            )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-brand-gray-light transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-brand-gray-muted leading-relaxed line-clamp-2">
                                    {product.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 flex flex-col gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white">{product.price}</span>
                                    <span className="text-xs font-bold text-brand-gray-muted uppercase tracking-wider">{product.currency}</span>
                                </div>

                                <button
                                    onClick={() => handlePay(product)}
                                    disabled={!connected}
                                    className={`
                    w-full py-3 px-4 rounded-subtle font-bold text-sm tracking-wide transition-all duration-200
                    ${connected
                                            ? 'bg-white text-black hover:bg-brand-gray-light active:scale-[0.98]'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                  `}
                                >
                                    {connected ? `Pay with ${product.currency}` : 'Connect Wallet to Buy'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products?.length === 0 && (
                <div className="text-center py-20 text-brand-gray-muted border border-dashed border-white/10 rounded-subtle">
                    No products found in the catalog.
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
