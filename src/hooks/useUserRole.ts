// Hook to check user roles - Demonstrates Dependency Injection and abstraction
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'staff' | 'member';

interface UseUserRoleReturn {
  role: AppRole | null;
  isAdmin: boolean;
  isStaff: boolean;
  isMember: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setRole(data?.role as AppRole || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return {
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff' || role === 'admin',
    isMember: role === 'member',
    loading,
    hasRole: (r: AppRole) => role === r || (r === 'staff' && role === 'admin'),
  };
};
