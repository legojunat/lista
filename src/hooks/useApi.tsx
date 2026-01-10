import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Category } from "../types/category";
import { Material } from "../types/material";
import { Color } from "../types/color";

const API_URL = (window as unknown as { API_URL: string }).API_URL ?? "/";
const SELECTED_CATEGORY_IDS_KEY = "categoryIds";
const INITIAL_SELECTED_CATEGORY_IDS =
  window.localStorage.getItem(SELECTED_CATEGORY_IDS_KEY)?.split(",").filter(Boolean) ?? [];

interface ApiContextType {
  categories: Category[];
  selectedCategoryIds: Set<string>;
  selectedMaterials: Material[];
  toggleSelectedCategoryId: (categoryId: string) => void;
  toggleSelectAllCategories: () => void;
  fetchMaterial: (materialId: string) => Promise<Material | undefined>;
  getColor: (brickLinkColorId: string) => Color | undefined;
}

export const apiContextInitialValue: ApiContextType = {
  categories: [],
  selectedCategoryIds: new Set<string>(),
  selectedMaterials: [],
  toggleSelectedCategoryId: () => [],
  toggleSelectAllCategories: () => undefined,
  fetchMaterial: () => Promise.resolve(undefined),
  getColor: () => undefined
};

export const ApiContext = React.createContext<ApiContextType>(apiContextInitialValue);

interface CategoryMaterials {
  categoryId: string;
  categoryName: string;
  materials: Material[];
}

interface Props {
  children: ReactNode;
}

export function ApiProvider({ children }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => new Set<string>(INITIAL_SELECTED_CATEGORY_IDS));
  const [materials, setMaterials] = useState(() => new Map<string, Material>());
  const [materialsForCategory, setMaterialsForCategory] = useState(() => new Map<string, Material[]>());
  const [fetchingMaterialsForCategory, setFetchingMaterialsForCategory] = useState(false);
  const [colors, setColors] = useState(() => new Map<string, Color>());

  const selectedMaterials = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Array.from(materialsForCategory, ([_categoryId, materials]) => materials)
      .flatMap((materials) => materials)
      .filter((material) => selectedCategoryIds.has(material.item.categoryId))
      .sort((a, b) => a.item.brickLinkPartId.localeCompare(b.item.brickLinkPartId));
  }, [materialsForCategory, selectedCategoryIds]);

  useEffect(() => {
    const fetchCategoriesAsync = async () => {
      const response = await axios.get<Category[]>(`${API_URL}bricklink-categories.json`);
      setCategories(response.data.sort((a, b) => a.categoryName.localeCompare(b.categoryName)));
    };

    const fetchColorsAsync = async () => {
      const response = await axios.get<Color[]>(`${API_URL}colors.json`);
      const nextColors = new Map<string, Color>();
      response.data.forEach((color) => {
        nextColors.set(color.bricklinkId, color);
      });
      setColors(new Map(nextColors));
    };

    fetchCategoriesAsync();
    fetchColorsAsync();
  }, []);

  const toggleSelectedCategoryId = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      window.localStorage.setItem(SELECTED_CATEGORY_IDS_KEY, Array.from(next).join(","));
      return next;
    });
  }, []);

  const toggleSelectAllCategories = useCallback(() => {
    setSelectedCategoryIds((prev) => {
      if (prev.size === categories.length) {
        window.localStorage.setItem(SELECTED_CATEGORY_IDS_KEY, "");
        return new Set<string>();
      }

      const allCategoryIds = categories.map(({ categoryId }) => categoryId);
      window.localStorage.setItem(SELECTED_CATEGORY_IDS_KEY, allCategoryIds.join(","));
      return new Set(allCategoryIds);
    });
  }, [categories]);

  const fetchNextMaterialsForCategory = useCallback(
    async ([categoryId, ...nextCategoryIds]: string[]): Promise<void> => {
      if (!categoryId) {
        setFetchingMaterialsForCategory(false);
        return;
      }

      try {
        const response = await axios.get<CategoryMaterials>(`${API_URL}category-materials/${categoryId}.json`);
        setMaterialsForCategory((currentMaterialsForCategory) => {
          const nextMaterialsForCategory = new Map(currentMaterialsForCategory);
          nextMaterialsForCategory.set(categoryId, response.data.materials);
          return nextMaterialsForCategory;
        });
      } catch (error) {
        console.warn("Failed to load materials for category", categoryId, error);
      }

      fetchNextMaterialsForCategory(nextCategoryIds);
    },
    [materialsForCategory]
  );

  useEffect(() => {
    if (fetchingMaterialsForCategory) {
      // Only one fetching queue running concurrently
      console.warn("fetchingMaterialsForCategory is active, skipping fetch...");
      return;
    }

    setFetchingMaterialsForCategory(true);
    const missingCategoryIds = Array.from(selectedCategoryIds).filter(
      (categoryId) => !materialsForCategory.has(categoryId)
    );
    fetchNextMaterialsForCategory(missingCategoryIds);
  }, [fetchNextMaterialsForCategory, materialsForCategory, selectedCategoryIds]);

  // Note! Not used at the moment
  const fetchMaterial = useCallback(
    async (materialId: string): Promise<Material | undefined> => {
      if (materials.has(materialId)) {
        return materials.get(materialId);
      }

      try {
        const response = await axios.get<Material>(`${API_URL}materials/${materialId}.json`);
        const nextMaterials = new Map(materials);
        nextMaterials.set(materialId, response.data);
        setMaterials(nextMaterials);
        return response.data;
      } catch (error) {
        console.error("Failed to load material", materialId, error);
      }
    },
    [materials]
  );

  const getColor = useCallback(
    (brickLinkColorId: string) => {
      return colors.get(brickLinkColorId);
    },
    [colors]
  );

  return (
    <ApiContext.Provider
      value={{
        categories,
        selectedMaterials,
        selectedCategoryIds,
        toggleSelectedCategoryId,
        toggleSelectAllCategories,
        fetchMaterial,
        getColor
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export default () => useContext(ApiContext);
