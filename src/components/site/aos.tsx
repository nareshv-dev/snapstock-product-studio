import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/** Lightweight AOS: reveals every [data-aos] element as it scrolls into view. */
export function useAos() {
  const { pathname, searchStr } = useLocation();
  useEffect(() => {
    document.documentElement.classList.add("aos-ready");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("aos-in"); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    const scan = () => document.querySelectorAll("[data-aos]:not(.aos-in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname, searchStr]);
}
