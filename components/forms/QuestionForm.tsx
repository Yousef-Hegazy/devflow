"use client";

import { Question } from "@/lib/appwrite/types/appwrite";
import {
  AskQuestionSchema,
  AskQuestionSchemaType,
} from "@/lib/validators/questionSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import MarkdownEditor from "../MarkdownEditor";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Form } from "../ui/form";
import ControlledField from "./ControlledField";

type Props = {
  question?: Question;
};

const QuestionForm = ({ question }: Props) => {
  const { control, handleSubmit } = useForm<AskQuestionSchemaType>({
    resolver: zodResolver(AskQuestionSchema),
    mode: "all",
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.tag.title) || [],
    },
  });

  const onSubmit = (data: AskQuestionSchemaType) => {
    console.log(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="gap-10">
      <ControlledField
        control={control}
        name="title"
        description="Be specific and imagine you're asking a question to another person"
      />

      <Controller
        control={control}
        name="content"
        render={({ field, fieldState: { invalid, error } }) => (
          <Field className="flex flex-col items-start gap-2" invalid={invalid}>
            <FieldLabel>Content</FieldLabel>

            <MarkdownEditor
              ref={field.ref}
              markdown={field.value!}
              onChange={field.onChange}
              className="w-full text-neutral-100!"
              placeholder="Explain your question in detail..."
            />
            
            <FieldDescription>
              Introduce the problem and expand on what you put in the title
            </FieldDescription>
            {invalid ? (
              <span className="text-destructive text-xs">{error?.message}</span>
            ) : null}
          </Field>
        )}
      />

      <ControlledField
        control={control}
        name="tags"
        description="Add up to 3 tags to describe what your question is about"
        placeholder="e.g. javascript, react, web-development"
      />

      <div className="mt-16 flex justify-end">
        <Button
          type="submit"
          className="primary-gradient text-light-900 w-fit border-0 py-4"
          size="xl"
        >
          Ask Question
        </Button>
      </div>
    </Form>
  );
};

export default QuestionForm;
