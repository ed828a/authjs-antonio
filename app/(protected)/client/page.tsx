"use client";
import UserInfo from "@/components/auth/UserInfo";
import { useCurrentUser } from "@/hooks/use-current-user";
import React from "react";

type Props = {};

const ClientPage = (props: Props) => {
  const currentUser = useCurrentUser();
  return <UserInfo user={currentUser} label="💻 Client Component" />;
};

export default ClientPage;
