import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  imageUrl?: string;
}

export const ShareButtons = ({ title, url, imageUrl }: ShareButtonsProps) => {
  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title,
          url,
          text: `Check out this listing: ${title}`
        };

        // Add image to share data if available and if the browser supports files
        if (imageUrl && 'files' in navigator.share) {
          try {
            // Fetch the image
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
            
            // Add files to share data
            shareData.files = [file];
          } catch (error) {
            console.error('Error preparing image for share:', error);
            // Continue with sharing without the image if there's an error
          }
        }

        await navigator.share(shareData);
      } catch (error) {
        // User may have canceled share operation or it failed
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share content');
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
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