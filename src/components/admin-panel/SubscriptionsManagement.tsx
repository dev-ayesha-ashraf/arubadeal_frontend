import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Mail, Search } from "lucide-react";

interface Subscription {
  _id: string;
  email: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/subscriptions/admin/list`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch subscriptions");
  }
  const result = await response.json();
  return result.data;
};

const deleteSubscription = async (id: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/subscriptions/admin/delete/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to delete subscription");
  }
};

const sendNewsletter = async (subject: string, content: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/subscriptions/admin/send-newsletter`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("access_token") || ""
        )}`,
      },
      body: JSON.stringify({ subject, content }),
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to send newsletter");
  }
  const result = await response.json();
  return result.data;
};

const SubscriptionsManagement = () => {
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription",
        variant: "destructive",
      });
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: () => sendNewsletter(subject, content),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Newsletter sent successfully",
      });
      setShowNewsletterDialog(false);
      setSubject("");
      setContent("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      deleteSubscriptionMutation.mutate(id);
    }
  };

  const handleSendNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast({
        title: "Error",
        description: "Please provide both subject and content",
        variant: "destructive",
      });
      return;
    }
    sendNewsletterMutation.mutate();
  };

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Subscriptions</h1>
        <Button 
          onClick={() => setShowNewsletterDialog(true)}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Newsletter
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-500">
              Total Subscribers: <span className="font-semibold">{subscriptions.length}</span>
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading subscriptions...</div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? "No subscriptions match your search" : "No subscriptions found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Subscribed On</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{subscription.email}</td>
                    <td className="py-3 px-4">
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subscription.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {subscription.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subscription._id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Newsletter Dialog */}
      <Dialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Compose and send a newsletter to all active subscribers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNewsletter}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter newsletter subject"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border rounded-md h-48"
                  placeholder="Enter newsletter content"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewsletterDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={sendNewsletterMutation.isPending}
              >
                {sendNewsletterMutation.isPending ? "Sending..." : "Send Newsletter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement; 