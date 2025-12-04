// Circulation Service - Complex business logic for borrowing/returning
// Demonstrates Single Responsibility and Dependency Inversion

import { 
  ICirculationService, 
  MemberBorrowingInfo, 
  BookCopyBorrowingInfo, 
  BorrowingReturnInfo,
  ReturnResult 
} from './interfaces';
import { 
  memberRepository, 
  bookCopyRepository, 
  borrowingRepository,
  fineRepository 
} from '@/repositories';
import { IBorrowingTransaction, Result, isError } from '@/types/entities';

export class CirculationService implements ICirculationService {
  async lookupMemberForBorrowing(memberId: string): Promise<Result<MemberBorrowingInfo | null>> {
    if (!memberId) {
      return { success: true, data: null };
    }

    const memberResult = await memberRepository.getByMemberId(memberId);
    if (isError(memberResult)) {
      return { success: false, error: memberResult.error };
    }

    if (!memberResult.data) {
      return { success: true, data: null };
    }

    const countResult = await borrowingRepository.getMemberActiveBorrowingCount(memberResult.data.id);
    if (isError(countResult)) {
      return { success: false, error: countResult.error };
    }

    return {
      success: true,
      data: {
        id: memberResult.data.id,
        member_id: memberResult.data.member_id,
        full_name: memberResult.data.full_name,
        email: memberResult.data.email,
        status: memberResult.data.status,
        max_books_allowed: memberResult.data.max_books_allowed,
        borrowing_period_days: memberResult.data.borrowing_period_days,
        current_borrowings: countResult.data,
      },
    };
  }

  async lookupBookCopyForBorrowing(accessionNumber: string): Promise<Result<BookCopyBorrowingInfo | null>> {
    if (!accessionNumber) {
      return { success: true, data: null };
    }

    const result = await bookCopyRepository.getByAccessionNumber(accessionNumber);
    if (isError(result)) {
      return { success: false, error: result.error };
    }

    if (!result.data) {
      return { success: true, data: null };
    }

    const bookCopy = result.data as any;
    return {
      success: true,
      data: {
        id: bookCopy.id,
        accession_number: bookCopy.accession_number,
        status: bookCopy.status,
        location: bookCopy.location,
        book: bookCopy.book,
      },
    };
  }

  async lookupBorrowingForReturn(accessionNumber: string): Promise<Result<BorrowingReturnInfo | null>> {
    if (!accessionNumber) {
      return { success: true, data: null };
    }

    // First get the book copy
    const copyResult = await bookCopyRepository.getByAccessionNumber(accessionNumber);
    if (isError(copyResult)) {
      return { success: false, error: copyResult.error };
    }

    if (!copyResult.data) {
      return { success: true, data: null };
    }

    // Find active borrowing for this copy
    const borrowingResult = await borrowingRepository.getActiveByBookCopyId(copyResult.data.id);
    if (isError(borrowingResult)) {
      return { success: false, error: borrowingResult.error };
    }

    if (!borrowingResult.data) {
      return { success: true, data: null };
    }

    const borrowing = borrowingResult.data as any;
    return {
      success: true,
      data: {
        id: borrowing.id,
        borrowed_date: borrowing.borrowed_date,
        due_date: borrowing.due_date,
        member: borrowing.member,
        book_copy: {
          id: copyResult.data.id,
          accession_number: copyResult.data.accession_number,
          book: borrowing.book_copy?.book,
        },
      },
    };
  }

  async processBookBorrowing(
    memberId: string, 
    bookCopyId: string, 
    borrowingDays: number
  ): Promise<Result<IBorrowingTransaction>> {
    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowingDays);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Create borrowing transaction
    const transactionResult = await borrowingRepository.create({
      member_id: memberId,
      book_copy_id: bookCopyId,
      due_date: dueDateStr,
    });

    if (isError(transactionResult)) {
      return transactionResult;
    }

    // Update book copy status
    const updateResult = await bookCopyRepository.updateStatus(bookCopyId, 'borrowed');
    if (isError(updateResult)) {
      // Note: In production, we'd want to rollback the transaction
      return { success: false, error: updateResult.error };
    }

    return transactionResult;
  }

  async processBookReturn(
    transactionId: string,
    bookCopyId: string,
    memberId: string,
    fineRatePerDay: number,
    dueDate: Date
  ): Promise<Result<ReturnResult>> {
    const returnDate = new Date();
    const returnDateStr = returnDate.toISOString().split('T')[0];

    // Process return in transaction table
    const returnResult = await borrowingRepository.processReturn(transactionId, returnDateStr);
    if (isError(returnResult)) {
      return { success: false, error: returnResult.error };
    }

    // Update book copy status
    const updateResult = await bookCopyRepository.updateStatus(bookCopyId, 'available');
    if (isError(updateResult)) {
      return { success: false, error: updateResult.error };
    }

    // Calculate overdue days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateMidnight = new Date(dueDate);
    dueDateMidnight.setHours(0, 0, 0, 0);

    let daysOverdue = 0;
    let fine = undefined;

    if (today > dueDateMidnight) {
      daysOverdue = Math.ceil((today.getTime() - dueDateMidnight.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * fineRatePerDay;

      // Create fine record
      const fineResult = await fineRepository.create({
        member_id: memberId,
        transaction_id: transactionId,
        amount: fineAmount,
        reason: `Overdue by ${daysOverdue} days`,
      });

      if (!isError(fineResult)) {
        fine = fineResult.data;
      }
    }

    return {
      success: true,
      data: {
        transaction: returnResult.data,
        fine,
        daysOverdue,
      },
    };
  }
}

// Singleton instance
export const circulationService = new CirculationService();
