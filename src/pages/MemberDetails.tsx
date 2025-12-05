import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, BookOpen, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MemberDetail {
  id: string;
  member_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  member_type: string;
  status: string;
  registration_date: string;
  expiration_date: string | null;
  max_books_allowed: number;
  borrowing_period_days: number;
  renewal_limit: number;
  fine_rate_per_day: number;
}

interface BorrowingHistory {
  id: string;
  borrowed_date: string;
  due_date: string;
  return_date: string | null;
  book_copy: {
    accession_number: string;
    book: { title: string };
  };
}

interface FineRecord {
  id: string;
  amount: number;
  reason: string;
  paid: boolean;
  waived: boolean;
  created_at: string;
}

const MemberDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [borrowings, setBorrowings] = useState<BorrowingHistory[]>([]);
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadMemberDetails();
  }, [id]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      // Fetch member details
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Fetch borrowing history
      const { data: borrowingData, error: borrowingError } = await supabase
        .from('borrowing_transactions')
        .select(`
          id,
          borrowed_date,
          due_date,
          return_date,
          book_copy:book_copies(
            accession_number,
            book:books(title)
          )
        `)
        .eq('member_id', id)
        .order('borrowed_date', { ascending: false });

      if (borrowingError) throw borrowingError;
      setBorrowings(borrowingData as unknown as BorrowingHistory[]);

      // Fetch fines
      const { data: fineData, error: fineError } = await supabase
        .from('fines')
        .select('*')
        .eq('member_id', id)
        .order('created_at', { ascending: false });

      if (fineError) throw fineError;
      setFines(fineData || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const activeBorrowings = borrowings.filter(b => !b.return_date);
  const totalUnpaidFines = fines.filter(f => !f.paid && !f.waived).reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading member details...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Member not found.</p>
        <Button variant="outline" onClick={() => navigate('/members')} className="mt-4">
          Back to Members
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/members')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-foreground">{member.full_name}</h1>
          <p className="text-muted-foreground">Member ID: {member.member_id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <Badge className={`mt-2 ${getStatusColor(member.status)}`}>{member.status}</Badge>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Borrowings</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {activeBorrowings.length} / {member.max_books_allowed}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold mt-2">{borrowings.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unpaid Fines</span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${totalUnpaidFines > 0 ? 'text-destructive' : ''}`}>
              ₱{totalUnpaidFines.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{member.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Type</p>
                <Badge variant="secondary">{member.member_type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium">{new Date(member.registration_date).toLocaleDateString()}</p>
              </div>
            </div>
            {member.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{member.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Borrowing Privileges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Max Books</p>
                <p className="font-medium">{member.max_books_allowed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Borrowing Period</p>
                <p className="font-medium">{member.borrowing_period_days} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewal Limit</p>
                <p className="font-medium">{member.renewal_limit} times</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fine Rate</p>
                <p className="font-medium">₱{member.fine_rate_per_day}/day</p>
              </div>
            </div>
            {member.expiration_date && (
              <div>
                <p className="text-sm text-muted-foreground">Expiration Date</p>
                <p className="font-medium">{new Date(member.expiration_date).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Borrowing History</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
              <CardDescription>All borrowing transactions for this member</CardDescription>
            </CardHeader>
            <CardContent>
              {borrowings.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No borrowing history.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Accession #</TableHead>
                      <TableHead>Borrowed</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Returned</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="max-w-xs truncate">
                          {b.book_copy?.book?.title || 'Unknown'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {b.book_copy?.accession_number || '-'}
                        </TableCell>
                        <TableCell>{new Date(b.borrowed_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(b.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {b.return_date ? new Date(b.return_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {b.return_date ? (
                            <Badge className="bg-green-100 text-green-800">Returned</Badge>
                          ) : new Date(b.due_date) < new Date() ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fines" className="mt-4">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Fines & Penalties</CardTitle>
              <CardDescription>All fines for this member</CardDescription>
            </CardHeader>
            <CardContent>
              {fines.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No fines recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fines.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>{new Date(f.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{f.reason}</TableCell>
                        <TableCell className="font-medium">₱{f.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {f.paid ? (
                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                          ) : f.waived ? (
                            <Badge className="bg-gray-100 text-gray-800">Waived</Badge>
                          ) : (
                            <Badge variant="destructive">Unpaid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberDetails;
