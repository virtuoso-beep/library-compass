// Stats Repository - Aggregated statistics data access

import { BaseRepository } from './BaseRepository';
import { IStatsRepository } from './interfaces';
import { Result } from '@/types/entities';

export class StatsRepository extends BaseRepository implements IStatsRepository {
  protected tableName = '';
  protected orderBy = '';

  async getTotalBookCopies(): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('book_copies')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveMembers(): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveBorrowings(): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('borrowing_transactions')
        .select('*', { count: 'exact', head: true })
        .is('return_date', null);

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOverdueCount(): Promise<Result<number>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await this.getClient()
        .from('borrowing_transactions')
        .select('*', { count: 'exact', head: true })
        .is('return_date', null)
        .lt('due_date', today);

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Singleton instance
export const statsRepository = new StatsRepository();
