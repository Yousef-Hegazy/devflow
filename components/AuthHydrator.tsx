"use client";

import { AppUser } from "@/lib/appwrite/types";
import useAuthStore from "@/stores/authStore";
import { useEffect, useEffectEvent } from "react";

type Props = {
  user: AppUser | null;
};

const AuthHydrator = ({ user }: Props) => {
  const setUser = useAuthStore((state) => state.setUser);

  const setUserEvent = useEffectEvent((user: AppUser | null) => {
    setUser(user);
  });

  useEffect(() => {
    setUserEvent(user);
  }, [user]);

  return null;
};

export default AuthHydrator;
