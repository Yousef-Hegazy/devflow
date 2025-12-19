"use client";

import {
  AnswerSchema,
  AnswerSchemaType,
} from "@/lib/validators/questionSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import MarkdownEditor from "../MarkdownEditor";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Form } from "../ui/form";
import LoadingButton from "../ui/LoadingButton";

type Props = {
  initialContent?: string;
};

const AnswerForm = ({ initialContent = "" }: Props) => {
  const { control, handleSubmit, formState } = useForm<AnswerSchemaType>({
    resolver: zodResolver(AnswerSchema),
    mode: "all",
    defaultValues: {
      content: initialContent,
    },
  });

  const submit = async (data: AnswerSchemaType) => {
    console.log("Answer submitted:", data);
  };

  return (
    <Form onSubmit={handleSubmit(submit)} className="gap-6">
      <div className="flex items-center justify-end">
        <LoadingButton className="btn light-border-2 text-primary-500 dark:text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none">
          <Image
            src="/icons/stars.svg"
            alt="Generate AI Answer"
            width={12}
            height={12}
            className="object-contain"
          />
          Generate AI Answer
        </LoadingButton>
      </div>

      <Controller
        control={control}
        name="content"
        render={({ field, fieldState: { invalid, error } }) => (
          <Field className="flex flex-col items-start gap-2" invalid={invalid}>
            <FieldLabel>Your Answer</FieldLabel>

            <MarkdownEditor
              ref={field.ref}
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
          isLoading={formState.isSubmitting}
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
