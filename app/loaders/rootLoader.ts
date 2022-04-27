import { LoaderFunction } from "remix";
import {
  Fixture,
  getBootstrap,
  getCurrentEventId,
  getManagerProfile,
  ManagerProfile,
  Player,
  Team,
} from "~/services/api";
import { getUser } from "~/services/session.server";
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
  };
}

export const rootLoader: LoaderFunction = async ({ request }) => {
  const duration = logDuration("rootLoader");
  const [profile, bootstrap] = await Promise.all([
    (async () => {
      const user = await getUser(request);
      return user ? await getManagerProfile(user.userId) : null;
    })(),
    (async () => {
      const currentEventId = await getCurrentEventId();
      return getBootstrap(currentEventId);
    })(),
  ]);
  const data: RootLoaderData = { profile, bootstrap };
  duration.end();
  return data;
};
