import { LoaderFunction } from "remix";
import {
  BasicFixtureInfoPerTeam,
  Fixture,
  getBootstrap,
  getCurrentEventId,
  getManagerProfile,
  ManagerProfile,
  Player,
  Team,
} from "~/services/api";
import { getUser, User } from "~/services/session.server";
import { logDuration } from "~/util/logDuration";

export interface RootLoaderData {
  profile: ManagerProfile | null;
  bootstrap: {
    players: {
      [k: number]: Player;
    };
    teams: {
      [k: number]: Team;
    };
    fixtures: Fixture[];
    currentEventId: number;
    fixturesPerTeam: BasicFixtureInfoPerTeam;
  };
  stale: boolean;
}

// export const rootLoader: LoaderFunction = async ({ request }) => {
export const rootLoader = async (user: User) => {
  console.log("exec loader: root");
  // const duration = logDuration("rootLoader");

  let stale = false;

  const [profile, bootstrap] = await Promise.all([
    (async () => {
      try {
        if (!user) return null;
        const managerResponse = await getManagerProfile(user?.userId);
        if (managerResponse.stale) stale = true;
        return managerResponse.data;
      } catch (err) {
        return null;
      }
    })(),
    (async () => {
      const currentEventIdResponse = await getCurrentEventId();
      if (currentEventIdResponse.stale) stale = true;
      const { stale: bootstrapStale, ...bootstrap } = await getBootstrap(
        currentEventIdResponse.data
      );
      if (bootstrapStale) stale = true;
      return bootstrap;
    })(),
  ]);

  const data: RootLoaderData = { profile, bootstrap, stale };
  // duration.end();
  return data;
};
