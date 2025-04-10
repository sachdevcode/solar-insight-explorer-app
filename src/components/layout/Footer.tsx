
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted py-12" id="contact">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-bold text-lg mb-4">SolarInsight</h5>
            <p className="text-muted-foreground">
              We help homeowners analyze their solar proposal and utility bills 
              to make informed decisions about solar energy.
            </p>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link to="#how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link to="/upload" className="text-muted-foreground hover:text-primary">Start Analysis</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-4">Contact Us</h5>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <a href="mailto:info@solarinsight.com" className="text-muted-foreground hover:text-primary">
                  info@solarinsight.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <a href="tel:+11234567890" className="text-muted-foreground hover:text-primary">
                  (123) 456-7890
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">© 2025 SolarInsight. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
