'use client';
import { useRouter } from 'next/navigation';
import { Favorites } from '../../views/Favorites';
export default function FavoritesPage() {
  const router = useRouter();
  return <Favorites onNavigateHome={() => router.push('/')} />;
}
