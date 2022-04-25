// import { fetchBootstrap } from "fpl-api"
import dayjs from "dayjs";
import { Array, Boolean, Null, Number, Record, Static, String } from "runtypes";
import { cacheFetch } from "../redis.server";

const BASE_URL = "https://fantasy.premierleague.com/api";

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
  league: Record({ id: Number, name: String }),
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
});
export type HistoryRT = Static<typeof HistoryRT>;

export const ManagerInfoRT = Record({
  player_first_name: String,
  player_last_name: String,
  summary_overall_rank: Number,
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

export function fetchBootstrap() {
  const url = `${BASE_URL}/bootstrap-static/`;
  return cacheFetch({
    rt: BootstrapRT,
    url,
    expireAt: expireAt2am(),
  });
}
export function fetchLeague(opts: { leagueId: number }) {
  const url = `${BASE_URL}/leagues-classic/${opts.leagueId}/standings/`;
  return cacheFetch({ rt: LeagueRT, url, expireAt: null });
}
export function fetchGameweek(opts: { managerId: number; eventId: number }) {
  const url = `${BASE_URL}/entry/${opts.managerId}/event/${opts.eventId}/picks/`;
  return cacheFetch({
    rt: GameweekRT,
    url,
    expireAt: expireAtHalfHour(),
  });
}
export function fetchTransfers(opts: { managerId: number }) {
  const url = `${BASE_URL}/entry/${opts.managerId}/transfers/`;
  return cacheFetch({
    rt: Array(TransferRT),
    url,
    expireAt: expireAtHalfHour(),
  });
}
export function fetchFixtures(opts: { eventId: number }) {
  const url = `${BASE_URL}/fixtures/?event=${opts.eventId}`;
  return cacheFetch({ rt: Array(FixtureRT), url, expireAt: null });
}
export function fetchHistory(opts: { managerId: number }) {
  const url = `${BASE_URL}/entry/${opts.managerId}/history/`;
  return cacheFetch({
    rt: HistoryRT,
    url,
    expireAt: expireAtHalfHour(),
  });
}
export function fetchManagerInfo(opts: { managerId: number }) {
  const url = `${BASE_URL}/entry/${opts.managerId}/`;
  return cacheFetch({ rt: ManagerInfoRT, url, expireAt: null });
}
