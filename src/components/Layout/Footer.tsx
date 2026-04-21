import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail, 
  Globe,
  Shield,
  TrendingUp,
  Users,
  FileText,
  HelpCircle,
  MessageSquare,
  Star,
  ArrowUp
} from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AgroShield</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Decentralized agricultural insurance platform powered by blockchain technology. 
              Protecting farmers' livelihoods with transparent, affordable, and accessible insurance solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/policies" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Insurance Policies
                </Link>
              </li>
              <li>
                <Link to="/liquidity" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Liquidity Pool
                </Link>
              </li>
              <li>
                <Link to="/claims" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Claims Management
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Risk Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/docs" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/community" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Forum
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Events
                </Link>
              </li>
              <li>
                <Link to="/ambassadors" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Ambassadors
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Partners
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">
            © {currentYear} AgroShield. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link to="/compliance" className="text-gray-400 hover:text-white transition-colors">
              Compliance
            </Link>
          </div>

          {/* Back to Top Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToTop}
            className="text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black bg-opacity-50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <span>•</span>
              <span>Celo Mainnet</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Total Liquidity: $2.5M+</span>
              <span>•</span>
              <span>Active Policies: 1,200+</span>
              <span>•</span>
              <span>Users: 5,000+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
