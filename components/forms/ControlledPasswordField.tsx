"use client";

import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { InputProps } from "../ui/input";
import PasswordInput from "./PasswordInput";

interface ControlledFieldProps<TFieldValues extends FieldValues>
  extends InputProps {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
}

const ControlledPasswordField = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder = "",
  ...props
}: ControlledFieldProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { invalid, error } }) => (
        <Field invalid={invalid}>
          <FieldLabel className="capitalize">{label || name}</FieldLabel>
          <PasswordInput
            {...field}
            placeholder={placeholder}
            size="lg"
            {...props}
          />
          {invalid ? (
            <span className="text-xs text-red-600">{error?.message}</span>
          ) : null}
        </Field>
      )}
    />
  );
};

export default ControlledPasswordField;
