import { Users, Car, Award, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Users, label: "Happy Customers", value: "10,000+" },
  { icon: Car, label: "Cars Sold", value: "15,000+" },
  { icon: Award, label: "Years Experience", value: "25+" },
  { icon: ThumbsUp, label: "Satisfaction Rate", value: "98%" },
];

export const StatsSection = () => {
  return (
    <section className="relative py-20 px-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/50" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="w-12 h-12 mx-auto mb-4 text-dealership-primary" />
              <h3 className="text-3xl font-bold mb-2 text-black">
                {stat.value}
              </h3>
              <p className="text-gray-900">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center hidden">
          <h2 className="text-3xl font-bold mb-6 text-black">
            Director's Message
          </h2>
          <p className="text-lg text-black mb-8">
            "Our commitment to excellence and customer satisfaction has been the
            cornerstone of our success. We strive to provide not just vehicles,
            but lasting relationships with our customers, ensuring they find the
            perfect car that matches their needs and dreams."
          </p>
          <img
            src="/logo.svg"
            alt="Director's Signature"
            className="h-16 mx-auto mb-4"
          />
          <p className="font-semibold text-black">James Wilson</p>
          <p className="text-gray-900">Managing Director</p>
        </div>
      </div>
    </section>
  );
};
