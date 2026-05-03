import { api } from "@/src/lib/http/axios";

export const productService = {
  async getProducts() {
    return api.get("/v1/products");
  },

  async createProduct(data: FormData) {
    return api.post("/v1/products", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async updateProduct(id: number, data: FormData) {
    // Standard approach for Laravel multipart update
    data.append("_method", "PUT");
    return api.post(`/v1/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async deleteProduct(id: number) {
    return api.delete(`/v1/products/${id}`);
  },
};
