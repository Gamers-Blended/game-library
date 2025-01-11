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

function mapper(input) {
  // Account for case-insensitive matching
  const normalizedInput = input.toLowerCase();
  const matchedPlatform = Object.values(PlatformTypes).find(
    (platform) => platform.id === normalizedInput
  );

  // Return display name if found, otherwise return original input
  return matchedPlatform ? matchedPlatform.displayName : input;
}

export { PlatformTypes, mapper };

// export default function OptionMapper() {}
