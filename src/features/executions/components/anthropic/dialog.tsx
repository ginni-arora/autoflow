"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";


// ------------------ SCHEMA ------------------
const formSchema = z.object({
  variableName: z.string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message: "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores"
    }),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { message: "User prompt is required" }),
  credentialId: z.string().min(1, { message: "Credential ID is required" }),
});

export type AnthropicFormValues = z.infer<typeof formSchema> & {
  credentialId?: string;
};


// ------------------ PROPS ------------------
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicFormValues>;
  
}


// ------------------ COMPONENT ------------------
export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      credentialId: defaultValues.credentialId || "",
    },
  });

  // Reset form values when dialog opens with new defaults
useEffect(() => {
  if (open) {
    form.reset({
      variableName: defaultValues.variableName || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      credentialId: defaultValues.credentialId || "",
    });
  }
}, [open, defaultValues, form]);



  const watchVariableName = form.watch("variableName");

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Anthropic Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and the prompts for this node.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >

            {/* -------- VARIABLE NAME FIELD -------- */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="myAnthropic"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Use this name to reference the result in other nodes. {" "}
                    {`{{${watchVariableName || "myAnthropic"}.text}}`}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- SYSTEM PROMPT FIELD -------- */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Sets the behavior of the assistant. Use variables for simple values or JSON variable to stringify objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- USER PROMPT FIELD -------- */}
            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Summarize this text: {{json variable}}"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    The prompt to send to the AI. Use variables for simple values or JSON variable to stringify objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- CREDENTIAL ID FIELD -------- */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential ID</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="cm123abc456def"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    The ID of your Anthropic API credential. Create one at /credentials if you haven't already.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
         <Button type="submit">Save</Button>
            </DialogFooter>



            {/* -------- SUBMIT BUTTON --------
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary text-white"
            >
              Save
            </button> */}

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
