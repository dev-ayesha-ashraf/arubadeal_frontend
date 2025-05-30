import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  destructive?: boolean;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  destructive = true,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <p>{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
