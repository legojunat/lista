import React, { useEffect, useMemo, useState } from "react";

import useApi from "../hooks/useApi";
import { useVisible } from "../hooks/useVisible";
import { Material } from "../types/material";
import { euroCents } from "../utils/euro-cents";
import { formattedQuantity } from "../utils/formatted-quantity";
import { getLugbulkPrice } from "../utils/lugbulk-price";

import ColorLabel from "./ColorLabel";
import BrickLinkImage from "./BrickLinkImage";

import "./Row.css";

interface Props {
  materialId: string;
  search: string;
}

function Row({ materialId, search }: Props) {
  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const { fetchMaterial } = useApi();
  const visible = useVisible(material, search);

  useEffect(() => {
    fetchMaterial(materialId).then((nextMaterial) => {
      setMaterial(nextMaterial);
    });
  }, [materialId]);

  const name = useMemo(() => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = material?.item.name ?? "";
    return textArea.value;
  }, [material]);

  if (!visible) {
    return null;
  }

  return (
    <tr className="Row">
      <td>
        <div className="Row-imageContainer">
          <BrickLinkImage material={material} />
        </div>
      </td>
      <td>
        <ColorLabel brickLinkColorId={material?.price.brickLinkColorId} />
      </td>
      <td>{material?.price.brickLinkPartId}</td>
      <td>{euroCents(material?.price.minPrice)}</td>
      <td>{euroCents(material?.price.avgPrice)}</td>
      <td>{euroCents(material?.price.maxPrice)}</td>
      <td>{euroCents(material?.price.qtyAvgPrice)}</td>
      <td>{formattedQuantity(material?.price.unitQuantity)}</td>
      <td>{formattedQuantity(material?.price.totalQuantity)}</td>
      <td>
        <div className="Row-name">{name}</div>
      </td>
      <td>{euroCents(getLugbulkPrice(material?.lugbulkData.price))}</td>
      <td>{material?.lugbulkData.material}</td>
      <td>{material?.lugbulkData.description}</td>
      <td>{material?.lugbulkData.colourId}</td>
      <td>{material?.lugbulkData.price}</td>
    </tr>
  );
}

export default Row;
