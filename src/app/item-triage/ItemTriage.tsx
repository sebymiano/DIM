import React from 'react';
import { D2Item } from '../inventory/item-types';
// import { RootState } from '../store/reducers';
// import './item-review.scss';
// import { connect, DispatchProp } from 'react-redux';
// import { storesSelector } from 'app/inventory/reducer';
// import { DimStore } from 'app/inventory/store-types';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import { t } from 'app/i18next-t';
// import SpecialtyModSlotIcon from 'app/dim-ui/SpecialtyModSlotIcon';
import { armorStatHashes } from 'app/search/search-filter-hashes';

export default function ItemTriage({ item }: { item: D2Item }) {
  const factors = getItemDesirables(item);
  // const bucketSet = new Set();
  // allItemsInThisSlot.forEach((i) => bucketSet.add(i.bucket.name));
  // console.log(bucketSet);
  // t('Triage.HighestInSlot')
  // t('Triage.NumberOfThese')
  if (!factors) {
  }
  return (
    <>
      {factors.map(
        (factor) =>
          ((factor.compare === 'max' && factor.overall === factor.accessor(item)) ||
            (factor.compare === 'total' && factor.overall === 1)) && <div>{factor.label}</div>
      )}
    </>
  );
}

function getItemDesirables(item: D2Item) {
  const allItemsInThisSlot = item
    .getStoresService()
    .getAllItems()
    .filter(
      (i) =>
        i.bucket === item.bucket &&
        (item.classType === DestinyClass.Unknown ||
          i.classType === DestinyClass.Unknown ||
          i.classType === item.classType)
    );
  const factorFinders: {
    label: string;
    compare: string;
    overall: any;
    accessor(i: D2Item): any;
  }[] = [
    {
      label: t('Triage.NumberOfThese'),
      accessor: (i: D2Item) => i.dmg === item.dmg,
      compare: 'total',
      overall: 0
    },
    ...(item.stats
      ?.filter((stat) => armorStatHashes.includes(stat.statHash))
      .map((stat) => ({
        label: t('Triage.HighestInSlot', { stat: stat.displayProperties.name }),
        accessor: (i: D2Item) => i.stats?.find((s) => s.statHash === stat.statHash)?.base ?? 0,
        compare: 'max',
        overall: 0
      })) ?? [])
  ];
  if (!factorFinders) {
  }
  allItemsInThisSlot.forEach((i) =>
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
  console.log(factorFinders);
  return factorFinders;
  // const howManyOf = [{ name: <SpecialtyModSlotIcon item=/> }];
  // const bestOf = [];
}
/*
interface ProvidedProps {
  item: DimItem;
}

interface StoreProps {
  // canReview: boolean;
  stores: DimStore[];
}

function mapStateToProps(state: RootState, { item }: ProvidedProps): StoreProps {
  // const settings = state.settings;
  // const reviewsResponse = getReviews(item, state);
  console.log(item);
  return {
    // canReview: settings.allowIdPostToDtr
    stores: storesSelector(state)
  };
}

type Props = ProvidedProps & StoreProps & DispatchProp<any>;

interface State {
  submitted: boolean;
  expandReview: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class ItemReviews extends React.Component<Props, State> {
  render() {
    const { stores, item } = this.props;
    // const { submitted, expandReview } = this.state;

    if (!$featureFlags.reviewsEnabled) {
      return null;
    }
    /*
    if (!canReview) {
      return <div />;
    }

    // const canCreateReview = canReview && item.owner;
    if (!item) {
      console.log();
    }
    return <div />;
  }
}

export default connect<StoreProps>(mapStateToProps)(ItemReviews);
*/
