import { useState } from "react";
import type { QuotationTaskDTO } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface TasksTableProps {
  tasks: QuotationTaskDTO[];
  isEditing?: boolean;
  onTaskChange?: (updatedTasks: QuotationTaskDTO[]) => void;
}

export function TasksTable({ tasks, isEditing = false, onTaskChange }: TasksTableProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const handleManDaysChange = (taskId: string, value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) return;

    const updatedTasks = localTasks.map((task) => (task.id === taskId ? { ...task, man_days: numericValue } : task));

    setLocalTasks(updatedTasks);
    onTaskChange?.(updatedTasks);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Lp.</TableHead>
            <TableHead>Opis zadania</TableHead>
            <TableHead className="w-32 text-right">MD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localTasks.map((task, index) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{task.task_description}</TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={task.man_days ?? 0}
                    min={0}
                    step={0.5}
                    className="w-20 ml-auto text-right"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleManDaysChange(task.id, e.target.value)}
                  />
                ) : (
                  (task.man_days ?? 0)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
