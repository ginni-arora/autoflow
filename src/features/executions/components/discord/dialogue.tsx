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
import { DiscordNodeData } from "./node";

const formSchema = z.object({
  variableName: z.string().min(1, "Variable name is required"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
  content: z.string().min(1).max(2000),
  username: z.string().optional(),
});

type DiscordFormValues = z.infer<typeof formSchema>;

interface DiscordDialogueProps {
  data: DiscordNodeData;
  onSave: (data: DiscordNodeData) => void;
}

export const DiscordDialogue = ({ data, onSave }: DiscordDialogueProps) => {
  const form = useForm<DiscordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: data.variableName || "myDiscord",
      webhookUrl: data.webhookUrl || "",
      content: data.content || "",
      username: data.username || "",
    },
  });

  const handleSave = (values: DiscordFormValues) => {
    onSave(values);
    form.reset(values);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Discord Configuration</DialogTitle>
        <DialogDescription>
          Configure the Discord webhook settings for this node
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
                  <Input placeholder="myDiscord" {...field} />
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
                  <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                </FormControl>
                <FormDescription>
                  Get this from Discord channel settings, integrations, webhooks
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

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bot Username (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Workflow Bot" {...field} />
                </FormControl>
                <FormDescription>
                  This will be used to override the webhook's default username
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