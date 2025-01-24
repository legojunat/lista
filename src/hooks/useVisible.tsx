import { useEffect, useState } from "react";

import { Material } from "../types/material";

export const useVisible = (material: Material | undefined, search: string) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (material && search.length > 0) {
      let nextVisible = false;
      for (const key in material) {
        const part = material[key as keyof Material];
        if (part && typeof part === "object") {
          const match: string | undefined = Object.values(part).find((value: string) => {
            if (typeof value === "string" && value.toUpperCase().includes(search.toUpperCase())) {
              return true;
            }
            return false;
          });

          if (match) {
            nextVisible = true;
            break;
          }
        }
      }

      setVisible(nextVisible);
    } else if (!material && search.length > 0) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [material, search]);

  return visible;
};
