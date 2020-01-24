import React from 'react';
import { D2Item } from '../inventory/item-types';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import {
  getSpecialtyModSocketDisplayName,
  SpecialtyModSocketIcon,
  getArmorSlotSpecificModSocketDisplayName,
  ArmorSlotSpecificModSocketIcon
} from 'app/dim-ui/ModSocketTypeIcon';
import ElementIcon from 'app/inventory/ElementIcon';
import styles from './ItemTriage.m.scss';
import _ from 'lodash';
import { KeepJunkDial, getValueColors } from './ValueDial';
import BungieImage from 'app/dim-ui/BungieImage';

interface Factor {
  id: string;
  runIf(item: D2Item): any;
  render(item: D2Item): React.ReactElement;
  value(item: D2Item): string;
}

// : { [key: string]: Factor }
const itemFactors: { [key: string]: Factor } = {
  name: {
    id: 'name',
    runIf: () => true,
    render: (item) => (
      <>
        <BungieImage className={styles.inlineIcon} src={item.icon} /> {item.name}
      </>
    ),
    value: (item) => item.name
  },
  element: {
    id: 'element',
    runIf: (item) => item.dmg,
    render: (item) => <ElementIcon className={styles.inlineIcon} element={item.dmg} />,
    value: (item) => item.dmg!
  },
  specialtySocket: {
    id: 'specialtySocket',
    runIf: getSpecialtyModSocketDisplayName,
    render: (item) => (
      <SpecialtyModSocketIcon className={styles.inlineIcon} item={item} lowRes={true} />
    ),
    value: getSpecialtyModSocketDisplayName
  },
  armorSlot: {
    id: 'armorSlot',
    runIf: getArmorSlotSpecificModSocketDisplayName,
    render: (item) => (
      <ArmorSlotSpecificModSocketIcon className={styles.inlineIcon} item={item} lowRes={true} />
    ),
    value: getArmorSlotSpecificModSocketDisplayName
  }
};

const factorCombos = {
  Weapons: [[itemFactors.element]],
  Armor: [
    [itemFactors.element, itemFactors.specialtySocket, itemFactors.armorSlot],
    [itemFactors.element, itemFactors.specialtySocket],
    [itemFactors.name]
  ],
  General: [[itemFactors.element]]
};
const combosToCalculate: Factor[][] = _.uniqWith(Object.values(factorCombos).flat(), _.isEqual);

// surprisingly chill. this seems to just render 2x when item popup spawns.
// much fewer than i worried. why twice though??
export default function ItemTriage({ item }: { item: D2Item }) {
  // asdf
  const allItemFactors = getAllItemFactors(item);
  const similarFactors = factorCombos[item.bucket.sort as keyof typeof factorCombos]
    .filter((factorCombo) => factorCombo.every((factor) => factor.runIf(item)))
    .map((factorCombo) => {
      const count = allItemFactors[applyFactorCombo(item, factorCombo)] - 1;
      return {
        count,
        quality: 100 - count * (100 / 3),
        display: renderFactorCombo(item, factorCombo)
      };
    });

  const allStatMaxes = getStatMaxes(item);
  const tier = item.tier === 'Exotic' ? 'everything' : 'legendary or below';
  const notableStats =
    item.bucket.inArmor &&
    item.stats
      ?.filter((stat) => stat.base / allStatMaxes[tier][stat.statHash] >= 0.8)
      .map((stat) => {
        const best = allStatMaxes[tier][stat.statHash];
        const rawRatio = stat.base / best;
        return {
          best,
          quality: 100 - (10 - Math.floor(rawRatio * 10)) * (100 / 3),
          percent: Math.floor(rawRatio * 100),
          stat
        };
      });

  return (
    <div className={styles.itemTriagePane}>
      <div className={styles.triageTable}>
        <div className={`${styles.factorCombo} ${styles.header}`}>This item</div>
        <div className={`${styles.comboCount} ${styles.header}`}>Similar items</div>
        <div className={`${styles.keepMeter} ${styles.header}`} />
        <div className={styles.headerDivider} />
        {similarFactors.map(({ count, quality, display }) => (
          <>
            {display}
            <div className={styles.comboCount}>{count}</div>
            <div className={styles.keepMeter}>
              <KeepJunkDial value={quality} />
            </div>
          </>
        ))}
      </div>
      {notableStats && (
        <div className={styles.triageTable}>
          <div className={`${styles.bestStat} ${styles.header}`}>
            Best item (
            <ArmorSlotSpecificModSocketIcon
              className={styles.inlineIcon}
              item={item}
              lowRes={true}
            />
            )
          </div>
          <div className={`${styles.thisStat} ${styles.header}`}>This item</div>
          <div className={`${styles.keepMeter} ${styles.header}`} />
          <div className={styles.headerDivider} />

          {notableStats.map(({ best, quality, percent, stat }) => (
            <>
              <div className={styles.bestStat}>
                {stat.displayProperties.name}
                {(stat.displayProperties.icon && (
                  <BungieImage
                    key={stat.statHash}
                    className={styles.inlineIcon}
                    src={stat.displayProperties.icon}
                  />
                )) ||
                  ' '}
                {best}
              </div>
              <div className={styles.thisStat}>
                <span style={{ fontWeight: 'bold', color: getValueColors(quality)[1] }}>
                  {percent}%
                </span>{' '}
                ({stat.base})
              </div>
              <div className={styles.keepMeter}>
                <KeepJunkDial value={quality} />
              </div>
            </>
          ))}
        </div>
      )}
    </div>
  );
}
// console.log(combosToCalculate);
// export type TagValue = keyof typeof tagConfig | 'clear' | 'lock' | 'unlock';
// interface Factor {
//   render: React.ReactElement;
//   compareToExample(i: D2Item): boolean;
//   overallAdjust(overall: number, item: D2Item): number;
// }
// type FactorGenerator = (exampleItem: D2Item, statHash?: number) => Factor;

