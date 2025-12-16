"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SlackNodeData } from "./node";

const formSchema = z.object({
  variableName: z.string().min(1, "Variable name is required"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
  content: z.string().min(1),
});

type SlackFormValues = z.infer<typeof formSchema>;

interface SlackDialogueProps {
  data: SlackNodeData;
  onSave: (data: SlackNodeData) => void;
}

export const SlackDialogue = ({ data, onSave }: SlackDialogueProps) => {
  const form = useForm<SlackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: data.variableName || "mySlack",
      webhookUrl: data.webhookUrl || "",
      content: data.content || "",
    },
  });

  const handleSave = (values: SlackFormValues) => {
    onSave(values);
    form.reset(values);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Slack Configuration</DialogTitle>
        <DialogDescription>
          Configure the Slack webhook settings for this node
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="variableName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variable Name</FormLabel>
                <FormControl>
                  <Input placeholder="mySlack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://hooks.slack.com/workflows/..." {...field} />
                </FormControl>
                <FormDescription>
                  Get this from Slack workspace settings, workflows, webhooks. Make sure the key is content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Summary: {{summary}} AI Response: {{myGemini.text}}" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  The message to send. Use variables for simple values or JSON variable to stringify objects.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};