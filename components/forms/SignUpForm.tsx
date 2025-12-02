"use client";

import { SignUpSchema, SignUpSchemaType } from "@/lib/validators/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import ControlledField from "./ControlledField";
import ControlledPasswordField from "./ControlledPasswordField";
import Link from "next/link";

const SignUpForm = () => {
  const { handleSubmit, control } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    mode: "all",
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpSchemaType) => {
    console.log(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ControlledField
        control={control}
        name="username"
        placeholder="Enter your username"
        autoComplete="username"
      />

      <ControlledField
        control={control}
        name="name"
        placeholder="Enter your name"
        autoComplete="name"
      />

      <ControlledField
        control={control}
        name="email"
        placeholder="Enter your email"
        autoComplete="email"
      />

      <ControlledPasswordField
        control={control}
        name="password"
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        className="primary-gradient paragraph-medium rounded-2 font-inter text-light-900! min-h-12 w-full border-none px-4 py-3"
      >
        Sign Up
      </Button>

      <div className="flex items-center justify-start gap-1">
        <p>Already have an account?</p>
        <Button
          render={<Link className="paragraph-medium primary-text-gradient!" href="/sign-in" />}
          className="p-0"
          variant="link"
        >
          Sign In
        </Button>
      </div>
    </Form>
  );
};

export default SignUpForm;