// these contain a rendered version of a desirable item factor,
// and a function to compare other items to the triaged one
// const itemElement: FactorGenerator = (exampleItem) => ({
//   render: <ElementIcon className={styles.inlineIcon} element={exampleItem.dmg} />,
//   compareToExample: (i: D2Item) => i.dmg === exampleItem.dmg,
//   overallAdjust: (overall: number, _item: D2Item) => overall++
// });
// const itemSpecialtySocket: FactorGenerator = (exampleItem) => ({
//   render: <SpecialtyModSocketIcon className={styles.inlineIcon} item={exampleItem} lowRes={true} />,
//   compareToExample: (i: D2Item) =>
//     getSpecialtyModSocketDisplayName(i) === getSpecialtyModSocketDisplayName(exampleItem),
//   overallAdjust: (overall: number, _item: D2Item) => overall++
// });
// const itemArmorSlotSpecificSocket: FactorGenerator = (exampleItem) => ({
//   render: (
//     <ArmorSlotSpecificModSocketIcon
//       className={styles.inlineIcon}
//       item={exampleItem}
//       lowRes={true}
//     />
//   ),
//   compareToExample: (i: D2Item) =>
//     getArmorSlotSpecificModSocketDisplayName(i) ===
//     getArmorSlotSpecificModSocketDisplayName(exampleItem),
//   overallAdjust: (overall: number, _item: D2Item) => overall++
// });

// const itemStat: FactorGenerator = (exampleItem: D2Item, statHash) => {
//   const statDisplayProperties = exampleItem.stats?.find((s) => s.statHash === statHash)
//     ?.displayProperties;
//   return {
//     render: (
//       <>
//         {statDisplayProperties && statDisplayProperties.icon && (
//           <BungieImage className={styles.inlineIcon} src={statDisplayProperties.icon} />
//         )}
//         {statDisplayProperties && statDisplayProperties.name}
//       </>
//     ),
//     compareToExample: (_i: D2Item) => true,
//     overallAdjust: (overall: number, item: D2Item) =>
//       Math.max(overall, item.stats?.find((s) => s.statHash === statHash)?.base ?? 0)
//   };
// };

// a function
// function checkFactors(exampleItem: D2Item) {
//   const allItemFactors = getAllItemFactors(exampleItem);
//   const matchedFactors = factorCombos[exampleItem.bucket.sort as keyof typeof factorCombos].filter(
//     (factorCombo) => !(allItemFactors[applyFactorCombo(exampleItem, factorCombo)] > 999)
//   );
//   return matchedFactors.map((factorCombo) => renderFactorCombo(exampleItem, factorCombo));
// }

function getAllItemFactors(exampleItem: D2Item) {
  const combinationCounts: { [key: string]: number } = {};
  exampleItem
    .getStoresService()
    .getAllItems()
    .filter(
      (i) =>
        i.bucket.sort === exampleItem.bucket.sort &&
        (exampleItem.classType === DestinyClass.Unknown ||
          i.classType === DestinyClass.Unknown ||
          i.classType === exampleItem.classType)
    )
    .forEach((item) => {
      combosToCalculate.forEach((factorCombo) => {
        const combination = applyFactorCombo(item, factorCombo);
        combinationCounts[combination] = (combinationCounts[combination] ?? 0) + 1;
      });
    });
  return combinationCounts;
}

