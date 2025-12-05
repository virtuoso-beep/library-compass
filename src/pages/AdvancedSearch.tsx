import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ResourceType = Database['public']['Enums']['resource_type'];

interface SearchResult {
  id: string;
  title: string;
  subtitle: string | null;
  isbn: string | null;
  publication_year: number | null;
  call_number: string | null;
  language: string | null;
  resource_type: string;
  available_copies: number;
  total_copies: number;
}

const AdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    isbn: '',
    call_number: '',
    category: '',
    publisher: '',
    year_from: '',
    year_to: '',
    resource_type: '',
    language: '',
    availability: '',
  });

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from('books')
        .select(`
          id,
          title,
          subtitle,
          isbn,
          publication_year,
          call_number,
          language,
          resource_type,
          book_copies(id, status)
        `);

      // Apply filters
      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters.isbn) {
        query = query.ilike('isbn', `%${filters.isbn}%`);
      }
      if (filters.call_number) {
        query = query.ilike('call_number', `%${filters.call_number}%`);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type as ResourceType);
      }
      if (filters.language) {
        query = query.ilike('language', `%${filters.language}%`);
      }
      if (filters.year_from) {
        query = query.gte('publication_year', parseInt(filters.year_from));
      }
      if (filters.year_to) {
        query = query.lte('publication_year', parseInt(filters.year_to));
      }

      const { data, error } = await query.order('title');

      if (error) throw error;

      // Process results to include availability
      const processedResults: SearchResult[] = (data || []).map((book: any) => {
        const copies = book.book_copies || [];
        const availableCopies = copies.filter((c: any) => c.status === 'available').length;
        
        return {
          id: book.id,
          title: book.title,
          subtitle: book.subtitle,
          isbn: book.isbn,
          publication_year: book.publication_year,
          call_number: book.call_number,
          language: book.language,
          resource_type: book.resource_type,
          available_copies: availableCopies,
          total_copies: copies.length,
        };
      });

      // Filter by availability if specified
      let filteredResults = processedResults;
      if (filters.availability === 'available') {
        filteredResults = processedResults.filter(r => r.available_copies > 0);
      } else if (filters.availability === 'unavailable') {
        filteredResults = processedResults.filter(r => r.available_copies === 0);
      }

      setResults(filteredResults);
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      author: '',
      isbn: '',
      call_number: '',
      category: '',
      publisher: '',
      year_from: '',
      year_to: '',
      resource_type: '',
      language: '',
      availability: '',
    });
    setResults([]);
    setSearched(false);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Search</h1>
        <p className="text-muted-foreground">Search the catalog with multiple filters</p>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
          </CardTitle>
          <CardDescription>Combine multiple criteria to find books</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Search by title..."
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ISBN</Label>
              <Input
                placeholder="Search by ISBN..."
                value={filters.isbn}
                onChange={(e) => setFilters({ ...filters, isbn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Call Number</Label>
              <Input
                placeholder="Search by call number..."
                value={filters.call_number}
                onChange={(e) => setFilters({ ...filters, call_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Input
                placeholder="e.g., English"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Year From</Label>
              <Input
                type="number"
                placeholder="e.g., 2000"
                value={filters.year_from}
                onChange={(e) => setFilters({ ...filters, year_from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Year To</Label>
              <Input
                type="number"
                placeholder="e.g., 2024"
                value={filters.year_to}
                onChange={(e) => setFilters({ ...filters, year_to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Resource Type</Label>
              <Select
                value={filters.resource_type}
                onValueChange={(value) => setFilters({ ...filters, resource_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="periodical">Periodical</SelectItem>
                  <SelectItem value="thesis">Thesis</SelectItem>
                  <SelectItem value="ebook">E-Book</SelectItem>
                  <SelectItem value="audiovisual">Audiovisual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={filters.availability}
                onValueChange={(value) => setFilters({ ...filters, availability: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {results.length} {results.length === 1 ? 'book' : 'books'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No books found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{book.title}</h3>
                        {book.subtitle && (
                          <p className="text-sm text-muted-foreground">{book.subtitle}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {book.isbn && (
                            <Badge variant="outline">ISBN: {book.isbn}</Badge>
                          )}
                          {book.call_number && (
                            <Badge variant="outline">{book.call_number}</Badge>
                          )}
                          {book.publication_year && (
                            <Badge variant="outline">{book.publication_year}</Badge>
                          )}
                          <Badge variant="secondary">{book.resource_type}</Badge>
                          {book.language && (
                            <Badge variant="secondary">{book.language}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            book.available_copies > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {book.available_copies} / {book.total_copies} available
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;
