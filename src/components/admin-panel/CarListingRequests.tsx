import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, X, Clock, Loader2 } from "lucide-react";

interface CarRequest {
  id: string;
  ownerName: string;
  carModel: string;
  submittedAt: string;
  status: "Pending" | "In Review" | "Approved" | "Declined";
}

const dummyRequests: CarRequest[] = [
  { id: "1", ownerName: "Alice", carModel: "Toyota Corolla", submittedAt: "2025-10-01", status: "Pending" },
  { id: "2", ownerName: "Bob", carModel: "Honda Civic", submittedAt: "2025-10-03", status: "In Review" },
  { id: "3", ownerName: "Charlie", carModel: "Ford Mustang", submittedAt: "2025-10-05", status: "Approved" },
  { id: "4", ownerName: "David", carModel: "BMW X5", submittedAt: "2025-10-07", status: "Declined" },
];

const CarListingRequests = () => {
  const [requests, setRequests] = useState<CarRequest[]>(dummyRequests);

  const handleStatusChange = (id: string, newStatus: CarRequest["status"]) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Car Listing Requests</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left">Owner</th>
                <th className="py-3 px-4 text-left">Car Model</th>
                <th className="py-3 px-4 text-left">Submitted On</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{request.ownerName}</td>
                  <td className="py-3 px-4">{request.carModel}</td>
                  <td className="py-3 px-4">{new Date(request.submittedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "Declined"
                        ? "bg-red-100 text-red-800"
                        : request.status === "In Review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">Change Status</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white">
                        {["Pending", "In Review", "Approved", "Declined"].map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(request.id, status as CarRequest["status"])}
                          >
                            {status === "Approved" && <Check className="w-4 h-4 mr-2 text-green-500" />}
                            {status === "Declined" && <X className="w-4 h-4 mr-2 text-red-500" />}
                            {status === "In Review" && <Loader2 className="w-4 h-4 mr-2 text-yellow-500 animate-spin" />}
                            {status === "Pending" && <Clock className="w-4 h-4 mr-2 text-gray-500" />}
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarListingRequests;
