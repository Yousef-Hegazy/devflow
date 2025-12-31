import LeftSidebar from "@/components/navigation/LeftSidebar";
import Navbar from "@/components/navigation/navbar";
import RightSidebar from "@/components/navigation/RightSidebar";
import { getCurrentUser } from "@/lib/server";

import React from "react";

type Props = {
  children: React.ReactNode;
};

const RootLayout = async ({ children }: Props) => {
  const user = await getCurrentUser();

  return (
    <main className="background-light850_dark100 relative">
      <Navbar user={user} />

      <div className="flex">
        <LeftSidebar user={user} />

        <section className="flex min-h-screen flex-1 flex-col px-6 pt-36 pb-6 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </section>

        <RightSidebar />
      </div>
    </main>
  );
};

export default RootLayout;
