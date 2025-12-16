"use client";

import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { EntityList, EntityHeader, EntityPagination } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2Icon, XCircleIcon, Loader2Icon, ClockIcon } from "lucide-react";
import type { Execution, ExecutionStatus } from "@prisma/client";
import { Fragment } from "react";

type ExecutionWithWorkflow = Execution & {
  workflow: {
    id: string;
    name: string;
  };
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2Icon size={20} className="text-green-600" />;
    case "FAILED":
      return <XCircleIcon size={20} className="text-red-600" />;
    case "RUNNING":
      return <Loader2Icon size={20} className="text-blue-600 animate-spin" />;
    default:
      return <ClockIcon size={20} className="text-gray-600" />;
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const ExecutionItem = ({ data }: { data: ExecutionWithWorkflow }) => {
  const duration = data.completedAt && data.startedAt
    ? Math.round((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000)
    : null;

  const subtitle = (
    <Fragment>
      {data.workflow.name} • Started {formatDistanceToNow(new Date(data.startedAt), { addSuffix: true })}
      {duration !== null && (
        <Fragment> • Took {duration} seconds</Fragment>
      )}
    </Fragment>
  );

  return (
    <EntityList.Item
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={getStatusIcon(data.status)}
    />
  );
};

export const ExecutionsList = () => {
  const [{ data: executions }] = useSuspenseExecutions();
  
  return (
    <EntityList
      data={executions.items}
      renderItem={(execution) => <ExecutionItem key={execution.id} data={execution} />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="View your workflow execution history"
    />
  );
};

export const ExecutionsPagination = () => {
  const [{ data: executions }] = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  
  return (
    <EntityPagination
      currentPage={executions.page}
      totalPages={executions.totalPages}
      pageSize={executions.pageSize}
      total={executions.totalCount}
      onPageChange={(page) => setParams({ ...params, page })}
      onPageSizeChange={(pageSize) => setParams({ ...params, pageSize })}
    />
  );
};

export const ExecutionsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="space-y-6">
      <ExecutionsHeader />
      {children}
    </div>
  );
};

export const ExecutionsLoading = () => {
  return <div>Loading executions...</div>;
};

export const ExecutionsError = () => {
  return <div>Error loading executions</div>;
};

export const ExecutionsEmpty = () => {
  return (
    <EntityList.Empty
      title="No executions found"
      description="You haven't run any workflows yet. Get started by running your first workflow."
    />
  );
};