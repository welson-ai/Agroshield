import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Home,
  Shield,
  TrendingUp,
  FileText,
  Droplets,
  BarChart3,
  Settings,
  HelpCircle,
  Users,
  Calendar,
  MapPin,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Wallet,
  Globe,
  PieChart,
  Target,
  Zap,
  Clock,
  Star
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  description?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    title: 'Policies',
    href: '/policies',
    icon: Shield,
    badge: '3 Active',
    children: [
      {
        title: 'My Policies',
        href: '/policies/my',
        icon: Shield,
        description: 'View and manage your policies'
      },
      {
        title: 'Create Policy',
        href: '/policies/create',
        icon: Star,
        description: 'Get new insurance coverage'
      },
      {
        title: 'Policy Templates',
        href: '/policies/templates',
        icon: FileText,
        description: 'Browse policy options'
      }
    ]
  },
  {
    title: 'Claims',
    href: '/claims',
    icon: FileText,
    badge: '1 Pending',
    children: [
      {
        title: 'File Claim',
        href: '/claims/file',
        icon: FileText,
        description: 'Submit insurance claim'
      },
      {
        title: 'Claim History',
        href: '/claims/history',
        icon: Clock,
        description: 'View past claims'
      },
      {
        title: 'Claim Status',
        href: '/claims/status',
        icon: Activity,
        description: 'Track claim progress'
      }
    ]
  },
  {
    title: 'Liquidity',
    href: '/liquidity',
    icon: Droplets,
    children: [
      {
        title: 'Provide Liquidity',
        href: '/liquidity/provide',
        icon: TrendingUp,
        description: 'Earn rewards by providing liquidity'
      },
      {
        title: 'My Positions',
        href: '/liquidity/positions',
        icon: Wallet,
        description: 'Manage your liquidity positions'
      },
      {
        title: 'Pool Analytics',
        href: '/liquidity/analytics',
        icon: BarChart3,
        description: 'Pool performance metrics'
      }
    ]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      {
        title: 'Weather Data',
        href: '/analytics/weather',
        icon: Globe,
        description: 'Regional weather patterns'
      },
      {
        title: 'Risk Assessment',
        href: '/analytics/risk',
        icon: AlertTriangle,
        description: 'Risk analysis and scoring'
      },
      {
        title: 'Premium Trends',
        href: '/analytics/premiums',
        icon: TrendingUp,
        description: 'Premium rate analysis'
      },
      {
        title: 'Portfolio Performance',
        href: '/analytics/portfolio',
        icon: PieChart,
        description: 'Your investment performance'
      }
    ]
  },
  {
    title: 'Market',
    href: '/market',
    icon: Target,
    children: [
      {
        title: 'Marketplace',
        href: '/marketplace',
        icon: Target,
        description: 'Buy/sell insurance policies'
      },
      {
        title: 'Secondary Market',
        href: '/market/secondary',
        icon: Zap,
        description: 'Trade policy positions'
      }
    ]
  },
  {
    title: 'Community',
    href: '/community',
    icon: Users,
    children: [
      {
        title: 'Forum',
        href: '/community/forum',
        icon: Users,
        description: 'Community discussions'
      },
      {
        title: 'Events',
        href: '/community/events',
        icon: Calendar,
        description: 'Upcoming events and webinars'
      }
    ]
  }
];

const secondaryNavigation: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    description: 'Get help and support'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, className = '' }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['policies', 'claims']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({ item, level = 0 }) => {
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={`w-full justify-start px-${level === 0 ? '3' : '6'} h-10 ${
              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => toggleExpanded(item.title)}
          >
            <item.icon className="w-4 h-4 mr-2" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="mr-2">
                {item.badge}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
          
          {isExpanded && (
            <div className="ml-4">
              {item.children?.map(child => (
                <NavItemComponent key={child.title} item={child} level={1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} to={item.href} onClick={onClose}>
        <Button
          variant="ghost"
          className={`w-full justify-start px-${level === 0 ? '3' : '6'} h-10 ${
            active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className="w-4 h-4 mr-2" />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="mr-2">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${className}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgroShield</span>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navigation.map(item => (
                  <NavItemComponent key={item.title} item={item} />
                ))}
              </div>

              <Separator />

              {/* Secondary Navigation */}
              <div className="space-y-1">
                {secondaryNavigation.map(item => (
                  <NavItemComponent key={item.title} item={item} />
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Bottom Section */}
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-medium text-blue-600">3</div>
                  <div className="text-xs text-gray-500">Active Policies</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-medium text-green-600">12.5%</div>
                  <div className="text-xs text-gray-500">APY</div>
                </div>
              </div>

              {/* Help Link */}
              <Button variant="outline" size="sm" className="w-full">
                <HelpCircle className="w-4 h-4 mr-2" />
                Need Help?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
