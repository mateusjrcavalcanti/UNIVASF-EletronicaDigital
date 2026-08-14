import { describe, expect, it } from "vitest";
import { bitwiseOp, shiftOp } from "./bitwise";

describe("bitwiseOp - AND", () => {
  it("AND binário: 1010 & 1100 = 1000 (base 2)", () => {
    const r = bitwiseOp("1010", 2, "1100", 2, "AND", 2);
    expect(r.result.value).toBe("1000");
    expect(r.result.binaryInternal).toBe("1000");
  });

  it("AND binário com bitWidth=4: 1010 & 1100 = 1000", () => {
    const r = bitwiseOp("1010", 2, "1100", 2, "AND", 2, 4);
    expect(r.result.value).toBe("1000");
  });

  it("AND hex: F & A = A (base 16)", () => {
    const r = bitwiseOp("F", 16, "A", 16, "AND", 16);
    expect(r.result.value).toBe("A");
  });

  it("AND hex: FF & 0F = 0F (base 16)", () => {
    const r = bitwiseOp("FF", 16, "0F", 16, "AND", 16);
    expect(r.result.value).toBe("F");
  });

  it("AND decimal: 15 & 7 = 7 (base 10)", () => {
    const r = bitwiseOp("15", 10, "7", 10, "AND", 10);
    expect(r.result.value).toBe("7");
  });

  it("AND decimal: 255 & 170 = 170 (base 10)", () => {
    const r = bitwiseOp("255", 10, "170", 10, "AND", 10);
    expect(r.result.value).toBe("170");
  });

  it("AND base 5: 43 (base 5 = 23 dec) & 21 (base 5 = 11 dec) = 3 (base 5 = 3 dec)", () => {
    const r = bitwiseOp("43", 5, "21", 5, "AND", 5);
    expect(r.result.value).toBe("3");
  });

  it("AND com bitWidth truncando: 0b1111 & 0b10000 com width=4 = 0", () => {
    const r = bitwiseOp("1111", 2, "10000", 2, "AND", 2, 4);
    expect(r.result.value).toBe("0");
  });
});

describe("bitwiseOp - OR", () => {
  it("OR binário: 1010 | 1100 = 1110 (base 2)", () => {
    const r = bitwiseOp("1010", 2, "1100", 2, "OR", 2);
    expect(r.result.value).toBe("1110");
  });

  it("OR hex: F | A = F (base 16)", () => {
    const r = bitwiseOp("F", 16, "A", 16, "OR", 16);
    expect(r.result.value).toBe("F");
  });

  it("OR hex: A0 | 0F = AF (base 16)", () => {
    const r = bitwiseOp("A0", 16, "0F", 16, "OR", 16);
    expect(r.result.value).toBe("AF");
  });

  it("OR decimal: 15 | 7 = 15 (base 10)", () => {
    const r = bitwiseOp("15", 10, "7", 10, "OR", 10);
    expect(r.result.value).toBe("15");
  });

  it("OR decimal: 128 | 1 = 129 (base 10)", () => {
    const r = bitwiseOp("128", 10, "1", 10, "OR", 10);
    expect(r.result.value).toBe("129");
  });

  it("OR base 5: 43 (23 dec) | 21 (11 dec) = 113 (31 dec = 0b11111)", () => {
    const r = bitwiseOp("43", 5, "21", 5, "OR", 5);
    expect(r.result.value).toBe("111");
  });
});

describe("bitwiseOp - XOR", () => {
  it("XOR binário: 1010 ^ 1100 = 0110 (base 2)", () => {
    const r = bitwiseOp("1010", 2, "1100", 2, "XOR", 2);
    expect(r.result.value).toBe("110");
  });

  it("XOR hex: F ^ A = 5 (base 16)", () => {
    const r = bitwiseOp("F", 16, "A", 16, "XOR", 16);
    expect(r.result.value).toBe("5");
  });

  it("XOR hex: FF ^ AA = 55 (base 16)", () => {
    const r = bitwiseOp("FF", 16, "AA", 16, "XOR", 16);
    expect(r.result.value).toBe("55");
  });

  it("XOR decimal: 15 ^ 7 = 8 (base 10)", () => {
    const r = bitwiseOp("15", 10, "7", 10, "XOR", 10);
    expect(r.result.value).toBe("8");
  });

  it("XOR decimal: 255 ^ 255 = 0 (base 10)", () => {
    const r = bitwiseOp("255", 10, "255", 10, "XOR", 10);
    expect(r.result.value).toBe("0");
  });

  it("XOR base 5: 43 (23 dec) ^ 21 (11 dec) = 103 (28 dec)", () => {
    const r = bitwiseOp("43", 5, "21", 5, "XOR", 5);
    expect(r.result.value).toBe("103");
  });
});

