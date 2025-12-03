import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Fine {
  id: string;
  amount: number;
  reason: string;
  paid: boolean;
  waived: boolean;
  created_at: string;
  member: {
    full_name: string;
    member_id: string;
  };
}

const Fines = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    try {
      const { data, error } = await supabase
        .from('fines')
        .select(`
          id,
          amount,
          reason,
          paid,
          waived,
          created_at,
          member:members(full_name, member_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFines(data?.map(f => ({
        ...f,
        member: f.member as any
      })) || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('fines')
        .update({ 
          paid: true, 
          payment_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', fineId);

      if (error) throw error;
      toast.success('Fine marked as paid');
      loadFines();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
    }
  };

  const handleWaiveFine = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('fines')
        .update({ 
          waived: true,
          waiver_reason: 'Waived by librarian'
        })
        .eq('id', fineId);

      if (error) throw error;
      toast.success('Fine waived');
      loadFines();
    } catch (error: any) {
      toast.error(error.message || 'Failed to waive fine');
    }
  };

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.member.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'unpaid') return matchesSearch && !fine.paid && !fine.waived;
    if (filter === 'paid') return matchesSearch && (fine.paid || fine.waived);
    return matchesSearch;
  });

  const totalUnpaid = fines
    .filter(f => !f.paid && !f.waived)
    .reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Fines & Penalties</h1>
          <p className="text-muted-foreground">Manage library fines and payments</p>
        </div>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Unpaid</div>
          <div className="text-2xl font-bold text-destructive">₱{totalUnpaid.toFixed(2)}</div>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Search Fines</CardTitle>
          <CardDescription>Find fines by member name or ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'unpaid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unpaid')}
            >
              Unpaid
            </Button>
            <Button
              variant={filter === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('paid')}
            >
              Paid/Waived
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading fines...</p>
        </div>
      ) : filteredFines.length === 0 ? (
        <Card className="shadow-card border-border/50">
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No fines found matching your search.' : 'No fines recorded.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFines.map((fine) => (
            <Card key={fine.id} className="shadow-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{fine.member.full_name}</h3>
                      {fine.paid ? (
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      ) : fine.waived ? (
                        <Badge className="bg-blue-100 text-blue-800">Waived</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Member ID: {fine.member.member_id}
                    </p>
                    <p className="text-sm mb-2">{fine.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fine.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      ₱{Number(fine.amount).toFixed(2)}
                    </div>
                    {!fine.paid && !fine.waived && (
                      <div className="space-x-2">
                        <Button size="sm" onClick={() => handlePayFine(fine.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleWaiveFine(fine.id)}>
                          Waive
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fines;
