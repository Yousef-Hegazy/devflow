"use client";

import { Question } from "@/lib/types/appwrite";
import { useCreateQuestion, useUpdateQuestion } from "@/lib/queries/questions";
import {
  AskQuestionSchema,
  AskQuestionSchemaType,
} from "@/lib/validators/questionSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import TagCard from "../cards/TagCard";
import MarkdownEditor from "../MarkdownEditor";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import LoadingButton from "../ui/LoadingButton";
import ControlledField from "./ControlledField";

type Props = {
  question?: Question;
  userId: string;
};

const QuestionForm = ({ question, userId }: Props) => {
  const { control, handleSubmit, setError, clearErrors } =
    useForm<AskQuestionSchemaType>({
      resolver: zodResolver(AskQuestionSchema),
      mode: "all",
      defaultValues: {
        title: question?.title || "",
        content: question?.content || "",
        tags: question?.tags.map((tag) => tag.tag.title) || [],
      },
    });

  const { mutate: askQuestion, isPending: isCreatingQuestion } =
    useCreateQuestion();

  const { mutate: updateQuestion, isPending: isUpdatingQuestion } =
    useUpdateQuestion();

  const onSubmit = (data: AskQuestionSchemaType) =>
    question?.$id
      ? updateQuestion({
          userId,
          questionId: question.$id,
          question: data,
        })
      : askQuestion({ userId, question: data });

  function handleInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    field: ControllerRenderProps<
      {
        title: string;
        content: string;
        tags: string[];
      },
      "tags"
    >,
  ): void {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const value = input.value.trim();
      if (value === "" || value.length > 30) {
        setError("tags", {
          type: "manual",
          message: "Tag must be between 1 and 30 characters",
        });
        return;
      }

      if (field.value && field.value.length < 3) {
        if (field.value.includes(value)) {
          setError("tags", {
            type: "manual",
            message: "Tag already added",
          });
          return;
        }
        field.onChange(field.value ? [...field.value, value] : field.value);
        (e.target as HTMLInputElement).value = "";
        clearErrors("tags");
      } else {
        clearErrors("tags");
        return;
      }
      // setTagInputValue("");
    }
  }

  const handleTagRemove = (
    val: string,
    field: ControllerRenderProps<
      {
        title: string;
        content: string;
        tags: string[];
      },
      "tags"
    >,
  ) => {
    const newTags = field.value.filter((tag) => val !== tag);
    field.onChange(newTags);
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

      <Controller
        control={control}
        name="tags"
        render={({ field, fieldState: { invalid, error } }) => (
          <Field className="flex flex-col items-start gap-2" invalid={invalid}>
            <FieldLabel>Tags</FieldLabel>

            <Input
              className="min-h-12"
              type="text"
              placeholder="e.g. javascript, react, web-development"
              size="lg"
              aria-invalid={invalid}
              onKeyDown={(e) => handleInputKeyDown(e, field)}
            />

            <FieldDescription>
              Add up to 3 tags to describe what your question is about
            </FieldDescription>

            {field.value ? (
              <div className="flex w-full items-center justify-start gap-3">
                {field.value.map((tag) => (
                  <TagCard
                    key={tag}
                    name={tag}
                    $id={tag}
                    compact
                    showCount={false}
                    isButton
                    handleRemove={() => handleTagRemove(tag, field)}
                  />
                ))}
              </div>
            ) : null}

            {invalid ? (
              <span className="text-destructive text-xs">{error?.message}</span>
            ) : null}
          </Field>
        )}
      />
   

      <div className="mt-16 flex justify-end">
        <LoadingButton
          isLoading={isCreatingQuestion || isUpdatingQuestion}
          type="submit"
          className="primary-gradient text-light-900 w-fit border-0 py-4"
          size="xl"
        >
          {question?.$id ? "Update Question" : "Ask Question"}
        </LoadingButton>
      </div>
    </Form>
  );
};

export default QuestionForm;
