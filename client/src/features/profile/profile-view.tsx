"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Shield, Key, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { ApiResponse } from "@/types";

export function ProfileView() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    toast({
      type: "success",
      title: "Logged out",
      description: "You have signed out of your session.",
    });
    window.location.href = "/login";
  };

  // Form states for profile info
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Form states for password changes
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Fetch user profile from database
  const { data: profileRes, isLoading } = useQuery<ApiResponse<any>>({
    queryKey: ["userProfile"],
    queryFn: () => ApiClient.get<ApiResponse<any>>("/user/profile"),
  });

  const profile = profileRes?.data;

  // Initialize fields once query returns user data
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  // Profile Save Mutation
  const saveProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      ApiClient.patch<ApiResponse<any>>("/user/profile", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        type: "success",
        title: "Profile saved",
        description: "Your user details have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        type: "error",
        title: "Update failed",
        description: error.message || "Failed to update profile.",
      });
    },
  });

  // Password Update Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      ApiClient.patch<ApiResponse<any>>("/user/profile", data),
    onSuccess: () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        type: "success",
        title: "Password updated",
        description: "Your security credentials have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        type: "error",
        title: "Password update failed",
        description: error.message || "Incorrect current password.",
      });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ type: "error", title: "Validation Error", description: "Name and email are required." });
      return;
    }
    saveProfileMutation.mutate({ name, email });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast({ type: "error", title: "Validation Error", description: "All password fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      toast({ type: "error", title: "Validation Error", description: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ type: "error", title: "Validation Error", description: "New passwords do not match." });
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  if (isLoading) {
    return <div className="text-zinc-400 text-sm">Loading profile settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">User Profile</h2>
        <p className="text-xs text-zinc-400">View and update your personal account settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Info Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-glow">
                {name.charAt(0).toUpperCase() || "M"}
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-100">{name}</h3>
                <p className="text-xs text-zinc-400">{email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge color="#10B981">Active Account</Badge>
                  <span className="text-[11px] text-zinc-500">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 2026}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={saveProfileMutation.isPending}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span>Update Password</span>
          </h3>

          <form onSubmit={handleSavePassword} className="space-y-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Current Password</label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                leftIcon={<Shield className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">New Password</label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Key className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Key className="h-4 w-4 text-zinc-400" />}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={changePasswordMutation.isPending} className="shadow-glow">
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
