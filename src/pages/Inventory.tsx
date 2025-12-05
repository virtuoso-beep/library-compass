import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, MapPin, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BookCopy {
  id: string;
  accession_number: string;
  status: string;
  location: string | null;
  condition_notes: string | null;
  acquired_date: string;
  book: {
    title: string;
    isbn: string | null;
    call_number: string | null;
  };
}

const Inventory = () => {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('book_copies')
        .select(`
          id,
          accession_number,
          status,
          location,
          condition_notes,
          acquired_date,
          book:books(title, isbn, call_number)
        `)
        .order('accession_number');

      if (error) throw error;
      setCopies((data || []) as unknown as BookCopy[]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('book_copies')
        .update({ location: editLocation, status: editStatus as any })
        .eq('id', id);

      if (error) throw error;
      toast.success('Book copy updated');
      setEditingId(null);
      loadInventory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  const startEdit = (copy: BookCopy) => {
    setEditingId(copy.id);
    setEditLocation(copy.location || '');
    setEditStatus(copy.status);
  };

  const filteredCopies = copies.filter(copy => {
    const matchesSearch = 
      copy.accession_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      copy.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (copy.book.isbn && copy.book.isbn.includes(searchQuery)) ||
      (copy.location && copy.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || copy.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const stats = {
    total: copies.length,
    available: copies.filter(c => c.status === 'available').length,
    borrowed: copies.filter(c => c.status === 'borrowed').length,
    lost: copies.filter(c => c.status === 'lost').length,
    damaged: copies.filter(c => c.status === 'damaged' || c.status === 'for_repair').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage book copies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Copies</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.borrowed}</div>
            <p className="text-xs text-muted-foreground">Borrowed</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
            <p className="text-xs text-muted-foreground">Lost</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.damaged}</div>
            <p className="text-xs text-muted-foreground">Damaged/Repair</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Book Copies</CardTitle>
          <CardDescription>Manage individual book copies and their locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by accession number, title, ISBN, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="for_repair">For Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          ) : filteredCopies.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No book copies found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accession #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Call Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCopies.map((copy) => (
                    <TableRow key={copy.id}>
                      <TableCell className="font-mono">{copy.accession_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{copy.book.title}</TableCell>
                      <TableCell>{copy.book.call_number || '-'}</TableCell>
                      <TableCell>
                        {editingId === copy.id ? (
                          <Input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-32"
                            placeholder="Location"
                          />
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {copy.location || 'Not assigned'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === copy.id ? (
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="borrowed">Borrowed</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                              <SelectItem value="for_repair">For Repair</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getStatusColor(copy.status)}>
                            {copy.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === copy.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdate(copy.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(copy)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
