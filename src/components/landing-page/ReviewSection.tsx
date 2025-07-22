import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "John Smith",
    rating: 5,
    comment:
      "Excellent service and amazing selection of vehicles. The staff was very helpful throughout the entire process.",
    date: "March 15, 2024",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Found my dream car here! The financing options were great and the process was smooth.",
    date: "March 10, 2024",
  },
  {
    id: 3,
    name: "Michael Brown",
    rating: 5,
    comment:
      "Professional team and great after-sales service. Highly recommended!",
    date: "March 5, 2024",
  },
];

export const ReviewSection = () => {
  return (
    <section className="py-16 bg-white hidden">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-dealership-silver p-6 rounded-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-dealership-primary text-dealership-primary"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{review.comment}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{review.name}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
