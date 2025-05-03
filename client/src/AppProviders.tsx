import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/use-auth';
import { AchievementsProvider } from './hooks/use-achievements';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/theme-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AchievementsProvider>
            {children}
            <Toaster />
          </AchievementsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}