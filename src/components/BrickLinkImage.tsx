import React, { useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

import { Material } from "../types/material";

const BRICKLINK_IMAGE_URL = "https://img.bricklink.com/ItemImage";

interface Props {
  material?: Material;
}

function BrickLinkImage({ material }: Props) {
  const [fallbackImage, setFallbackImage] = useState(false);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const brickLinkPartId = useMemo(() => material?.price?.brickLinkPartId, [material]);

  const brickLinkColorId = useMemo(() => material?.price?.brickLinkColorId, [material]);

  const imageUrl = useMemo(() => {
    if (brickLinkPartId && brickLinkColorId) {
      return `${BRICKLINK_IMAGE_URL}/PN/${brickLinkColorId}/${brickLinkPartId}.png`;
    }
    return undefined;
  }, [brickLinkPartId, brickLinkColorId]);

  const fallbackImageUrl = useMemo(() => {
    if (brickLinkPartId) {
      return `${BRICKLINK_IMAGE_URL}/PL/${brickLinkPartId}.png`;
    }
    return undefined;
  }, [brickLinkPartId]);

  return (
    <div ref={ref}>
      {inView && !fallbackImage && imageUrl && <img src={imageUrl} onError={() => setFallbackImage(true)} />}
      {inView && !fallbackImage && !imageUrl && fallbackImageUrl && <img src={fallbackImageUrl} />}
      {inView && fallbackImage && fallbackImageUrl && <img src={fallbackImageUrl} />}
    </div>
  );
}

export default BrickLinkImage;
