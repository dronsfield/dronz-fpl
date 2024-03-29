import React from "react";
import { Form } from "remix";
import appConfig from "~/appConfig";
import LoaderLink from "~/components/LoaderLink";
import LogoutButton from "~/components/LogoutButton";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { ManagerProfile } from "~/services/api";
import { sortBy } from "~/util/sortBy";

const tableHeaders = ["name", "managerRank"] as const;

export interface HomeProps {
  data: ManagerProfile;
}
const Home: React.FC<HomeProps> = (props) => {
  const { data } = props;

  const [showAll, setShowAll] = React.useState(false);

  const validLeagues = React.useMemo(() => {
    return sortBy(
      showAll
        ? data.leagues
        : data.leagues.filter(
            (league) => league.managerRank <= appConfig.MAX_MANAGERS
          ),
      "name"
    );
  }, [data, showAll]);

  return (
    <Section>
      <Table
        data={validLeagues}
        headers={tableHeaders}
        renderCell={(header, rowData) => {
          if (header === "name") {
            const to = `/league/${rowData.id}`;
            return <LoaderLink to={to} children={rowData.name} />;
          }
          return rowData[header];
        }}
        renderHeader={(header) => {
          if (header === "managerRank") return "your rank";
          if (header === "name") return "league name";
        }}
      />
      {!showAll ? (
        <>
          <Spacer height={8} />
          <button onClick={() => setShowAll(true)} children="Show all" />
        </>
      ) : null}

      <Spacer height={16} />
      <div children="View another league" />
      <Form method="post">
        <input type="hidden" name="xd" value="league" />
        <input type="text" name="id" required placeholder="League ID" />
        <button type="submit" children="GO" />
        <Spacer height={32} />
        <LogoutButton />
      </Form>
    </Section>
  );
};

export default Home;
