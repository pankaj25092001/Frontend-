"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuth } from './AuthContext'; // We need to know who the user is

// Define the shape of a single item in our cart
interface CartItem {
  _id: string;
  videoId: {
    _id: string;
    title: string;
    thumbnailUrl: string;
  };
  purchaseType: 'buy' | 'rent';
  price: number;
}

// Define the functions and data our context will provide
interface CartContextType {
  cart: CartItem[];
  fetchCart: () => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { user } = useAuth(); // Get the current logged-in user

    // This function fetches the cart from our backend
    const fetchCart = useCallback(async () => {
        // Only fetch if a user is logged in
        if (user) {
            try {
                const res = await api.get('/cart');
                setCart(res.data.items || []);
            } catch (error) {
                console.error("Failed to fetch cart:", error);
                setCart([]); // Clear cart on error
            }
        } else {
            setCart([]); // If no user, the cart is empty
        }
    }, [user]);

    // This function removes an item from the cart
    const removeFromCart = async (itemId: string) => {
        try {
            await api.delete(`/cart/remove/${itemId}`);
            fetchCart(); // Re-fetch the cart to get the updated list
        } catch (error) {
            console.error("Failed to remove from cart:", error);
        }
    };

    // A simple function to clear the cart state
    const clearCart = () => setCart([]);

    // This effect automatically fetches the cart whenever the user logs in or out
    useEffect(() => {
        fetchCart();
    }, [user, fetchCart]);
    
    // Calculate the total price and item count
    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    const itemCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, fetchCart, removeFromCart, clearCart, cartTotal, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

// This is a custom hook to make using our context easier
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

