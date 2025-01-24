import React, { useMemo } from "react";

import useApi from "../hooks/useApi";

import "./ColorLabel.css";

interface Props {
  brickLinkColorId?: string;
}

function ColorLabel({ brickLinkColorId }: Props) {
  const { getColor } = useApi();

  const color = useMemo(() => {
    return brickLinkColorId ? getColor(brickLinkColorId) : undefined;
  }, [getColor, brickLinkColorId]);

  if (color) {
    return (
      <div className="ColorLabel">
        <span style={{ backgroundColor: `#${color.hex}` }} className="ColorLabel-hex" />
        {color.bricklinkName}
      </div>
    );
  }

  return null;
}

export default ColorLabel;
