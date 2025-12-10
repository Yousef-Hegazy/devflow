"use client";

import { useSignIn } from "@/lib/queries/auth";
import { SignInSchema, SignInSchemaType } from "@/lib/validators/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import LoadingButton from "../ui/LoadingButton";
import ControlledField from "./ControlledField";
import ControlledPasswordField from "./ControlledPasswordField";

const SignInForm = () => {
  const { handleSubmit, control } = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: signIn, isPending } = useSignIn();

  const onSubmit = (data: SignInSchemaType) => signIn(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
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

      <LoadingButton
        isLoading={isPending}
        type="submit"
        className="primary-gradient paragraph-medium rounded-2 font-inter text-light-900! min-h-12 w-full border-none px-4 py-3"
      >
        Sign In
      </LoadingButton>

      <div className="flex items-center justify-start gap-1">
        <p>Don&apos;t have an account?</p>
        <Button
          render={
            <Link
              className="paragraph-medium primary-text-gradient!"
              href="/sign-up"
            />
          }
          className="p-0"
          variant="link"
        >
          Sign Up
        </Button>
      </div>
    </Form>
  );
};

export default SignInForm;
