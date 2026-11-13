import { describe, it, expect } from "vitest";
import { cartTotals, validatePromo, seedDB } from "@/lib/store";

const db = seedDB();
const s = db.settings;
const heritage = db.promos.find((p) => p.code === "HERITAGE10")!;

describe("pricing rules", () => {
  it("HERITAGE10 takes 10% off", () => {
    expect(cartTotals([{ price: 100, qty: 1 }], heritage, s).discount).toBe(10);
  });
  it("standard UK delivery is £4.95 under £75", () => {
    expect(cartTotals([{ price: 39.99, qty: 1 }], undefined, s).shipping).toBe(4.95);
  });
  it("standard delivery is free at £75 or more", () => {
    expect(cartTotals([{ price: 39.99, qty: 2 }], undefined, s).shipping).toBe(0);
  });
  it("express delivery costs £9.95", () => {
    expect(cartTotals([{ price: 100, qty: 1 }], undefined, s, "express").shipping).toBe(9.95);
  });
  it("WELCOME5 needs a £40 minimum", () => {
    expect(validatePromo("welcome5", db.promos, 30, "2026-11-13").error).toBeTruthy();
    expect(validatePromo("welcome5", db.promos, 45, "2026-11-13").promo?.code).toBe("WELCOME5");
  });
});
