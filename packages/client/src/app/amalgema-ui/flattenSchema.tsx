import { mapObject } from "@latticexyz/common/utils";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type/internal";

export type KeySchema = {
  readonly [k: string]: {
    readonly type: StaticAbiType;
  };
};

export type ValueSchema = {
  readonly [k: string]: {
    readonly type: SchemaAbiType;
  };
};

export function flattenSchema<schema extends ValueSchema | KeySchema>(
  schema: schema
): { readonly [k in keyof schema]: { readonly type: schema[k]["type"] } } {
  return mapObject(schema, (value) => ({ type: value.type }));
}