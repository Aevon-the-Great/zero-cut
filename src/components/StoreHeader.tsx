import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Activity } from 'lucide-react';

/**
 * Metadata interface for the store
 * Fetched from VITE_METADATA_JSON_URL
 */
interface StoreMetadata {
    name: string;
    wallet?: string;
    feeToggle?: boolean;
    network?: 'mainnet-beta' | 'devnet';
}

export const StoreHeader = () => {
    const { publicKey, connected } = useWallet();

    // Fetch metadata from environment variable URL
    const metadataUrl = import.meta.env.VITE_METADATA_JSON_URL;

    const { data: metadata, isLoading, error } = useQuery<StoreMetadata>({
        queryKey: ['storeMetadata'],
        queryFn: async () => {
            if (!metadataUrl) return { name: 'ZeroCut Store' };
            const response = await fetch(metadataUrl);
            if (!response.ok) throw new Error('Failed to fetch store metadata');
            return response.json();
        },
        // Don't retry if URL is missing
        enabled: !!metadataUrl || true,
    });

    // Shorten public key for display
    const shortenedAddress = publicKey
        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
        : null;

    // Fallback name
    const storeName = metadata?.name || 'ZeroCut Store';

    // Chain indicator - usually you'd get this from the connection provider, 
    // but we can show what the store expects or a generic "Secure" badge
    const networkDisplay = metadata?.network === 'devnet' ? 'Devnet' : 'Mainnet';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 px-6 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                    <ShieldCheck size={18} className="text-black" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                        {isLoading ? '...' : storeName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-gray-muted font-semibold">
                            <Activity size={10} />
                            {networkDisplay}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {connected && shortenedAddress && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[11px] text-brand-gray-muted font-medium uppercase tracking-wider">Connected</span>
                        <span className="text-xs font-mono text-white">{shortenedAddress}</span>
                    </div>
                )}
                <WalletMultiButton />
            </div>

            {/* Error state subtle indicator */}
            {error && !metadataUrl && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500/50" title="Metadata URL Missing" />
            )}
        </header>
    );
};

export default StoreHeader;
