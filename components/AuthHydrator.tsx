"use client";

import { AppUser } from "@/lib/appwrite/types/appwrite";
import useAuthStore from "@/stores/authStore";
import { useEffect } from "react";

type Props = {
  user: AppUser | null;
};

const AuthHydrator = ({ user }: Props) => {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
};

export default AuthHydrator;
