import React, { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Category } from "../types/category";
import { Material } from "../types/material";
import { Color } from "../types/color";

const API_URL = "";
const SELECTED_CATEGORY_IDS_KEY = "categoryIds";
const INITIAL_SELECTED_CATEGORY_IDS = window.localStorage.getItem(SELECTED_CATEGORY_IDS_KEY)?.split(",") ?? [];

interface ApiContextType {
  categories: Category[];
  selectedCategoryIds: Set<string>;
  toggleSelectedCategoryId: (categoryId: string) => void;
  toggleSelectAllCategories: () => void;
  fetchMaterial: (materialId: string) => Promise<Material | undefined>;
  getColor: (brickLinkColorId: string) => Color | undefined;
}

export const apiContextInitialValue: ApiContextType = {
  categories: [],
  selectedCategoryIds: new Set<string>(),
  toggleSelectedCategoryId: () => [],
  toggleSelectAllCategories: () => undefined,
  fetchMaterial: () => Promise.resolve(undefined),
  getColor: () => undefined
};

export const ApiContext = React.createContext<ApiContextType>(apiContextInitialValue);

interface Props {
  children: ReactNode;
}

export function ApiProvider({ children }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => new Set<string>(INITIAL_SELECTED_CATEGORY_IDS));
  const [materials, setMaterials] = useState(() => new Map<string, Material>());
  const [colors, setColors] = useState(() => new Map<string, Color>());

  useEffect(() => {
    const fetchCategoriesAsync = async () => {
      const response = await axios.get<Category[]>(`${API_URL}/bricklink-categories.json`);
      setCategories(response.data.sort((a, b) => a.categoryName.localeCompare(b.categoryName)));
    };

    const fetchColorsAsync = async () => {
      const response = await axios.get<Color[]>(`${API_URL}/colors.json`);
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

  const fetchMaterial = useCallback(
    async (materialId: string): Promise<Material | undefined> => {
      if (materials.has(materialId)) {
        return materials.get(materialId);
      }

      try {
        const response = await axios.get<Material>(`${API_URL}/materials/${materialId}.json`);
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
