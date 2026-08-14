import { describe, expect, it } from "vitest";
import { add, subtract } from "./arithmetic";

// =========================================================================
// ADIÇÃO
// =========================================================================

describe("add", () => {
  // ── Binário ──────────────────────────────────────────────────────────
  describe("binário (base 2)", () => {
    it("1010 + 110 = 10000", () => {
      const r = add("1010", 2, "110", 2, 2);
      expect(r.value).toBe("10000");
      expect(r.carry).toBe(true);
    });

    it("1 + 1 = 10 (carry simples)", () => {
      const r = add("1", 2, "1", 2, 2);
      expect(r.value).toBe("10");
      expect(r.carry).toBe(true);
    });

    it("0 + 0 = 0", () => {
      const r = add("0", 2, "0", 2, 2);
      expect(r.value).toBe("0");
      expect(r.carry).toBe(false);
    });

    it("11111111 + 1 = 100000000 (8 bits + carry)", () => {
      const r = add("11111111", 2, "1", 2, 2);
      expect(r.value).toBe("100000000");
      expect(r.carry).toBe(true);
    });
  });

  // ── Hexadecimal ──────────────────────────────────────────────────────
  describe("hexadecimal (base 16)", () => {
    it("FF + 1 = 100", () => {
      const r = add("FF", 16, "1", 16, 16);
      expect(r.value).toBe("100");
      expect(r.carry).toBe(true);
    });

    it("A + 5 = F (sem carry)", () => {
      const r = add("A", 16, "5", 16, 16);
      expect(r.value).toBe("F");
      expect(r.carry).toBe(false);
    });

    it("1A + 2B = 45", () => {
      const r = add("1A", 16, "2B", 16, 16);
      expect(r.value).toBe("45");
    });

    it("FFFF + 1 = 10000", () => {
      const r = add("FFFF", 16, "1", 16, 16);
      expect(r.value).toBe("10000");
      expect(r.carry).toBe(true);
    });
  });

  // ── Decimal ──────────────────────────────────────────────────────────
  describe("decimal (base 10)", () => {
    it("10 + 5 = 15", () => {
      const r = add("10", 10, "5", 10, 10);
      expect(r.value).toBe("15");
      expect(r.carry).toBe(false);
    });

    it("999 + 1 = 1000 (carry propagado)", () => {
      const r = add("999", 10, "1", 10, 10);
      expect(r.value).toBe("1000");
      expect(r.carry).toBe(true);
    });

    it("0 + 0 = 0", () => {
      const r = add("0", 10, "0", 10, 10);
      expect(r.value).toBe("0");
    });

    it("500 + 500 = 1000", () => {
      const r = add("500", 10, "500", 10, 10);
      expect(r.value).toBe("1000");
      expect(r.carry).toBe(true);
    });
  });

  // ── Base 5 ───────────────────────────────────────────────────────────
  describe("base 5 (quinário)", () => {
    it("43 + 21 = 114 (23 dec + 11 dec = 34 dec)", () => {
      const r = add("43", 5, "21", 5, 5);
      expect(r.value).toBe("114");
      expect(r.carry).toBe(true);
    });

    it("4 + 1 = 10 (carry simples)", () => {
      const r = add("4", 5, "1", 5, 5);
      expect(r.value).toBe("10");
      expect(r.carry).toBe(true);
    });

    it("0 + 0 = 0", () => {
      const r = add("0", 5, "0", 5, 5);
      expect(r.value).toBe("0");
    });

    it("44 + 1 = 100", () => {
      const r = add("44", 5, "1", 5, 5);
      expect(r.value).toBe("100");
    });
  });

  // ── Bases diferentes ─────────────────────────────────────────────────
  describe("bases diferentes", () => {
    it("A(16) + 10(10) = 20(10)", () => {
      const r = add("A", 16, "10", 10, 10);
      expect(r.value).toBe("20");
    });

    it("111(2) + F(16) = 22(10)  (7 + 15 = 22)", () => {
      const r = add("111", 2, "F", 16, 10);
      expect(r.value).toBe("22");
    });

    it("1010(2) + 5(10) = F(16)  (10 + 5 = 15)", () => {
      const r = add("1010", 2, "5", 10, 16);
      expect(r.value).toBe("F");
    });

    it("14(5) + 3(10) = 12(10)  (9 dec + 3 dec = 12 dec)", () => {
      const r = add("14", 5, "3", 10, 10);
      expect(r.value).toBe("12");
    });
  });

  // ── Saída em base diferente ──────────────────────────────────────────
  describe("base de saída diferente", () => {
    it("FF(16) + 1(16) = 256(10)", () => {
      const r = add("FF", 16, "1", 16, 10);
      expect(r.value).toBe("256");
    });

    it("1010(2) + 1010(2) = 14(16)  (10+10=20=0x14)", () => {
      const r = add("1010", 2, "1010", 2, 16);
      expect(r.value).toBe("14");
    });

    it("7(10) + 1(10) = 10(8)", () => {
      const r = add("7", 10, "1", 10, 8);
      expect(r.value).toBe("10");
    });
  });

  // ── Passos explicativos ──────────────────────────────────────────────
  describe("passos explicativos", () => {
    it("gera passos com descrição e matemática", () => {
      const r = add("1010", 2, "110", 2, 2);
      expect(r.steps.length).toBeGreaterThan(0);
      expect(r.steps[0].description).toContain("Adição");
      expect(r.steps.some((s) => s.math?.includes("+"))).toBe(true);
      expect(r.steps.some((s) => s.description?.includes("Resultado final"))).toBe(true);
    });

    it("mostra o coluna-por-coluna nos passos", () => {
      const r = add("12", 10, "9", 10, 10);
      expect(r.steps.some((s) => s.description?.includes("coluna"))).toBe(true);
      expect(r.steps.some((s) => s.math?.includes("vai"))).toBe(true);
    });

    it("reporta carry final quando existe", () => {
      const r = add("F", 16, "1", 16, 16);
      expect(r.carry).toBe(true);
      expect(r.steps.some((s) => s.description?.includes("Carry final"))).toBe(true);
    });
  });
});