function getStatMaxes(exampleItem: D2Item) {
  const statMaxes: {
    everything: { [key: number]: number };
    'legendary or below': { [key: number]: number };
  } = {
    everything: {},
    'legendary or below': {}
  };
  exampleItem
    .getStoresService()
    .getAllItems()
    .filter(
      (i) =>
        i.bucket.hash === exampleItem.bucket.hash &&
        (exampleItem.classType === DestinyClass.Unknown ||
          i.classType === DestinyClass.Unknown ||
          i.classType === exampleItem.classType)
    )
    .forEach((item) => {
      if (item.stats) {
        const tierInfo =
          item.tier === 'Exotic' ? ['everything'] : ['legendary or below', 'everything'];
        item.stats.forEach((stat) => {
          tierInfo.forEach((tier) => {
            const bestStatNow: number =
              statMaxes[tier][stat.statHash] ?? (stat.smallerIsBetter ? 9999999 : -9999999);
            const newBestStat = (stat.smallerIsBetter ? Math.min : Math.max)(
              bestStatNow,
              stat.base
            );
            statMaxes[tier][stat.statHash] = newBestStat;
          });
        });
      }
    });
  return statMaxes;
}

function applyFactorCombo(item: D2Item, factorCombo: Factor[]) {
  return factorCombo.map((factor) => factor.id + factor.value(item)).join();
}
function renderFactorCombo(item: D2Item, factorCombo: Factor[]) {
  return (
    <div className={styles.factorCombo}>{factorCombo.map((factor) => factor.render(item))}</div>
  );
}
// function getItemDesirableFactors(exampleItem: D2Item) {
// const statsToFindMaxesFor = armorStatHashes.concat(exampleItem.primStat?.statHash ?? []);

// itemCollections.sort -- in the same major category (Weapons|Armor|General|Inventory)
// const itemCollections: { [key: string]: D2Item[] } = {
//   sort: exampleItem
//     .getStoresService()
//     .getAllItems()
//     .filter(
//       (i) =>
//         i.bucket.sort === exampleItem.bucket.sort &&
//         (exampleItem.classType === DestinyClass.Unknown ||
//           i.classType === DestinyClass.Unknown ||
//           i.classType === exampleItem.classType)
//     )
// };
// // itemCollections.slot -- in the same slot (Energy Weapons|Power Weapons|Helmet|Ghost|etc)
// itemCollections.slot = itemCollections.sort.filter(
//   (i) => i.bucket.hash === exampleItem.bucket.hash
// );

// exampleItem
//   .getStoresService()
//   .getAllItems()
//   .filter(
//     (i) =>
//       i.bucket.sort === exampleItem.bucket.sort &&
//       (exampleItem.classType === DestinyClass.Unknown ||
//         i.classType === DestinyClass.Unknown ||
//         i.classType === exampleItem.classType)
//   );

// const factorFinders: {
//   factors: Factor[];
//   overall: any;
// }[] = [];

// if (exampleItem.bucket.sort && ['Weapons'].includes(exampleItem.bucket.sort)) {
//   factorFinders.push({
//     factors: [itemElement(exampleItem)],
//     overall: 0
//   });
// }

// if (exampleItem.bucket.sort && ['Armor'].includes(exampleItem.bucket.sort)) {
//   if (getSpecialtyModSocketDisplayName(exampleItem)) {
//     factorFinders.push(
//       {
//         factors: [itemArmorSlotSpecificSocket(exampleItem), itemSpecialtySocket(exampleItem)],
//         overall: 0
//       },
//       {
//         factors: [itemElement(exampleItem), itemSpecialtySocket(exampleItem)],
//         overall: 0
//       },
//       ...statsToFindMaxesFor.map((statHash) => ({
//         factors: [itemStat(exampleItem, statHash)],
//         overall: 0
//       }))
//     );
//   }
// }

// factorFinders.forEach((factorFinder) =>
//   itemCollections.slot.forEach((item) => {
//     if (factorFinder.factors.every((factor) => factor.compareToExample(item))) {
//       factorFinder.overall = factorFinder.factors[0].overallAdjust(factorFinder.overall, item);
//     }
//   })
// );
// t('Triage.HighestInSlot'),
// t('Triage.NumberOfThese'),

// remove filters this item doesn't meet the standards for
// console.log(factorFinders);
// return factorFinders;
/*.filter(
    (factorFinder) =>
      // (factorFinder.compare === 'max' && f.overall <= f.accessor(item)) ||
      factorFinder.overall === 1
  );*/
// }
/*
function NumberOfItemType({ item }: { item: D2Item }) {
  t('Triage.NumberOfThese');
}
*/

// function logthru<T>(x: T): T {
//   console.log(x);
//   return x;
// }
