import Image from "next/image";
import Navbar from "@/components/navbar";
import WalletGenerator from "@/components/walletGen";
import { WalletAdapter, } from "../components/walletAdapter";
export default function Home() {
  return (
    
   <main>
    <Navbar/>
    <WalletAdapter></WalletAdapter>
  
   </main>
  );
}
