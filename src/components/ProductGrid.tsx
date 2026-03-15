import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, ShoppingCart, CheckCircle2, Download } from 'lucide-react';
import { useState } from 'react';
import { 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
    getAssociatedTokenAddress, 
    createTransferCheckedInstruction 
} from '@solana/spl-token';

// USDC Mint address string (Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr on devnet)
const USDC_MINT_STR = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

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

interface StoreMetadata {
    name: string;
    wallet?: string;
    feeToggle?: boolean;
    network?: 'mainnet-beta' | 'devnet';
}

export const ProductGrid = () => {
    const { connection } = useConnection();
    const { publicKey, connected, sendTransaction } = useWallet();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

    // URL from environment variables
    const productJsonUrl = import.meta.env.VITE_PRODUCT_JSON_URL;
    const metadataUrl = import.meta.env.VITE_METADATA_JSON_URL;

    // Fetch store metadata to get recipient wallet
    const { data: metadata } = useQuery<StoreMetadata>({
        queryKey: ['storeMetadata'],
        queryFn: async () => {
            if (!metadataUrl) return { name: 'ZeroCut Store' };
            const response = await fetch(metadataUrl);
            if (!response.ok) throw new Error('Failed to fetch store metadata');
            return response.json();
        },
    });

    const { data: products, isLoading, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!productJsonUrl) {
                throw new Error('VITE_PRODUCT_JSON_URL environment variable is not defined.');
            }
            const response = await fetch(productJsonUrl);
            if (!response.ok) throw new Error('Failed to fetch product catalog');
            return response.json();
        },
        enabled: !!productJsonUrl,
        retry: 1,
    });

    const handlePay = async (product: Product) => {
        if (!connected || !publicKey || !metadata?.wallet) {
            alert("Please connect your wallet and ensure store is configured.");
            return;
        }

        try {
            setProcessingId(product.id);
            
            // Validate seller wallet address
            let sellerPublicKey: PublicKey;
            try {
                sellerPublicKey = new PublicKey(metadata.wallet);
            } catch (e) {
                throw new Error("Invalid seller wallet address. Please check your metadata configuration.");
            }
            
            const usdcMint = new PublicKey(USDC_MINT_STR);
            
            const transaction = new Transaction();

            if (product.currency === 'SOL') {
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: sellerPublicKey,
                        lamports: product.price * LAMPORTS_PER_SOL,
                    })
                );
            } else if (product.currency === 'USDC') {
                const userTokenAddress = await getAssociatedTokenAddress(usdcMint, publicKey);
                const sellerTokenAddress = await getAssociatedTokenAddress(usdcMint, sellerPublicKey);

                transaction.add(
                    createTransferCheckedInstruction(
                        userTokenAddress,
                        usdcMint,
                        sellerTokenAddress,
                        publicKey,
                        product.price * (10 ** 6), // USDC has 6 decimals
                        6
                    )
                );
            }

            const { context: { slot: minContextSlot }, value: { blockhash, lastValidBlockHeight } } =
                await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

            const parsedTx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
            if (!parsedTx) {
                throw new Error("Transaction not found after confirmation");
            }

            if (parsedTx.meta?.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(parsedTx.meta.err)}`);
            }

            if (product.currency === 'SOL') {
                const expectedAmount = product.price * LAMPORTS_PER_SOL;
                const fee = parsedTx.meta?.fee || 0;
                const expectedMin = expectedAmount - fee - 10000;

                const solTransfer = parsedTx.transaction.message.instructions.find(
                    (ix: any) => ix.program === 'system' && (ix as any).parsed?.type === 'transfer'
                ) as any;

                if (!solTransfer) {
                    throw new Error("No SOL transfer found in transaction");
                }

                const recipient = solTransfer.parsed.info.destination || solTransfer.parsed.info.toPubkey;
                if (recipient !== metadata.wallet) {
                    throw new Error(`Incorrect recipient. Expected ${metadata.wallet}, got ${recipient}`);
                }

                const sentAmount = solTransfer.parsed.info.lamports;
                if (sentAmount < expectedMin) {
                    throw new Error(`Incorrect amount sent. Expected ~${expectedAmount}, got ${sentAmount}`);
                }
            } else if (product.currency === 'USDC') {
                const tokenTransfers = parsedTx.meta?.postTokenBalances || [];
                const sellerTokenBalance = tokenTransfers.find(
                    (tb: any) => tb.owner === metadata.wallet && tb.mint === USDC_MINT_STR
                );

                if (!sellerTokenBalance) {
                    throw new Error("No USDC transfer found in transaction");
                }

                const receivedAmount = sellerTokenBalance.uiTokenAmount?.uiAmountString;
                if (receivedAmount !== undefined && Number(receivedAmount) < product.price - 1) {
                    throw new Error(`Incorrect amount sent. Expected ~${product.price}, got ${receivedAmount}`);
                }
            }
            
            setPurchasedIds(prev => [...prev, product.id]);
        } catch (err: any) {
            console.error("Payment failed:", err);
            alert(`Payment failed: ${err.message || 'Unknown error'}`);
        } finally {
            setProcessingId(null);
        }
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
                                <div className="flex items-baseline justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-white">{product.price}</span>
                                        <span className="text-xs font-bold text-brand-gray-muted uppercase tracking-wider">{product.currency}</span>
                                    </div>
                                    {purchasedIds.includes(product.id) && (
                                        <div className="flex items-center gap-1 text-green-400">
                                            <CheckCircle2 size={16} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Purchased</span>
                                        </div>
                                    )}
                                </div>

                                {purchasedIds.includes(product.id) ? (
                                    <a
                                        href={product.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 rounded-subtle bg-white text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-gray-light transition-all active:scale-[0.98]"
                                    >
                                        <Download size={16} />
                                        Download Product
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => handlePay(product)}
                                        disabled={!connected || processingId !== null}
                                        className={`
                                            w-full py-3 px-4 rounded-subtle font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2
                                            ${connected
                                                ? 'bg-white text-black hover:bg-brand-gray-light active:scale-[0.98]'
                                                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                                        `}
                                    >
                                        {processingId === product.id ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4" />
                                                Processing...
                                            </>
                                        ) : connected ? (
                                            `Buy with ${product.currency}`
                                        ) : (
                                            'Connect Wallet to Buy'
                                        )}
                                    </button>
                                )}
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
