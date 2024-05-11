import { unwrap } from "@latticexyz/common";
import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";
import { Table } from "@latticexyz/store/config/v2";
import { KeySchema as ProtocolParserKeySchema } from "@latticexyz/protocol-parser/internal";

import { flattenSchema } from "./flattenSchema";

import {
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { isDefined } from "@latticexyz/common/utils";

const indexerClient = createIndexerClient({
  url: "https://indexer.mud.redstonechain.com",
});

export async function fetchRecords(tables: readonly Table[]) {
  const results = unwrap(
    await indexerClient.getLogs({
      chainId: 690,
      address: "0x9d05cc196c87104a7196fcca41280729b505dbbf",
      filters: tables.map((table) => ({
        tableId: table.tableId,
      })),
    })
  );

  const records = results.logs
    .map((log) => {
      if (log.eventName !== "Store_SetRecord") {
        throw new Error(`Unexpected log type from indexer: ${log.eventName}`);
      }

      const table = tables.find((table) => table.tableId === log.args.tableId);
      if (!table) return;

      const keySchema = flattenSchema(getKeySchema(table)) as unknown as ProtocolParserKeySchema;
      const key = decodeKey(keySchema, log.args.keyTuple);
      const value = decodeValueArgs(
        flattenSchema(getValueSchema(table)) as unknown as ProtocolParserKeySchema,
        log.args
      );

      return {
        table,
        keyTuple: log.args.keyTuple,
        primaryKey: Object.values(key),
        key,
        value,
        fields: { ...key, ...value },
      };
    })
    .filter(isDefined);

  return { records, blockNumber: results.blockNumber };
}