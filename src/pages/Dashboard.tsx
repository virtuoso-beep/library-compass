import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BookMarked, AlertCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const { stats, loading } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      description: 'Available copies in library',
      icon: BookMarked,
      color: 'text-primary',
    },
    {
      title: 'Active Members',
      value: stats.totalMembers,
      description: 'Registered library members',
      icon: Users,
      color: 'text-accent',
    },
    {
      title: 'Active Borrowings',
      value: stats.activeBorrowings,
      description: 'Currently borrowed books',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks,
      description: 'Books past due date',
      icon: AlertCircle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of library operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card border-border/50 hover:shadow-elegant transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {loading ? '...' : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common library operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/circulation" className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="font-semibold text-foreground">Process Borrowing</div>
              <div className="text-sm text-muted-foreground">Check out books to members</div>
            </a>
            <a href="/circulation" className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="font-semibold text-foreground">Process Return</div>
              <div className="text-sm text-muted-foreground">Return books to inventory</div>
            </a>
            <a href="/members" className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="font-semibold text-foreground">Register Member</div>
              <div className="text-sm text-muted-foreground">Add new library member</div>
            </a>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest library transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display. Start processing transactions to see them here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
