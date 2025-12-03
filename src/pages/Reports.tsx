import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, BookOpen, AlertTriangle } from 'lucide-react';

interface OverdueBook {
  id: string;
  borrowed_date: string;
  due_date: string;
  member: { full_name: string; member_id: string };
  book_copy: { accession_number: string; book: { title: string } };
}

interface BorrowingStats {
  total_borrowed: number;
  total_returned: number;
  overdue_count: number;
}

const Reports = () => {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [borrowingStats, setBorrowingStats] = useState<BorrowingStats>({ total_borrowed: 0, total_returned: 0, overdue_count: 0 });
  const [activeBorrowings, setActiveBorrowings] = useState<OverdueBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Load overdue books
      const today = new Date().toISOString().split('T')[0];
      const { data: overdue } = await supabase
        .from('borrowing_transactions')
        .select(`
          id,
          borrowed_date,
          due_date,
          member:members(full_name, member_id),
          book_copy:book_copies(accession_number, book:books(title))
        `)
        .is('return_date', null)
        .lt('due_date', today);

      setOverdueBooks(overdue?.map(o => ({
        ...o,
        member: o.member as any,
        book_copy: o.book_copy as any
      })) || []);

      // Load active borrowings
      const { data: active } = await supabase
        .from('borrowing_transactions')
        .select(`
          id,
          borrowed_date,
          due_date,
          member:members(full_name, member_id),
          book_copy:book_copies(accession_number, book:books(title))
        `)
        .is('return_date', null)
        .order('due_date');

      setActiveBorrowings(active?.map(a => ({
        ...a,
        member: a.member as any,
        book_copy: a.book_copy as any
      })) || []);

      // Load stats
      const { count: totalBorrowed } = await supabase
        .from('borrowing_transactions')
        .select('*', { count: 'exact', head: true });

      const { count: totalReturned } = await supabase
        .from('borrowing_transactions')
        .select('*', { count: 'exact', head: true })
        .not('return_date', 'is', null);

      setBorrowingStats({
        total_borrowed: totalBorrowed || 0,
        total_returned: totalReturned || 0,
        overdue_count: overdue?.length || 0,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Reports</h1>
        <p className="text-muted-foreground">Library analytics and reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <FileText className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{borrowingStats.total_borrowed}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Books Returned</CardTitle>
            <BookOpen className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{borrowingStats.total_returned}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Books</CardTitle>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{borrowingStats.overdue_count}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue" className="w-full">
        <TabsList>
          <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
          <TabsTrigger value="borrowed">Currently Borrowed</TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-6">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Overdue Books Report</CardTitle>
              <CardDescription>Books that are past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : overdueBooks.length === 0 ? (
                <p className="text-muted-foreground">No overdue books</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Accession #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueBooks.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.book_copy.book.title}</TableCell>
                        <TableCell>{item.book_copy.accession_number}</TableCell>
                        <TableCell>
                          {item.member.full_name}
                          <span className="text-muted-foreground text-sm ml-2">({item.member.member_id})</span>
                        </TableCell>
                        <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{getDaysOverdue(item.due_date)} days</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed" className="mt-6">
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Currently Borrowed Books</CardTitle>
              <CardDescription>All books currently checked out</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : activeBorrowings.length === 0 ? (
                <p className="text-muted-foreground">No books currently borrowed</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Accession #</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBorrowings.map((item) => {
                      const isOverdue = new Date(item.due_date) < new Date();
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.book_copy.book.title}</TableCell>
                          <TableCell>{item.book_copy.accession_number}</TableCell>
                          <TableCell>
                            {item.member.full_name}
                            <span className="text-muted-foreground text-sm ml-2">({item.member.member_id})</span>
                          </TableCell>
                          <TableCell>{new Date(item.borrowed_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">On Time</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default Reports;
