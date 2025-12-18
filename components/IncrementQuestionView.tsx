"use client";

import { increaseViewCount } from "@/actions/questions";
import { useQuery } from "@tanstack/react-query";

type Props = {
  questionId: string;
};

const IncrementQuestionView = ({ questionId }: Props) => {
  useQuery({
    queryKey: ["increase-question-views", questionId],
    queryFn: () => increaseViewCount(questionId),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!questionId,
    retry: 0,
  });
  return null;
};

export default IncrementQuestionView;
