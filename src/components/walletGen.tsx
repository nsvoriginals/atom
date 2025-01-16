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


const WalletGenerator = () => {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(
    Array(12).fill(" ")
  );
  const [pathTypes, setPathTypes] = useState<string[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [mnemonicInput, setMnemonicInput] = useState<string>("");
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
  const [gridView, setGridView] = useState<boolean>(false);
  const pathTypeNames: { [key: string]: string } = {
    "501": "Solana",
    "60": "Ethereum",
  };

  const pathTypeName = pathTypeNames[pathTypes[0]] || "";

  useEffect(() => {
    const storedWallets = localStorage.getItem("wallets");
    const storedMnemonic = localStorage.getItem("mnemonics");
    const storedPathTypes = localStorage.getItem("paths");

    if (storedWallets && storedMnemonic && storedPathTypes) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setWallets(JSON.parse(storedWallets));
      setPathTypes(JSON.parse(storedPathTypes));
      setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
    }
  }, []);

  const handleDeleteWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    setPathTypes(updatedPathTypes);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("paths", JSON.stringify(updatedPathTypes));
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
    toast.success("Wallet deleted successfully!");
  }
  const handleClearWallets=(){
    localStorage.removeItem("wallets");
    localStorage.removeItem("paths");
    localStorage.removeItem("mnemonics")

    setWallets([])
    setPathTypes([])
    setMnemonicWords([])
    setVisiblePhrases([])
    setVisiblePrivateKeys([])
  }


  const copyToClipboard=(content:string)=>{
    navigator.clipboard.writeText(content);
    toast.success("Text copied to clipboard")
  }

  const togglePrivateKeyVisibility=(index:number)=>{
   setVisiblePrivateKeys(visiblePrivateKeys.map((visible,i)=>(i===index ? !visible :visible )))
  }
  const togglePhraseVisibility=(index:number)=>{
    setVisiblePhrases(visiblePhrases.map((visible,i)=>(i===index ? !visible :visible )))
   }


   const generateWalletFromMnemonics=(pathType:string,mnemonic:string,accountIndex:number):Wallet | null=>{
     try{

     const seedBuffer=mnemonicToSeedSync(mnemonic)
     const path=`m/44'/${pathTypes}/0'/${accountIndex}`
     const {key:derivedSeed}=derivePath(path,seedBuffer.toString("hex"))
    let publicKeyEncoded:string
    let privateKeyEncoded:string


    if(pathType==='501'){ //FOR SOLANA
      const {secretKey}=nacl.sign.keyPair.fromSeed(derivedSeed)
      const keyPair=Keypair.fromSecretKey(secretKey)
      privateKeyEncoded=bs58.encode(secretKey)
      publicKeyEncoded=keyPair.publicKey.toBase58()
    }else if (pathType === "60") {
      // Ethereum
      const privateKey = Buffer.from(derivedSeed).toString("hex");
      privateKeyEncoded = privateKey;

      const wallet = new ethers.Wallet(privateKey);
      publicKeyEncoded = wallet.address;
    } else {
      toast.error("Unsupported path type.");
      return null;
    }

    return {
      publicKey: publicKeyEncoded,
      privateKey: privateKeyEncoded,
      mnemonic,
      path,
    };
  } catch (error) {
    toast.error("Failed to generate wallet. Please try again.");
    return null;
  }
};
const handleGenerateWallet=()=>{
  let mnemonic=mnemonicInput.trim()
  if(mnemonic){
    if(!validateMnemonic(mnemonic)){
      toast.error("Invalid Mnemonics phrase")
      return
    }
  }
  else{
    mnemonic=generateMnemonic()
  }
  const words=mnemonic.split(" ")
  setMnemonicWords(words);
  
}


    
 
return <div>
  
</div>


}