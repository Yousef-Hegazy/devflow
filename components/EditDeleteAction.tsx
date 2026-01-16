"use client";

import { useDeleteAnswer, useDeleteQuestion } from "@/lib/queries/questions";
import { cn } from "@/lib/utils";
import useAlertDialogStore from "@/stores/alertDialogStore";
import useAuthStore from "@/stores/authStore";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import LoadingButton from "./ui/LoadingButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
  type: "question" | "answer";
  itemId: string;
  questionId?: string;
  className?: string;
};

const EditDeleteAction = ({ type, itemId, questionId, className }: Props) => {
  const currentUser = useAuthStore((s) => s.user);

  const openConfirm = useAlertDialogStore((s) => s.onOpen);

  const { mutate: deleteQuestion, isPending: isDeletingQuestion } =
    useDeleteQuestion();
  const { mutate: deleteAnswer, isPending: isDeletingAnswer } =
    useDeleteAnswer();

  const handleDelete = () => {
    if (!currentUser) return;

    openConfirm({
      title: `Delete ${type}`,
      description: `Are you sure you want to delete this ${type}? This action cannot be undone. This will permanently remove the ${type} from our servers.`,
      actions: [
        {
          children: (
            <>
              <Trash /> Delete
            </>
          ),
          variant: "destructive",
          onClick: () =>
            type === "question"
              ? deleteQuestion({ questionId: itemId, userId: currentUser.id })
              : deleteAnswer({ answerId: itemId, userId: currentUser.id }),
        },
      ],
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 max-sm:w-full",
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <LoadingButton
              size="icon"
              onClick={handleDelete}
              isLoading={isDeletingQuestion || isDeletingAnswer}
              variant="ghost"
            >
              <Trash className="text-rose-600" />
            </LoadingButton>
          }
        />
        <TooltipContent>Delete {type}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              disabled={isDeletingQuestion || isDeletingAnswer}
              variant="ghost"
              render={
                <Link
                  href={
                    type === "question"
                      ? `/questions/${itemId}/update`
                      : `/questions/${questionId}?editAnswer=${itemId}#answerForm`
                  }
                />
              }
            >
              <Pencil className="text-green-600" />
            </Button>
          }
        />
        <TooltipContent>Edit {type}</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default EditDeleteAction;
