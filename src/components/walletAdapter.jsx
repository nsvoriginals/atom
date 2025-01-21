"use client"
import React, { FC, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider,WalletDisconnectButton ,WalletConnectButton  } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import dotenv from 'dotenv';

dotenv.config();

export function WalletAdapter() {
  const API = process.env.ALCHEMY_API;
  const endpoint = `https://solana-devnet.g.alchemy.com/v2/${API}`;
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
         
         <WalletMultiButton />
         <WalletDisconnectButton />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
