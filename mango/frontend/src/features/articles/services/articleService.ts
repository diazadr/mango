import { api } from "@/src/lib/http/axios";
import { ArticleFormData } from "../schema/articleSchema";

export const articleService = {
  async getArticles(params?: any) {
    return api.get("/v1/admin/articles", { params });
  },

  async createArticle(data: FormData) {
    return api.post("/v1/admin/articles", data);
  },

  async updateArticle(id: number, data: FormData) {
    return api.post(`/v1/admin/articles/${id}`, data);
  },

  async deleteArticle(id: number) {
    return api.delete(`/v1/admin/articles/${id}`);
  },
};
