// Domain Models/Entities - Demonstrating Encapsulation and Abstraction

// Base Entity Interface (Abstraction)
export interface IEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Re-export Result type
export { type Result, isError, isSuccess } from './result';

// Book Entity
export interface IBook extends IEntity {
  title: string;
  subtitle: string | null;
  isbn: string | null;
  publication_year: number | null;
  cover_image_url: string | null;
  description: string | null;
  publisher_id: string | null;
  category_id: string | null;
  edition: string | null;
  language: string | null;
  pages: number | null;
  call_number: string | null;
  resource_type: ResourceType;
}

// Book Copy Entity
export interface IBookCopy extends IEntity {
  accession_number: string;
  book_id: string;
  status: BookStatus;
  location: string | null;
  condition_notes: string | null;
  acquired_date: string;
  book?: IBook;
}

// Member Entity
export interface IMember extends IEntity {
  member_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  member_type: MemberType;
  status: MemberStatus;
  registration_date: string;
  expiration_date: string | null;
  max_books_allowed: number;
  borrowing_period_days: number;
  renewal_limit: number;
  fine_rate_per_day: number;
}

// Borrowing Transaction Entity
export interface IBorrowingTransaction extends IEntity {
  member_id: string;
  book_copy_id: string;
  borrowed_date: string;
  due_date: string;
  return_date: string | null;
  renewal_count: number;
  staff_user_id: string | null;
  member?: IMember;
  book_copy?: IBookCopy;
}

// Fine Entity
export interface IFine extends IEntity {
  member_id: string;
  transaction_id: string | null;
  amount: number;
  reason: string;
  paid: boolean;
  payment_date: string | null;
  waived: boolean;
  waiver_reason: string | null;
  member?: IMember;
}

// Enums (Type-safe constants)
export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'lost' | 'damaged' | 'for_repair';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'expired';
export type MemberType = 'student' | 'faculty' | 'staff_member' | 'guest';
export type ResourceType = 'book' | 'periodical' | 'thesis' | 'ebook' | 'audiovisual';

// DTOs (Data Transfer Objects) - For creating/updating entities
export interface CreateBookDTO {
  title: string;
  subtitle?: string;
  isbn?: string;
  publication_year?: number;
  description?: string;
  publisher_id?: string;
  category_id?: string;
}

export interface CreateMemberDTO {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  member_type: MemberType;
}

export interface CreateBorrowingDTO {
  member_id: string;
  book_copy_id: string;
  due_date: string;
}

export interface CreateFineDTO {
  member_id: string;
  transaction_id?: string;
  amount: number;
  reason: string;
}

// Value Objects - Immutable objects representing domain concepts
export class MemberPrivileges {
  constructor(
    public readonly maxBooks: number,
    public readonly borrowingDays: number,
    public readonly renewalLimit: number,
    public readonly fineRatePerDay: number
  ) {}

  static forMemberType(type: MemberType): MemberPrivileges {
    switch (type) {
      case 'faculty':
        return new MemberPrivileges(10, 30, 3, 3);
      case 'staff_member':
        return new MemberPrivileges(7, 21, 2, 4);
      case 'student':
        return new MemberPrivileges(5, 14, 2, 5);
      case 'guest':
      default:
        return new MemberPrivileges(2, 7, 1, 10);
    }
  }
}
