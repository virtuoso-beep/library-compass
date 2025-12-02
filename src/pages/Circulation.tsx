import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BookOpen, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Circulation = () => {
  const [borrowMemberId, setBorrowMemberId] = useState('');
  const [borrowBookId, setBorrowBookId] = useState('');
  const [returnBookId, setReturnBookId] = useState('');

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Borrowing functionality will be implemented soon');
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Return functionality will be implemented soon');
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
                <div className="pt-4 space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Member and book information will appear here after scanning
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Process Borrowing
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
                <div className="pt-4 space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Book and borrowing information will appear here after scanning
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Process Return
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