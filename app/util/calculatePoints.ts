import { PitchPick } from "~/services/api";
export const calculatePoints = (picks: PitchPick[]) => {
  let total = 0;
  picks.forEach((pick) => {
    if (pick.multiplier !== 0) {
      total += pick.points || 0;
    }
  });
  return total;
};
