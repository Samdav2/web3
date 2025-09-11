"use client";

import React, { useState, useEffect } from 'react';
// Corrected: Import from CDN URLs for browser environment
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

// You can create the client here if you prefer not to use a separate file
const client = createThirdwebClient({ clientId: "3e681cfd6903162ea00efb231ef55b8d" }); // Replace with your client ID

// --- Main Airdrop Page Component ---
export default function AirdropPage() {

    // Effect to disable right-click and developer shortcuts

   useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "F12" || // F12
        (e.ctrlKey && e.shiftKey && e.code === "KeyI") || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.code === "KeyJ") || // Ctrl+Shift+J
        (e.ctrlKey && e.code === "KeyU") // Ctrl+U
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

    return (
        <>
            <style jsx global>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #0A0A0A;
                    color: #EAEAEA;
                }
                .main-container {
                    background: radial-gradient(ellipse at top, rgba(10, 10, 10, 1), #0A0A0A), radial-gradient(ellipse at bottom, rgba(38, 38, 38, 0.5), #0A0A0A);
                    min-height: 100vh;
                }
                .glass-card {
                    background: rgba(17, 17, 17, 0.6);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .timer-box {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
                }
                .glow-effect {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 60%);
                    z-index: 0;
                    pointer-events: none;
                }
                /* Custom styles for the Thirdweb ConnectButton */
                .connect-button {
                    background: linear-gradient(90deg, #3B82F6, #8B5CF6) !important;
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5), 0 0 30px rgba(139, 92, 246, 0.3) !important;
                    transition: all 0.3s ease !important;
                    border-radius: 0.75rem !important;
                    font-weight: 600 !important;
                    font-size: 1.125rem !important;
                    color: white !important;
                    width: 100%;
                    padding-top: 1rem !important;
                    padding-bottom: 1rem !important;
                }
                .connect-button:hover {
                    box-shadow: 0 0 25px rgba(99, 102, 241, 0.8), 0 0 40px rgba(139, 92, 246, 0.5) !important;
                    transform: scale(1.05) !important;
                }
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
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 text-white">
                Aura Protocol
            </h1>
            <p className="text-xl font-medium text-blue-400">Genesis Airdrop is Live!</p>
        </header>
    );
}

// --- Airdrop Claim Card Component ---
function AirdropClaimCard() {
    return (
        <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-lg mx-auto mb-12">
            <p className="text-gray-300 mb-2">Claim period ends in:</p>
            <CountdownTimer />
            <div className="mt-6">
                 <ConnectButton
                    client={client}
                    appMetadata={{
                      name: "Aura Protocol Airdrop",
                      url: "https://example.com", // Replace with your website URL
                    }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-4">Connect your wallet to check eligibility and claim your $AURA tokens.</p>
        </div>
    );
}

// --- Countdown Timer Component ---
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({
        days: '00', hours: '00', minutes: '00', seconds: '00'
    });
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const countdownDate = new Date().setDate(new Date().getDate() + 14);

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
            <div className="timer-box p-3 rounded-lg w-20">
                <span className="text-3xl font-bold text-white">{timeLeft.days}</span>
                <span className="text-xs text-gray-400 block">Days</span>
            </div>
            <div className="timer-box p-3 rounded-lg w-20">
                <span className="text-3xl font-bold text-white">{timeLeft.hours}</span>
                <span className="text-xs text-gray-400 block">Hours</span>
            </div>
            <div className="timer-box p-3 rounded-lg w-20">
                <span className="text-3xl font-bold text-white">{timeLeft.minutes}</span>
                <span className="text-xs text-gray-400 block">Minutes</span>
            </div>
            <div className="timer-box p-3 rounded-lg w-20">
                <span className="text-3xl font-bold text-white">{timeLeft.seconds}</span>
                <span className="text-xs text-gray-400 block">Seconds</span>
            </div>
        </div>
    );
}

// --- Airdrop Details Component ---
function AirdropDetails() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="glass-card p-5 rounded-xl">
                <h3 className="font-bold text-white text-lg mb-1">Total Airdrop</h3>
                <p className="text-2xl font-semibold text-blue-400">100,000,000</p>
                <p className="text-sm text-gray-400">$AURA</p>
            </div>
            <div className="glass-card p-5 rounded-xl">
                <h3 className="font-bold text-white text-lg mb-1">Eligibility</h3>
                <p className="text-sm text-gray-300">Early users & community contributors.</p>
                <a href="#" className="text-blue-400 text-sm hover:underline">Check criteria</a>
            </div>
            <div className="glass-card p-5 rounded-xl">
                <h3 className="font-bold text-white text-lg mb-1">Network</h3>
                <p className="text-lg font-semibold text-gray-200">Ethereum Mainnet</p>
            </div>
        </div>
    );
}
