// Book Repository - Demonstrating Inheritance from Base Repository

import { BaseRepository } from './BaseRepository';
import { IBookRepository } from './interfaces';
import { IBook, CreateBookDTO, Result } from '@/types/entities';

export class BookRepository 
  extends BaseRepository 
  implements IBookRepository {
  
  protected tableName = 'books';
  protected orderBy = 'title';

  async getAll(): Promise<Result<IBook[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      return this.success((data || []) as unknown as IBook[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Result<IBook | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBook | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(dto: CreateBookDTO): Promise<Result<IBook>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .insert({
          title: dto.title,
          subtitle: dto.subtitle || null,
          isbn: dto.isbn || null,
          publication_year: dto.publication_year || null,
          description: dto.description || null,
          publisher_id: dto.publisher_id || null,
          category_id: dto.category_id || null,
        })
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBook);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, updates: Partial<IBook>): Promise<Result<IBook>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IBook);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const { error } = await this.getClient()
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return this.success(true);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchByTitle(query: string): Promise<Result<IBook[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,isbn.ilike.%${query}%`)
        .order('title');

      if (error) throw error;
      return this.success((data || []) as unknown as IBook[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByIsbn(isbn: string): Promise<Result<IBook | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('books')
        .select('*')
        .eq('isbn', isbn)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IBook | null);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Singleton instance
export const bookRepository = new BookRepository();
