import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, CheckCircle, XCircle, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { reservationService } from '@/services/ReservationService';
import { IReservation } from '@/repositories/ReservationRepository';
import { isError } from '@/types/entities';

const Reservations = () => {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    const result = await reservationService.getAllReservations();
    if (isError(result)) {
      toast.error(result.error.message || 'Failed to load reservations');
    } else {
      setReservations(result.data);
    }
    setLoading(false);
  };

  const handleFulfill = async (id: string) => {
    const result = await reservationService.fulfillReservation(id);
    if (isError(result)) {
      toast.error(result.error.message || 'Failed to fulfill reservation');
    } else {
      toast.success('Reservation fulfilled');
      loadReservations();
    }
  };

  const handleCancel = async (id: string) => {
    const result = await reservationService.cancelReservation(id);
    if (isError(result)) {
      toast.error(result.error.message || 'Failed to cancel reservation');
    } else {
      toast.success('Reservation cancelled');
      loadReservations();
    }
  };

  const filteredReservations = reservations.filter(r =>
    r.member?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.member?.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.book?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Reservations</h1>
        <p className="text-muted-foreground">Manage book reservations</p>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Search Reservations</CardTitle>
          <CardDescription>Find reservations by member or book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name, ID, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reservations...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card className="shadow-card border-border/50">
          <CardContent className="py-12 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No reservations found matching your search.' : 'No pending reservations.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="shadow-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{reservation.book?.title}</h3>
                      {isExpired(reservation.expiration_date) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reserved by: {reservation.member?.full_name} ({reservation.member?.member_id})
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Reserved: {new Date(reservation.reservation_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {new Date(reservation.expiration_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFulfill(reservation.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Fulfill
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(reservation.id)}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;
