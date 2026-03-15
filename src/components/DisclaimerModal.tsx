import React, { useState, useEffect } from 'react';

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal
    const hasSeenModal = localStorage.getItem('hasSeenZeroCutDisclaimer');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenZeroCutDisclaimer', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 p-8 max-w-md w-full rounded-2xl shadow-2xl relative">
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight text-center">
          Notice
        </h2>
        <p className="text-brand-gray-muted text-lg mb-8 text-center leading-relaxed">
          No refund, do your ovvn research on the seller. P2P.
        </p>
        <button
          onClick={handleClose}
          className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 active:scale-95"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
