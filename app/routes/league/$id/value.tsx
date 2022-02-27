import React from "react";
import { ManagerCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Table from "~/components/Table";
import { LeagueContext } from "../$id";

const headers = [
  "Manager",
  "Squad Value",
  "In The Bank",
  "Total",
  "Profit",
] as const;

function moneyColumn(value: number) {
  return `${value.toFixed(1)}`;
}

const TemplateTeam: React.FC<{}> = (props) => {
  const { managers, currentEventId } = React.useContext(LeagueContext);

  return (
    <Section>
      <Table
        data={managers}
        headers={headers}
        renderCell={(header, manager) => {
          switch (header) {
            case "Manager":
              return (
                <ManagerCell
                  manager={manager}
                  currentEventId={currentEventId}
                />
              );
            case "Squad Value":
              return moneyColumn(manager.totalMoney - manager.bankMoney);
            case "In The Bank":
              return moneyColumn(manager.bankMoney);
            case "Total":
              return moneyColumn(manager.totalMoney);
            case "Profit":
              return moneyColumn(manager.totalMoney - 100);
          }
        }}
        cellWidths={{
          Manager: ["auto"],
          "Squad Value": ["auto"],
          "In The Bank": ["auto"],
          Total: ["auto"],
          Profit: ["auto"],
        }}
      />
    </Section>
  );
};

export default TemplateTeam;
