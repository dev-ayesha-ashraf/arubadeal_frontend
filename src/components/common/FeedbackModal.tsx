import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormErrors {
    email?: string;
    feedback?: string;
}

const API_URL = import.meta.env.VITE_API_URL1;
const FEEDBACK_ENDPOINT = `${API_URL}feedback`;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    open,
    onOpenChange
}) => {
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState({
        email: false,
        feedback: false
    });
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setEmail('');
            setFeedback('');
            setErrors({});
            setTouched({ email: false, feedback: false });
            setIsSubmitted(false);
        }
    }, [open]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (feedback.trim() && feedback.trim().length < 10) {
            newErrors.feedback = 'Please provide at least 10 characters if you choose to give feedback';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateForm();
    };

    const submitFeedbackToAPI = async (email: string, message: string) => {
        const payload = {
            email: email.trim(),
            message: message.trim() || '[No feedback provided]'
        };

        const response = await fetch(FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({
            email: true,
            feedback: true
        });

        if (!validateForm()) {
            if (errors.email) {
                toast({
                    title: 'Email Required',
                    description: errors.email,
                    duration: 3000,
                });
            }
            if (errors.feedback) {
                toast({
                    title: 'Invalid Feedback',
                    description: errors.feedback,
                    duration: 3000,
                });
            }
            return;
        }

        setIsSubmitting(true);

        const loadingToast = toast({
            title: 'Submitting your feedback...',
            description: 'Please wait a moment.',
            duration: Infinity,
        });

        try {
            // Submit to API
            const result = await submitFeedbackToAPI(email, feedback);
            
            console.log('API Response:', result);

            if (result.success) {
                toast({
                    title: 'Feedback Submitted Successfully!',
                    description: 'Thank you for helping us improve our service.',
                    duration: 3000,
                });

                setIsSubmitted(true);

                const submissions = JSON.parse(localStorage.getItem('feedbackSubmissions') || '[]');
                submissions.push({
                    email: email.trim(),
                    feedback: feedback.trim() || '[No feedback provided]',
                    timestamp: new Date().toISOString(),
                    apiResponse: result
                });
                localStorage.setItem('feedbackSubmissions', JSON.stringify(submissions));

                setTimeout(() => {
                    onOpenChange(false);
                    setTimeout(() => {
                        setEmail('');
                        setFeedback('');
                        setErrors({});
                        setTouched({ email: false, feedback: false });
                        setIsSubmitted(false);
                    }, 300);
                }, 2000);
            } else {
                throw new Error(result.detail || 'Failed to submit feedback');
            }

        } catch (error) {
            console.error('Error submitting feedback:', error);

            try {
                const submissions = JSON.parse(localStorage.getItem('feedbackSubmissions') || '[]');
                submissions.push({
                    email: email.trim(),
                    feedback: feedback.trim() || '[No feedback provided]',
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                localStorage.setItem('feedbackSubmissions', JSON.stringify(submissions));

                toast({
                    title: 'Saved Locally',
                    description: 'Failed to send to server, but saved locally. We\'ll sync when possible.',
                    duration: 4000,
                });

                setIsSubmitted(true);
                
                setTimeout(() => {
                    onOpenChange(false);
                    setTimeout(() => {
                        setEmail('');
                        setFeedback('');
                        setErrors({});
                        setTouched({ email: false, feedback: false });
                        setIsSubmitted(false);
                    }, 300);
                }, 2000);
            } catch (localError) {
                toast({
                    title: 'Submission Failed',
                    description: 'Failed to submit feedback. Please try again.',
                    duration: 4000,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: 'email' | 'feedback', value: string) => {
        if (field === 'email') {
            setEmail(value);
        } else {
            setFeedback(value);
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCancel = () => {
        if (feedback.trim() || email.trim()) {
            toast({
                title: 'Feedback Not Submitted',
                description: 'Your feedback has not been saved.',
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const form = document.querySelector('form');
                            if (form) {
                                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                const formEvent = submitEvent as unknown as React.FormEvent;
                                handleSubmit(formEvent);
                            }
                        }}
                    >
                        Submit Anyway
                    </Button>
                ),
                duration: 5000,
            });
            return; 
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open && (feedback.trim() || email.trim())) {
                handleCancel();
            } else {
                onOpenChange(open);
            }
        }}>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] sm:mx-auto p-4 sm:p-6">
                <DialogHeader className="px-0 sm:px-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-dealership-gold" />
                        <DialogTitle className="text-lg sm:text-xl">Share Your Feedback</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm sm:text-base">
                        Help us improve by sharing your thoughts and suggestions.
                    </DialogDescription>
                </DialogHeader>

                {isSubmitted ? (
                    <div className="py-6 sm:py-8 text-center">
                        <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100">
                            <Send className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900">
                            Thank You!
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                            Your feedback has been submitted successfully. We appreciate your help in making our platform better.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email" className="text-sm sm:text-base">
                                    Email Address
                                </Label>
                                <span className="text-xs text-red-500">Required</span>
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                className={`w-full text-sm sm:text-base ${errors.email && touched.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.email && touched.email && (
                                <div className="flex items-start gap-1 text-red-500 text-xs">
                                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{errors.email}</span>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                We'll use this to follow up on your feedback.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="feedback" className="text-sm sm:text-base">
                                    Your Feedback
                                </Label>
                                <span className="text-xs text-gray-500">Optional</span>
                            </div>
                            <Textarea
                                id="feedback"
                                placeholder="Tell us what you think about our platform, what we can improve, or any features you'd like to see... (Optional)"
                                value={feedback}
                                onChange={(e) => handleInputChange('feedback', e.target.value)}
                                onBlur={() => handleBlur('feedback')}
                                className={`min-h-[120px] sm:min-h-[150px] resize-none text-sm sm:text-base ${errors.feedback && touched.feedback ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.feedback && touched.feedback && (
                                <div className="flex items-start gap-1 text-red-500 text-xs">
                                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{errors.feedback}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    Optional - but very helpful if you have suggestions
                                </p>
                                {feedback.trim() && (
                                    <span className={`text-xs ${feedback.length >= 10 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {feedback.length}/10
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto order-2 sm:order-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto bg-dealership-gold hover:bg-dealership-gold/90 text-white order-1 sm:order-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Feedback
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};