import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import AddMemberDialog from '@/components/AddMemberDialog';

interface Member {
  id: string;
  member_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  member_type: string;
  status: string;
  registration_date: string;
  max_books_allowed: number;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.member_id.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Library Members</h1>
          <p className="text-muted-foreground">Manage member registrations and accounts</p>
        </div>
        <AddMemberDialog onMemberAdded={loadMembers} />
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
          <CardDescription>Find members by name, ID, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="shadow-card border-border/50">
          <CardContent className="py-12 text-center">
            <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No members found matching your search.' : 'No members registered yet. Register your first member!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="shadow-card border-border/50 hover:shadow-elegant transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{member.full_name}</h3>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {member.member_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Member ID:</span>{' '}
                        <span className="font-medium text-foreground">{member.member_id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{' '}
                        <span className="font-medium text-foreground">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>{' '}
                          <span className="font-medium text-foreground">{member.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Max Books:</span>{' '}
                        <span className="font-medium text-foreground">{member.max_books_allowed}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;