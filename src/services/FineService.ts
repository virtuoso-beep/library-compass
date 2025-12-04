// Fine Service - Business logic for fines

import { IFineService } from './interfaces';
import { fineRepository } from '@/repositories';
import { IFine, Result } from '@/types/entities';

export class FineService implements IFineService {
  async getAllFines(): Promise<Result<IFine[]>> {
    return fineRepository.getAll();
  }

  async getUnpaidFines(): Promise<Result<IFine[]>> {
    return fineRepository.getUnpaidFines();
  }

  async getTotalUnpaid(): Promise<Result<number>> {
    return fineRepository.getTotalUnpaid();
  }

  async payFine(fineId: string): Promise<Result<IFine>> {
    return fineRepository.markAsPaid(fineId);
  }

  async waiveFine(fineId: string, reason?: string): Promise<Result<IFine>> {
    return fineRepository.waiveFine(fineId, reason);
  }

  async createOverdueFine(
    memberId: string, 
    transactionId: string, 
    daysOverdue: number, 
    fineRatePerDay: number
  ): Promise<Result<IFine>> {
    const amount = daysOverdue * fineRatePerDay;
    return fineRepository.create({
      member_id: memberId,
      transaction_id: transactionId,
      amount,
      reason: `Overdue by ${daysOverdue} days`,
    });
  }
}

// Singleton instance
export const fineService = new FineService();
