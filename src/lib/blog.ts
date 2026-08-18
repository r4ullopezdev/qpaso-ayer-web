import data from "@/content/blog-articles.json";

export interface BlogArticle {
  slug: string;
  lang: "es" | "en";
  cluster: string;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { h2: string; body: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
}

const ARTICLES = data as BlogArticle[];
const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getAllArticles(): BlogArticle[] {
  return ARTICLES;
}
export function getArticle(slug: string): BlogArticle | undefined {
  return BY_SLUG.get(slug);
}
export function getArticlesByLang(lang: "es" | "en"): BlogArticle[] {
  return ARTICLES.filter((a) => a.lang === lang);
}
