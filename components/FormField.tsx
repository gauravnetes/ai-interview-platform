import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input } from "./ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
  children?: React.ReactNode;
}

const FormField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  children,
}: FormFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="label">{label}</FormLabel>
        <div className="relative">
          <FormControl>
            <Input
              className="input pr-10"
              placeholder={placeholder}
              type={type}
              {...field}
            />
          </FormControl>
          {children && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor pointer text-muted-foreground">
              {children}
            </div>
          )}
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField;
