import { ItemsOf } from "~/util/utilityTypes";

export const playerPositions = ["GKP", "DEF", "MID", "FWD"] as const;
export type PlayerPosition = ItemsOf<typeof playerPositions> | "???";
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
}

export interface Chip {
  eventId: number;
  name: string;
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
    [id: number]: PickType;
  };
  transfers: {
    in: number[];
    out: number[];
  };
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
