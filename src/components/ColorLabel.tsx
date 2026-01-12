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

  return (
    <div className="ColorLabel">
      <span style={{ backgroundColor: color?.hex ? `#${color.hex}` : undefined }} className="ColorLabel-hex" />
      {color?.bricklinkName ?? brickLinkColorId}
    </div>
  );
}

export default ColorLabel;
