import React from 'react';
import { D2Item } from '../inventory/item-types';
// import { RootState } from '../store/reducers';
// import './item-review.scss';
// import { connect, DispatchProp } from 'react-redux';
// import { storesSelector } from 'app/inventory/reducer';
// import { DimStore } from 'app/inventory/store-types';
import { DestinyClass } from 'bungie-api-ts/destiny2';
// import { t } from 'app/i18next-t';
import SpecialtyModSlotIcon from 'app/dim-ui/SpecialtyModSlotIcon';
import { armorStatHashes } from 'app/search/search-filter-hashes';
import includeIf from 'app/utils/include-if';
import { getItemSpecialtyModSlotFilterName } from 'app/utils/item-utils';
import ElementIcon from 'app/inventory/ElementIcon';
import BungieImage from 'app/dim-ui/BungieImage';

// surprisingly chill
export default function ItemTriage({ item }: { item: D2Item }) {
  const factors = getItemDesirableFactors(item);

  return (
    <>
      {factors.map((factor, index) => (
        <div key={index}>{factor.itemLabel}</div>
      ))}
    </>
  );
}

function getItemDesirableFactors(item: D2Item) {
  const statsToFindMaxesFor = armorStatHashes.concat(item.primStat?.statHash ?? []);

  const itemCollections: { [key: string]: D2Item[] } = {
    sort: item
      .getStoresService()
      .getAllItems()
      .filter(
        (i) =>
          i.bucket.sort === item.bucket.sort &&
          (item.classType === DestinyClass.Unknown ||
            i.classType === DestinyClass.Unknown ||
            i.classType === item.classType)
      )
  };
  itemCollections.slot = itemCollections.sort.filter((i) => i.bucket.hash === item.bucket.hash);

  const factorFinders: {
    itemLabel: React.ReactElement;
    compare: string;
    overall: any;
    accessor(i: D2Item): any;
  }[] = [
    {
      itemLabel: <ElementIcon element={item.dmg} />,
      accessor: (i: D2Item) => i.dmg === item.dmg,
      compare: 'total',
      overall: 0
    },
    ...includeIf(getItemSpecialtyModSlotFilterName(item), {
      itemLabel: <SpecialtyModSlotIcon item={item} />,
      accessor: (i: D2Item) =>
        getItemSpecialtyModSlotFilterName(i) === getItemSpecialtyModSlotFilterName(item),
      compare: 'total',
      overall: 0
    }),
    ...includeIf(
      item.stats,
      item
        .stats!.filter((stat) => statsToFindMaxesFor.includes(stat.statHash))
        .map((stat) => ({
          itemLabel: (
            <>
              <BungieImage src={stat.displayProperties.icon} />
              {stat.displayProperties.name}
            </>
          ),
          accessor: (i: D2Item) => i.stats?.find((s) => s.statHash === stat.statHash)?.base ?? 0,
          compare: 'max',
          overall: 0
        }))
    )
  ];

  itemCollections.slot.forEach((i) =>
    factorFinders.forEach((f) => {
      if (f.compare === 'max') {
        const thisValue = f.accessor(i);
        f.overall = Math.max(f.overall, thisValue ?? 0);
      }
      if (f.compare === 'total' && f.accessor(i)) {
        f.overall++;
      }
    })
  );
  // console.log(factorFinders);
  // t('Triage.HighestInSlot'),
  // t('Triage.NumberOfThese'),

  // remove filters this item doesn't meet the standards for
  return factorFinders.filter(
    (f) =>
      (f.compare === 'max' && f.overall <= f.accessor(item)) ||
      (f.compare === 'total' && f.overall === 1)
  );
}
/*
function NumberOfItemType({ item }: { item: D2Item }) {
  t('Triage.NumberOfThese');
}
*/
