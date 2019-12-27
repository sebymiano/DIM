import React from 'react';
import { DimItem, DimSocket } from 'app/inventory/item-types';
import { bungieBackgroundStyle } from 'app/dim-ui/BungieImage';
import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { RootState } from 'app/store/reducers';
import { connect } from 'react-redux';
import styles from './ModSocketTypeIcon.m.scss';
import modSocketsByName from 'data/d2/seasonal-mod-slots.json';

// specialty sockets are seasonal-ish, thus-far. some correspond to a season, some to an expansion
const specialtyModSocketHashes = Object.values(modSocketsByName).flat();
export const specialtyModSocketFilterNames = Object.keys(modSocketsByName);

/** verifies an item is d2 armor and has a specialty mod socket, which is returned */
export const getSpecialtySocket: (item: DimItem) => DimSocket | false = (item) =>
  (item.isDestiny2() &&
    item.bucket?.sort === 'Armor' &&
    item.sockets?.sockets.find((socket) =>
      specialtyModSocketHashes.includes(socket?.plug?.plugItem?.plug?.plugCategoryHash ?? -99999999)
    )) ??
  false;

/** returns a matched filter name or false if not found */
export const getSpecialtyModSocketFilterName: (item: DimItem) => string | false = (item) => {
  const foundSocket = getSpecialtySocket(item);
  return (
    (foundSocket &&
      specialtyModSocketFilterNames.find((key) =>
        modSocketsByName[key].includes(foundSocket.plug!.plugItem.plug.plugCategoryHash)
      )) ||
    false
  );
};

/** this returns a string for easy printing purposes. '' if not found */
export const getSpecialtyModSocketDisplayName: (item: DimItem) => string = (item) => {
  const foundSocket = getSpecialtySocket(item);
  return (foundSocket && foundSocket.plug!.plugItem.itemTypeDisplayName) || '';
};

const armorSlotSpecificPlugCategoryIdentifier = /enhancements\.v2_(head|arms|chest|legs|class_item)/i;

/** verifies an item is d2 armor and has an armor slot specific mod socket, which is returned */
export const getArmorSlotSpecificModSocket: (item: DimItem) => DimSocket | false = (item) =>
  (item.isDestiny2() &&
    item.bucket?.sort === 'Armor' &&
    item.sockets?.sockets.find((socket) =>
      socket?.plug?.plugItem?.plug?.plugCategoryIdentifier.match(
        armorSlotSpecificPlugCategoryIdentifier
      )
    )) ??
  false;

/** this returns a string for easy printing purposes. '' if not found */
export const getArmorSlotSpecificModSocketDisplayName: (item: DimItem) => string = (item) => {
  const foundSocket = getArmorSlotSpecificModSocket(item);
  return (foundSocket && foundSocket.plug!.plugItem.itemTypeDisplayName) || '';
};

interface ProvidedProps {
  item: DimItem;
  className?: string;
  lowRes?: boolean;
}
interface StoreProps {
  defs: D2ManifestDefinitions;
}
function mapStateToProps() {
  return (state: RootState): StoreProps => ({
    defs: state.manifest.d2Manifest!
  });
}
type Props = ProvidedProps & StoreProps;

function disconnectedSpecialtyModSocketIcon({ item, className, lowRes, defs }: Props) {
  const foundSocket = getSpecialtySocket(item);
  const emptySocketHash = foundSocket && foundSocket.socketDefinition.singleInitialItemHash;
  const emptySocketIcon = emptySocketHash && defs.InventoryItem.get(emptySocketHash);
  return emptySocketIcon ? (
    <div
      className={`${className} ${styles.specialtyModIcon} ${lowRes ? styles.lowRes : ''}`}
      title={emptySocketIcon.itemTypeDisplayName}
      style={bungieBackgroundStyle(emptySocketIcon.displayProperties.icon)}
    />
  ) : null;
}
export const SpecialtyModSocketIcon = connect<StoreProps>(mapStateToProps)(
  disconnectedSpecialtyModSocketIcon
);

function disconnectedArmorSlotSpecificModSocketIcon({ item, className, lowRes, defs }: Props) {
  const foundSocket = getArmorSlotSpecificModSocket(item);
  const emptySocketHash = foundSocket && foundSocket.socketDefinition.singleInitialItemHash;
  const emptySocketIcon = emptySocketHash && defs.InventoryItem.get(emptySocketHash);
  return emptySocketIcon ? (
    <div
      className={`${className} ${styles.specialtyModIcon} ${lowRes ? styles.lowRes : ''}`}
      title={emptySocketIcon.itemTypeDisplayName}
      style={bungieBackgroundStyle(emptySocketIcon.displayProperties.icon)}
    />
  ) : null;
}
export const ArmorSlotSpecificModSocketIcon = connect<StoreProps>(mapStateToProps)(
  disconnectedArmorSlotSpecificModSocketIcon
);
