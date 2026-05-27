"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
export type TreeNode = {
  id: string;
  label: string;
  type: "kgi" | "ksf" | "kpi" | "action";
  value?: string;
  unit?: string;
  owner?: string;
  deadline?: string;
  note: string;
  children: TreeNode[];
};

type TreeEditorProps = {
  root: TreeNode | null;
  onChange: (root: TreeNode | null) => void;
};

const TYPE_LABELS: Record<TreeNode["type"], string> = {
  kgi: "KGI",
  ksf: "KSF",
  kpi: "KPI",
  action: "Action",
};

const TYPE_COLORS: Record<TreeNode["type"], string> = {
  kgi: "bg-purple-100 text-purple-800 border-purple-300",
  ksf: "bg-blue-100 text-blue-800 border-blue-300",
  kpi: "bg-green-100 text-green-800 border-green-300",
  action: "bg-gray-100 text-gray-700 border-gray-300",
};

const CHILD_TYPE_MAP: Record<TreeNode["type"], TreeNode["type"]> = {
  kgi: "ksf",
  ksf: "kpi",
  kpi: "action",
  action: "action",
};

function createNode(type: TreeNode["type"]): TreeNode {
  return {
    id: globalThis.crypto.randomUUID(),
    label: "",
    type,
    value: "",
    unit: "",
    owner: "",
    deadline: "",
    note: "",
    children: [],
  };
}

function updateNodeById(
  node: TreeNode,
  id: string,
  patch: Partial<TreeNode>
): TreeNode {
  if (node.id === id) return { ...node, ...patch };
  return {
    ...node,
    children: node.children.map((c) => updateNodeById(c, id, patch)),
  };
}

function addChildToNode(
  node: TreeNode,
  parentId: string,
  child: TreeNode
): TreeNode {
  if (node.id === parentId) {
    return { ...node, children: [...node.children, child] };
  }
  return {
    ...node,
    children: node.children.map((c) => addChildToNode(c, parentId, child)),
  };
}

function removeNodeById(
  node: TreeNode,
  id: string
): TreeNode | null {
  if (node.id === id) return null;
  return {
    ...node,
    children: node.children
      .map((c) => removeNodeById(c, id))
      .filter((c): c is TreeNode => c !== null),
  };
}

type NodeRowProps = {
  node: TreeNode;
  depth: number;
  onUpdate: (id: string, patch: Partial<TreeNode>) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
};

function NodeRow({ node, depth, onUpdate, onAddChild, onDelete }: NodeRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);

  const indentPx = depth * 24;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-start gap-2 rounded-lg border bg-card p-2"
        style={{ marginLeft: `${indentPx}px` }}
      >
        {/* Collapse toggle */}
        {node.children.length > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="mt-0.5 text-muted-foreground text-xs w-4 shrink-0"
          >
            {collapsed ? "▶" : "▼"}
          </button>
        )}
        {node.children.length === 0 && <span className="w-4 shrink-0" />}

        {/* Type badge */}
        <span
          className={`shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[node.type]}`}
        >
          {TYPE_LABELS[node.type]}
        </span>

        {/* Label / value display or edit */}
        {editing ? (
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Input
                value={node.label}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="ラベル"
                className="h-7 text-sm flex-1 min-w-[160px]"
              />
              <Input
                value={node.value ?? ""}
                onChange={(e) => onUpdate(node.id, { value: e.target.value })}
                placeholder="目標値"
                className="h-7 text-sm w-24"
              />
              <Input
                value={node.unit ?? ""}
                onChange={(e) => onUpdate(node.id, { unit: e.target.value })}
                placeholder="単位"
                className="h-7 text-sm w-16"
              />
              <Input
                value={node.owner ?? ""}
                onChange={(e) => onUpdate(node.id, { owner: e.target.value })}
                placeholder="担当者"
                className="h-7 text-sm w-24"
              />
              <Input
                value={node.deadline ?? ""}
                onChange={(e) => onUpdate(node.id, { deadline: e.target.value })}
                placeholder="期限"
                className="h-7 text-sm w-28"
              />
            </div>
            <Textarea
              value={node.note}
              onChange={(e) => onUpdate(node.id, { note: e.target.value })}
              placeholder="メモ"
              className="text-xs min-h-[48px] resize-none"
              rows={2}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start h-6 text-xs px-2"
              onClick={() => setEditing(false)}
            >
              完了
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-1 flex-col cursor-pointer min-w-0"
            onClick={() => setEditing(true)}
          >
            <span className="text-sm font-medium truncate">
              {node.label || <span className="text-muted-foreground italic">（未入力）</span>}
              {node.value && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {node.value}{node.unit}
                </span>
              )}
            </span>
            {(node.owner || node.deadline) && (
              <span className="text-xs text-muted-foreground">
                {node.owner && `担当: ${node.owner}`}
                {node.owner && node.deadline && " / "}
                {node.deadline && `期限: ${node.deadline}`}
              </span>
            )}
            {node.note && (
              <span className="text-xs text-muted-foreground line-clamp-1">{node.note}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-primary"
            onClick={() => onAddChild(node.id)}
          >
            + 子追加
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-destructive hover:text-destructive"
            onClick={() => onDelete(node.id)}
          >
            削除
          </Button>
        </div>
      </div>

      {/* Children */}
      {!collapsed && node.children.length > 0 && (
        <div className="flex flex-col gap-1">
          {node.children.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeEditor({ root, onChange }: TreeEditorProps) {
  function handleUpdate(id: string, patch: Partial<TreeNode>) {
    if (!root) return;
    onChange(updateNodeById(root, id, patch));
  }

  function handleAddChild(parentId: string) {
    if (!root) return;
    const parent = findNode(root, parentId);
    if (!parent) return;
    const childType = CHILD_TYPE_MAP[parent.type];
    const child = createNode(childType);
    onChange(addChildToNode(root, parentId, child));
  }

  function handleDelete(id: string) {
    if (!root) return;
    if (root.id === id) {
      onChange(null);
      return;
    }
    const updated = removeNodeById(root, id);
    onChange(updated);
  }

  function handleAddRoot() {
    onChange(createNode("kgi"));
  }

  return (
    <div className="flex flex-col gap-3">
      {root ? (
        <NodeRow
          node={root}
          depth={0}
          onUpdate={handleUpdate}
          onAddChild={handleAddChild}
          onDelete={handleDelete}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 gap-3">
          <p className="text-sm text-muted-foreground">
            KGI ノードがありません。まず KGI を追加してください。
          </p>
          <Button type="button" variant="outline" onClick={handleAddRoot}>
            + KGI を追加
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="text-xs text-muted-foreground">凡例：</span>
        {(["kgi", "ksf", "kpi", "action"] as const).map((t) => (
          <span
            key={t}
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[t]}`}
          >
            {TYPE_LABELS[t]}
          </span>
        ))}
      </div>
    </div>
  );
}

// Helper: find node by id (depth-first)
function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}
