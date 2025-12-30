import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userRoleService, User, Role } from "@/services/user-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, Loader2, Users, Shield, Mail } from "lucide-react";
import StatsCard from "../common/StatsCard";
import SearchBar from "../common/SearchBar";
import PageHeader from "../common/PageHeader";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: () => userRoleService.listUsers(searchTerm),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => userRoleService.listRoles(),
  });

  const assignRoleMutation = useMutation({
    mutationFn: userRoleService.assignRole,
    onSuccess: () => {
      toast.success("Role updated successfully");
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to Update Role");
    },
  });

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) return;
    assignRoleMutation.mutate({
      user_id: selectedUser.id,
      role_id: selectedRole,
      site_id: "00000000-0000-0000-0000-000000000000",
    });
  };

  const handleRemoveRole = () => {
    if (!selectedUser) return;

    // Find the "user" role ID from the roles list
    const userRole = roles.find((role) => role.name.toLowerCase() === 'user');

    if (!userRole) {
      toast.error("User role not found");
      return;
    }

    // Use assignRole mutation to set the role to "user"
    assignRoleMutation.mutate({
      user_id: selectedUser.id,
      role_id: userRole.id,
      site_id: "00000000-0000-0000-0000-000000000000",
    });

    // Close the dialog after mutation
    setIsRemoveDialogOpen(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="User Management"
          description="Manage user roles and permissions"
          icon={Users}
        >
        </PageHeader>

        <div className="flex gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Total Users"
              value={users.length}
              icon={Users}
              variant="blue"
            />
            <StatsCard
              title="Total Roles"
              value={roles.length}
              icon={Shield}
              variant="green"
            />
          </div>
        </div>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search users by email..."
        className="mb-6"
      />

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-100">
              <TableHead className="font-semibold text-gray-700">User</TableHead>
              <TableHead className="font-semibold text-gray-700">Email</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-dealership-primary" />
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gray-200">
                        <AvatarFallback className="bg-dealership-primary text-white font-semibold">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.mid_name} {user.last_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAssignDialogOpen(true);
                        }}
                        className="hover:bg-dealership-primary/10 hover:text-dealership-primary hover:border-dealership-primary transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Update Role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsRemoveDialogOpen(true);
                        }}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Role
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      < Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen} >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-dealership-primary/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-dealership-primary" />
              </div>
              Update Role to {selectedUser?.first_name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {roles
                  .filter((role) => role.name.toLowerCase() !== 'superadmin')
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="capitalize">{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole || assignRoleMutation.isPending}
              className="bg-dealership-primary hover:bg-dealership-primary/90 text-white"
            >
              {assignRoleMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Remove Role
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700">
                Are you sure you want to remove the role from{" "}
                <span className="font-semibold text-gray-900">{selectedUser?.email}</span>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveRole}
              disabled={assignRoleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {assignRoleMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Remove Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;