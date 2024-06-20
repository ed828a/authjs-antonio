import { auth, signOut } from "@/auth";

import React from "react";

type Props = {};

const SettingPage = async (props: Props) => {
  const session = await auth();

  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="bg-black text-white" type="submit">
          Sign Out
        </button>
      </form>
    </div>
  );
};

export default SettingPage;
