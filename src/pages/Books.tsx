import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import AddBookDialog from '@/components/AddBookDialog';

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  isbn: string | null;
  publication_year: number | null;
  cover_image_url: string | null;
  description: string | null;
  publisher_id: string | null;
  category_id: string | null;
}

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.subtitle && book.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (book.isbn && book.isbn.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Books Catalog</h1>
          <p className="text-muted-foreground">Browse and manage library collection</p>
        </div>
        <AddBookDialog onBookAdded={loadBooks} />
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Search Books</CardTitle>
          <CardDescription>Find books by title, ISBN, or author</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="shadow-card border-border/50">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No books found matching your search.' : 'No books in catalog yet. Add your first book!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="shadow-card border-border/50 hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                    {book.subtitle && (
                      <CardDescription className="line-clamp-1 mt-1">{book.subtitle}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {book.isbn && (
                    <Badge variant="secondary" className="text-xs">
                      ISBN: {book.isbn}
                    </Badge>
                  )}
                  {book.publication_year && (
                    <span className="text-xs text-muted-foreground">{book.publication_year}</span>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/books/${book.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;