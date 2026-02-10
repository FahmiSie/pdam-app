"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";

const Homebar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
            PADAM APP
          </Link>
          
          <div className="hidden md:flex gap-4">
            <Link href="/services" className="text-sm font-medium hover:text-blue-600 transition">
              Services
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-blue-600 transition">
              Profile
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Homebar;