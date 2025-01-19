"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import bs58 from "bs58";
import { ethers } from "ethers";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Grid2X2,
    List,
    Trash,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";

import { Wallet } from "../../types/Wallet";
import { div } from "framer-motion/client";


export function WalletGenerator() {
    const [mnemonics, setMnemonics] = useState<string[]>(Array(12).fill(" "))
    const [wallets, setWallets] = useState<Wallet[]>([])
    const [pathTypes, setPathTypes] = useState<string[]>([])
    const [showMnemonic, setShowMnemonic] = useState<boolean>(false)
    const [mnemonicInput, setMnemonicInput] = useState<string>("")
    const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([])
    const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([])
    const [gridView, setGridView] = useState<boolean>(false)

    const pathTypeNames: ({ [key: string]: string }) = {
        "501": "Solana",
        "60": "Ethereum"
    }
    const pathType = pathTypeNames[pathTypes[0]] || ""


    useEffect(() => {
        const storedWallets = localStorage.getItem("wallets")
        const storedPaths = localStorage.getItem("paths")
        const storedMnemonics = localStorage.getItem("mnemonics")

        //setting localstorage items to the state variables
        if (storedMnemonics && storedPaths && storedWallets) {
            setMnemonics(JSON.parse(storedMnemonics))
            setWallets(JSON.parse(storedWallets))
            setPathTypes(JSON.parse(storedPaths))

            setVisiblePhrases(JSON.parse(storedWallets).map(() => false))
            setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false))
        }

    }, [])

    const handleDeleteWallet = (index: number) => {
        const updatedWallets = wallets.filter((e, i) => i != index)
        const updatedPathTypes = pathTypes.filter((e, i) => i != index)

        setWallets(updatedWallets)
        setPathTypes(updatedPathTypes)
        localStorage.setItem("wallets", JSON.stringify(updatedWallets))
        localStorage.setItem("paths", JSON.stringify(updatedPathTypes))
        setVisiblePhrases(visiblePhrases.filter((e, i) => i != index))
        setVisiblePrivateKeys(visiblePrivateKeys.filter((e, i) => i != index))
        toast.success("Wallet deleted Successfully")
    }

    const handleClearWallet = () => {
        localStorage.removeItem("wallets");
        localStorage.removeItem("mnemonics");
        localStorage.removeItem("paths");
        setWallets([]);
        setMnemonics([]);
        setPathTypes([]);
        setVisiblePrivateKeys([]);
        setVisiblePhrases([]);
        toast.success("All wallets cleared.");
    }

    const GenerateWalletFromMnemonic = (pathType: string, mnemonic: string, accountIndex: number): Wallet | null => {
        try {

            const seedBuffer = mnemonicToSeedSync(mnemonic)
            const path = `m'/44'/${pathType}'/0'/${accountIndex}'`
            const { key: derivedSeed } = derivePath(path, seedBuffer.toString('hex'))
            let privateKeyEncoded: string;
            let publicKeyEncoded: string;
            if (pathType === "501") {
                const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed)
                const keypair = Keypair.fromSecretKey(secretKey)

                privateKeyEncoded = bs58.encode(secretKey)
                publicKeyEncoded = keypair.publicKey.toBase58()

            }
            else if (pathType === "60") {
                const privateKey = Buffer.from(derivedSeed).toString("hex");
                privateKeyEncoded = privateKey;

                const Wallet = new ethers.Wallet(privateKey);
                publicKeyEncoded = Wallet.address;
            } else {
                toast.error("Unsupported wallet type")
                return null;

            }

            return {
                publicKey: publicKeyEncoded,
                privateKey: privateKeyEncoded,
                mnemonic,
                path

            }
        } catch (error: any) {
            toast.error("Failed to generate wallet. Please try again.");
            return null;
        }

    }

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success("Text copied to the Clipboard")
    }

    const handleAddWallet = () => {

    }
    return <div>

    </div>


}