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


export default function WalletGenerator() {
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
            const path = `m/44'/${pathType}'/0'/${accountIndex}'`
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

    const handleGenerateWallet = () => {
        let mnemonic = mnemonicInput.trim();
    
        if (mnemonic) {
          if (!validateMnemonic(mnemonic)) {
            toast.error("Invalid recovery phrase. Please try again.");
            return;
          }
        } else {
          mnemonic = generateMnemonic();
        }
    
        const words = mnemonic.split(" ");
        setMnemonics(words);
    
        const wallet = GenerateWalletFromMnemonic(
          pathTypes[0],
          mnemonic,
          wallets.length
        );
        if (wallet) {
            const updatedWallets = [...wallets, wallet];
            setWallets(updatedWallets);
            localStorage.setItem("wallets", JSON.stringify(updatedWallets));
            localStorage.setItem("mnemonics", JSON.stringify(words));
            localStorage.setItem("paths", JSON.stringify(pathTypes));
            setVisiblePrivateKeys([...visiblePrivateKeys, false]);
            setVisiblePhrases([...visiblePhrases, false]);
           
            toast.success("Wallet generated successfully!");
          }else{
            alert("wallet not created")
          }
          alert("done bro")
        };

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success("Text copied to the Clipboard")
    }
    const togglePrivateKeyVisibility = (index: number) => {
        setVisiblePrivateKeys(
          visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
        );
      };
    
      const togglePhraseVisibility = (index: number) => {
        setVisiblePhrases(
          visiblePhrases.map((visible, i) => (i === index ? !visible : visible))
        );
      };
      const handleAddWallet = () => {
        if(!mnemonics){
            toast.error("No mnemonic is given ")
            return
        }
    
        const wallet = GenerateWalletFromMnemonic(pathTypes[0], mnemonics.join(" "), wallets.length);
        if(wallet){
            const updatedWallets = [...wallets, wallet];
            const updatedPathTypes = [...pathTypes, pathTypes[0]]; // Fix: Add only the current path type
            setWallets(updatedWallets);
            localStorage.setItem("wallets", JSON.stringify(updatedWallets));
            localStorage.setItem("paths", JSON.stringify(updatedPathTypes)); // Fix: Use consistent key "paths"
            setVisiblePrivateKeys([...visiblePrivateKeys, false]);
            setVisiblePhrases([...visiblePhrases, false]);
            toast.success("Wallet generated successfully!");
        }
    }
    return <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen text-white font-sans">
    {/* Wallet Initialization Section */}
    {wallets.length === 0 && (
      <motion.div
        className="bg-white text-black rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Web Based Wallet</h2>
        {pathTypes.length === 0 && (
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={() => setPathTypes(["501"])}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Solana
            </motion.button>
            <motion.button
              onClick={() => setPathTypes(["60"])}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Ethereum
            </motion.button>
          </div>
        )}
      </motion.div>
    )}

   
    {pathTypes.length !== 0 && (
      <motion.div
        className="mt-8 bg-white text-black rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="password"
          value={mnemonicInput}
          placeholder="Enter your secret phrase (or leave blank to generate)"
          onChange={(e) => setMnemonicInput(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <motion.button
          onClick={() => {
            handleGenerateWallet()
            alert("wallet created")
           
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
        </motion.button>
      </motion.div>
    )}

   {mnemonics && mnemonics[0].trim() !== "" && wallets.length > 0 && (
    <motion.div
        className="mt-8 bg-white text-black rounded-lg shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Your Secret Phrase</h3>
            <motion.button
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="bg-gray-200 text-gray-800 py-1 px-3 rounded-lg shadow-md hover:bg-gray-300 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {showMnemonic ? <ChevronUp /> : <ChevronDown />}
            </motion.button>
        </div>
        {showMnemonic && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full cursor-pointer"
                onClick={() => copyToClipboard(mnemonics.join(" "))}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
                >
                    {mnemonics.map((word, index) => (
                        <p
                            key={index}
                            className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg shadow-md"
                        >
                            {`${index + 1}. ${word}`}
                        </p>
                    ))}
                </motion.div>

                <div className="text-sm md:text-base text-gray-600 flex w-full gap-2 items-center justify-center group-hover:text-gray-800 transition-all duration-300">
                    <Copy className="w-4 h-4" /> Click Anywhere To Copy
                </div>
            </motion.div>
        )}
  
    </motion.div>
  
)}
  
{wallets.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.3, ease: "easeInOut" }}
    className="mt-6 space-y-8"
  >
    {/* Header Section */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        {pathType} Wallet
      </h2>
      <div className="flex items-center gap-2">
        {wallets.length > 1 && (
          <Button
            variant="ghost"
            onClick={() => setGridView(!gridView)}
            className="hidden md:block"
          >
            {gridView ? <Grid2X2 /> : <List />}
          </Button>
        )}
        <Button onClick={handleAddWallet}>Add Wallet</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Clear Wallets</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all wallets and keys from local storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearWallet}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    {/* Wallets Section */}
    <div
      className={`grid gap-6 ${gridView ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
    >
      {wallets.map((wallet, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.3, ease: "easeInOut" }}
          className="border border-primary/10 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Wallet Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-primary/5">
            <h3 className="text-xl font-bold tracking-tight">Wallet {index + 1}</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive">
                  <Trash className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this wallet? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteWallet(index)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Wallet Keys */}
          <div className="p-6 space-y-4 bg-secondary/10">
            {/* Public Key */}
            <div className="space-y-1 cursor-pointer" onClick={() => copyToClipboard(wallet.publicKey)}>
              <span className="text-sm font-medium text-muted">Public Key</span>
              <p className="text-primary font-semibold truncate hover:text-primary/80">
                {wallet.publicKey}
              </p>
            </div>

            {/* Private Key */}
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted">Private Key</span>
              <div className="flex items-center justify-between">
                <p
                  className="text-primary font-semibold truncate hover:text-primary/80 cursor-pointer"
                  onClick={() => copyToClipboard(wallet.privateKey)}
                >
                  {visiblePrivateKeys[index] ? wallet.privateKey : "•".repeat(12)}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => togglePrivateKeyVisibility(index)}
                >
                  {visiblePrivateKeys[index] ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}

  </div>

}