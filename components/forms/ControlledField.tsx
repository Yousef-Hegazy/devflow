"use client";

import { cn } from "@/lib/utils";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input, InputProps } from "../ui/input";

interface ControlledFieldProps<TFieldValues extends FieldValues>
  extends InputProps {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  type?: string;
}

const ControlledField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder = "",
  type = "text",
  className,
  ...props
}: ControlledFieldProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { invalid, error } }) => (
        <Field className="flex flex-col items-start gap-2">
          <FieldLabel className="capitalize">{label || name}</FieldLabel>
          <Input
            {...field}
            className={cn("min-h-12", className)}
            type={type}
            placeholder={placeholder}
            size="lg"
            aria-invalid={invalid}
            {...props}
          />
          {invalid ? (
            <span className="text-destructive text-xs">{error?.message}</span>
          ) : null}
        </Field>
      )}
    />
  );
};

export default ControlledField;