describe("bitwiseOp - bases misturadas", () => {
  it("AND entre binário e hex, saída decimal", () => {
    const r = bitwiseOp("1010", 2, "F", 16, "AND", 10);
    expect(r.result.value).toBe("10");
  });

  it("OR entre decimal e base 5, saída hex", () => {
    const r = bitwiseOp("10", 10, "21", 5, "OR", 16);
    expect(r.result.value).toBe("B");
  });

  it("XOR entre hex e decimal, saída binária", () => {
    const r = bitwiseOp("1A", 16, "15", 10, "XOR", 2);
    expect(r.result.value).toBe("10101");
  });
});

describe("bitwiseOp - bitWidth / máscara", () => {
  it("máscara 8 bits: 0x1FF & 0xFF trunca para 0xFF", () => {
    const r = bitwiseOp("1FF", 16, "FF", 16, "AND", 16, 8);
    expect(r.result.value).toBe("FF");
  });

  it("máscara 4 bits: 0xFF OR 0x00 trunca para 0x0F", () => {
    const r = bitwiseOp("FF", 16, "00", 16, "OR", 16, 4);
    expect(r.result.value).toBe("F");
  });

  it("máscara 8 bits em XOR: 0x123 ^ 0x00 = 0x23", () => {
    const r = bitwiseOp("123", 16, "0", 10, "XOR", 16, 8);
    expect(r.result.value).toBe("23");
  });
});

describe("shiftOp - base 2 (shift puro)", () => {
  it("shift left binário: 1 << 3 = 1000 (base 2)", () => {
    const r = shiftOp("1", 2, "left", 3, 2);
    expect(r.result.value).toBe("1000");
  });

  it("shift left binário: 1010 << 2 = 101000 (base 2)", () => {
    const r = shiftOp("1010", 2, "left", 2, 2);
    expect(r.result.value).toBe("101000");
  });

  it("shift right binário: 1000 >> 3 = 1 (base 2)", () => {
    const r = shiftOp("1000", 2, "right", 3, 2);
    expect(r.result.value).toBe("1");
  });

  it("shift right binário: 1010 >> 1 = 101 (base 2)", () => {
    const r = shiftOp("1010", 2, "right", 1, 2);
    expect(r.result.value).toBe("101");
  });

  it("shift right binário trunca: 1 >> 1 = 0", () => {
    const r = shiftOp("1", 2, "right", 1, 2);
    expect(r.result.value).toBe("0");
  });

  it("shift left com bitWidth=8: FF << 1 = FE", () => {
    const r = shiftOp("11111111", 2, "left", 1, 16, 8);
    expect(r.result.value).toBe("FE");
  });

  it("shift left com bitWidth=4: F << 1 = E", () => {
    const r = shiftOp("1111", 2, "left", 1, 16, 4);
    expect(r.result.value).toBe("E");
  });
});