// =========================================================================
// SUBTRAÇÃO
// =========================================================================

describe("subtract", () => {
  // ── Binário (complemento de 2) ───────────────────────────────────────
  describe("binário (base 2 — complemento de 2)", () => {
    it("1000 - 1 = 111 (8 - 1 = 7)", () => {
      const r = subtract("1000", 2, "1", 2, 2);
      expect(r.value).toBe("111");
    });

    it("1010 - 101 = 101 (10 - 5 = 5)", () => {
      const r = subtract("1010", 2, "101", 2, 2);
      expect(r.value).toBe("101");
    });

    it("1100 - 10 = 1010 (12 - 2 = 10)", () => {
      const r = subtract("1100", 2, "10", 2, 2);
      expect(r.value).toBe("1010");
    });

    it("0 - 0 = 0", () => {
      const r = subtract("0", 2, "0", 2, 2);
      expect(r.value).toBe("0");
    });

    it("10000 - 1 = 1111 (16 - 1 = 15)", () => {
      const r = subtract("10000", 2, "1", 2, 2);
      expect(r.value).toBe("1111");
    });

    it("111 - 111 = 0", () => {
      const r = subtract("111", 2, "111", 2, 2);
      expect(r.value).toBe("0");
    });
  });

  // ── Hexadecimal (complemento de 2) ───────────────────────────────────
  describe("hexadecimal (base 16 — complemento de 2)", () => {
    it("100 - 1 = FF (256 - 1 = 255)", () => {
      const r = subtract("100", 16, "1", 16, 16);
      expect(r.value).toBe("FF");
    });

    it("A - 5 = 5 (10 - 5 = 5)", () => {
      const r = subtract("A", 16, "5", 16, 16);
      expect(r.value).toBe("5");
    });

    it("FF - AA = 55 (255 - 170 = 85)", () => {
      const r = subtract("FF", 16, "AA", 16, 16);
      expect(r.value).toBe("55");
    });

    it("ABC - 123 = 999 (2748 - 291 = 2457)", () => {
      const r = subtract("ABC", 16, "123", 16, 16);
      expect(r.value).toBe("999");
    });
  });

  // ── Decimal (borrow) ─────────────────────────────────────────────────
  describe("decimal (base 10 — borrow)", () => {
    it("255 - 1 = 254", () => {
      const r = subtract("255", 10, "1", 10, 10);
      expect(r.value).toBe("254");
    });

    it("1000 - 1 = 999 (borrow múltiplo)", () => {
      const r = subtract("1000", 10, "1", 10, 10);
      expect(r.value).toBe("999");
      expect(r.borrow).toBe(true);
    });

    it("5 - 5 = 0", () => {
      const r = subtract("5", 10, "5", 10, 10);
      expect(r.value).toBe("0");
    });

    it("100 - 99 = 1", () => {
      const r = subtract("100", 10, "99", 10, 10);
      expect(r.value).toBe("1");
      expect(r.borrow).toBe(true);
    });

    it("0 - 0 = 0", () => {
      const r = subtract("0", 10, "0", 10, 10);
      expect(r.value).toBe("0");
    });
  });

  // ── Base 5 (borrow) ──────────────────────────────────────────────────
  describe("base 5 (quinário — borrow)", () => {
    it("43 - 21 = 22 (23 dec - 11 dec = 12 dec)", () => {
      const r = subtract("43", 5, "21", 5, 5);
      expect(r.value).toBe("22");
    });

    it("10 - 1 = 4 (5 dec - 1 dec = 4 dec)", () => {
      const r = subtract("10", 5, "1", 5, 5);
      expect(r.value).toBe("4");
      expect(r.borrow).toBe(true);
    });

    it("100 - 1 = 44 (25 dec - 1 dec = 24 dec = 44₅)", () => {
      const r = subtract("100", 5, "1", 5, 5);
      expect(r.value).toBe("44");
      expect(r.borrow).toBe(true);
    });

    it("44 - 1 = 43 (24 dec - 1 dec = 23 dec)", () => {
      const r = subtract("44", 5, "1", 5, 5);
      expect(r.value).toBe("43");
    });
  });

  // ── Bases diferentes ─────────────────────────────────────────────────
  describe("bases diferentes", () => {
    it("A(16) - 5(10) = 5(10)  (10 - 5 = 5)", () => {
      const r = subtract("A", 16, "5", 10, 10);
      expect(r.value).toBe("5");
    });

    it("20(5) - 3(10) = 12(5)  (10 dec - 3 dec = 7 dec = 12₅)", () => {
      const r = subtract("20", 5, "3", 10, 5);
      expect(r.value).toBe("12");
    });

    it("100(2) - 1(10) = 3(10)  (4 - 1 = 3)", () => {
      const r = subtract("100", 2, "1", 10, 10);
      expect(r.value).toBe("3");
    });

    it("FF(16) - 10(10) = F5(16)  (255 - 10 = 245 = 0xF5)", () => {
      const r = subtract("FF", 16, "10", 10, 16);
      expect(r.value).toBe("F5");
    });
  });

  // ── Resultado negativo ───────────────────────────────────────────────
  describe("resultado negativo", () => {
    it("1 - 10 = -9 (decimal)", () => {
      const r = subtract("1", 10, "10", 10, 10);
      expect(r.value).toBe("-9");
    });

    it("A(16) - FF(16) = -F5(16)  (10 - 255 = -245)", () => {
      const r = subtract("A", 16, "FF", 16, 16);
      expect(r.value).toBe("-F5");
    });

    it("1(2) - 1010(2) = -1001(2)  (1 - 10 = -9)", () => {
      const r = subtract("1", 2, "1010", 2, 2);
      expect(r.value).toBe("-1001");
    });

    it("1(5) - 10(5) = -4(5)  (1 - 5 = -4)", () => {
      const r = subtract("1", 5, "10", 5, 5);
      expect(r.value).toBe("-4");
    });

    it("0 - 1 = -1 (decimal)", () => {
      const r = subtract("0", 10, "1", 10, 10);
      expect(r.value).toBe("-1");
    });
  });

  // ── Operandos com sinal explícito ────────────────────────────────────
  describe("operandos com prefixo '-'", () => {
    // (-A) - (-B) = B - A
    it("(-5) - (-3) = -2  (decimal)", () => {
      const r = subtract("-5", 10, "-3", 10, 10);
      expect(r.value).toBe("-2");
    });

    // A - (-B) = A + B
    it("5 - (-3) = 8  (decimal)", () => {
      const r = subtract("5", 10, "-3", 10, 10);
      expect(r.value).toBe("8");
    });

    // (-A) - B = -(A + B)
    it("(-5) - 3 = -8  (decimal)", () => {
      const r = subtract("-5", 10, "3", 10, 10);
      expect(r.value).toBe("-8");
    });

    // (-A) - (-B) com B > A → resultado positivo
    it("(-3) - (-10) = 7  (decimal)", () => {
      const r = subtract("-3", 10, "-10", 10, 10);
      expect(r.value).toBe("7");
    });
  });

  // ── Saída em base diferente ──────────────────────────────────────────
  describe("base de saída diferente", () => {
    it("100(16) - 1(16) = 255(10)", () => {
      const r = subtract("100", 16, "1", 16, 10);
      expect(r.value).toBe("255");
    });

    it("A(16) - 5(16) = 101(2)  (10 - 5 = 5 = 101₂)", () => {
      const r = subtract("A", 16, "5", 16, 2);
      expect(r.value).toBe("101");
    });

    it("255(10) - 170(10) = 55(16)  (85 = 0x55)", () => {
      const r = subtract("255", 10, "170", 10, 16);
      expect(r.value).toBe("55");
    });

    it("resultado negativo em base diferente: 1(10) - A(16) = -9(8)", () => {
      const r = subtract("1", 10, "A", 16, 8);
      expect(r.value).toBe("-11");
    });
  });

  // ── Passos explicativos ──────────────────────────────────────────────
  describe("passos explicativos", () => {
    it("gera passos com descrição e matemática", () => {
      const r = subtract("1000", 2, "1", 2, 2);
      expect(r.steps.length).toBeGreaterThan(0);
      expect(r.steps[0].description).toContain("Subtração");
      expect(r.steps.some((s) => s.description?.includes("complemento de 2"))).toBe(true);
    });

    it("mostra complemento de 2 nos passos para base potência de 2", () => {
      const r = subtract("A", 16, "3", 16, 16);
      expect(r.steps.some((s) => s.description?.includes("complemento de 2"))).toBe(true);
      expect(r.steps.some((s) => s.math?.includes("→"))).toBe(true);
    });

    it("mostra borrow nos passos para base não potência de 2", () => {
      const r = subtract("10", 5, "1", 5, 5);
      expect(r.steps.some((s) => s.description?.includes("empréstimo"))).toBe(true);
      expect(r.borrow).toBe(true);
    });

    it("reporta steps do complemento de 2 com largura de bits", () => {
      const r = subtract("FFF", 16, "1", 16, 16);
      expect(r.steps.some((s) => s.description?.includes("bits"))).toBe(true);
    });
  });
});

