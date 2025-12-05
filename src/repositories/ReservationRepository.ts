// Reservation Repository - Handles reservation data access
import { BaseRepository } from './BaseRepository';
import { Result } from '@/types/entities';

export interface IReservation {
  id: string;
  member_id: string;
  book_id: string;
  reservation_date: string;
  expiration_date: string;
  fulfilled: boolean;
  cancelled: boolean;
  member?: {
    full_name: string;
    member_id: string;
    email: string;
  };
  book?: {
    title: string;
    isbn: string | null;
  };
}

export interface CreateReservationDTO {
  member_id: string;
  book_id: string;
  expiration_date: string;
}

export class ReservationRepository extends BaseRepository {
  protected tableName = 'reservations';
  protected orderBy = 'reservation_date';

  private getSelectQuery(): string {
    return `
      *,
      member:members(full_name, member_id, email),
      book:books(title, isbn)
    `;
  }

  async getAll(): Promise<Result<IReservation[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .select(this.getSelectQuery())
        .eq('cancelled', false)
        .eq('fulfilled', false)
        .order('reservation_date', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IReservation[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByMemberId(memberId: string): Promise<Result<IReservation[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .select(this.getSelectQuery())
        .eq('member_id', memberId)
        .eq('cancelled', false)
        .order('reservation_date', { ascending: false });

      if (error) throw error;
      return this.success((data || []) as unknown as IReservation[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveByBookId(bookId: string): Promise<Result<IReservation[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .select(this.getSelectQuery())
        .eq('book_id', bookId)
        .eq('cancelled', false)
        .eq('fulfilled', false)
        .order('reservation_date');

      if (error) throw error;
      return this.success((data || []) as unknown as IReservation[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(dto: CreateReservationDTO): Promise<Result<IReservation>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .insert(dto)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IReservation);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async cancel(id: string): Promise<Result<IReservation>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .update({ cancelled: true })
        .eq('id', id)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IReservation);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async fulfill(id: string): Promise<Result<IReservation>> {
    try {
      const { data, error } = await this.getClient()
        .from('reservations')
        .update({ fulfilled: true })
        .eq('id', id)
        .select(this.getSelectQuery())
        .single();

      if (error) throw error;
      return this.success(data as unknown as IReservation);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPendingCount(): Promise<Result<number>> {
    try {
      const { count, error } = await this.getClient()
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('cancelled', false)
        .eq('fulfilled', false);

      if (error) throw error;
      return this.success(count || 0);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const reservationRepository = new ReservationRepository();
