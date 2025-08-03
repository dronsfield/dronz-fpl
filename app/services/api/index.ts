import appConfig from "~/appConfig";
import { keyBy } from "~/util/keyBy";
import {
  BasicFixtureInfoPerTeam,
  Chip,
  ChipKey,
  Fixture,
  FixtureTeam,
  GameweekTransfers,
  League,
  Manager,
  ManagerProfile,
  PickType,
  PitchPick,
  Player,
  playerPositions,
  Team,
  Teams,
} from "./models";
import {
  ElementRT,
  EventRT,
  EventStatusRT,
  fetchBootstrap,
  fetchEventStatus,
  fetchFixtures,
  fetchLeague,
  fetchLive,
  fetchManager,
  fetchManagerInfo,
  FixtureRT,
  HistoryRT,
  LiveElementRT,
  LiveStatsRT,
  ManagerInfoRT,
  ManagersRT,
  PickRT,
  TeamRT,
  TransferRT,
} from "./requests";
import { getKeys } from "~/util/getKeys";
import { sortBy } from "~/util/sortBy";
import wait from "~/util/wait";
import { CacheFetchResult } from "~/services/cacheFn";
export * from "./models";

function parseCurrentEventId(events: EventRT[]): number {
  let currentEventId = 0;
  for (let eventData of events) {
    if (eventData.is_current) {
      currentEventId = eventData.id;
      break;
    }
  }
  return currentEventId;
}
function parseCurrentEventIdFromStatus(statusResp: EventStatusRT): number {
  return statusResp.status[0]?.event || 0;
}
function transformWebName(web_name: string) {
  if (web_name === "Alexander-Arnold") return "Trent";
  return web_name;
}
function parsePlayerFromElement(
  element: ElementRT,
  live: { [key: string]: { stats: LiveStatsRT } }
): Player {
  const {
    id,
    first_name,
    web_name,
    second_name,
    team,
    team_code,
    selected_by_percent,
    element_type,
    now_cost,
  } = element;
  const position = playerPositions[element_type - 1] || "???";
  const cost = 0.1 * now_cost;
  const liveForPlayer = live[id];
  // if (!liveForPlayer) console.log(`no live data for ${web_name}`);
  return {
    id,
    firstName: first_name,
    lastName: second_name,
    webName: transformWebName(web_name),
    teamId: team,
    teamCode: team_code,
    selectedBy: selected_by_percent,
    position,
    cost,
    gameweekStats: liveForPlayer?.stats || {},
  };
}
function parseTeam(team: TeamRT): Team {
  const { id, code, name, short_name } = team;
  return {
    id,
    code,
    name,
    shortName: short_name,
  };
}
function parseFixture(fixture: FixtureRT, teams: Teams): Fixture {
  const {
    id,
    kickoff_time,
    stats,
    team_h,
    team_h_score,
    team_a,
    team_a_score,
    started,
    finished_provisional,
  } = fixture;
  const homeStats: FixtureTeam["stats"] = {};
  const awayStats: FixtureTeam["stats"] = {};
  const homeRealtimeBonus: FixtureTeam["realtimeBonus"] = [];
  const awayRealtimeBonus: FixtureTeam["realtimeBonus"] = [];

  stats.forEach((stat) => {
    const { identifier, a, h } = stat;
    homeStats[identifier] = h;
    awayStats[identifier] = a;

    if (identifier === "bps") {
      const all = [
        ...h.map(({ value, element }) => ({ bps: value, element, home: true })),
        ...a.map(({ value, element }) => ({
          bps: value,
          element,
          home: false,
        })),
      ];
      const sorted = sortBy(all, "bps", true);

      const top: Array<{
        bp: number;
        bps: number;
        element: number;
        home: boolean;
      }> = [];

      for (let ii = 0; ii < sorted.length; ii++) {
        let bp = 0;
        const current = sorted[ii];
        const prev = top.slice(-1)[0];
        if (prev && current.bps === prev?.bps) {
          bp = prev.bp;
        } else {
          bp = 3 - top.length;
        }
        if (bp > 0) {
          top.push({ ...current, bp });
        } else {
          break;
        }
      }

      top.forEach(({ bp, element, home }) => {
        (home ? homeRealtimeBonus : awayRealtimeBonus).push({
          value: bp,
          element,
        });
      });
    }
  });

  return {
    id,
    kickoffTime: kickoff_time,
    started,
    finished: finished_provisional,
    home: {
      teamId: team_h,
      team: teams[team_h],
      score: team_h_score,
      stats: homeStats,
      realtimeBonus: homeRealtimeBonus,
    },
    away: {
      teamId: team_a,
      team: teams[team_a],
      score: team_a_score,
      stats: awayStats,
      realtimeBonus: awayRealtimeBonus,
    },
  };
}
function parseGameweekTransfers(
  allTransfers: TransferRT[],
  history: HistoryRT,
  currentEventId: number
): GameweekTransfers {
  const transfers: GameweekTransfers = {
    in: [],
    out: [],
    cost: null,
  };
  allTransfers
    .filter((transferPayload) => transferPayload.event === currentEventId)
    .forEach((transferPayload) => {
      transfers.in.push(transferPayload.element_in);
      transfers.out.push(transferPayload.element_out);
    });

  const filteredIn = transfers.in.filter((id) => !transfers.out.includes(id));
  const filteredOut = transfers.out.filter((id) => !transfers.in.includes(id));
  transfers.in = filteredIn;
  transfers.out = filteredOut;

  const cost = history.current.find(
    (gw) => gw.event === currentEventId
  )?.event_transfers_cost;
  transfers.cost = cost || cost === 0 ? cost : null;

  return transfers;
}
function parseChips(history: HistoryRT): Chip[] {
  let wcIndex = 0;
  let fhIndex = 0;
  return history.chips.map((chip) => {
    const { event, name } = chip;
    const key: ChipKey | null = (() => {
      if (name === "wildcard") {
        wcIndex++;
        if (wcIndex === 1) return "wc1";
        if (wcIndex === 2) return "wc2";
      } else if (name === "3xc") {
        return "tc";
      } else if (name === "freehit") {
        fhIndex++;
        if (fhIndex === 1) return "fh";
        // if (fhIndex === 2) return "fh2";
      } else if (name === "bboost") {
        return "bb";
      } else if (name === "manager") {
        return "am";
      }
      return null;
    })();
    return { eventId: event, key };
  });

  // return history.chips.map((chip) => ({
  //   eventId: chip.event,
  //   name: chip.name,
  // }));
}
function parseManagerProfile(
  managerId: number,
  managerInfo: ManagerInfoRT
): ManagerProfile {
  return {
    id: managerId,
    name: `${managerInfo.player_first_name} ${managerInfo.player_last_name}`,
    overallRank: managerInfo.summary_overall_rank || 0,
    leagues: managerInfo.leagues.classic.map((item) => ({
      id: item.id,
      name: item.name,
      managerRank: item.entry_rank,
    })),
  };
}

