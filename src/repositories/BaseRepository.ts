// Base Repository - Demonstrating Inheritance and Open/Closed Principle
// Open for extension, closed for modification

import { supabase } from '@/integrations/supabase/client';
import { Result } from '@/types/entities';

// Abstract Base Repository Class (Template Method Pattern)
// Note: Due to Supabase's strict typing, concrete implementations
// handle their own data access while inheriting common utilities
export abstract class BaseRepository {
  protected abstract tableName: string;
  protected abstract orderBy: string;

  // Utility method for handling errors consistently
  protected handleError<T>(error: unknown): Result<T> {
    return { success: false, error: error as Error };
  }

  // Utility method for success responses
  protected success<T>(data: T): Result<T> {
    return { success: true, data };
  }

  // Get the Supabase client - allows for dependency injection in future
  protected getClient() {
    return supabase;
  }
}
