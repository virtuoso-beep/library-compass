// Service Interfaces - Demonstrating Abstraction and Interface Segregation
// Business logic contracts separate from data access

import { 
  IBook, IBookCopy, IMember, IBorrowingTransaction, IFine,
  CreateBookDTO, CreateMemberDTO, Result
} from '@/types/entities';

// Book Service Interface
export interface IBookService {
  getAllBooks(): Promise<Result<IBook[]>>;
  searchBooks(query: string): Promise<Result<IBook[]>>;
  addBook(dto: CreateBookDTO, accessionNumber: string, location?: string): Promise<Result<IBook>>;
}

// Member Service Interface
export interface IMemberService {
  getAllMembers(): Promise<Result<IMember[]>>;
  searchMembers(query: string): Promise<Result<IMember[]>>;
  getMemberByMemberId(memberId: string): Promise<Result<IMember | null>>;
  registerMember(dto: CreateMemberDTO): Promise<Result<IMember>>;
  getMemberWithBorrowingCount(memberId: string): Promise<Result<{ member: IMember; currentBorrowings: number } | null>>;
}

// Circulation Service Interface - Handles borrowing/returning logic
export interface ICirculationService {
  lookupMemberForBorrowing(memberId: string): Promise<Result<MemberBorrowingInfo | null>>;
  lookupBookCopyForBorrowing(accessionNumber: string): Promise<Result<BookCopyBorrowingInfo | null>>;
  lookupBorrowingForReturn(accessionNumber: string): Promise<Result<BorrowingReturnInfo | null>>;
  processBookBorrowing(memberId: string, bookCopyId: string, borrowingDays: number): Promise<Result<IBorrowingTransaction>>;
  processBookReturn(transactionId: string, bookCopyId: string, memberId: string, fineRatePerDay: number, dueDate: Date): Promise<Result<ReturnResult>>;
}

// Fine Service Interface
export interface IFineService {
  getAllFines(): Promise<Result<IFine[]>>;
  getUnpaidFines(): Promise<Result<IFine[]>>;
  getTotalUnpaid(): Promise<Result<number>>;
  payFine(fineId: string): Promise<Result<IFine>>;
  waiveFine(fineId: string, reason?: string): Promise<Result<IFine>>;
  createOverdueFine(memberId: string, transactionId: string, daysOverdue: number, fineRatePerDay: number): Promise<Result<IFine>>;
}

// Dashboard Service Interface
export interface IDashboardService {
  getLibraryStats(): Promise<Result<LibraryStats>>;
}

// Value Objects for service operations
export interface MemberBorrowingInfo {
  id: string;
  member_id: string;
  full_name: string;
  email: string;
  status: string;
  max_books_allowed: number;
  borrowing_period_days: number;
  current_borrowings: number;
}

export interface BookCopyBorrowingInfo {
  id: string;
  accession_number: string;
  status: string;
  location: string | null;
  book: {
    title: string;
    isbn: string | null;
  };
}

export interface BorrowingReturnInfo {
  id: string;
  borrowed_date: string;
  due_date: string;
  member: {
    full_name: string;
    member_id: string;
    fine_rate_per_day: number;
  };
  book_copy: {
    id: string;
    accession_number: string;
    book: {
      title: string;
    };
  };
}

export interface ReturnResult {
  transaction: IBorrowingTransaction;
  fine?: IFine;
  daysOverdue: number;
}

export interface LibraryStats {
  totalBooks: number;
  totalMembers: number;
  activeBorrowings: number;
  overdueBooks: number;
}