describe("shiftOp - base != 2 (multiplicação/divisão)", () => {
  it("shift left decimal: 5 << 2 = 500 (5 × 10²)", () => {
    const r = shiftOp("5", 10, "left", 2, 10);
    expect(r.result.value).toBe("500");
  });

  it("shift left decimal: 123 << 1 = 1230", () => {
    const r = shiftOp("123", 10, "left", 1, 10);
    expect(r.result.value).toBe("1230");
  });

  it("shift right decimal: 500 >> 2 = 5 (500 ÷ 10²)", () => {
    const r = shiftOp("500", 10, "right", 2, 10);
    expect(r.result.value).toBe("5");
  });

  it("shift right decimal: 1230 >> 1 = 123", () => {
    const r = shiftOp("1230", 10, "right", 1, 10);
    expect(r.result.value).toBe("123");
  });

  it("shift right decimal com resto: 123 >> 1 = 12 (resto 3)", () => {
    const r = shiftOp("123", 10, "right", 1, 10);
    expect(r.result.value).toBe("12");
  });

  it("shift left hex: A << 1 = A0 (10 × 16 = 160)", () => {
    const r = shiftOp("A", 16, "left", 1, 16);
    expect(r.result.value).toBe("A0");
  });

  it("shift right hex: A0 >> 1 = A (160 ÷ 16 = 10)", () => {
    const r = shiftOp("A0", 16, "right", 1, 16);
    expect(r.result.value).toBe("A");
  });

  it("shift left base 5: 12 (base 5 = 7 dec) << 1 = 120 (base 5 = 35 dec = 7×5)", () => {
    const r = shiftOp("12", 5, "left", 1, 5);
    expect(r.result.value).toBe("120");
  });

  it("shift right base 5: 120 (base 5 = 35 dec) >> 1 = 12 (base 5 = 7 dec)", () => {
    const r = shiftOp("120", 5, "right", 1, 5);
    expect(r.result.value).toBe("12");
  });
});

describe("shiftOp - saída em base diferente da entrada", () => {
  it("shift left binário → decimal: 1 << 3 = 8", () => {
    const r = shiftOp("1", 2, "left", 3, 10);
    expect(r.result.value).toBe("8");
  });

  it("shift left decimal → binário: 5 << 1 = 1010", () => {
    const r = shiftOp("5", 10, "left", 1, 2);
    expect(r.result.value).toBe("1010");
  });
});

describe("bitwiseOp - steps", () => {
  it("gera passos para AND", () => {
    const r = bitwiseOp("1010", 2, "1100", 2, "AND", 2);
    expect(r.steps.length).toBeGreaterThan(0);
    expect(r.steps[0].description).toContain("AND");
    expect(r.steps.some((s) => s.math?.includes("AND"))).toBe(true);
  });

  it("gera passos para XOR com bitWidth", () => {
    const r = bitwiseOp("FF", 16, "0F", 16, "XOR", 16, 8);
    expect(r.steps.some((s) => s.description?.includes("Máscara"))).toBe(true);
  });
});

describe("shiftOp - steps", () => {
  it("gera passos para shift left em base 2", () => {
    const r = shiftOp("1", 2, "left", 3, 2);
    expect(r.steps.length).toBeGreaterThan(0);
    expect(r.steps[0].description).toContain("left");
  });

  it("gera passos para shift right em base 10", () => {
    const r = shiftOp("500", 10, "right", 2, 10);
    expect(r.steps.some((s) => s.math?.includes("÷"))).toBe(true);
  });
});

describe("bitwiseOp - edge cases", () => {
  it("operando zero: 0 AND F = 0", () => {
    const r = bitwiseOp("0", 2, "F", 16, "AND", 16);
    expect(r.result.value).toBe("0");
  });

  it("operandos iguais: A XOR A = 0", () => {
    const r = bitwiseOp("A", 16, "A", 16, "XOR", 16);
    expect(r.result.value).toBe("0");
  });

  it("todos bits 1: FF AND FF = FF", () => {
    const r = bitwiseOp("FF", 16, "FF", 16, "AND", 16);
    expect(r.result.value).toBe("FF");
  });
});

describe("shiftOp - edge cases", () => {
  it("shift zero: 0 << 5 = 0", () => {
    const r = shiftOp("0", 10, "left", 5, 10);
    expect(r.result.value).toBe("0");
  });

  it("shift amount 0: 42 << 0 = 42", () => {
    const r = shiftOp("42", 10, "left", 0, 10);
    expect(r.result.value).toBe("42");
  });

  it("shift right maior que valor: 1 >> 5 = 0", () => {
    const r = shiftOp("1", 2, "right", 5, 2);
    expect(r.result.value).toBe("0");
  });
});
