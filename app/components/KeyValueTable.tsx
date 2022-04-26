import React from "react";
import Table, { CellWidths } from "./Table";

const KEY_WIDTHS = ["nowrap"] as CellWidths;
const VALUE_WIDTHS = ["auto"] as CellWidths;

export interface KeyValueTableProps {
  items: Array<{ key: string; value: string | React.ReactElement }>;
}
const KeyValueTable: React.FC<KeyValueTableProps> = (props) => {
  const { items } = props;

  return (
    <Table.Table>
      <tbody>
        {items.map((item) => {
          return (
            <Table.Row key={item.key}>
              <Table.Cell children={item.key} widths={KEY_WIDTHS} />
              <Table.Cell children={item.value} widths={VALUE_WIDTHS} />
            </Table.Row>
          );
        })}
      </tbody>
    </Table.Table>
  );
};

export default KeyValueTable;
