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
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SubscriptionBox } from "./SubscriptionPopup";

export const Footer = () => {
  const [showSubscription, setShowSubscription] = useState(false);

  const handleSubscribeClick = () => {
    setShowSubscription(true);
  };

  return (
    <>
      <footer className="text-white bg-gradient-to-b from-dealership-primary/70 to-dealership-primary/100">
        <div className="container mx-auto py-8 px-6">
          <div className="mb-2 border-b border-gray-100/30 pb-2">
            <div className="max-w-3xl mx-auto text-center">
              <div className="px-8 py-4">
                <h3 className="text-2xl font-bold mb-4">
                  Stay Updated with the Best Deals
                </h3>
                <p className="text-gray-100 mb-6">
                  Subscribe to our newsletter and be the first to know about new
                  arrivals, exclusive offers, and special promotions.
                </p>
                <button
                  onClick={handleSubscribeClick}
                  className="bg-white text-dealership-primary hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
                >
                  Subscribe Now
                </button>
              </div>
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
                  <Link
                    to="/listings"
                    className="text-gray-100 hover:text-white"
                  >
                    Listings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dealers"
                    className="text-gray-100 hover:text-white"
                  >
                    Dealers
                  </Link>
                </li>
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
                <a href="#" className="hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-gray-100">
              © {new Date().getFullYear()} Aruba Quality Deals. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showSubscription} onOpenChange={setShowSubscription}>
        <DialogContent className="max-w-[86%] max-h-[85vh] sm:max-w-[56%] overflow-auto">
          <SubscriptionBox />
        </DialogContent>
      </Dialog>
    </>
  );
};
