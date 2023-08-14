import React from "react";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import { useLeagueData } from "~/hooks/useRouteData";
import { formatName } from "~/util/formatName";
import managerData from "~/data/managers.json";
import { sortBy } from "~/util/sortBy";

const lilSpacer = <Spacer height={5} />;

const Calculation: React.FC<{}> = (props) => {
  const {
    managers,
    prizeCalculation: { buyIns, totalPrize, prizes, pots },
  } = useLeagueData();

  React.useEffect(() => {
    const managersNotPaid = managers.filter((m) => !m.buyIn);
    console.group();
    console.log("NOT PAID:");
    sortBy(managersNotPaid, "name").forEach((m) => {
      console.log(m.name);
    });
    console.groupEnd();

    console.group();
    console.log("NOT JOINED:");
    managerData.forEach(({ name }) => {
      if (!managers.find((m) => m.name.toLowerCase() === name)) {
        console.log(name);
      }
    });
    console.groupEnd();
  }, [managers]);

  return (
    <Section>
      <h3>Prize calculation breakdown</h3>
      {lilSpacer}
      <div>
        <strong>Podium split per pot</strong>
        {lilSpacer}
        <div>#1: 50%</div>
        <div>#2: 30%</div>
        <div>#3: 20%</div>
      </div>
      <Spacer height={20} />
      <div>
        {buyIns.map((buyIn, index) => {
          const { totalPrize, managers, prizes } = pots[buyIn];
          if (buyIn === 0) return null;
          return (
            <div key={buyIn}>
              <strong>£{buyIn} buy-in pot</strong>
              {lilSpacer}
              <div>Managers ({managers.length}): </div>
              <div>
                {managers.map((manager) => formatName(manager.name)).join(", ")}
              </div>
              {lilSpacer}
              <div>{`Total prize: ${managers.length} x (${buyIn} - ${
                buyIns[index + 1] || 0
              }) = £${totalPrize}`}</div>

              {lilSpacer}
              <div>
                Winners:
                {prizes?.map((prize, index) => {
                  return (
                    <div key={index}>
                      #{index + 1}: {formatName(prize.manager.name)}, £
                      {prize.value}
                    </div>
                  );
                })}
              </div>
              <Spacer height={20} />
            </div>
          );
        })}
        <div>
          <strong>Overall</strong>
          {lilSpacer}
          <div>Total prize: £{totalPrize}</div>
          {lilSpacer}
          <div>
            Winners:
            {prizes?.map((prize, index) => {
              return (
                <div key={index}>
                  {formatName(prize.manager.name)}, £{prize.value}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Calculation;
