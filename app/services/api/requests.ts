// import { fetchBootstrap } from "fpl-api"
import dayjs from "dayjs";
import {
  Array,
  Boolean,
  Dictionary,
  Null,
  Number,
  Record,
  Static,
  String,
} from "runtypes";
import appConfig from "~/appConfig";
import {runtypeFetch} from "~/util/runtypeFetch";
import betterFetch from "../../util/betterFetch";
import {cacheFn} from "../redis.server";

const BASE_URL = appConfig.BASE_URL

// ------------------------------------------------------------
// FPL API RESPONSE RUNTYPES
// ------------------------------------------------------------

export const EventStatusRT = Record({
  status: Array(Record({event: Number})),
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

export const LeagueRT = Record({
  league: Record({id: Number, name: String}),
  standings: Record({
    results: Array(
        Record({
          entry: Number,
          entry_name: String,
          player_name: String,
          rank: Number,
          total: Number,
        })
    ),
  }),
});
export type LeagueRT = Static<typeof LeagueRT>;

export const PickRT = Record({
  element: Number,
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

export const StatRT = Record({value: Number, element: Number});
export const FixtureRT = Record({
  id: Number,
  kickoff_time: String,
  finished_provisional: Boolean,
  started: Boolean,
  stats: Array(
      Record({identifier: String, a: Array(StatRT), h: Array(StatRT)})
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

// ------------------------------------------------------------
// FETCHERS
// ------------------------------------------------------------

export function fetchEventStatus() {
  const url = `/api/event-status`;
  const rt = EventStatusRT;
  return cacheFn({
    rt,
    fn: () => runtypeFetch(rt, url),
    key: `event-status`,
    expireAt: null,
  });
}

export function fetchBootstrap() {
  const url = `/api/bootstrap`;
  const rt = BootstrapRT;
  return cacheFn({
    rt,
    fn: () => runtypeFetch(rt, url),
    key: `bootstrap`,
    expireAt: expireAt2am(),
  });
}

export async function fetchLeague(opts: { leagueId: number; eventId: number }) {
  const url = `/api/league/${opts.leagueId}/${opts.eventId}`
  const rt = LeagueWithManagersRT
  return cacheFn({
    rt,
    key: `league/${opts.leagueId}`,
    expireAt: expireAtHalfHour(),
    fn: () => runtypeFetch(rt, url)
  })
}

export function fetchFixtures(opts: { eventId: number }) {
  const url = `/api/fixtures/${opts.eventId}`;
  const rt = Array(FixtureRT);
  return cacheFn({
    rt,
    fn: () => runtypeFetch(rt, url),
    key: `fixtures/${opts.eventId}`,
    expireAt: null,
  });
}

export function fetchManagerInfo(opts: { managerId: number }) {
  const url = `/api/manager-info/${opts.managerId}/`;
  const rt = ManagerInfoRT;

  return cacheFn({
    rt,
    fn: () => runtypeFetch(rt, url),
    key: `manager-info/${opts.managerId}`,
    expireAt: null,
  });
}

export function fetchLive(opts: { eventId: number }) {
  const url = `/api/live/${opts.eventId}`;
  const rt = LiveRT;

  return cacheFn({
    rt,
    fn: () => runtypeFetch(rt, url),
    key: `live/${opts.eventId}`,
    expireAt: null,
  });
}
