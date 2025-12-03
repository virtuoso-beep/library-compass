import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MemberInfo {
  id: string;
  member_id: string;
  full_name: string;
  email: string;
  status: string;
  max_books_allowed: number;
  borrowing_period_days: number;
  current_borrowings: number;
}

interface BookCopyInfo {
  id: string;
  accession_number: string;
  status: string;
  location: string | null;
  book: {
    title: string;
    isbn: string | null;
  };
}

interface BorrowingInfo {
  id: string;
  borrowed_date: string;
  due_date: string;
  member: {
    full_name: string;
    member_id: string;
  };
  book_copy: {
    accession_number: string;
    book: {
      title: string;
    };
  };
}

const Circulation = () => {
  const [borrowMemberId, setBorrowMemberId] = useState('');
  const [borrowBookId, setBorrowBookId] = useState('');
  const [returnBookId, setReturnBookId] = useState('');
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [bookCopyInfo, setBookCopyInfo] = useState<BookCopyInfo | null>(null);
  const [borrowingInfo, setBorrowingInfo] = useState<BorrowingInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupMember = async (memberId: string) => {
    if (!memberId) {
      setMemberInfo(null);
      return;
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', memberId)
      .maybeSingle();

    if (error || !member) {
      setMemberInfo(null);
      return;
    }

    const { count } = await supabase
      .from('borrowing_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', member.id)
      .is('return_date', null);

    setMemberInfo({
      ...member,
      current_borrowings: count || 0,
    });
  };

  const lookupBookCopy = async (accessionNumber: string) => {
    if (!accessionNumber) {
      setBookCopyInfo(null);
      return;
    }

    const { data, error } = await supabase
      .from('book_copies')
      .select(`
        id,
        accession_number,
        status,
        location,
        book:books(title, isbn)
      `)
      .eq('accession_number', accessionNumber)
      .maybeSingle();

    if (error || !data) {
      setBookCopyInfo(null);
      return;
    }

    setBookCopyInfo({
      id: data.id,
      accession_number: data.accession_number,
      status: data.status,
      location: data.location,
      book: data.book as any,
    });
  };

  const lookupBorrowing = async (accessionNumber: string) => {
    if (!accessionNumber) {
      setBorrowingInfo(null);
      return;
    }

    const { data: bookCopy } = await supabase
      .from('book_copies')
      .select('id')
      .eq('accession_number', accessionNumber)
      .maybeSingle();

    if (!bookCopy) {
      setBorrowingInfo(null);
      return;
    }

    const { data, error } = await supabase
      .from('borrowing_transactions')
      .select(`
        id,
        borrowed_date,
        due_date,
        member:members(full_name, member_id),
        book_copy:book_copies(
          accession_number,
          book:books(title)
        )
      `)
      .eq('book_copy_id', bookCopy.id)
      .is('return_date', null)
      .maybeSingle();

    if (error || !data) {
      setBorrowingInfo(null);
      return;
    }

    setBorrowingInfo({
      id: data.id,
      borrowed_date: data.borrowed_date,
      due_date: data.due_date,
      member: data.member as any,
      book_copy: data.book_copy as any,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => lookupMember(borrowMemberId), 300);
    return () => clearTimeout(timer);
  }, [borrowMemberId]);

  useEffect(() => {
    const timer = setTimeout(() => lookupBookCopy(borrowBookId), 300);
    return () => clearTimeout(timer);
  }, [borrowBookId]);

  useEffect(() => {
    const timer = setTimeout(() => lookupBorrowing(returnBookId), 300);
    return () => clearTimeout(timer);
  }, [returnBookId]);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberInfo || !bookCopyInfo) {
      toast.error('Please enter valid member and book information');
      return;
    }

    if (memberInfo.status !== 'active') {
      toast.error('Member account is not active');
      return;
    }

    if (memberInfo.current_borrowings >= memberInfo.max_books_allowed) {
      toast.error('Member has reached maximum borrowing limit');
      return;
    }

    if (bookCopyInfo.status !== 'available') {
      toast.error('This book copy is not available for borrowing');
      return;
    }

    setLoading(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + memberInfo.borrowing_period_days);

      const { error: transactionError } = await supabase
        .from('borrowing_transactions')
        .insert({
          member_id: memberInfo.id,
          book_copy_id: bookCopyInfo.id,
          due_date: dueDate.toISOString().split('T')[0],
        });

      if (transactionError) throw transactionError;

      const { error: updateError } = await supabase
        .from('book_copies')
        .update({ status: 'borrowed' })
        .eq('id', bookCopyInfo.id);

      if (updateError) throw updateError;

      toast.success(`Book borrowed successfully. Due date: ${dueDate.toLocaleDateString()}`);
      setBorrowMemberId('');
      setBorrowBookId('');
      setMemberInfo(null);
      setBookCopyInfo(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process borrowing');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowingInfo) {
      toast.error('No active borrowing found for this book');
      return;
    }

    setLoading(true);
    try {
      const returnDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(borrowingInfo.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { error: transactionError } = await supabase
        .from('borrowing_transactions')
        .update({ return_date: returnDate })
        .eq('id', borrowingInfo.id);

      if (transactionError) throw transactionError;

      const { data: transaction } = await supabase
        .from('borrowing_transactions')
        .select('book_copy_id, member_id')
        .eq('id', borrowingInfo.id)
        .single();

      const { error: updateError } = await supabase
        .from('book_copies')
        .update({ status: 'available' })
        .eq('id', transaction?.book_copy_id);

      if (updateError) throw updateError;

      if (today > dueDate) {
        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const { data: member } = await supabase
          .from('members')
          .select('fine_rate_per_day')
          .eq('id', transaction?.member_id)
          .single();

        const fineAmount = daysOverdue * (member?.fine_rate_per_day || 5);

        await supabase.from('fines').insert({
          member_id: transaction?.member_id,
          transaction_id: borrowingInfo.id,
          amount: fineAmount,
          reason: `Overdue by ${daysOverdue} days`,
        });

        toast.warning(`Book returned. Fine of ₱${fineAmount.toFixed(2)} applied for ${daysOverdue} days overdue.`);
      } else {
        toast.success('Book returned successfully');
      }

      setReturnBookId('');
      setBorrowingInfo(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Circulation</h1>
        <p className="text-muted-foreground">Process book borrowing and returns</p>
      </div>

      <Tabs defaultValue="borrow" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="borrow" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Borrow</span>
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Return</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrow" className="mt-6">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Process Book Borrowing</CardTitle>
              <CardDescription>Check out books to library members</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBorrow} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member-id">Member ID</Label>
                  <Input
                    id="member-id"
                    placeholder="Scan or enter member ID"
                    value={borrowMemberId}
                    onChange={(e) => setBorrowMemberId(e.target.value)}
                    required
                  />
                </div>

                {memberInfo && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{memberInfo.full_name}</span>
                      <Badge className={memberInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {memberInfo.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{memberInfo.email}</p>
                    <p className="text-sm">
                      Books borrowed: {memberInfo.current_borrowings} / {memberInfo.max_books_allowed}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="book-accession">Book Accession Number</Label>
                  <Input
                    id="book-accession"
                    placeholder="Scan or enter accession number"
                    value={borrowBookId}
                    onChange={(e) => setBorrowBookId(e.target.value)}
                    required
                  />
                </div>

                {bookCopyInfo && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{bookCopyInfo.book.title}</span>
                      <Badge className={bookCopyInfo.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {bookCopyInfo.status}
                      </Badge>
                    </div>
                    {bookCopyInfo.book.isbn && (
                      <p className="text-sm text-muted-foreground">ISBN: {bookCopyInfo.book.isbn}</p>
                    )}
                    {bookCopyInfo.location && (
                      <p className="text-sm">Location: {bookCopyInfo.location}</p>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading || !memberInfo || !bookCopyInfo}>
                    {loading ? 'Processing...' : 'Process Borrowing'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return" className="mt-6">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Process Book Return</CardTitle>
              <CardDescription>Return borrowed books to inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReturn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="return-accession">Book Accession Number</Label>
                  <Input
                    id="return-accession"
                    placeholder="Scan or enter accession number"
                    value={returnBookId}
                    onChange={(e) => setReturnBookId(e.target.value)}
                    required
                  />
                </div>

                {borrowingInfo ? (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">Active Borrowing Found</span>
                    </div>
                    <p className="text-sm"><strong>Book:</strong> {borrowingInfo.book_copy.book.title}</p>
                    <p className="text-sm"><strong>Borrower:</strong> {borrowingInfo.member.full_name} ({borrowingInfo.member.member_id})</p>
                    <p className="text-sm"><strong>Borrowed:</strong> {new Date(borrowingInfo.borrowed_date).toLocaleDateString()}</p>
                    <p className="text-sm">
                      <strong>Due:</strong> {new Date(borrowingInfo.due_date).toLocaleDateString()}
                      {new Date(borrowingInfo.due_date) < new Date() && (
                        <Badge className="ml-2 bg-red-100 text-red-800">Overdue</Badge>
                      )}
                    </p>
                  </div>
                ) : returnBookId ? (
                  <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span>No active borrowing found for this book</span>
                  </div>
                ) : null}

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading || !borrowingInfo}>
                    {loading ? 'Processing...' : 'Process Return'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Circulation;
