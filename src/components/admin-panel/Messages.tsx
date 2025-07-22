import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Messages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "John Doe",
      subject: "BMW X5 2023",
      message:
        "I'm interested in this vehicle. Can you provide more information about its history?",
      isHidden: false,
    },
    {
      id: 2,
      author: "Jane Smith",
      subject: "Mercedes GLC 2023",
      message: "What is the best price you can offer for this model?",
      isHidden: false,
    },
    {
      id: 3,
      author: "Mike Johnson",
      subject: "Audi Q7 2023",
      message:
        "Is this vehicle still available? I would like to schedule a test drive.",
      isHidden: false,
    },
  ]);

  const { toast } = useToast();

  const handleHideMessage = (id: number) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, isHidden: !msg.isHidden } : msg
      )
    );
    toast({
      title: "Success",
      description: "Message visibility updated",
    });
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    toast({
      title: "Success",
      description: "Message deleted successfully",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messages & Comments</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bg-white p-4 rounded-lg shadow-md transition-opacity duration-200 ${
              message.isHidden ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{message.author}</p>
                <p className="text-sm text-gray-500">Re: {message.subject}</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHideMessage(message.id)}
                >
                  {message.isHidden ? "Show" : "Hide"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <p className="text-gray-600">{message.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
