export const seo = (title: string, description: string) => [
  { title: `${title} | Gray & Gable London` },
  { name: "description", content: description },
  { property: "og:title", content: `${title} | Gray & Gable London` },
  { property: "og:description", content: description },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];
