import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddBookDialogProps {
  onBookAdded: () => void;
}

const AddBookDialog = ({ onBookAdded }: AddBookDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    isbn: '',
    publication_year: '',
    description: '',
    call_number: '',
    language: 'English',
    pages: '',
    resource_type: 'book' as const,
    accession_number: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert book
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          isbn: formData.isbn || null,
          publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
          description: formData.description || null,
          call_number: formData.call_number || null,
          language: formData.language,
          pages: formData.pages ? parseInt(formData.pages) : null,
          resource_type: formData.resource_type,
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Insert book copy
      if (formData.accession_number) {
        const { error: copyError } = await supabase
          .from('book_copies')
          .insert({
            book_id: book.id,
            accession_number: formData.accession_number,
            location: formData.location || null,
            status: 'available',
          });

        if (copyError) throw copyError;
      }

      toast.success('Book added successfully');
      setOpen(false);
      setFormData({
        title: '',
        subtitle: '',
        isbn: '',
        publication_year: '',
        description: '',
        call_number: '',
        language: 'English',
        pages: '',
        resource_type: 'book',
        accession_number: '',
        location: '',
      });
      onBookAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>Enter book details to add to the catalog</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call_number">Call Number</Label>
              <Input
                id="call_number"
                value={formData.call_number}
                onChange={(e) => setFormData({ ...formData, call_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_year">Publication Year</Label>
              <Input
                id="publication_year"
                type="number"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_type">Resource Type</Label>
              <Select
                value={formData.resource_type}
                onValueChange={(value: any) => setFormData({ ...formData, resource_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">First Copy Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accession_number">Accession Number *</Label>
                <Input
                  id="accession_number"
                  value={formData.accession_number}
                  onChange={(e) => setFormData({ ...formData, accession_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location/Shelf</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
