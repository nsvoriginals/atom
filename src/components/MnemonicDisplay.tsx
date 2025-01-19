import React from "react"
import { ChevronDown, ChevronUp, Copy } from "lucide-react"
import { motion } from 'framer-motion'
import { Button } from "./ui/button"
import toast from 'sonner'

interface MnemonicDisplay {
    showMnemonic: boolean;
    setShowMnemonic: (value: boolean) => void;
    mnemonicWord: string[];
    copyToClipboard: (content: string) => void;
}

export function MnemonicDisplay({ showMnemonic, setShowMnemonic, mnemonicWord, copyToClipboard }: MnemonicDisplay) {

    return <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
            {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
        className="group flex flex-col gap-4 cursor-pointer rounded-lg border border-primary/8 p-8"
    >
        <div className="flex justify-between items-center w-full" onClick={() => setShowMnemonic(!showMnemonic)}>

            <h1>Your secret</h1>
            <button onClick={() => setShowMnemonic(!showMnemonic)} >
                {showMnemonic ? (<ChevronDown className="size-4f" />) : (<ChevronUp className="size-4" />)}
            </button>
        </div>
        {showMnemonic && <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                ease: "easeInOut",
            }}
            className="flex flex-col items-center justify-center w-full"
            onClick={() => copyToClipboard(mnemonicWord.join(" "))}>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8">
                {mnemonicWord.map((word, index) => (
                    <p key={index}>{word}</p>
                ))}

            </motion.div>

            <div className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300">
                <Copy className="size-4" /> Click Anywhere To Copy
            </div>

        </motion.div>
        }
    </motion.div>
}