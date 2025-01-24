export interface Material {
  lugbulkData: LugbulkData;
  price: Price;
  item: Item;
}

export interface Item {
  brickLinkPartId: string;
  name: string;
  type: string;
  categoryId: string;
  imageUrl: string;
  thumbnailUrl: string;
  weight: string;
  dimX: string;
  dimY: string;
  dimZ: string;
  yearReleased: string;
  isObsolete: string;
}

export interface LugbulkData {
  onList2024: string;
  mainGroupTop: string;
  mainGroupSub: string;
  material: string;
  description: string;
  colourId: string;
  communicationNumber: string;
  grossWeight: string;
  length: string;
  width: string;
  height: string;
  price: string;
}

export interface Price {
  brickLinkPartId: string;
  brickLinkColorId: string;
  minPrice: string;
  avgPrice: string;
  maxPrice: string;
  qtyAvgPrice: string;
  unitQuantity: string;
  totalQuantity: string;
}
