"use client";

import { handleOAuthSuccess } from "@/actions/auth";
import { useQuery } from "@tanstack/react-query";

type Props = { userId: string; secret: string; provider: string };

const HandleOAuthSuccess = ({ userId, secret, provider }: Props) => {
  useQuery({
    queryKey: ["oauth-success", userId, secret, provider],
    queryFn: () => handleOAuthSuccess(userId, secret, provider),
  });

  return null;
};

export default HandleOAuthSuccess;