// =========================================================================
// ADIÇÃO COM NÚMEROS NEGATIVOS
// =========================================================================

describe("add com operandos negativos", () => {
  it("(-5) + (-3) = -8 (decimal)", () => {
    const r = add("-5", 10, "-3", 10, 10);
    expect(r.value).toBe("-8");
  });

  it("5 + (-3) = 2 (decimal — sinais opostos, A > B)", () => {
    const r = add("5", 10, "-3", 10, 10);
    expect(r.value).toBe("2");
  });

  it("3 + (-5) = -2 (decimal — sinais opostos, B > A)", () => {
    const r = add("3", 10, "-5", 10, 10);
    expect(r.value).toBe("-2");
  });

  it("(-A) + A = 0 (hex)", () => {
    const r = add("-A", 16, "A", 16, 16);
    expect(r.value).toBe("0");
  });

  it("(-10) + 10 = 0 (decimal)", () => {
    const r = add("-10", 10, "10", 10, 10);
    expect(r.value).toBe("0");
  });
});

// =========================================================================
// CARRY / BORROW / OVERFLOW
// =========================================================================

describe("detecção de carry, borrow e overflow", () => {
  describe("carry na adição", () => {
    it("detecta carry em FF(16) + 1(16)", () => {
      const r = add("FF", 16, "1", 16, 16);
      expect(r.carry).toBe(true);
    });

    it("detecta carry em 111(2) + 1(2)", () => {
      const r = add("111", 2, "1", 2, 2);
      expect(r.carry).toBe(true);
    });

    it("não detecta carry em 12(10) + 3(10) = 15", () => {
      const r = add("12", 10, "3", 10, 10);
      expect(r.carry).toBe(false);
    });

    it("não detecta carry em 1010(2) + 101(2) = 1111", () => {
      const r = add("1010", 2, "101", 2, 2);
      expect(r.carry).toBe(false);
    });
  });

  describe("borrow na subtração", () => {
    it("detecta borrow em 10(5) - 1(5)", () => {
      const r = subtract("10", 5, "1", 5, 5);
      expect(r.borrow).toBe(true);
    });

    it("detecta borrow em 1000(10) - 1(10)", () => {
      const r = subtract("1000", 10, "1", 10, 10);
      expect(r.borrow).toBe(true);
    });

    it("não detecta borrow em 555(10) - 123(10)", () => {
      const r = subtract("555", 10, "123", 10, 10);
      expect(r.borrow).toBe(false);
    });
  });

  describe("overflow aritmético", () => {
    it("overflow em adição binária com carry + base potência de 2", () => {
      const r = add("1111", 2, "1", 2, 2);
      expect(r.overflow).toBe(true);
      expect(r.carry).toBe(true);
    });

    it("overflow em adição hex com carry", () => {
      const r = add("FF", 16, "1", 16, 16);
      expect(r.overflow).toBe(true);
    });

    it("sem overflow em base 10 mesmo com carry", () => {
      const r = add("999", 10, "1", 10, 10);
      expect(r.overflow).toBe(false);
      expect(r.carry).toBe(true);
    });
  });
});

// =========================================================================
// EDGE CASES
// =========================================================================

describe("edge cases", () => {
  it("adição com operandos de comprimentos diferentes", () => {
    const r = add("1", 2, "11111111", 2, 2);
    expect(r.value).toBe("100000000");
  });

  it("subtração que resulta em zero sem borrow", () => {
    const r = subtract("FF", 16, "FF", 16, 16);
    expect(r.value).toBe("0");
    expect(r.borrow).toBe(false);
  });

  it("subtração com operandos idênticos em base 5", () => {
    const r = subtract("44", 5, "44", 5, 5);
    expect(r.value).toBe("0");
  });

  it("resultado zero não tem sinal negativo", () => {
    const r = add("-5", 10, "5", 10, 10);
    expect(r.value).toBe("0");
    expect(r.value).not.toContain("-");
  });

  it("conversão para base menor que a de trabalho", () => {
    const r = add("FF", 16, "1", 16, 2);
    expect(r.value).toBe("100000000");
  });

  it("subtração em base 36 usa borrow (não é potência de 2)", () => {
    const r = subtract("10", 36, "1", 36, 36);
    // 36 dec - 1 dec = 35 dec = "Z" em base 36
    expect(r.value).toBe("Z");
  });
});
