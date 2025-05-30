import { Helmet } from "react-helmet-async";
import { Car } from "@/types/car";

interface ShareMetaTagsProps {
  car: Car | null;
}

export const ShareMetaTags = ({ car }: ShareMetaTagsProps) => {
  if (!car) return null;

  const imageUrl = `${import.meta.env.VITE_MEDIA_URL}/${car.image}`;
  const shareUrl = window.location.href;
  const title = `${car.title} - AWG ${Number(car.price).toLocaleString()}`;
  const description = `${car.make} ${car.model || ''} - ${car.transmission} - ${car.mileage.toLocaleString()} mi`;

  return (
    <Helmet>
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={shareUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={shareUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* WhatsApp specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
}; 