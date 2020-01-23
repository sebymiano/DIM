import React from 'react';
import { D2Item } from '../inventory/item-types';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import {
  getSpecialtyModSocketDisplayName,
  //   SpecialtyModSocketIcon,
  getArmorSlotSpecificModSocketDisplayName,
  ArmorSlotSpecificModSocketIcon
} from 'app/dim-ui/ModSocketTypeIcon';
// import { armorStatHashes } from 'app/search/search-filter-hashes';
import ElementIcon from 'app/inventory/ElementIcon';
// import BungieImage from 'app/dim-ui/BungieImage';
import styles from './ItemTriage.m.scss';

// surprisingly chill. this seems to just render 2x when item popup spawns.
// much fewer than i worried. why twice though??
export default function ItemTriage({ item }: { item: D2Item }) {
  getAllItemFactors(item);

  return (
    <div className={styles.itemTriagePane}>
      {/*factors.map((factor, index) => (
        <div key={index}>{factor.factors.map((factor) => factor.render)}</div>
      ))*/}
    </div>
  );
}
interface Factor {
  render(item: D2Item): React.ReactElement;
  value(item: D2Item): string;
}
// : { [key: string]: Factor }
const itemFactors: { [key: string]: Factor } = {
  element: {
    render: (item) => <ElementIcon className={styles.inlineIcon} element={item.dmg} />,
    value: (item) => item.dmg ?? 'asdf'
  },
  specialtySocket: {
    render: (item) => (
      <ArmorSlotSpecificModSocketIcon className={styles.inlineIcon} item={item} lowRes={true} />
    ),
    value: getSpecialtyModSocketDisplayName
  },
  armorSlot: {
    render: (item) => <ElementIcon className={styles.inlineIcon} element={item.dmg} />,
    value: getArmorSlotSpecificModSocketDisplayName
  }
};

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
      const combination = ['element']
        .map((factor) => factor + itemFactors[factor].value(item))
        .join();
      combinationCounts[combination] = (combinationCounts[combination] ?? 0) + 1;
    });
  console.log(combinationCounts);
  return combinationCounts;
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
