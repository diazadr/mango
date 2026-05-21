import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1, "title_required"),
  category: z.string().min(1, "category_required"),
  status: z.enum(["draft", "published"]),
  excerpt: z.string().optional(),
  content: z.string().min(1, "content_required"),
  cover_image: z.any().optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;
