import data from "./writings.json";

export type WritingTopic = "memory" | "context" | "agents";

export interface WritingArticle {
  id: string;
  title: string;
  url: string;
  date: string;
  teaser: string;
  source: "知乎";
  topic: WritingTopic;
}

export const writings = data as {
  articles: WritingArticle[];
  collection_url: string;
  collection_label: string;
};
