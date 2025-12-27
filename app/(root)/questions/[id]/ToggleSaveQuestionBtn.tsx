"use client";

import LoadingButton from "@/components/ui/LoadingButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useIsQuestionSavedByUser,
  useToggleSaveQuestion,
} from "@/lib/queries/questions";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

type Props = {
  questionId: string;
  userId: string;
};

const ToggleSaveQuestionBtn = ({ questionId, userId }: Props) => {
  const { data: isSaved, isPending: isSavedPending } = useIsQuestionSavedByUser(
    { userId, questionId },
  );
  const { mutate: saveQuestion, isPending: isSavePending } = useToggleSaveQuestion();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <LoadingButton
            wholeLoading
            isLoading={isSavedPending || isSavePending}
            size="icon-sm"
            variant="ghost"
            onClick={() => saveQuestion({ questionId, userId })}
          >
            {
              <Bookmark
                className={cn("text-primary-500 transition-all", {
                  "fill-primary-500": isSaved,
                })}
              />
            }
          </LoadingButton>
        }
      />

      <TooltipContent>
        {isSaved ? "Remove from collection" : "Add to collection"}
      </TooltipContent>
    </Tooltip>
  );
};

export default ToggleSaveQuestionBtn;
