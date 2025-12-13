"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface StripeTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({
  open,
  onOpenChange,
}: StripeTriggerDialogProps) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  
  if (!workflowId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              No workflow ID found. Please make sure you're in a valid workflow.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy webhook URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe dashboard to trigger this workflow on payment events.
          </DialogDescription>
          
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe dashboard</li>
              <li>Go to Developers → Webhooks</li>
              <li>Click Add endpoint</li>
              <li>Paste the endpoint URL from above</li>
              <li>Select events to listen for (e.g., payment_intent.succeeded)</li>
              <li>Copy and save the signing secret</li>
            </ol>
          </div>
          
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code className="bg-background px-1 py-0.5 rounded">stripe.amount</code> - Payment amount</li>
              <li><code className="bg-background px-1 py-0.5 rounded">stripe.currency</code> - Currency</li>
              <li><code className="bg-background px-1 py-0.5 rounded">stripe.customerId</code> - Customer ID</li>
              <li><code className="bg-background px-1 py-0.5 rounded">stripe.eventType</code> - Stripe event type</li>
              <li><code className="bg-background px-1 py-0.5 rounded">{`{{json stripe}}`}</code> - All stripe data as JSON</li>
            </ul>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};