import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedbackBarProps {
  onFeedbackClick: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export const FeedbackBar: React.FC<FeedbackBarProps> = ({
  onFeedbackClick,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-amber-50/95 backdrop-blur-sm border-b border-amber-200 text-dealership-gold px-4 py-3 md:py-2.5 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        <div className="flex items-start gap-2.5 flex-1">
          <MessageSquare className="h-4 w-4 text-dealership-gold mt-0.5 flex-shrink-0" />
          <span className="text-sm font-medium leading-snug md:leading-normal">
            We're in development phase. Your feedback helps us provide better service.
          </span>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <Button
            size="sm"
            onClick={onFeedbackClick}
            className="bg-dealership-gold hover:bg-dealership-gold/90 text-white shadow-sm hover:shadow flex-1 md:flex-none min-w-[120px]"
          >
            Give Feedback
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 w-9 p-0 text-dealership-gold hover:bg-dealership-gold/10 rounded-full flex-shrink-0"
            title="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close feedback bar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};