import React, { useEffect, useMemo, useState } from "react";

import useApi from "../hooks/useApi";
import { Material } from "../types/material";

import ColorLabel from "./ColorLabel";
import BrickLinkImage from "./BrickLinkImage";

import "./Image.css";
import { getLugbulkPrice } from "../utils/lugbulk-price";
import { euroCents } from "../utils/euro-cents";
import { useVisible } from "../hooks/useVisible";

interface Props {
  materialId: string;
  search: string;
}

function Image({ materialId, search }: Props) {
  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const { fetchMaterial } = useApi();
  const visible = useVisible(material, search);

  useEffect(() => {
    fetchMaterial(materialId).then((nextMaterial) => {
      setMaterial(nextMaterial);
      if (!material) {
        setNotFound(true);
      }
    });
  }, [materialId]);

  const bottomLabel = useMemo(() => {
    if (material) {
      const encodedString = [
        material.item.brickLinkPartId,
        `BL ${euroCents(material.price.qtyAvgPrice)}`,
        `(LB ${euroCents(getLugbulkPrice(material.lugbulkData.price))})`,
        material.item.name
      ].join(" ");
      const textArea = document.createElement("textarea");
      textArea.innerHTML = encodedString;
      return textArea.value;
    }

    return "";
  }, [material]);

  if (!visible) {
    return null;
  }

  return (
    <div className="Image">
      {!notFound && !material && <div className="Image-loading" />}
      {material && (
        <>
          <BrickLinkImage material={material} />
          <div className="Image-topLabel">
            <ColorLabel brickLinkColorId={material.price.brickLinkColorId} />
          </div>
          <div className="Image-bottomLabel" title={bottomLabel}>
            {bottomLabel}
          </div>
        </>
      )}
    </div>
  );
}

export default Image;
