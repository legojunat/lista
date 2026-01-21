import React, { useMemo } from "react";

import { Material } from "../types/material";
import { euroCents } from "../utils/euro-cents";
import { formattedQuantity } from "../utils/formatted-quantity";
import { getLugbulkPrice } from "../utils/lugbulk-price";

import ColorLabel from "./ColorLabel";
import BrickLinkImage from "./BrickLinkImage";
import { FEES } from "../constants";

import "./Row.css";

interface Props {
  material: Material;
}

function Row({ material }: Props) {
  const name = useMemo(() => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = material?.item.name ?? "";
    return textArea.value;
  }, [material]);

  const lugbulkPrice = useMemo(() => {
    return getLugbulkPrice(material?.lugbulkData.price);
  }, [material]);

  const lugbulkPriceWithFees = useMemo(() => {
    if (lugbulkPrice) {
      return lugbulkPrice * FEES;
    }
    return undefined;
  }, [lugbulkPrice]);

  const unitQuantity = useMemo(() => {
    return Number(material?.price.unitQuantity);
  }, [material]);

  return (
    <tr className="Row">
      <td className="Row-imageCell">
        <BrickLinkImage material={material} />
      </td>
      <td className="Row-colorCell">
        <ColorLabel brickLinkColorId={material?.price.brickLinkColorId} />
      </td>
      <td className="Row-partIdCell">
        <b>{material?.price.brickLinkPartId}</b>
      </td>
      {unitQuantity ? (
        <>
          <td>{euroCents(material?.price.minPrice)}</td>
          <td>{euroCents(material?.price.avgPrice)}</td>
          <td>{euroCents(material?.price.maxPrice)}</td>
          <td>{euroCents(material?.price.qtyAvgPrice)}</td>
          <td>{formattedQuantity(material?.price.unitQuantity)}</td>
          <td>{formattedQuantity(material?.price.totalQuantity)}</td>
        </>
      ) : (
        <td colSpan={6}>-</td>
      )}
      <td>
        <div className="Row-name">{name}</div>
      </td>
      <td>{euroCents(lugbulkPriceWithFees)}</td>
      <td>{material?.lugbulkData.material}</td>
      <td>{material?.lugbulkData.description}</td>
      <td>{material?.lugbulkData.colourId}</td>
      <td>{euroCents(lugbulkPrice)}</td>
    </tr>
  );
}

export default Row;
