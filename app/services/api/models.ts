import { ItemsOf, Maybe } from "~/util/utilityTypes";

export const playerPositions = ["GKP", "DEF", "MID", "FWD"] as const;
export type PlayerPosition = ItemsOf<typeof playerPositions> | "???";
export const positionIndexes: Record<PlayerPosition, number | null> = {
  GKP: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
  "???": null,
};
export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  webName: string;
  teamId: number;
  teamCode: number;
  selectedBy: string;
  position: PlayerPosition;
  cost: number;
  gameweekStats: { [key: string]: Maybe<string | number | boolean> };
}
export type Players = { [id: number]: Player };
export interface Team {
  id: number;
  code: number;
  name: string;
  shortName: string;
}
export type Teams = { [id: number]: Team };

export interface GameweekTransfers {
  in: number[];
  out: number[];
  cost: number | null;
}

export const chipKeys = ["wc1", "wc2", "fh", "tc", "bb"] as const;
export type ChipKey = ItemsOf<typeof chipKeys>;
export const chipLabels = {
  wc1: "Wildcard 1",
  wc2: "Wildcard 2",
  fh: "Free Hit",
  // fh2: "Free Hit 2",
  tc: "Triple Captain",
  bb: "Bench Boost",
} as const;
export interface Chip {
  eventId: number;
  key: ChipKey | null;
}

export type PickType = "STARTING" | "BENCHED" | "CAPTAIN" | "VICE";
export interface Manager {
  id: number;
  name: string;
  teamName: string;
  rank: number;
  totalPoints: number;
  eventPoints: number;
  totalMoney: number;
  bankMoney: number;
  picks: {
    [id: number]: {
      pickType: PickType;
      position: number;
      multiplier: number;
    };
  };
  transfers: GameweekTransfers;
  chips: Chip[];
}
export interface League {
  id: number;
  name: string;
  managers: Manager[];
}

export interface FixtureTeam {
  teamId: number;
  team: Team;
  score: number | null;
  stats: {
    [identifier: string]: { value: number; element: number }[];
  };
}
export interface Fixture {
  id: number;
  kickoffTime: string;
  started: boolean;
  finished: boolean;
  home: FixtureTeam;
  away: FixtureTeam;
}

// a league in the context of a list of one manager's leagues
export interface ManagerLeague {
  id: number;
  name: string;
  managerRank: number;
}
export interface ManagerProfile {
  id: number;
  name: string;
  overallRank: number;
  leagues: Array<ManagerLeague>;
}

export interface PitchPick {
  player: Player;
  pickType: PickType;
  points?: number;
  position?: number;
  value?: Maybe<string | number | boolean>;
  multiplier?: number;
}

export interface BasicFixtureInfoPerTeam {
  [teamId: number]: Array<{
    started: boolean;
    isHome: boolean;
    opponent: Team;
    shorthand: string;
  }>;
}
