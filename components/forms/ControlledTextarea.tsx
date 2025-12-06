"use client";

import { cn } from "@/lib/utils";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Textarea, TextareaProps } from "../ui/textarea";

interface ControlledTextareaProps<TFieldValues extends FieldValues>
  extends TextareaProps {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
}

const ControlledTextarea = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder = "",
  className,
  description,
  ...props
}: ControlledTextareaProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { invalid, error } }) => (
        <Field className="flex flex-col items-start gap-2" invalid={invalid}>
          <FieldLabel className="capitalize">{label || name}</FieldLabel>
          <Textarea
            {...field}
            className={cn("min-h-12", className)}
            placeholder={placeholder}
            size="lg"
            aria-invalid={invalid}
            {...props}
          />
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {invalid ? (
            <span className="text-destructive text-xs">{error?.message}</span>
          ) : null}
        </Field>
      )}
    />
  );
};

export default ControlledTextarea;
