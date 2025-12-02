import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LayoutDashboard, BookMarked, Users, RefreshCw, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/books', label: 'Books', icon: BookMarked },
    { href: '/members', label: 'Members', icon: Users },
    { href: '/circulation', label: 'Circulation', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-library-cream via-background to-muted/30">
      <nav className="border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-elegant">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold font-serif text-foreground">Library System</span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {user && (
              <Button variant="ghost" onClick={signOut} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;