import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/product', { params: { ...query } });
      console.log('rrr', response);
      
      if (response.status !== 200) throw new Error(response.error);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || error.error || "상품 목록을 불러오는데 실패했습니다.");
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      
      if (response.status !== 200) throw new Error(response.error);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || error.error || "상품 상세 정보를 불러오는데 실패했습니다.");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/product', formData);
      
      if (response.status !== 200) throw new Error(response.error);
      dispatch(showToastMessage({ message: "상품 생성 완료", status: "success" }));
      dispatch(getProductList({page: 1}))
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || error.error || "상품 생성에 실패했습니다.");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      
      if (response.status !== 200) throw new Error(response.error);
      dispatch(getProductList({page: 1}))
      dispatch(showToastMessage({ message: "상품 삭제 완료", status: "success" }));
      return id; // 삭제된 상품 ID 반환
    } catch (error) {
      return rejectWithValue(error.message || error.error || "상품 삭제에 실패했습니다.");
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/product/${id}`, formData);
      console.log('rrr', response);
      
      
      if (response.status !== 200) throw new Error(response.error);
      dispatch(showToastMessage({ message: "상품 수정 완료", status: "success" }));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message || error.error || "상품 수정에 실패했습니다.");
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
        // 새 상품을 리스트에 추가
        state.productList.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // getProductList
      .addCase(getProductList.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false;
        state.productList = action.payload.data || action.payload;
        state.totalPageNum = action.payload.totalPageNum || 1;
        state.error = "";
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getProductDetail
      .addCase(getProductDetail.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.data;
        state.error = "";
        state.totalPageNum = action.payload.totalPageNum;
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // editProduct
      .addCase(editProduct.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
        // 수정된 상품으로 리스트 업데이트
        const index = state.productList.findIndex(product => product._id === action.payload._id);
        if (index !== -1) {
          state.productList[index] = action.payload;
        }
        // 선택된 상품도 업데이트
        if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.success = true;
        // 삭제된 상품을 리스트에서 제거
        state.productList = state.productList.filter(product => product._id !== action.payload);
        // 선택된 상품이 삭제된 경우 초기화
        if (state.selectedProduct && state.selectedProduct._id === action.payload) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { setSelectedProduct, setFilteredList, clearError } = productSlice.actions;
export default productSlice.reducer;
