// Repository Interfaces - Demonstrating Interface Segregation Principle (ISP)
// and Dependency Inversion Principle (DIP)

import { 
  IBook, IBookCopy, IMember, IBorrowingTransaction, IFine,
  CreateBookDTO, CreateMemberDTO, CreateBorrowingDTO, CreateFineDTO,
  Result, BookStatus
} from '@/types/entities';

// Generic Repository Interface (Abstraction)
export interface IRepository<T, CreateDTO> {
  getAll(): Promise<Result<T[]>>;
  getById(id: string): Promise<Result<T | null>>;
  create(data: CreateDTO): Promise<Result<T>>;
  update(id: string, data: Partial<T>): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
}

// Specific Repository Interfaces (Interface Segregation)
export interface IBookRepository extends IRepository<IBook, CreateBookDTO> {
  searchByTitle(query: string): Promise<Result<IBook[]>>;
  getByIsbn(isbn: string): Promise<Result<IBook | null>>;
}

export interface IBookCopyRepository {
  getAll(): Promise<Result<IBookCopy[]>>;
  getById(id: string): Promise<Result<IBookCopy | null>>;
  getByAccessionNumber(accessionNumber: string): Promise<Result<IBookCopy | null>>;
  getByBookId(bookId: string): Promise<Result<IBookCopy[]>>;
  create(bookId: string, accessionNumber: string, location?: string): Promise<Result<IBookCopy>>;
  updateStatus(id: string, status: BookStatus): Promise<Result<IBookCopy>>;
  getAvailableCopies(): Promise<Result<number>>;
}

export interface IMemberRepository extends IRepository<IMember, CreateMemberDTO> {
  getByMemberId(memberId: string): Promise<Result<IMember | null>>;
  getByEmail(email: string): Promise<Result<IMember | null>>;
  searchByName(query: string): Promise<Result<IMember[]>>;
  getActiveMembers(): Promise<Result<IMember[]>>;
  generateMemberId(): Promise<string>;
}

export interface IBorrowingRepository {
  getAll(): Promise<Result<IBorrowingTransaction[]>>;
  getById(id: string): Promise<Result<IBorrowingTransaction | null>>;
  getActiveBorrowings(): Promise<Result<IBorrowingTransaction[]>>;
  getOverdueBorrowings(): Promise<Result<IBorrowingTransaction[]>>;
  getMemberBorrowings(memberId: string): Promise<Result<IBorrowingTransaction[]>>;
  getMemberActiveBorrowingCount(memberId: string): Promise<Result<number>>;
  getActiveByBookCopyId(bookCopyId: string): Promise<Result<IBorrowingTransaction | null>>;
  create(data: CreateBorrowingDTO): Promise<Result<IBorrowingTransaction>>;
  processReturn(id: string, returnDate: string): Promise<Result<IBorrowingTransaction>>;
}

export interface IFineRepository {
  getAll(): Promise<Result<IFine[]>>;
  getById(id: string): Promise<Result<IFine | null>>;
  getByMemberId(memberId: string): Promise<Result<IFine[]>>;
  getUnpaidFines(): Promise<Result<IFine[]>>;
  getTotalUnpaid(): Promise<Result<number>>;
  create(data: CreateFineDTO): Promise<Result<IFine>>;
  markAsPaid(id: string): Promise<Result<IFine>>;
  waiveFine(id: string, reason?: string): Promise<Result<IFine>>;
}

// Statistics Interface
export interface IStatsRepository {
  getTotalBookCopies(): Promise<Result<number>>;
  getActiveMembers(): Promise<Result<number>>;
  getActiveBorrowings(): Promise<Result<number>>;
  getOverdueCount(): Promise<Result<number>>;
}
