import type { QueryNode, Schema, SchemaField, FieldType } from '@/types/query';

export interface SelectableField {
  path: string;
  label: string;
  type: FieldType;
  options?: string[];
}


export function getFieldMetadata(
  fieldPath: string,
  schema: Schema,
  schemas: Schema[]
): SchemaField | null {
  if (!fieldPath) return null;

  const parts = fieldPath.split('.');
  if (parts.length === 1) {
    return schema.fields.find((f) => f.name === parts[0]) ?? null;
  }

  let currentSchema = schema;
  for (let i = 0; i < parts.length - 1; i++) {
    const relationName = parts[i];
    const relation = currentSchema.relations?.find((r) => r.name === relationName);
    if (!relation) return null;

    const nextSchema = schemas.find((s) => s.name === relation.targetSchema);
    if (!nextSchema) return null;

    currentSchema = nextSchema;
  }

  const lastPart = parts[parts.length - 1];
  return currentSchema.fields.find((f) => f.name === lastPart) ?? null;
}


export function getSelectableFields(
  schema: Schema,
  schemas: Schema[]
): SelectableField[] {
  const list: SelectableField[] = [];

  // Local fields
  for (const field of schema.fields) {
    list.push({
      path: field.name,
      label: field.name,
      type: field.type,
      options: field.options,
    });
  }

  if (schema.relations) {
    for (const relation of schema.relations) {
      const targetSchema = schemas.find((s) => s.name === relation.targetSchema);
      if (!targetSchema) continue;

      for (const field of targetSchema.fields) {
        list.push({
          path: `${relation.name}.${field.name}`,
          label: `${relation.name} → ${field.name}`,
          type: field.type,
          options: field.options,
        });
      }
    }
  }

  return list;
}

export function getReferencedFields(node: QueryNode): string[] {
  const fields: string[] = [];
  
  function walk(n: QueryNode) {
    if (n.type === 'rule') {
      if (n.field) {
        fields.push(n.field);
      }
    } else {
      for (const child of n.children) {
        walk(child);
      }
    }
  }
  
  walk(node);
  return Array.from(new Set(fields));
}