function getPickType(pick: PickRT): PickType {
  if (pick.element_type === 5) return "AM";
  if (pick.is_captain) return "CAPTAIN";
  if (pick.is_vice_captain) return "VICE";
  return pick.position <= 11 ? "STARTING" : "BENCHED";
}

export function getBasicFixtureInfoPerTeam(fixtures: Fixture[]) {
  const output: BasicFixtureInfoPerTeam = {};

  const addFixtureForTeam = (fixture: Fixture, isHome: boolean) => {
    const us = fixture[isHome ? "home" : "away"];
    const them = fixture[!isHome ? "home" : "away"];

    output[us.teamId] = [
      ...(output[us.teamId] || []),
      {
        started: fixture.started,
        finished: fixture.finished,
        isHome: isHome,
        opponent: them.team,
        shorthand: `${them.team.shortName} (${isHome ? "H" : "A"})`,
      },
    ];
  };

  fixtures.forEach((fixture) => {
    addFixtureForTeam(fixture, true);
    addFixtureForTeam(fixture, false);
  });

  return output;
}

export function getPitchPicks(
  manager: Manager | undefined,
  players: {
    [id: number]: Player;
  },
  basicFixtureInfoPerTeam: BasicFixtureInfoPerTeam
): Array<PitchPick> {
  const managerPicks = manager?.picks || {};
  const picks = getKeys(managerPicks).map((playerId) => {
    const player = players[playerId];
    const { pickType, position, multiplier } = managerPicks[playerId];

    const basicFixtureInfo = basicFixtureInfoPerTeam[player.teamId] || [];
    const firstFixture = basicFixtureInfo[0];
    const _points = player.gameweekStats.total_points;
    const points =
      typeof _points === "number" && multiplier
        ? _points * multiplier
        : Number(_points) || 0;

    const value = [
      firstFixture ? (firstFixture.started ? points : undefined) : "-",
      ...basicFixtureInfo.map((fix) =>
        fix.started ? undefined : fix.shorthand
      ),
    ]
      .filter((val) => val !== undefined)
      .join(", ");

    return {
      player,
      pickType,
      points,
      position,
      multiplier,
      value,
    };
  });
  return picks;
}

