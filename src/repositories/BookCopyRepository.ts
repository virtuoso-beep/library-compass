// Book Copy Repository - Demonstrating Encapsulation

import { BaseRepository } from './BaseRepository';
import { IBookCopyRepository } from './interfaces';
import { IBookCopy, Result, BookStatus } from '@/types/entities';

export class BookCopyRepository extends BaseRepository implements IBookCopyRepository {
  protected tableName = 'book_copies';
  protected orderBy = 'accession_number';

  async getAll(): Promise<Result<IBookCopy[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .select(`
          *,
          book:books(title, isbn)
        `)
        .order('accession_number');

      if (error) throw error;
      return this.success((data || []) as unknown as IBookCopy[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Result<IBookCopy | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .select(`
          *,
          book:books(title, isbn)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBookCopy | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByAccessionNumber(accessionNumber: string): Promise<Result<IBookCopy | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .select(`
          *,
          book:books(title, isbn)
        `)
        .eq('accession_number', accessionNumber)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBookCopy | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByBookId(bookId: string): Promise<Result<IBookCopy[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .select('*')
        .eq('book_id', bookId)
        .order('accession_number');

      if (error) throw error;
      return this.success((data || []) as unknown as IBookCopy[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(bookId: string, accessionNumber: string, location?: string): Promise<Result<IBookCopy>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .insert({
          book_id: bookId,
          accession_number: accessionNumber,
          location: location || null,
          status: 'available' as BookStatus,
        })
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBookCopy);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateStatus(id: string, status: BookStatus): Promise<Result<IBookCopy>> {
    try {
      const { data, error } = await this.getClient()
        .from('book_copies')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBookCopy);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAvailableCopies(): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('book_copies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Singleton instance
export const bookCopyRepository = new BookCopyRepository();
