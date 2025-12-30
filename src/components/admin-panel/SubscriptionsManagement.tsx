import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Mail, Edit, Eye, Users, FileText, CheckSquare, Filter, Mailbox, BellOff, Bell, MessageSquare, ThumbsUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import StatsCard from "@/components/common/StatsCard";
import PageHeader from "@/components/common/PageHeader";
import { Pagination } from "../common/Pagination";
import SearchBar from "@/components/common/SearchBar";

interface Subscription {
  id: string;
  email: string;
  whatsapp_no: string;
  make_ref: {
    id: string;
    name: string;
  };
  model: string;
  budget_range: {
    from_range: number;
    to_range: number;
  };
  year_range: {
    from_range: number;
    to_range: number;
  };
  body_type_ref: {
    id: string;
    name: string;
  };
  channel: "Email" | "Whatsapp" | "All";
  unsubscribe: boolean;
  created_at: string;
  updated_at: string;
}

interface Feedback {
  id: string;
  email: string;
  message: string;
  created_at: string;
}

interface PaginatedResponse {
  total_items: number;
  total_pages: number;
  page: number;
  size: number;
  items: Subscription[];
}

interface UpdateSubscriptionParams {
  ids: string[];
  unsubscribe?: boolean;
  channel?: string;
}

const fetchSubscriptions = async (page: number = 1, size: number = 20): Promise<PaginatedResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/subscriptions/admin/?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
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
  return await response.json();
};

const updateSubscription = async (params: UpdateSubscriptionParams): Promise<{ success: boolean; detail: string }> => {
  const queryParams = new URLSearchParams();
  if (params.unsubscribe !== undefined) {
    queryParams.append("unsubscribe", params.unsubscribe.toString());
  }
  if (params.channel) {
    queryParams.append("channel", params.channel);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL1}subscriptions/admin/update?${queryParams.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
      body: JSON.stringify(params.ids),
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to update subscription");
  }
  return await response.json();
};

const sendNewsletter = async (subject: string, content: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL1}subscriptions/admin/send-newsletter`,
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

const fetchFeedbacks = async (): Promise<Feedback[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL1}feedbacks`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch feedbacks");
  }
  return await response.json();
};

const deleteFeedback = async (id: string): Promise<{ success: boolean; detail: string }> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL1}feedbacks/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to delete feedback");
  }
  return await response.json();
};

