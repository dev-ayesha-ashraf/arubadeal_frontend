import React from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Navbar } from "./Navbar";

const SellPage: React.FC = () => {
  return (
    <div>
      <Header />
      <Navbar />

      {/* Hero Section with Integrated Steps */}
      <section
        className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Sell Your Car <span className="text-dealership-primary">Fast</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Get the best offer for your car within minutes. Hassle-free process, instant quotes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="bg-dealership-primary text-white font-semibold py-4 px-12 rounded-full shadow-2xl transition-all hover:shadow-dealership-primary/25"
              onClick={() => (window.location.href = "/list-car")}
            >
              List My Car Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SellPage;