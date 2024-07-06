import UserInfo from "@/components/auth/UserInfo";
import { getCurrentUser } from "@/lib/auth-lib";
import React from "react";

type Props = {};

const ServerPage = async (props: Props) => {
  const currentUser = await getCurrentUser();

  console.log("currentUser", currentUser);

  return <UserInfo user={currentUser} label="🖥️ Server Component" />;
};

export default ServerPage;
