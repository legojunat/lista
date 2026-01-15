import React, { useMemo } from "react";
import classNames from "classnames";

import { Material } from "../types/material";

import ColorLabel from "./ColorLabel";
import BrickLinkImage from "./BrickLinkImage";

import "./Image.css";
import { getLugbulkPrice } from "../utils/lugbulk-price";
import { euroCents } from "../utils/euro-cents";
import { formattedQuantity } from "../utils/formatted-quantity";

interface Props {
  material: Material;
  zoomed: boolean;
}

function Image({ material, zoomed }: Props) {
  const bottomLabel = useMemo(() => {
    if (material) {
      const textArea = document.createElement("textarea");
      textArea.innerHTML = material.item.name;
      const parts = [
        `${material.item.brickLinkPartId} ${textArea.value}`,
        `BL hinta (qty max): ${euroCents(material.price.qtyAvgPrice)}`,
        `BL saatavuus (unit/total): ${formattedQuantity(material.price.unitQuantity)} / ${formattedQuantity(material.price.totalQuantity)}`
      ];
      if (material.lugbulkData.price) {
        parts.push(
          `Lugbulk hinta: ${euroCents(getLugbulkPrice(material.lugbulkData.price))} (${euroCents(material.lugbulkData.price)})`
        );
      }
      return parts;
    }

    return [];
  }, [material]);

  return (
    <div className={classNames("Image", { zoomed })}>
      <BrickLinkImage material={material} />
      <div className="Image-topLabel">
        <ColorLabel brickLinkColorId={material.price.brickLinkColorId} />
      </div>
      <div className="Image-bottomLabel">
        {bottomLabel.map((value, index) => (
          <div key={index}>{value}</div>
        ))}
      </div>
    </div>
  );
}

export default Image;
