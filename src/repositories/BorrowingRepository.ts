// Borrowing Repository - Handles all borrowing transaction data access

import { BaseRepository } from './BaseRepository';
import { IBorrowingRepository } from './interfaces';
import { IBorrowingTransaction, CreateBorrowingDTO, Result } from '@/types/entities';

export class BorrowingRepository extends BaseRepository implements IBorrowingRepository {
  protected tableName = 'borrowing_transactions';
  protected orderBy = 'borrowed_date';

  private getSelectQuery(): string {
    return `
      *,
      member:members(full_name, member_id, fine_rate_per_day),
      book_copy:book_copies(
        accession_number,
        book:books(title)
      )
    `;
  }

  async getAll(): Promise<Result<IBorrowingTransaction[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .order('borrowed_date', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IBorrowingTransaction[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Result<IBorrowingTransaction | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBorrowingTransaction | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveBorrowings(): Promise<Result<IBorrowingTransaction[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .is('return_date', null)
        .order('due_date');

      if (error) throw error;
      return this.success((data || []) as unknown as IBorrowingTransaction[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOverdueBorrowings(): Promise<Result<IBorrowingTransaction[]>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .is('return_date', null)
        .lt('due_date', today)
        .order('due_date');

      if (error) throw error;
      return this.success((data || []) as unknown as IBorrowingTransaction[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMemberBorrowings(memberId: string): Promise<Result<IBorrowingTransaction[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .eq('member_id', memberId)
        .order('borrowed_date', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IBorrowingTransaction[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMemberActiveBorrowingCount(memberId: string): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('borrowing_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .is('return_date', null);

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveByBookCopyId(bookCopyId: string): Promise<Result<IBorrowingTransaction | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .select(this.getSelectQuery())
        .eq('book_copy_id', bookCopyId)
        .is('return_date', null)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBorrowingTransaction | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(dto: CreateBorrowingDTO): Promise<Result<IBorrowingTransaction>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .insert({
          member_id: dto.member_id,
          book_copy_id: dto.book_copy_id,
          due_date: dto.due_date,
        })
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBorrowingTransaction);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async processReturn(id: string, returnDate: string): Promise<Result<IBorrowingTransaction>> {
    try {
      const { data, error } = await this.getClient()
        .from('borrowing_transactions')
        .update({ return_date: returnDate })
        .eq('id', id)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBorrowingTransaction);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Singleton instance
export const borrowingRepository = new BorrowingRepository();
