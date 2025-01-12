const PlatformTypes = {
  PC: {
    id: "pc",
    displayName: "PC",
  },
  PS3: {
    id: "ps3",
    displayName: "PlayStation 3",
  },
  XBOX_360: {
    id: "xbox360",
    displayName: "Xbox 360",
  },
  PS4: {
    id: "ps4",
    displayName: "PlayStation 4",
  },
  XBOX_ONE: {
    id: "xboxone",
    displayName: "Xbox One",
  },
  PS5: {
    id: "ps5",
    displayName: "PlayStation 5",
  },
  XBOX_SERIES_X: {
    id: "xboxseriesx",
    displayName: "Xbox Series X",
  },
  SWITCH: {
    id: "switch",
    displayName: "Nintendo Switch",
  },
};

const RegionTypes = {
  US: {
    id: "us",
    displayName: "United States",
  },
  EUR: {
    id: "eur",
    displayName: "Europe",
  },
  ASIA: {
    id: "asia",
    displayName: "Asia",
  },
  JP: {
    id: "jp",
    displayName: "Japan",
  },
};

const EditionTypes = {
  STANDARD: {
    id: "std",
    displayName: "Standard",
  },
  LIMITED: {
    id: "le",
    displayName: "Limited",
  },
  COLLECTORS: {
    id: "ce",
    displayName: "Collector's",
  },
};

function mapItemToLabel(input, itemType) {
  // Account for case-insensitive matching
  const normalizedInput = input.toLowerCase();
  const matchedItem = Object.values(itemType).find(
    (item) => item.id === normalizedInput
  );

  // Return display name if found, otherwise return original input
  return matchedItem ? matchedItem.displayName : input;
}

export { PlatformTypes, RegionTypes, EditionTypes, mapItemToLabel };