const SubscriptionsManagement = () => {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "feedbacks">("subscriptions");

  // Subscriptions states
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updateChannel, setUpdateChannel] = useState<string>("");
  const [updateUnsubscribe, setUpdateUnsubscribe] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { toast: shadcnToast } = useToast();
  const queryClient = useQueryClient();

  const { data: paginatedData, isLoading: subscriptionsLoading } = useQuery<PaginatedResponse>({
    queryKey: ["subscriptions", page, size],
    queryFn: () => fetchSubscriptions(page, size),
    enabled: activeTab === "subscriptions",
  });

  const { data: feedbacks, isLoading: feedbacksLoading } = useQuery<Feedback[]>({
    queryKey: ["feedbacks"],
    queryFn: fetchFeedbacks,
    enabled: activeTab === "feedbacks",
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(data.detail || "Subscription updated successfully");
      setShowUpdateDialog(false);
      setSelectedIds([]);
      setUpdateChannel("");
      setUpdateUnsubscribe("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: () => sendNewsletter(subject, content),
    onSuccess: () => {
      toast.success("Newsletter sent successfully");
      setShowNewsletterDialog(false);
      setSubject("");
      setContent("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send newsletter");
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      toast.success(data.detail || "Feedback deleted successfully");
      setShowFeedbackDetails(false);
      setSelectedFeedback(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete feedback");
    },
  });

  const handleUnsubscribe = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "unsubscribe" : "resubscribe";

    toast.custom((t) => (
      <div className="bg-white p-6 rounded-lg shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          {newStatus ? "Unsubscribe" : "Resubscribe"} Confirmation
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to {action} this subscription?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            variant={newStatus ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              updateSubscriptionMutation.mutate({
                ids: [id],
                unsubscribe: newStatus
              });
              toast.dismiss(t);
            }}
          >
            {newStatus ? "Unsubscribe" : "Resubscribe"}
          </Button>
        </div>
      </div>
    ));
  };

  const handleBulkUnsubscribe = (unsubscribe: boolean) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one subscription");
      return;
    }

    const action = unsubscribe ? "unsubscribe" : "resubscribe";

    toast.custom((t) => (
      <div className="bg-white p-6 rounded-lg shadow-lg border max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          Bulk {unsubscribe ? "Unsubscribe" : "Resubscribe"} Confirmation
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to {action} {selectedIds.length} selected subscription(s)?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            variant={unsubscribe ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              updateSubscriptionMutation.mutate({
                ids: selectedIds,
                unsubscribe
              });
              toast.dismiss(t);
            }}
          >
            {unsubscribe ? "Unsubscribe All" : "Resubscribe All"}
          </Button>
        </div>
      </div>
    ));
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsDialog(true);
  };

  const handleBulkUpdate = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one subscription to update");
      return;
    }
    setShowUpdateDialog(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateChannel && !updateUnsubscribe) {
      toast.error("Please select at least one field to update");
      return;
    }

    const params: UpdateSubscriptionParams = {
      ids: selectedIds,
    };

    if (updateChannel) {
      params.channel = updateChannel;
    }
    if (updateUnsubscribe) {
      params.unsubscribe = updateUnsubscribe === "true";
    }

    updateSubscriptionMutation.mutate(params);
  };

  const handleSendNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast.error("Please provide both subject and content");
      return;
    }
    sendNewsletterMutation.mutate();
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (paginatedData?.items) {
      if (selectedIds.length === paginatedData.items.length) {
        setSelectedIds([]);
      } else {
        setSelectedIds(paginatedData.items.map(sub => sub.id));
      }
    }
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackDetails(true);
  };


  const filteredSubscriptions = paginatedData?.items?.filter((subscription) =>
    subscription.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscription.whatsapp_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscription.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredFeedbacks = feedbacks?.filter((feedback) =>
    feedback.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.message.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownloadCSV = () => {
    if (filteredSubscriptions.length === 0) {
      toast.error("No subscriptions to download");
      return;
    }

    const headers = [
      "Email",
      "Phone",
      "Make",
      "Model",
      "Budget From",
      "Budget To",
      "Year From",
      "Year To",
      "Body Type",
      "Channel",
      "Status",
      "Created At"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredSubscriptions.map(sub => [
        `"${sub.email}"`,
        `"${sub.whatsapp_no}"`,
        `"${sub.make_ref.name}"`,
        `"${sub.model || ''}"`,
        sub.budget_range?.from_range || '',
        sub.budget_range?.to_range || '',
        sub.year_range?.from_range || '',
        sub.year_range?.to_range || '',
        `"${sub.body_type_ref?.name || ''}"`,
        sub.channel,
        sub.unsubscribe ? "Unsubscribed" : "Subscribed",
        new Date(sub.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Subscriptions and feedback Management"
        description="Manage subscriptions and user feedbacks"
        icon={MessageSquare}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "subscriptions" | "feedbacks")} className="w-full">
        <TabsList className="inline-flex items-center bg-transparent p-0 h-auto mb-6 w-full border-b justify-around">
          <TabsTrigger
            value="subscriptions"
            className="relative px-4 pb-3 pt-2 bg-transparent data-[state=active]:text-dealership-primary data-[state=active]:shadow-none hover:text-dealership-primary/80 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Mailbox className="w-4 h-4" />
              <span className="relative">
                Subscriptions
                <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-dealership-primary transition-all duration-300 ease-out transform scale-x-0 group-data-[state=active]:scale-x-100 origin-center" />
              </span>
              {paginatedData && (
                <Badge variant="secondary" className="ml-2">
                  {paginatedData.total_items}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="feedbacks"
            className="relative px-4 pb-3 pt-2 bg-transparent data-[state=active]:text-dealership-primary data-[state=active]:shadow-none hover:text-dealership-primary/80 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span className="relative">
                Feedbacks
                <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-dealership-primary transition-all duration-300 ease-out transform scale-x-0 group-data-[state=active]:scale-x-100 origin-center" />
              </span>
              {feedbacks && (
                <Badge variant="secondary" className="ml-2">
                  {feedbacks.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setShowNewsletterDialog(true)}
              variant="default"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Newsletter
            </Button>
            <Button
              onClick={handleBulkUpdate}
              variant="outline"
              className="flex items-center gap-2"
              disabled={selectedIds.length === 0}
            >
              <Edit className="w-4 h-4" />
              Bulk Update ({selectedIds.length})
            </Button>
            <Button
              onClick={() => handleBulkUnsubscribe(true)}
              variant="destructive"
              className="flex items-center gap-2"
              disabled={selectedIds.length === 0}
            >
              <BellOff className="w-4 h-4" />
              Unsubscribe All
            </Button>
            <Button
              onClick={() => handleBulkUnsubscribe(false)}
              variant="default"
              className="flex items-center gap-2"
              disabled={selectedIds.length === 0}
            >
              <Bell className="w-4 h-4" />
              Resubscribe All
            </Button>
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Subscribers"
              value={paginatedData?.total_items || 0}
              icon={Users}
              variant="blue"
            />
            <StatsCard
              title="Current Page"
              value={paginatedData?.page || 1}
              icon={FileText}
              variant="green"
            />
            <StatsCard
              title="Total Pages"
              value={paginatedData?.total_pages || 1}
              icon={Filter}
              variant="purple"
            />
            <StatsCard
              title="Selected"
              value={selectedIds.length}
              icon={CheckSquare}
              variant="orange"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">
              <div className="w-full sm:w-1/3">
                <SearchBar
                  value={searchQuery}
                  onChange={(val: string) => setSearchQuery(val)}
                  placeholder="Search by email, phone, or model"
                />
              </div>
            </div>

            {subscriptionsLoading ? (
              <div className="text-center py-4">Loading subscriptions...</div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? "No subscriptions match your search" : "No subscriptions found"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white table-auto text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={paginatedData?.items && selectedIds.length === paginatedData.items.length}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="py-3 px-4 text-left">Email</th>
                        <th className="py-3 px-4 text-left">Phone</th>
                        <th className="py-3 px-4 text-left">Make/Model</th>
                        <th className="py-3 px-4 text-left">Channel</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(subscription.id)}
                              onChange={() => handleCheckboxChange(subscription.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{subscription.email}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{subscription.whatsapp_no}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>
                              <span className="font-medium">{subscription.make_ref.name}</span>
                              {subscription.model && (
                                <span className="text-gray-500 ml-2">/ {subscription.model}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant="outline">{subscription.channel}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <Badge
                              variant={subscription.unsubscribe ? "destructive" : "default"}
                              className={subscription.unsubscribe ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                            >
                              {subscription.unsubscribe ? "Unsubscribed" : "Subscribed"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(subscription)}
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsubscribe(subscription.id, subscription.unsubscribe)}
                              className={subscription.unsubscribe ? "text-green-600 hover:text-green-900 hover:bg-green-50" : "text-red-600 hover:text-red-900 hover:bg-red-50"}
                            >
                              {subscription.unsubscribe ? (
                                <Bell className="w-4 h-4" />
                              ) : (
                                <BellOff className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {paginatedData && paginatedData.total_pages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Showing {((page - 1) * size) + 1} to {Math.min(page * size, paginatedData.total_items)} of {paginatedData.total_items} entries
                    </div>
                    <Pagination
                      currentPage={page}
                      totalPages={paginatedData.total_pages}
                      onPageChange={(p: number) => setPage(p)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedbacks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total Feedbacks"
              value={feedbacks?.length || 0}
              icon={MessageSquare}
              variant="blue"
            />
            <StatsCard
              title="Today's Feedbacks"
              value={feedbacks?.filter(f => {
                const today = new Date().toDateString();
                const feedbackDate = new Date(f.created_at).toDateString();
                return today === feedbackDate;
              }).length || 0}
              icon={FileText}
              variant="green"
            />
            <StatsCard
              title="This Month"
              value={feedbacks?.filter(f => {
                const now = new Date();
                const feedbackDate = new Date(f.created_at);
                return now.getMonth() === feedbackDate.getMonth() &&
                  now.getFullYear() === feedbackDate.getFullYear();
              }).length || 0}
              icon={Filter}
              variant="purple"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">
              <div className="w-full sm:w-1/3">
                <SearchBar
                  value={searchQuery}
                  onChange={(val: string) => setSearchQuery(val)}
                  placeholder="Search by email or message"
                />
              </div>
            </div>

            {feedbacksLoading ? (
              <div className="text-center py-4">Loading feedbacks...</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery ? "No feedbacks match your search" : "No feedbacks found"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{feedback.email}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(feedback.created_at).toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {new Date(feedback.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{feedback.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFeedback(feedback)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Newsletter Dialog */}
      <Dialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Compose and send a newsletter to all active subscribers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNewsletter}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter newsletter subject"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter newsletter content"
                  className="min-h-[200px]"
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

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscriptions</DialogTitle>
            <DialogDescription>
              Update {selectedIds.length} selected subscription(s)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select value={updateChannel} onValueChange={setUpdateChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Whatsapp">Whatsapp</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current channel</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unsubscribe">Status</Label>
                <Select
                  value={updateUnsubscribe}
                  onValueChange={setUpdateUnsubscribe}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="true">Unsubscribe</SelectItem>
                    <SelectItem value="false">Subscribe</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current status</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSubscriptionMutation.isPending}
              >
                {updateSubscriptionMutation.isPending ? "Updating..." : "Update Subscriptions"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subscription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Detailed information about the subscription
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm">{selectedSubscription.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm">{selectedSubscription.whatsapp_no}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Make</p>
                      <p className="text-sm">{selectedSubscription.make_ref.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Model</p>
                      <p className="text-sm">{selectedSubscription.model || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Body Type</p>
                      <p className="text-sm">{selectedSubscription.body_type_ref.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Channel</p>
                      <Badge variant="outline">{selectedSubscription.channel}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Budget Range</p>
                      <p className="text-sm">
                        ${selectedSubscription.budget_range.from_range.toLocaleString()} - ${selectedSubscription.budget_range.to_range.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Year Range</p>
                      <p className="text-sm">
                        {selectedSubscription.year_range.from_range} - {selectedSubscription.year_range.to_range}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge
                        variant={selectedSubscription.unsubscribe ? "destructive" : "default"}
                        className={selectedSubscription.unsubscribe ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                      >
                        {selectedSubscription.unsubscribe ? "Unsubscribed" : "Subscribed"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm">
                        {new Date(selectedSubscription.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm">
                        {new Date(selectedSubscription.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Details Dialog */}
      <Dialog open={showFeedbackDetails} onOpenChange={setShowFeedbackDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View detailed feedback information
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedFeedback.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <div className="flex gap-4">
                      <Badge variant="outline">
                        {new Date(selectedFeedback.created_at).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline">
                        {new Date(selectedFeedback.created_at).toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Message</p>
                    <div className="mt-2 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="flex justify-between">

            <Button onClick={() => setShowFeedbackDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;