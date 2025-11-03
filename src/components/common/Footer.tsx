import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SubscriptionBox } from "./SubscriptionBox";

export const Footer = () => {
  return (
    <footer className="text-white bg-gradient-to-b from-dealership-primary/70 to-dealership-primary/100">
      <div className="container mx-auto py-16 px-6">
        {/* Subscription Box - Top Section */}
        <div className="mb-12 border-b border-gray-100/30 pb-12">
          <div className="max-w-3xl mx-auto">
            <SubscriptionBox />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-100">
              We are committed to providing quality vehicles and exceptional
              customer service to our valued clients for over 25 years.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-100 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-gray-100 hover:text-white">
                  Listings
                </Link>
              </li>
              <li>
                <Link to="/dealers" className="text-gray-100 hover:text-white">
                  Dealers
                </Link>
              </li>
              {/* <li>
                <a href="#" className="text-gray-100 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-100 hover:text-white">
                  Contact
                </a>
              </li> */}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <div className="space-y-4">
              <p className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>+297 569 4343</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>support@arudeal.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Oranjestad Santa Cruz 38, Aruba</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-dealership-primary">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-dealership-primary">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-dealership-primary">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-dealership-primary">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-gray-100">
            © {new Date().getFullYear()} Car Dealership. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
