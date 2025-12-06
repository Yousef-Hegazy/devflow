"use client";


import { cn } from "@/lib/utils";

function Form({ className, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      slot="form"
      className={cn("flex w-full flex-col gap-4", className)}
      data-slot="form"
      {...props}
    />
  );
}

export { Form };
