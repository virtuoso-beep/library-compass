// Book Service - Business logic for books (Single Responsibility Principle)

import { IBookService } from './interfaces';
import { bookRepository, bookCopyRepository } from '@/repositories';
import { IBook, CreateBookDTO, Result, isError } from '@/types/entities';

export class BookService implements IBookService {
  async getAllBooks(): Promise<Result<IBook[]>> {
    return bookRepository.getAll();
  }

  async searchBooks(query: string): Promise<Result<IBook[]>> {
    if (!query.trim()) {
      return bookRepository.getAll();
    }
    return bookRepository.searchByTitle(query);
  }

  async addBook(dto: CreateBookDTO, accessionNumber: string, location?: string): Promise<Result<IBook>> {
    // Create the book first
    const bookResult = await bookRepository.create(dto);
    if (isError(bookResult)) {
      return bookResult;
    }

    // Then create the first copy
    const copyResult = await bookCopyRepository.create(bookResult.data.id, accessionNumber, location);
    if (isError(copyResult)) {
      // Rollback: delete the book if copy creation fails
      await bookRepository.delete(bookResult.data.id);
      return { success: false, error: copyResult.error };
    }

    return bookResult;
  }
}

// Singleton instance
export const bookService = new BookService();
