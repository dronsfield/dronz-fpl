import React from "react";
import { LoaderFunction, Outlet, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { getLeague, init } from "~/services/api";

export const loader: LoaderFunction = async ({ params }) => {
  const id = Number(params.id);
  invariant(id, "expected params.id");
  const initData = await init();
  const leagueData = await getLeague(id, initData.currentEventId);

  return {
    ...initData,
    ...leagueData,
  };
};

export interface LeagueProps {
  foo: string;
}

const League: React.FC<LeagueProps> = (props) => {
  const { foo } = props;
  const data = useLoaderData();
  console.log({ data });

  return (
    <>
      <div>League</div>
      <Outlet />
    </>
  );
};

export default League;
