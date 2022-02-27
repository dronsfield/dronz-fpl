// import {
//   playerPositions,
//   PlayerPosition,
//   Player,
//   Players,
//   Team,
//   Teams,
//   GameweekTransfers,
//   Chip,
//   PickType,
//   Manager,
//   League,
//   FixtureTeam,
//   Fixture,
// } from "./models";
// import {
//   ElementRT,
//   TeamRT,
//   EventRT,
//   BootstrapRT,
//   LeagueRT,
//   PickRT,
//   GameweekRT,
//   TransferRT,
//   StatRT,
//   FixtureRT,
//   HistoryRT,
// } from "./requests";

import { keyBy } from "~/util/keyBy";
import {
  Chip,
  Fixture,
  FixtureTeam,
  GameweekTransfers,
  League,
  Manager,
  PickType,
  Player,
  playerPositions,
  Team,
  Teams,
} from "./models";
import {
  ElementRT,
  EventRT,
  fetchBootstrap,
  fetchFixtures,
  fetchGameweek,
  fetchHistory,
  fetchLeague,
  fetchTransfers,
  FixtureRT,
  HistoryRT,
  PickRT,
  TeamRT,
  TransferRT,
} from "./requests";

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
function parsePlayerFromElement(element: ElementRT): Player {
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
  return {
    id,
    firstName: first_name,
    lastName: second_name,
    webName: web_name,
    teamId: team,
    teamCode: team_code,
    selectedBy: selected_by_percent,
    position,
    cost,
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
  stats.forEach((stat) => {
    const { identifier, a, h } = stat;
    homeStats[identifier] = h;
    awayStats[identifier] = a;
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
    },
    away: {
      teamId: team_a,
      team: teams[team_a],
      score: team_a_score,
      stats: awayStats,
    },
  };
}
function parseGameweekTransfers(
  allTransfers: TransferRT[],
  currentEventId: number
): GameweekTransfers {
  const transfers: GameweekTransfers = {
    in: [],
    out: [],
  };
  allTransfers
    .filter((transferPayload) => transferPayload.event === currentEventId)
    .map((transferPayload) => {
      transfers.in.push(transferPayload.element_in);
      transfers.out.push(transferPayload.element_out);
    });
  return transfers;
}
function parseChips(history: HistoryRT): Chip[] {
  return history.chips.map((chip) => ({
    eventId: chip.event,
    name: chip.name,
  }));
}

export async function init() {
  const bootstrap = await fetchBootstrap();
  const playerList = bootstrap.elements.map(parsePlayerFromElement);
  const players = keyBy(playerList, "id");
  const teamList = bootstrap.teams.map(parseTeam);
  const teams = keyBy(teamList, "id");
  const currentEventId = parseCurrentEventId(bootstrap.events);
  const fixturesResponse = await fetchFixtures({
    eventId: currentEventId || 1,
  });
  const fixtures = fixturesResponse.map((fixture) =>
    parseFixture(fixture, teams)
  );
  return { players, teams, currentEventId, fixtures };
}

function getPickType(pick: PickRT): PickType {
  if (pick.is_captain) return "CAPTAIN";
  if (pick.is_vice_captain) return "VICE";
  return pick.position <= 11 ? "STARTING" : "BENCHED";
}

export async function getLeague(
  leagueId: number,
  currentEventId: number
): Promise<League> {
  const league = await fetchLeague({ leagueId });
  const {
    league: { name, id },
    standings: { results },
  } = league;
  const managers = await Promise.all(
    results.slice(0, 20).map(async (result) => {
      const [gw, transfersResponse, historyResponse] = await Promise.all([
        fetchGameweek({
          teamId: result.entry,
          eventId: currentEventId,
        }),
        fetchTransfers({ teamId: result.entry }),
        fetchHistory({ teamId: result.entry }),
      ]);

      const picks = gw.picks.reduce((acc, pick) => {
        acc[pick.element] = getPickType(pick);
        return acc;
      }, {} as Manager["picks"]);

      const transfers = parseGameweekTransfers(
        transfersResponse,
        currentEventId
      );

      const chips = parseChips(historyResponse);

      const manager: Manager = {
        id: result.entry,
        name: result.player_name,
        teamName: result.entry_name,
        rank: result.rank,
        totalPoints: result.total,
        eventPoints: gw.entry_history.points,
        totalMoney: gw.entry_history.value * 0.1,
        bankMoney: gw.entry_history.bank * 0.1,
        picks,
        chips,
        transfers,
      };
      return manager;
    })
  );
  return {
    name,
    id,
    managers,
  };
}