export async function getCurrentEventId() {
  try {
    const eventStatusResponse = await fetchEventStatus();
    return {
      data: parseCurrentEventIdFromStatus(eventStatusResponse.data),
      stale: eventStatusResponse.stale,
    };
  } catch (error) {
    console.error(`Error in getCurrentEventId():`, error);
    throw error;
  }
}

export async function getBootstrap(currentEventId: number) {
  try {
    let bootstrapResponse, liveResponse, fixturesResponse;

    if (currentEventId === 0) {
      // When currentEventId is 0, only fetch bootstrap data
      bootstrapResponse = await fetchBootstrap();
      // Create stub responses for live and fixtures that match the expected types
      liveResponse = {
        data: { elements: [] as LiveElementRT[] },
        stale: false,
        fromCache: false,
      } as CacheFetchResult<{ elements: LiveElementRT[] }>;
      fixturesResponse = {
        data: [],
        stale: false,
        fromCache: false,
      } as CacheFetchResult<FixtureRT[]>;
    } else {
      // Normal flow when currentEventId is not 0
      [bootstrapResponse, liveResponse, fixturesResponse] = await Promise.all([
        fetchBootstrap(),
        fetchLive({ eventId: currentEventId }),
        fetchFixtures({ eventId: currentEventId }),
      ]);
    }

    const live = keyBy(liveResponse.data.elements, "id");
    const playerList = bootstrapResponse.data.elements.map((element) =>
      parsePlayerFromElement(element, live)
    );
    const players = keyBy(playerList, "id");
    const teamList = bootstrapResponse.data.teams.map(parseTeam);
    const teams = keyBy(teamList, "id");
    const fixtures = fixturesResponse.data.map((fixture) =>
      parseFixture(fixture, teams)
    );
    const fixturesPerTeam = getBasicFixtureInfoPerTeam(fixtures);
    return {
      players,
      teams,
      fixtures,
      currentEventId,
      fixturesPerTeam,
      stale:
        bootstrapResponse.stale || liveResponse.stale || fixturesResponse.stale,
    };
  } catch (error) {
    console.error(
      `Error in getBootstrap(currentEventId: ${currentEventId}):`,
      error
    );
    throw error;
  }
}

