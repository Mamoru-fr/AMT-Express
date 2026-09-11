import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AMT Express",
    short_name: "AMT",
    description: "AMT Express - vehicle dispatch and ride management app",
    start_url: "/",
    scope: "/",
    lang: "fr",
    dir: "ltr",
    display: "standalone",
    background_color: "#f8f9fa",
    theme_color: "#003366",
    orientation: "portrait-primary",
    categories: ["transport", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon_192_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon_192_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon_512_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon_512_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshots/mobile-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
};