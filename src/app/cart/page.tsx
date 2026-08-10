'use client';
import { useRouter } from 'next/navigation';
import { Cart } from '../../views/Cart';
export default function CartPage() {
  const router = useRouter();
  return <Cart onNavigateHome={() => router.push('/')} />;
}
