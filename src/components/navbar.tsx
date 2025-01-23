import Link from 'next/link'
import { Atom, Github, Twitter } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-purple-500 p-4 shadow-md">
      <div className="container mx-auto">
        <ul className="flex justify-center space-x-8">
          <li>
            <Link href="#" className="flex items-center text-white hover:text-sky-300 transition-colors duration-200">
              <Atom className="w-5 h-5 mr-2" />
              <span className="font-semibold">Atom</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center text-white hover:text-sky-300 transition-colors duration-200">
              <Github className="w-5 h-5 mr-2" />
              <span className="font-semibold">GitHub</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center text-white hover:text-sky-300 transition-colors duration-200">
              <Twitter className="w-5 h-5 mr-2" />
              <span className="font-semibold">Twitteradf</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}