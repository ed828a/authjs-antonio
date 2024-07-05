"use client";

import { logout } from "@/actions/logout";
import { useCurrentUser } from "@/hooks/use-current-user";
// import { useSession, signOut } from "next-auth/react";
// import { Session } from "next-auth/types";

import React, { useEffect, useState } from "react";

type Props = {};

const SettingPage = (props: Props) => {
  const user = useCurrentUser();

  return (
    <div className="bg-white p-10 rounded-xl">
      <button className="" type="button" onClick={async () => await logout()}>
        Sign Out
      </button>
    </div>
  );
};

export default SettingPage;
