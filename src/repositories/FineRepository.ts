// Fine Repository - Data access for fines

import { BaseRepository } from './BaseRepository';
import { IFineRepository } from './interfaces';
import { IFine, CreateFineDTO, Result } from '@/types/entities';

export class FineRepository extends BaseRepository implements IFineRepository {
  protected tableName = 'fines';
  protected orderBy = 'created_at';

  private getSelectQuery(): string {
    return `
      *,
      member:members(full_name, member_id)
    `;
  }

  async getAll(): Promise<Result<IFine[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .select(this.getSelectQuery())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IFine[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Result<IFine | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .select(this.getSelectQuery())
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IFine | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByMemberId(memberId: string): Promise<Result<IFine[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .select(this.getSelectQuery())
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IFine[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUnpaidFines(): Promise<Result<IFine[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .select(this.getSelectQuery())
        .eq('paid', false)
        .eq('waived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IFine[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTotalUnpaid(): Promise<Result<number>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .select('amount')
        .eq('paid', false)
        .eq('waived', false);

      if (error) throw error;
      const total = (data || []).reduce((sum, f) => sum + Number(f.amount), 0);
      return this.success(total);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(dto: CreateFineDTO): Promise<Result<IFine>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .insert({
          member_id: dto.member_id,
          transaction_id: dto.transaction_id || null,
          amount: dto.amount,
          reason: dto.reason,
        })
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IFine);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markAsPaid(id: string): Promise<Result<IFine>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .update({ 
          paid: true, 
          payment_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', id)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IFine);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async waiveFine(id: string, reason?: string): Promise<Result<IFine>> {
    try {
      const { data, error } = await this.getClient()
        .from('fines')
        .update({ 
          waived: true,
          waiver_reason: reason || 'Waived by librarian'
        })
        .eq('id', id)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IFine);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Singleton instance
export const fineRepository = new FineRepository();
