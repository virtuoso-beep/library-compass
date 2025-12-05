// Reservation Service - Business logic for reservations
import { reservationRepository, IReservation, CreateReservationDTO } from '@/repositories/ReservationRepository';
import { memberRepository } from '@/repositories/MemberRepository';
import { Result, isError } from '@/types/entities';

export interface IReservationService {
  getAllReservations(): Promise<Result<IReservation[]>>;
  getMemberReservations(memberId: string): Promise<Result<IReservation[]>>;
  createReservation(memberId: string, bookId: string): Promise<Result<IReservation>>;
  cancelReservation(id: string): Promise<Result<IReservation>>;
  fulfillReservation(id: string): Promise<Result<IReservation>>;
  getPendingCount(): Promise<Result<number>>;
}

class ReservationService implements IReservationService {
  async getAllReservations(): Promise<Result<IReservation[]>> {
    return reservationRepository.getAll();
  }

  async getMemberReservations(memberId: string): Promise<Result<IReservation[]>> {
    return reservationRepository.getByMemberId(memberId);
  }

  async createReservation(memberId: string, bookId: string): Promise<Result<IReservation>> {
    // Validate member exists and is active
    const memberResult = await memberRepository.getById(memberId);
    if (isError(memberResult)) return memberResult;
    if (!memberResult.data) {
      return { success: false, error: new Error('Member not found') };
    }
    if (memberResult.data.status !== 'active') {
      return { success: false, error: new Error('Member account is not active') };
    }

    // Check if member already has a reservation for this book
    const existingResult = await reservationRepository.getActiveByBookId(bookId);
    if (isError(existingResult)) return existingResult;
    
    const hasExisting = existingResult.data.some(r => r.member_id === memberId);
    if (hasExisting) {
      return { success: false, error: new Error('Member already has an active reservation for this book') };
    }

    // Create reservation with 7-day expiration
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const dto: CreateReservationDTO = {
      member_id: memberId,
      book_id: bookId,
      expiration_date: expirationDate.toISOString().split('T')[0],
    };

    return reservationRepository.create(dto);
  }

  async cancelReservation(id: string): Promise<Result<IReservation>> {
    return reservationRepository.cancel(id);
  }

  async fulfillReservation(id: string): Promise<Result<IReservation>> {
    return reservationRepository.fulfill(id);
  }

  async getPendingCount(): Promise<Result<number>> {
    return reservationRepository.getPendingCount();
  }
}

export const reservationService = new ReservationService();
