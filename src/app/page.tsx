import { cookies } from 'next/headers';
import { fetchHome } from '../api/home';
import { fetchConfig } from '../api/general';
import { HomeClientWrapper } from '../components/HomeClientWrapper';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSeenSplash = cookieStore.has('ez_shop_has_seen_splash');

  // Pre-fetch home data and config in parallel on the server
  // (Leverages Next.js server-side fetch deduplication and caching)
  const [homeData, _configData] = await Promise.all([
    fetchHome('ar').catch((err) => {
      console.error('Server-side pre-fetch of home data failed:', err);
      return null;
    }),
    fetchConfig('ar').catch((err) => {
      console.error('Server-side pre-fetch of config failed:', err);
      return null;
    }),
  ]);

  return (
    <HomeClientWrapper
      initialHomeData={homeData || undefined}
      initialShowSplash={!hasSeenSplash}
    />
  );
}
