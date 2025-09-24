"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingCart } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2"><span className="font-bold">VidStream</span></Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {itemCount}
                      </span>
                    )}
                    <span className="sr-only">Cart</span>
                  </Button>
                </Link>

                {/* --- THIS IS THE UPDATED AVATAR LINK --- */}
                <Link href="/profile" aria-label="Go to profile page" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {/* I've changed the style from 'lorelei' to the friendlier 'adventurer' style */}
                    <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.username}`} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden font-medium sm:inline">{user.username}</span>
                </Link>

                <Button onClick={logout} variant="ghost">Log Out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Log In</Button></Link>
                <Link href="/signup"><Button>Sign Up</Button></Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

