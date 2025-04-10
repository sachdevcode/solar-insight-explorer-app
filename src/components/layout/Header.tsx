
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="h-8 w-8 text-solar-500" />
          <span className="font-bold text-xl">SolarInsight</span>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
          <Link to="#how-it-works" className="text-sm font-medium hover:text-primary">How It Works</Link>
          <Link to="#contact" className="text-sm font-medium hover:text-primary">Contact</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/upload">
            <Button>Start Your Analysis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
