// Member Service - Business logic for members

import { IMemberService } from './interfaces';
import { memberRepository, borrowingRepository } from '@/repositories';
import { IMember, CreateMemberDTO, Result, isError } from '@/types/entities';

export class MemberService implements IMemberService {
  async getAllMembers(): Promise<Result<IMember[]>> {
    return memberRepository.getAll();
  }

  async searchMembers(query: string): Promise<Result<IMember[]>> {
    if (!query.trim()) {
      return memberRepository.getAll();
    }
    return memberRepository.searchByName(query);
  }

  async getMemberByMemberId(memberId: string): Promise<Result<IMember | null>> {
    return memberRepository.getByMemberId(memberId);
  }

  async registerMember(dto: CreateMemberDTO): Promise<Result<IMember>> {
    // Check if email already exists
    const existingResult = await memberRepository.getByEmail(dto.email);
    if (!isError(existingResult) && existingResult.data) {
      return { 
        success: false, 
        error: new Error('A member with this email already exists') 
      };
    }

    return memberRepository.create(dto);
  }

  async getMemberWithBorrowingCount(memberId: string): Promise<Result<{ member: IMember; currentBorrowings: number } | null>> {
    const memberResult = await memberRepository.getByMemberId(memberId);
    if (isError(memberResult)) {
      return memberResult;
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
        member: memberResult.data,
        currentBorrowings: countResult.data,
      },
    };
  }
}

// Singleton instance
export const memberService = new MemberService();
