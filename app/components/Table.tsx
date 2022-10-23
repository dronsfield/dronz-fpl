import { capitalCase } from "change-case";
import React from "react";
import styled, { css } from "styled-components";
import colors from "~/style/colors";
import { recordFromArray } from "~/util/recordFromArray";
import { ItemsOf } from "~/util/utilityTypes";

const _Table = styled.table.attrs({ cellSpacing: 0 })`
  width: 100%;

  border: 1px solid ${colors.border};
  background-color: white;
  border-radius: 5px;
`;

const Row = styled.tr`
  th,
  td {
    border-bottom: 1px solid ${colors.border};
  }
  tbody &:last-child {
    th,
    td {
      border-bottom: none;
    }
  }
`;

const HeaderRow = styled(Row)``;

export type CellWidth = number | "hide" | "auto" | "nowrap";
export type CellWidths = [CellWidth] | [CellWidth, CellWidth];

interface CellProps {
  widths: CellWidths;
}

function makeCellWidthStyle(cellWidth: CellWidth) {
  const widthValue = typeof cellWidth === "number" ? cellWidth + "px" : "auto";
  const style = `
    display: ${cellWidth === "hide" ? "none" : "table-cell"};
    width: ${widthValue};
    min-width: ${widthValue};
    ${cellWidth === "nowrap" ? `white-space: nowrap;` : ""}
  `;
  return style;
}

const cellStyle = css<CellProps>`
  ${(p) => `
  ${makeCellWidthStyle(p.widths[0])}
  ${p.widths[1]
      ? `
  @media (min-width: 600px) {
    ${makeCellWidthStyle(p.widths[1])}
  }`
      : ""
    }
  `}
  box-sizing: content-box;
  padding: 8px 4px;
  &:first-child {
    padding-left: 8px;
  }
  &:last-child {
    padding-right: 8px;
  }
`;

const Cell = styled.td<CellProps>`
  ${cellStyle};
`;

const HeaderCell = styled.th<CellProps & { onClick?: any }>`
  ${cellStyle};
`;

interface TableProps<
  RowData extends object,
  Headers extends readonly string[]
  > {
  data: RowData[];
  headers: Headers;
  renderCell: (header: ItemsOf<Headers>, rowData: RowData) => React.ReactNode;
  renderHeader?: (header: ItemsOf<Headers>) => React.ReactNode;
  cellWidths?: Record<ItemsOf<Headers>, CellWidths>;
}

function TableRenderer<
  RowData extends object,
  Headers extends readonly string[]
>(props: TableProps<RowData, Headers>): React.ReactElement {
  let {
    data,
    headers,
    renderCell,
    renderHeader = capitalCase,
    cellWidths: cellWidthsProp,
  } = props;

  const cellWidths = React.useMemo(() => {
    if (cellWidthsProp) {
      return cellWidthsProp;
    } else {
      return recordFromArray(headers, () => ["auto"] as CellWidths);
    }
  }, [headers, cellWidthsProp]);

  return (
    <_Table>
      <thead>
        <HeaderRow>
          {headers.map((header: ItemsOf<Headers>) => {
            return (
              <HeaderCell
                children={renderHeader(header)}
                widths={cellWidths[header]}
                key={header}
                style={{
                  // workaround for weird SC bug that will use header className
                  // for normal cells after page change
                  fontWeight: "bold",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "left",
                }}
              />
            );
          })}
        </HeaderRow>
      </thead>
      <tbody>
        {data.map((rowData, index) => {
          return (
            <Row key={index}>
              {headers.map((header: ItemsOf<Headers>) => {
                return (
                  <Cell
                    children={renderCell(header, rowData)}
                    widths={cellWidths[header]}
                    key={header}
                  />
                );
              })}
            </Row>
          );
        })}
      </tbody>
    </_Table>
  );
}

const ComponentsObject = {
  Table: _Table,
  Row,
  HeaderRow,
  Cell,
  HeaderCell,
};

let MemoizedTableRenderer: any = React.memo(TableRenderer);

Object.assign(MemoizedTableRenderer, ComponentsObject);

let Table = MemoizedTableRenderer as (<
  RowData extends object,
  Headers extends readonly string[]
  >(
  props: TableProps<RowData, Headers>
) => React.ReactElement) &
  typeof ComponentsObject;

export default Table;

// export default React.memo(Table)
