"use client";

import { User } from "@/db/schema-types";
import useAuthStore from "@/stores/authStore";
import { useEffect, useEffectEvent } from "react";

type Props = {
  user: User | null;
};

const AuthHydrator = ({ user }: Props) => {
  const setUser = useAuthStore((state) => state.setUser);

  const setUserEvent = useEffectEvent((user: User | null) => {
    setUser(user);
  });

  useEffect(() => {
    setUserEvent(user);
  }, [user]);

  return null;
};

export default AuthHydrator;