export async function getLeague(
  leagueId: number,
  currentEventId: number
): Promise<League & { stale: boolean }> {
  try {
    let stale = false;
    const leagueResponse = await fetchLeague({
      leagueId,
      eventId: currentEventId,
    });
    if (leagueResponse.stale) stale = true;

    const _managers: ManagersRT = {};

    if (currentEventId === 0) {
      // Create stub responses when currentEventId is 0
      await Promise.all(
        [
          ...leagueResponse.data.standings.results,
          ...leagueResponse.data.new_entries.results,
        ]
          .slice(0, appConfig.MAX_MANAGERS)
          .map(async (result) => {
            const managerId = result.entry;
            // Create stub manager response that matches ManagerRT structure
            _managers[managerId] = {
              gw: {
                picks: [],
                entry_history: {
                  points: 0,
                  value: 1000, // 100.0 in the original format
                  bank: 0,
                },
              },
              transfers: [],
              history: {
                chips: [],
                current: [],
                past: [],
              },
            };
          })
      );
    } else {
      // Normal flow when currentEventId is not 0
      await Promise.all(
        [
          ...leagueResponse.data.standings.results,
          ...leagueResponse.data.new_entries.results,
        ]
          .slice(0, appConfig.MAX_MANAGERS)
          .map(async (result, index) => {
            const managerId = result.entry;
            const managerResponse = await fetchManager({
              managerId,
              eventId: currentEventId,
              remoteDelay: index * 50,
            });
            _managers[managerId] = managerResponse.data;
            if (managerResponse.stale) stale = true;
          })
      );
    }

    const {
      league: { name, id },
      standings: { results },
      new_entries: { results: newResults },
    } = leagueResponse.data;
    const managers = [...results, ...newResults]
      .slice(0, appConfig.MAX_MANAGERS)
      .map((result) => {
        const {
          gw,
          transfers: transfersResponse,
          history: historyResponse,
        } = _managers[result.entry];

        const picks = gw.picks.reduce((acc, pick) => {
          acc[pick.element] = {
            pickType: getPickType(pick),
            position: pick.position,
            multiplier: pick.multiplier,
          };
          return acc;
        }, {} as Manager["picks"]);

        const transfers = parseGameweekTransfers(
          transfersResponse,
          historyResponse,
          currentEventId
        );

        const chips = parseChips(historyResponse);

        const currentEvent = historyResponse.current.find(
          (x) => x.event === currentEventId
        );

        const manager: Manager = {
          id: result.entry,
          name:
            result.player_name ||
            `${result.player_first_name || ""} ${
              result.player_last_name || ""
            }`,
          teamName: result.entry_name,
          rank: result.rank || 0,
          totalPoints: result.total || 0,
          eventPoints: gw.entry_history.points,
          totalMoney: gw.entry_history.value * 0.1,
          bankMoney: gw.entry_history.bank * 0.1,
          picks,
          chips,
          transfers,
          overallSeasonRank: currentEvent?.overall_rank || 0,
          overallGameweekRank: currentEvent?.rank || 0,
          pastSeasons: (historyResponse.past || []).map((season) => {
            return { name: season.season_name, rank: season.rank };
          }),
          seasonHistory: historyResponse.current.map((gw) => {
            return {
              eventId: gw.event,
              eventPoints: gw.points,
              totalPoints: gw.total_points,
              overallRank: gw.overall_rank,
            };
          }),
        };
        return manager;
      });

    return {
      name,
      id,
      managers,
      stale,
    };
  } catch (error) {
    console.error(
      `Error in getLeague(leagueId: ${leagueId}, currentEventId: ${currentEventId}):`,
      error
    );
    throw error;
  }
}

export async function getManagerProfile(managerId: number) {
  try {
    const managerInfoResponse = await fetchManagerInfo({ managerId });
    return {
      data: parseManagerProfile(managerId, managerInfoResponse.data),
      stale: managerInfoResponse.stale,
    };
  } catch (error) {
    console.error(
      `Error in getManagerProfile(managerId: ${managerId}):`,
      error
    );
    throw error;
  }
}
