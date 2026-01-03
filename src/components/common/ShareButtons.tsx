import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackCustomEvent } from "@/lib/init-pixel";

interface ShareButtonsProps {
  title: string;
  url: string;
  imageUrl?: string;
  isThirdParty?: boolean;
}

export const ShareButtons = ({ title, url, imageUrl, isThirdParty }: ShareButtonsProps) => {
  const getShareUrl = (listingUrl: string) => {
    if (isThirdParty) return listingUrl;
    try {
      const slug = listingUrl.split("/listings/")[1];
      return slug ? `https://api.arudeal.com/share/${slug}` : listingUrl;
    } catch {
      return listingUrl;
    }
  };

  const shareUrl = getShareUrl(url);

  const handleShare = async () => {
    trackCustomEvent("share_click", { title, shareUrl, hasImage: !!imageUrl });

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title,
          url: shareUrl,
          text: `Check out this listing: ${title}`,
        };

        if (imageUrl && "files" in navigator.share) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: "image/jpeg" });
            shareData.files = [file];
            trackCustomEvent("share_image_included", { imageUrl });
          } catch (error) {
            console.error("Error preparing image for share:", error);
            trackCustomEvent("share_image_failed", { imageUrl, error });
          }
        }

        await navigator.share(shareData);
        trackCustomEvent("share_success", { method: "native", title, shareUrl });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Failed to share content");
          console.error("Error sharing:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="flex items-center gap-2 hover:bg-gray-100"
      title="Share"
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </Button>
  );
};
