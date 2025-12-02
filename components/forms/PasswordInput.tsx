"use client";

import { Eye, EyeClosed } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useToggle } from "@uidotdev/usehooks";
import { InputProps } from "../ui/input";
import { cn } from "@/lib/utils";

export default function PasswordInput({ className, ...props }: InputProps) {
  const [showPassword, toggleShowPassword] = useToggle(false);

  return (
    <InputGroup className="min-h-12">
      <InputGroupInput
        className={cn("min-h-12", className)}
        autoComplete="current-password"
        type={showPassword ? "text" : "password"}
        size="lg"
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <Button
          onClick={() => toggleShowPassword()}
          size="icon-lg"
          variant="ghost"
        >
          {showPassword ? <EyeClosed /> : <Eye />}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
