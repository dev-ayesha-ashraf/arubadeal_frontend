import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Mail, Phone, Car, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  name: string;
  email: string;
  whatsapp_no: string;
  message: string;
  vehical_id: string;
  is_read: boolean;
  created_at?: string; // Assuming there might be a date field, if not I'll handle it
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token")?.replace(/(^"|"$)/g, "");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/messages`, {
        headers: {
          "Authorization": `Bearer ${token || ""}`,
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error("Not authenticated");
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: number, currentStatus: boolean) => {
    // Note: The prompt didn't specify a PUT endpoint for is_read, 
    // but the schema implies it's a field. I'll implement a local state update 
    // for now to provide feedback, assuming a PUT may exist or be added.
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, is_read: !currentStatus } : msg
    ));

    toast({
      title: "Success",
      description: `Marked as ${!currentStatus ? 'read' : 'unread'}`,
    });
  };

  const handleDeleteMessage = (id: number) => {
    // Local delete for now
    setMessages(messages.filter((msg) => msg.id !== id));
    toast({
      title: "Success",
      description: "Message removed from view",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-dealership-primary" />
        <p className="text-slate-500 font-medium">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inquiry Messages</h1>
            <p className="text-slate-500 mt-1">Manage customer inquiries from car listings</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchMessages}
            className="bg-white"
          >
            Refresh
          </Button>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No messages yet</h3>
            <p className="text-slate-500 mt-1">Customer inquiries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${message.is_read ? "opacity-75" : "border-l-4 border-l-dealership-primary"
                  }`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between lg:justify-start lg:gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-900">{message.name}</h3>
                          {!message.is_read && (
                            <Badge className="bg-dealership-primary text-[10px] h-4">NEW</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <a href={`mailto:${message.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {message.email}
                          </a>
                          {message.whatsapp_no && (
                            <span className="text-sm text-slate-600 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {message.whatsapp_no}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-700 leading-relaxed">
                      "{message.message}"
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                        <Car className="w-3.5 h-3.5 text-dealership-primary" />
                        Vehicle ID: <span className="text-slate-900 uppercase">{message.vehical_id}</span>
                      </div>
                      {/* {message.created_at && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                      )} */}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 justify-end lg:justify-start lg:min-w-[140px]">
                    <Button
                      variant={message.is_read ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => handleToggleRead(message.id, message.is_read)}
                      className={message.is_read ? "text-slate-400" : "border-dealership-primary text-dealership-primary hover:bg-dealership-primary/5"}
                    >
                      {message.is_read ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Read
                        </>
                      ) : (
                        "Mark as Read"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
