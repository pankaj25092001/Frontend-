"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clapperboard } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const router = useRouter();

    const handleCheckout = async () => {
        try {
            const res = await api.post('/payment/create-checkout-session');
            if (res.data.url) {
                clearCart();
                router.push(res.data.url); // Redirect to Stripe
            }
        } catch (error) {
            toast.error("Checkout failed. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
            {cart.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {cart.map(item => (
                            // --- CHANGE: Reduced padding from p-4 to p-2 for a tighter look ---
                            <Card key={item._id} className="flex items-center p-2">
                                {/* --- CHANGE: Made the placeholder and icon smaller --- */}
                                <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                    <Clapperboard className="h-6 w-6 text-muted-foreground" />
                                </div>
                                
                                {/* --- CHANGE: Reduced margin from ml-4 to ml-3 --- */}
                                <div className="ml-3 flex-grow">
                                    {/* --- CHANGE: Controlled font size for a more compact title --- */}
                                    <h2 className="font-semibold text-base">{item.videoId.title}</h2>
                                    <p className="text-sm text-muted-foreground capitalize">{item.purchaseType}</p>
                                </div>
                                <div className="text-right ml-2">
                                    {/* --- CHANGE: Controlled font size for price --- */}
                                    <p className="font-semibold text-sm">₹{item.price.toFixed(2)}</p>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item._id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div>
                        <Card>
                            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleCheckout}>Proceed to Checkout</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-4">Looks like you haven't added any premium videos yet.</p>
                    <Link href="/"><Button>Continue Shopping</Button></Link>
                </div>
            )}
        </div>
    );
}