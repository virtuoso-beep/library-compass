// Dashboard Service - Aggregates statistics

import { IDashboardService, LibraryStats } from './interfaces';
import { statsRepository } from '@/repositories';
import { Result, isError } from '@/types/entities';

export class DashboardService implements IDashboardService {
  async getLibraryStats(): Promise<Result<LibraryStats>> {
    try {
      // Fetch all stats in parallel for performance
      const [booksResult, membersResult, borrowingsResult, overdueResult] = await Promise.all([
        statsRepository.getTotalBookCopies(),
        statsRepository.getActiveMembers(),
        statsRepository.getActiveBorrowings(),
        statsRepository.getOverdueCount(),
      ]);

      // Handle any errors
      if (isError(booksResult)) return { success: false, error: booksResult.error };
      if (isError(membersResult)) return { success: false, error: membersResult.error };
      if (isError(borrowingsResult)) return { success: false, error: borrowingsResult.error };
      if (isError(overdueResult)) return { success: false, error: overdueResult.error };

      return {
        success: true,
        data: {
          totalBooks: booksResult.data,
          totalMembers: membersResult.data,
          activeBorrowings: borrowingsResult.data,
          overdueBooks: overdueResult.data,
        },
      };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}

// Singleton instance
export const dashboardService = new DashboardService();
