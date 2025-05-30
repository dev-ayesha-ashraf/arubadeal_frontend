import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export const Header = () => {
  return (
    <div className="hidden md:block bg-gradient-to-b from-dealership-primary/80 to-dealership-primary/100 text-white py-4">
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <MapPin size={20} />
        <span className="text-base md:text-lg">
          Oranjestad Santa Cruz 38, Aruba
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Phone size={20} />
        <span className="text-base md:text-lg">+297 569 4343</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock size={20} />
        <span className="text-base md:text-lg">Mon-Sat: 9AM-8PM</span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://www.facebook.com/share/18bEakUSqf/"
          className="p-2 bg-white rounded-full text-dealership-primary transition hover:bg-gray-200"
        >
          <Facebook size={20} />
        </a>
        <a
          href="https://www.instagram.com"
          className="p-2 bg-white rounded-full text-dealership-primary transition hover:bg-gray-200"
        >
          <Instagram size={20} />
        </a>
        <a
          href="https://www.twitter.com"
          className="p-2 bg-white rounded-full text-dealership-primary transition hover:bg-gray-200"
        >
          <Twitter size={20} />
        </a>
        <a
          href="https://www.linkedin.com"
          className="p-2 bg-white rounded-full text-dealership-primary transition hover:bg-gray-200"
        >
          <Linkedin size={20} />
        </a>
      </div>
    </div>
  </div>
</div>

  );
};
