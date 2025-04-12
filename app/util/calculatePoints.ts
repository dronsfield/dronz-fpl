import { PitchPick } from "~/services/api";
export const calculatePoints = (picks: PitchPick[]) => {
  let total = 0;
  picks.forEach((pick) => {
    total += (pick.points || 0) * (pick.multiplier || 1);
  });
  return total;
};
