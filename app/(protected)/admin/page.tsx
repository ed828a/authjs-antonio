"use client";
import { admin } from "@/actions/admin";
import FormSuccess from "@/components/FormSuccess";
import RoleGate from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import React from "react";
import { toast } from "sonner";

const AdminPage = () => {
  const role = useCurrentRole();

  const onApiRouteClick = async () => {
    const response = await fetch("/api/admin");
    console.log("response.status", response.status);
    console.log("response.statusText", response.statusText);
    console.log("response", response);

    if (response.ok) {
      toast.success("Allowed API route!");
    } else {
      toast.error(`Status: ${response.status}  --- Forbidden API Route!`);
    }

    const data = await response.json();
    console.log("data: ", data);
  };

  const onServerActionClick = () => {
    admin().then((data) => {
      if (data.error) {
        toast.error(data.error);
      }

      if (data.success) {
        toast.success(data.success);
      }
    });
  };

  return (
    <div>
      <Card className="w-[600px] shadow-md">
        <CardHeader>
          <p className="text-2xl font-semibold text-center">🔑 Admin</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RoleGate allowedRole={UserRole.ADMIN}>
            <FormSuccess message="You do have permission to view this content!" />
            <div className="flex flex-row items-center justify-between rounded-lg  p-3">
              <p className="text-sm font-medium">Current Role</p>
              <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
                {role}
              </p>
            </div>
          </RoleGate>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
            <p className="text-sm font-medium">Admin-only API Route</p>
            <Button onClick={onApiRouteClick}>Click to test</Button>
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
            <p className="text-sm font-medium">Admin-only Server Action</p>
            <Button onClick={onServerActionClick}>Click to test</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
