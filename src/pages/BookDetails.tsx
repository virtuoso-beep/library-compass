import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookOpen, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BookDetail {
  id: string;
  title: string;
  subtitle: string | null;
  isbn: string | null;
  publication_year: number | null;
  description: string | null;
  call_number: string | null;
  language: string | null;
  pages: number | null;
  edition: string | null;
  resource_type: string;
  cover_image_url: string | null;
}

interface BookCopy {
  id: string;
  accession_number: string;
  status: string;
  location: string | null;
  condition_notes: string | null;
  acquired_date: string;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [addCopyOpen, setAddCopyOpen] = useState(false);
  const [newCopy, setNewCopy] = useState({ accession_number: '', location: '' });
  const [addingCopy, setAddingCopy] = useState(false);

  useEffect(() => {
    if (id) loadBookDetails();
  }, [id]);

  const loadBookDetails = async () => {
    setLoading(true);
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (bookError) throw bookError;
      setBook(bookData);

      const { data: copyData, error: copyError } = await supabase
        .from('book_copies')
        .select('*')
        .eq('book_id', id)
        .order('accession_number');

      if (copyError) throw copyError;
      setCopies(copyData || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCopy = async () => {
    if (!newCopy.accession_number) {
      toast.error('Accession number is required');
      return;
    }

    setAddingCopy(true);
    try {
      const { error } = await supabase
        .from('book_copies')
        .insert({
          book_id: id,
          accession_number: newCopy.accession_number,
          location: newCopy.location || null,
          status: 'available',
        });

      if (error) throw error;
      toast.success('Copy added successfully');
      setAddCopyOpen(false);
      setNewCopy({ accession_number: '', location: '' });
      loadBookDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add copy');
    } finally {
      setAddingCopy(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      borrowed: 'bg-blue-100 text-blue-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      lost: 'bg-red-100 text-red-800',
      damaged: 'bg-orange-100 text-orange-800',
      for_repair: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Book not found.</p>
        <Button variant="outline" onClick={() => navigate('/books')} className="mt-4">
          Back to Books
        </Button>
      </div>
    );
  }

  const availableCopies = copies.filter(c => c.status === 'available').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/books')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground">{book.title}</h1>
          {book.subtitle && <p className="text-muted-foreground">{book.subtitle}</p>}
        </div>
        <Badge className={availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {availableCopies} / {copies.length} available
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {book.isbn && (
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium font-mono">{book.isbn}</p>
                </div>
              )}
              {book.call_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Call Number</p>
                  <p className="font-medium">{book.call_number}</p>
                </div>
              )}
              {book.publication_year && (
                <div>
                  <p className="text-sm text-muted-foreground">Publication Year</p>
                  <p className="font-medium">{book.publication_year}</p>
                </div>
              )}
              {book.edition && (
                <div>
                  <p className="text-sm text-muted-foreground">Edition</p>
                  <p className="font-medium">{book.edition}</p>
                </div>
              )}
              {book.language && (
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{book.language}</p>
                </div>
              )}
              {book.pages && (
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="font-medium">{book.pages}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Resource Type</p>
                <Badge variant="secondary">{book.resource_type}</Badge>
              </div>
            </div>
            {book.description && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{book.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Copies</span>
              <span className="font-bold text-2xl">{copies.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available</span>
              <span className="font-bold text-2xl text-green-600">{availableCopies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Borrowed</span>
              <span className="font-bold text-2xl text-blue-600">
                {copies.filter(c => c.status === 'borrowed').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Other</span>
              <span className="font-bold text-2xl text-orange-600">
                {copies.filter(c => !['available', 'borrowed'].includes(c.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Book Copies</CardTitle>
            <CardDescription>Individual copies of this title</CardDescription>
          </div>
          <Dialog open={addCopyOpen} onOpenChange={setAddCopyOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Copy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Copy</DialogTitle>
                <DialogDescription>Add a new copy of "{book.title}"</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Accession Number *</Label>
                  <Input
                    value={newCopy.accession_number}
                    onChange={(e) => setNewCopy({ ...newCopy, accession_number: e.target.value })}
                    placeholder="Enter accession number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={newCopy.location}
                    onChange={(e) => setNewCopy({ ...newCopy, location: e.target.value })}
                    placeholder="e.g., Shelf A-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddCopyOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCopy} disabled={addingCopy}>
                    {addingCopy ? 'Adding...' : 'Add Copy'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {copies.length === 0 ? (
            <div className="text-center py-8">
              <Copy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No copies available. Add the first copy.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession #</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acquired</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {copies.map((copy) => (
                  <TableRow key={copy.id}>
                    <TableCell className="font-mono">{copy.accession_number}</TableCell>
                    <TableCell>{copy.location || 'Not assigned'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(copy.status)}>
                        {copy.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(copy.acquired_date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {copy.condition_notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetails;
