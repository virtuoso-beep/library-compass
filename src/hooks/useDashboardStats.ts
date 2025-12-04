// Custom Hooks - React integration with services (Facade Pattern)
// Provides clean interface for components to use services

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, LibraryStats } from '@/services';
import { isError } from '@/types/entities';

export function useDashboardStats() {
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrowings: 0,
    overdueBooks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const result = await dashboardService.getLibraryStats();
    
    if (isError(result)) {
      setError(result.error.message);
    } else {
      setStats(result.data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}
