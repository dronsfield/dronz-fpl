// import { fetchBootstrap } from "fpl-api"
import dayjs from "dayjs";
import {
  Array,
  Boolean,
  Dictionary,
  Null,
  Number,
  Partial,
  Record,
  Runtype,
  Static,
  String,
} from "runtypes";
import appConfig from "~/appConfig";
import { runtypeFetch } from "~/util/runtypeFetch";
import { cacheFn } from "../localCache";
import { ValueOf } from "~/util/utilityTypes";
import betterFetch from "~/util/betterFetch";

const BASE_URL = appConfig.BASE_URL;

// ------------------------------------------------------------
// FPL API RESPONSE RUNTYPES
// ------------------------------------------------------------

export const EventStatusRT = Record({
  status: Array(Record({ event: Number })),
});
export type EventStatusRT = Static<typeof EventStatusRT>;

export const ElementRT = Record({
  id: Number,
  first_name: String,
  second_name: String,
  web_name: String,
  team: Number,
  team_code: Number,
  selected_by_percent: String,
  element_type: Number,
  now_cost: Number,
});
export type ElementRT = Static<typeof ElementRT>;

export const TeamRT = Record({
  code: Number,
  id: Number,
  name: String,
  short_name: String,
});
export type TeamRT = Static<typeof TeamRT>;

export const EventRT = Record({
  id: Number,
  finished: Boolean,
  is_current: Boolean,
});
export type EventRT = Static<typeof EventRT>;

export const BootstrapRT = Record({
  events: Array(EventRT),
  elements: Array(ElementRT),
  teams: Array(TeamRT),
});
export type BootstrapRT = Static<typeof BootstrapRT>;

export const LeagueResultRT = Record({
  entry: Number,
  entry_name: String,
}).And(
  Partial({
    player_name: String,
    player_first_name: String,
    player_last_name: String,
    rank: Number,
    total: Number,
  })
);
export const LeagueRT = Record({
  league: Record({ id: Number, name: String }),
  standings: Record({
    results: Array(LeagueResultRT),
  }),
  new_entries: Record({
    results: Array(LeagueResultRT),
  }),
});
export type LeagueRT = Static<typeof LeagueRT>;

export const PickRT = Record({
  element: Number,
  element_type: Number,
  is_captain: Boolean,
  is_vice_captain: Boolean,
  position: Number,
  multiplier: Number,
});
export type PickRT = Static<typeof PickRT>;

export const GameweekRT = Record({
  entry_history: Record({
    points: Number,
    value: Number,
    bank: Number,
  }),
  picks: Array(PickRT),
});
export type GameweekRT = Static<typeof GameweekRT>;

export const TransferRT = Record({
  element_in: Number,
  element_in_cost: Number,
  element_out: Number,
  element_out_cost: Number,
  entry: Number,
  event: Number,
});
export type TransferRT = Static<typeof TransferRT>;

export const StatRT = Record({ value: Number, element: Number });
export const FixtureRT = Record({
  id: Number,
  kickoff_time: String,
  finished_provisional: Boolean,
  started: Boolean,
  stats: Array(
    Record({ identifier: String, a: Array(StatRT), h: Array(StatRT) })
  ),
  team_h: Number,
  team_h_score: Number.Or(Null),
  team_a: Number,
  team_a_score: Number.Or(Null),
});

export type FixtureRT = Static<typeof FixtureRT>;

export const HistoryRT = Record({
  chips: Array(
    Record({
      event: Number,
      name: String,
    })
  ),
  current: Array(
    Record({
      event: Number,
      points: Number,
      total_points: Number,
      rank: Number.Or(Null),
      overall_rank: Number.Or(Null),
      event_transfers: Number,
      event_transfers_cost: Number,
    })
  ),
  past: Array(
    Record({
      season_name: String,
      rank: Number,
    })
  ),
});
export type HistoryRT = Static<typeof HistoryRT>;

export const ManagerInfoRT = Record({
  player_first_name: String,
  player_last_name: String,
  summary_overall_rank: Number.Or(Null),
  leagues: Record({
    classic: Array(
      Record({
        id: Number,
        name: String,
        entry_rank: Number,
      })
    ),
  }),
});
export type ManagerInfoRT = Static<typeof ManagerInfoRT>;

export const ManagerRT = Record({
  gw: GameweekRT,
  transfers: Array(TransferRT),
  history: HistoryRT,
});
export type ManagerRT = Static<typeof ManagerRT>;

const ManagersRT = Dictionary(ManagerRT, Number);
export type ManagersRT = Static<typeof ManagersRT>;

export const LeagueWithManagersRT = LeagueRT.And(
  Record({
    managers: ManagersRT,
  })
);
export type LeagueWithManagersRT = Static<typeof LeagueWithManagersRT>;

