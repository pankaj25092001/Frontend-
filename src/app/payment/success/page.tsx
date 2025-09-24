"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// We wrap the main component in a Suspense boundary
// This is good practice for pages that use searchParams
const PaymentSuccessContent = () => {
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state
  const searchParams = useSearchParams();
  const { fetchCart } = useCart();

  const [status, setStatus] = useState('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs when the page loads, but it now waits for the user to be confirmed.
    const verifySession = async () => {
      // 1. Wait until the initial authentication check is complete
      if (isAuthLoading) {
        return; // Do nothing if we're still checking who the user is
      }
      // If auth check is done and there's no user, it's an error
      if (!user) {
        setStatus('error');
        return;
      }
      
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const response = await api.post('/payment/verify-session', {
          session_id: sessionId,
        });

        if (response.status === 200) {
          setStatus('success');
          setOrderId(response.data.order._id);
          fetchCart(); // Refresh the cart icon in the header
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus('error');
      }
    };

    verifySession();
  }, [searchParams, fetchCart, user, isAuthLoading]); // It now depends on the user and auth status

  // --- UI States ---
  if (status === 'verifying' || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">Verifying your payment...</h1>
        <p className="text-muted-foreground">Please do not close this page.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
        <p className="text-muted-foreground mb-6">There was an issue verifying your payment. If the payment was successful, your items will appear in your library shortly. Please contact support if the issue persists.</p>
        <Link href="/"><Button>Go to Homepage</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg text-center p-8">
            <CardHeader>
                <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-bold mt-4">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Thank you for your purchase! Your new content is now available.
                    Your order ID is: <span className="font-mono text-foreground">{orderId}</span>
                </p>
                <div className="mt-8">
                    <Link href="/"><Button className="w-full">Continue Exploring</Button></Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

// The main page component that uses Suspense
export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    )
}

