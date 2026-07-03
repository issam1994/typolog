"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
      {...props}
    >
      {pending ? (pendingLabel ?? "…") : children}
    </button>
  );
}
