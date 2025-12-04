// Member Repository - Demonstrating Single Responsibility Principle

import { BaseRepository } from './BaseRepository';
import { IMemberRepository } from './interfaces';
import { IMember, CreateMemberDTO, Result, MemberPrivileges } from '@/types/entities';

export class MemberRepository 
  extends BaseRepository 
  implements IMemberRepository {
  
  protected tableName = 'members';
  protected orderBy = 'full_name';

  async getAll(): Promise<Result<IMember[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return this.success((data || []) as unknown as IMember[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Result<IMember | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IMember | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(dto: CreateMemberDTO): Promise<Result<IMember>> {
    try {
      const memberId = await this.generateMemberId();
      const privileges = MemberPrivileges.forMemberType(dto.member_type);
      
      const { data, error } = await this.getClient()
        .from('members')
        .insert({
          member_id: memberId,
          full_name: dto.full_name,
          email: dto.email,
          phone: dto.phone || null,
          address: dto.address || null,
          member_type: dto.member_type,
          max_books_allowed: privileges.maxBooks,
          borrowing_period_days: privileges.borrowingDays,
          renewal_limit: privileges.renewalLimit,
          fine_rate_per_day: privileges.fineRatePerDay,
        })
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IMember);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, updates: Partial<IMember>): Promise<Result<IMember>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return this.success(data as unknown as IMember);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const { error } = await this.getClient()
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return this.success(true);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByMemberId(memberId: string): Promise<Result<IMember | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IMember | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getByEmail(email: string): Promise<Result<IMember | null>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      return this.success(data as unknown as IMember | null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchByName(query: string): Promise<Result<IMember[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,member_id.ilike.%${query}%`)
        .order('full_name');

      if (error) throw error;
      return this.success((data || []) as unknown as IMember[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveMembers(): Promise<Result<IMember[]>> {
    try {
      const { data, error } = await this.getClient()
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      return this.success((data || []) as unknown as IMember[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateMemberId(): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await this.getClient()
      .from('members')
      .select('*', { count: 'exact', head: true });
    
    const sequence = String((count || 0) + 1).padStart(5, '0');
    return `LIB-${year}-${sequence}`;
  }
}

// Singleton instance
export const memberRepository = new MemberRepository();