export const LiveStatsRT = Dictionary(String.Or(Number).Or(Boolean), String);
export type LiveStatsRT = Static<typeof LiveStatsRT>;

export const LiveElementRT = Record({
  id: Number,
  stats: LiveStatsRT,
});
export type LiveElementRT = Static<typeof LiveElementRT>;

export const LiveRT = Record({
  elements: Array(LiveElementRT),
});
export type LiveRT = Static<typeof LiveRT>;

// ------------------------------------------------------------
// EXPIRY FUNCTIONS
// ------------------------------------------------------------

function expireAtHalfHour() {
  const now = dayjs();
  return now
    .utc()
    .startOf("minute")
    .set("minute", Math.ceil(now.get("minute") / 30) * 30)
    .unix();
}

function expireAt2am() {
  return dayjs().utc().add(1, "day").startOf("hour").set("hour", 2).unix();
}

function expireAtMinute() {
  if (
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("192.168")
  ) {
    return dayjs().utc().startOf("minute").add(5, "minute").unix();
  }
  return dayjs().utc().startOf("minute").add(1, "minute").unix();
}

// ------------------------------------------------------------
// FETCHERS
// ------------------------------------------------------------

export const apiEndpointConfig = {
  eventStatus: {
    rt: EventStatusRT,
    getKey: () => `2324/event-status`,
    getExpireAt: expireAtMinute,
  },
  bootstrap: {
    rt: BootstrapRT,
    getKey: () => `2324/bootstrap`,
    getExpireAt: expireAt2am,
  },
  league: {
    rt: LeagueRT,
    getKey: (opts: { leagueId: number; eventId: number }) =>
      `2324/league/${opts.leagueId}/${opts.eventId}`,
    getExpireAt: expireAtMinute,
  },
  manager: {
    rt: ManagerRT,
    getKey: (opts: { managerId: number; eventId: number }) =>
      `2324/manager/${opts.managerId}/${opts.eventId}`,
    getExpireAt: expireAtHalfHour,
  },
  managerInfo: {
    rt: ManagerInfoRT,
    getKey: (opts: { managerId: number }) =>
      `2324/manager-info/${opts.managerId}`,
    getExpireAt: expireAtMinute,
  },
  fixtures: {
    rt: Array(FixtureRT),
    getKey: (opts: { eventId: number }) => `2324/fixtures/${opts.eventId}`,
    getExpireAt: expireAtMinute,
  },
  live: {
    rt: LiveRT,
    getKey: (opts: { eventId: number }) => `2324/live/${opts.eventId}`,
    getExpireAt: expireAtMinute,
  },
};

type ConfigValue<R> = {
  rt: Runtype<R>;
  getKey: (opts: any) => string;
  getExpireAt: () => number | null;
};

const DEV_NEVER_EXPIRE = false;

const fetchFromApiAndCache = async <R>(
  url: string,
  config: ConfigValue<R>,
  opts: any
) => {
  return cacheFn({
    rt: config.rt,
    fn: () =>
      runtypeFetch(
        Record({ data: config.rt, stale: Boolean, fromCache: Boolean }),
        window.location.origin + url
      ),
    key: config.getKey(opts),
    expireAt: DEV_NEVER_EXPIRE
      ? dayjs().utc().add(1000, "day").unix()
      : config.getExpireAt(),
    remoteDelay: opts?.remoteDelay,
  });
};

export function fetchEventStatus() {
  return fetchFromApiAndCache(
    `/api/event-status`,
    apiEndpointConfig.eventStatus,
    {}
  );
}

export function fetchBootstrap() {
  return fetchFromApiAndCache(
    `/api/bootstrap`,
    apiEndpointConfig.bootstrap,
    {}
  );
}

export async function fetchLeague(opts: { leagueId: number; eventId: number }) {
  return fetchFromApiAndCache(
    `/api/league/${opts.leagueId}/${opts.eventId}`,
    apiEndpointConfig.league,
    opts
  );
}

export async function fetchManager(opts: {
  managerId: number;
  eventId: number;
  remoteDelay?: number;
}) {
  return fetchFromApiAndCache(
    `/api/manager/${opts.managerId}/${opts.eventId}`,
    apiEndpointConfig.manager,
    opts
  );
}

export function fetchManagerInfo(opts: { managerId: number }) {
  return fetchFromApiAndCache(
    `/api/manager-info/${opts.managerId}/`,
    apiEndpointConfig.managerInfo,
    opts
  );
}

export function fetchFixtures(opts: { eventId: number }) {
  return fetchFromApiAndCache(
    `/api/fixtures/${opts.eventId}`,
    apiEndpointConfig.fixtures,
    opts
  );
}

export function fetchLive(opts: { eventId: number }) {
  return fetchFromApiAndCache(
    `/api/live/${opts.eventId}`,
    apiEndpointConfig.live,
    opts
  );
}
