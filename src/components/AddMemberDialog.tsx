import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddMemberDialogProps {
  onMemberAdded: () => void;
}

const AddMemberDialog = ({ onMemberAdded }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    member_type: 'student' as const,
  });

  const generateMemberId = () => {
    const prefix = formData.member_type.toUpperCase().substring(0, 3);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${new Date().getFullYear()}-${random}`;
  };

  const getMemberDefaults = (type: string) => {
    switch (type) {
      case 'faculty':
        return { max_books: 10, borrowing_days: 30, renewal_limit: 3, fine_rate: 3 };
      case 'staff_member':
        return { max_books: 5, borrowing_days: 21, renewal_limit: 2, fine_rate: 4 };
      case 'guest':
        return { max_books: 2, borrowing_days: 7, renewal_limit: 1, fine_rate: 10 };
      default: // student
        return { max_books: 3, borrowing_days: 14, renewal_limit: 2, fine_rate: 5 };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memberId = formData.member_id || generateMemberId();
      const defaults = getMemberDefaults(formData.member_type);
      
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const { error } = await supabase
        .from('members')
        .insert({
          member_id: memberId,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          member_type: formData.member_type,
          max_books_allowed: defaults.max_books,
          borrowing_period_days: defaults.borrowing_days,
          renewal_limit: defaults.renewal_limit,
          fine_rate_per_day: defaults.fine_rate,
          expiration_date: expirationDate.toISOString().split('T')[0],
          status: 'active',
        });

      if (error) throw error;

      toast.success('Member registered successfully');
      setOpen(false);
      setFormData({
        member_id: '',
        full_name: '',
        email: '',
        phone: '',
        address: '',
        member_type: 'student',
      });
      onMemberAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Register Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Member</DialogTitle>
          <DialogDescription>Add a new library member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member_id">Member ID (auto-generated if empty)</Label>
            <Input
              id="member_id"
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              placeholder="Leave empty to auto-generate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member_type">Member Type</Label>
            <Select
              value={formData.member_type}
              onValueChange={(value: any) => setFormData({ ...formData, member_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="staff_member">Staff</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
