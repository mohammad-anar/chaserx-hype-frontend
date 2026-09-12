import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  minStockLevel: number;
  isAvailable: boolean;
  productRecipes?: any[];
  stockMovements?: any[];
}

export interface IngredientListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Ingredient[];
}

export const ingredientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllIngredients: builder.query<
      IngredientListResponse,
      { searchTerm?: string; lowStock?: boolean; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/ingredient",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: [TAG_TYPES.PRODUCT],
    }),

    createIngredient: builder.mutation<
      any,
      { name: string; unit: string; currentStock: number; minStockLevel?: number }
    >({
      query: (body) => ({
        url: "/ingredient",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PRODUCT],
    }),

    restockIngredient: builder.mutation<
      any,
      { id: string; quantity: number; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/ingredient/${id}/restock`,
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PRODUCT],
    }),

    getAllRecipes: builder.query<any, void>({
      query: () => ({
        url: "/recipe",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.PRODUCT],
    }),

    setProductRecipe: builder.mutation<
      any,
      {
        productId: string;
        items: Array<{ ingredientId: string; quantity: number; unit: string }>;
      }
    >({
      query: (body) => ({
        url: "/recipe/set",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.PRODUCT],
    }),
  }),
});

export const {
  useGetAllIngredientsQuery,
  useCreateIngredientMutation,
  useRestockIngredientMutation,
  useGetAllRecipesQuery,
  useSetProductRecipeMutation,
} = ingredientApi;
