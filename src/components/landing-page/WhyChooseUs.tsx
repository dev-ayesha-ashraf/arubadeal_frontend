import { ShieldCheck, Clock, Wallet, Headphones } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description:
      "All our vehicles undergo rigorous quality checks and certification processes.",
  },
  {
    icon: Clock,
    title: "Fast & Easy Process",
    description: "Quick and hassle-free buying process with minimal paperwork.",
  },
  {
    icon: Wallet,
    title: "Best Price Guarantee",
    description: "We offer competitive prices and flexible financing options.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated team is always ready to assist you with any queries.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center relative">
              <reason.icon className="w-12 h-12 mx-auto mb-4 text-dealership-primary" />
              <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
