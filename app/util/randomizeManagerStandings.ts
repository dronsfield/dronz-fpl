import { BuyInManager } from "~/util/calculatePrizes";

export function randomizeManagerStandingsWithBuyIn(
  buyInManagers: BuyInManager[]
): BuyInManager[] {
  const randomizedManagers = buyInManagers.map((manager) => {
    // Base points range
    const basePoints = 1500;
    const randomRange = 800;

    // Weight the randomization based on buy-in amount
    // Higher buy-ins get a bonus to their points
    const buyInBonus = manager.buyIn * 5; // £1 buy-in = 5 point bonus

    // Generate weighted random points
    const randomPoints =
      Math.floor(Math.random() * randomRange) + basePoints + buyInBonus;

    // Generate random event points between 20-100
    const randomEventPoints = Math.floor(Math.random() * 80) + 30;

    return {
      ...manager,
      totalPoints: randomPoints,
      eventPoints: randomEventPoints,
      rank: 0, // This will be updated after sorting
    };
  });

  // Sort by total points in descending order and update ranks
  return randomizedManagers
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((manager, index) => ({
      ...manager,
      rank: index + 1, // Update rank based on sorted position
    }));
}
