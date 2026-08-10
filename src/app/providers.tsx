'use client';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from '../contexts/StoreContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { Toaster } from 'sonner';
import { syncAuthCookieFromStorage } from '../utils/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // One-time sync: ensure returning users (who already have api_token in
  // localStorage from a previous session) get the auth_token cookie set,
  // so the Edge middleware recognises them without forcing a re-login.
  useEffect(() => {
    syncAuthCookieFromStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <StoreProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            dir="rtl"
            toastOptions={{ duration: 3000 }}
          />
        </StoreProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
