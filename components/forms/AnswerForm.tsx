"use client";

import { useAIAnswer, useAnswerQuestion } from "@/lib/queries/questions";
import {
  AIAnswerSchema,
  AnswerSchema,
  AnswerSchemaType,
} from "@/lib/validators/questionSchemas";
import useAuthStore from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import Image from "next/image";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import MarkdownEditor from "../MarkdownEditor";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Form } from "../ui/form";
import LoadingButton from "../ui/LoadingButton";
import { toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

type Props = {
  initialContent?: string;
  questionId: string;
  questionTitle?: string;
  questionContent?: string;
};

const AnswerForm = ({
  initialContent = "",
  questionId,
  questionTitle = "",
  questionContent = "",
}: Props) => {
  const user = useAuthStore((state) => state.user);
  const editorRef = useRef<MDXEditorMethods>(null);
  const { control, handleSubmit, setValue, getValues } =
    useForm<AnswerSchemaType>({
      resolver: zodResolver(AnswerSchema),
      mode: "all",
      defaultValues: {
        content: initialContent,
      },
    });

  const { mutate: answerQuestion, isPending: isAnswering } =
    useAnswerQuestion();

  const { mutate: generateAIAnswer, isPending: isGeneratingAIAnswer } =
    useAIAnswer();

  const onSubmit = (data: AnswerSchemaType) =>
    answerQuestion(
      { answer: data, questionId },
      {
        onSuccess: () => {
          setValue("content", "");
          if (editorRef.current) {
            editorRef.current.setMarkdown("");
          }
        },
      },
    );

  const onGenerateAIAnswer = async () => {
    if (!user?.$id) {
      toastManager.add({
        title: "Authentication Required",
        description: "You must be logged in to generate an AI answer.",
        type: "info",
      });
      return;
    }

    const content = getValues("content");

    const validated = AIAnswerSchema.partial().safeParse({
      answer: content,
    });

    if (!validated.success) {
      const err = z.treeifyError(validated.error).properties?.answer
        ?.errors?.[0];
      toastManager.add({
        title: "Please check your answer",
        description: err || "Please check your input and try again.",
        type: "error",
      });

      return;
    }

    if (editorRef.current) {
      generateAIAnswer(
        {
          content: questionContent,
          question: questionTitle,
          answer: content,
        },
        {
          onSuccess: (data) => {
            const formatted = data.text.replace(/<br>/g, " ").toString().trim();

            setValue("content", formatted);
            if (editorRef.current) {
              editorRef.current.setMarkdown(formatted);
            }
          },
        },
      );
    }
  };

  return (
    // eslint-disable-next-line react-hooks/refs
    <Form onSubmit={handleSubmit(onSubmit)} className="gap-6">
      <div className="flex items-center justify-end">
        <Tooltip disabled={!!user?.$id}>
          <TooltipTrigger
            render={
              <LoadingButton
                className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
                type="button"
                isLoading={isGeneratingAIAnswer}
                disabled={isGeneratingAIAnswer || !user?.$id}
                onClick={onGenerateAIAnswer}
              >
                <Image
                  src="/icons/stars.svg"
                  alt="Improve Answer with AI"
                  width={12}
                  height={12}
                  className="object-contain"
                />
                Improve Answer with AI
              </LoadingButton>
            }
          />

          <TooltipPopup>Must be logged in to use this feature.</TooltipPopup>
        </Tooltip>
      </div>

      <Controller
        control={control}
        name="content"
        render={({ field, fieldState: { invalid, error } }) => (
          <Field className="flex flex-col items-start gap-2" invalid={invalid}>
            <FieldLabel>Your Answer</FieldLabel>

            <MarkdownEditor
              ref={(ref) => {
                field.ref(ref);
                editorRef.current = ref;
              }}
              markdown={field.value || ""}
              onChange={field.onChange}
              placeholder="Write your answer here..."
              className="w-full text-neutral-100!"
            />

            <FieldDescription>
              Be detailed and explain the reasoning behind your answer.
            </FieldDescription>
            {invalid ? (
              <span className="text-destructive text-xs">{error?.message}</span>
            ) : null}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <LoadingButton
          isLoading={isAnswering}
          type="submit"
          className="primary-gradient text-light-900 w-fit border-0 py-3"
          size="lg"
        >
          Post Answer
        </LoadingButton>
      </div>
    </Form>
  );
};

export default AnswerForm;
