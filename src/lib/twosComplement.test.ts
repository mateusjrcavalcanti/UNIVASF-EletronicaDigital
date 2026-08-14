import { describe, expect, it } from "vitest";
import { fromTwosComplement, toTwosComplement } from "./twosComplement";

describe("toTwosComplement", () => {
  it('"1111" (4 bits) = -1 decimal', () => {
    const r = toTwosComplement("1111", 2, 4);
    expect(r.decimal).toBe(-1);
    expect(r.isNegative).toBe(true);
    expect(r.binary).toBe("1111");
  });

  it('"1000" (4 bits) = -8 decimal', () => {
    const r = toTwosComplement("1000", 2, 4);
    expect(r.decimal).toBe(-8);
    expect(r.isNegative).toBe(true);
  });

  it('"0111" (4 bits) = 7 decimal', () => {
    const r = toTwosComplement("0111", 2, 4);
    expect(r.decimal).toBe(7);
    expect(r.isNegative).toBe(false);
  });

  it('"0000" (4 bits) = 0 decimal', () => {
    const r = toTwosComplement("0000", 2, 4);
    expect(r.decimal).toBe(0);
    expect(r.isNegative).toBe(false);
  });

  it('"1010" (4 bits) = -6 decimal → "A" em hex', () => {
    const r = toTwosComplement("1010", 2, 4);
    expect(r.decimal).toBe(-6);
    expect(r.isNegative).toBe(true);
    expect(r.hex).toBe("A");
  });

  it("valor decimal positivo: 26 → 00011010 (8 bits)", () => {
    const r = toTwosComplement("26", 10, 8);
    expect(r.binary).toBe("00011010");
    expect(r.decimal).toBe(26);
    expect(r.isNegative).toBe(false);
  });

  it("entrada hexadecimal: 1A (base 16) = 26 decimal", () => {
    const r = toTwosComplement("1A", 16, 8);
    expect(r.decimal).toBe(26);
    expect(r.binary).toBe("00011010");
    expect(r.hex).toBe("1A");
  });

  it("255 em 8 bits = -1 (bit de sinal acende)", () => {
    const r = toTwosComplement("255", 10, 8);
    expect(r.decimal).toBe(-1);
    expect(r.isNegative).toBe(true);
    expect(r.binary).toBe("11111111");
    expect(r.hex).toBe("FF");
  });

  it("valor maior que a largura é truncado (módulo 2^bitWidth)", () => {
    const r = toTwosComplement("200", 10, 8);
    expect(r.binary).toBe("11001000");
    expect(r.decimal).toBe(-56);
  });

  it("bits são preenchidos com zeros à esquerda até a largura", () => {
    const r = toTwosComplement("3", 10, 8);
    expect(r.binary).toBe("00000011");
    expect(r.decimal).toBe(3);
  });
});

describe("fromTwosComplement", () => {
  it('"1010" decodifica para -6 decimal', () => {
    const r = fromTwosComplement("1010", 10);
    expect(r.decimal).toBe(-6);
    expect(r.value).toBe("-6");
  });

  it('"1111" decodifica para -1 decimal', () => {
    const r = fromTwosComplement("1111", 10);
    expect(r.decimal).toBe(-1);
    expect(r.value).toBe("-1");
  });

  it('"1000" decodifica para -8 decimal', () => {
    const r = fromTwosComplement("1000", 10);
    expect(r.decimal).toBe(-8);
  });

  it('"0111" decodifica para 7 decimal', () => {
    const r = fromTwosComplement("0111", 10);
    expect(r.decimal).toBe(7);
    expect(r.value).toBe("7");
  });

  it('"0000" decodifica para 0 decimal', () => {
    const r = fromTwosComplement("0000", 10);
    expect(r.decimal).toBe(0);
    expect(r.value).toBe("0");
  });

  it('"1010" (=-6) em hexadecimal → "-6"', () => {
    const r = fromTwosComplement("1010", 16);
    expect(r.decimal).toBe(-6);
    expect(r.value).toBe("-6");
  });

  it('"0111" (=7) em hexadecimal → "7"', () => {
    const r = fromTwosComplement("0111", 16);
    expect(r.value).toBe("7");
  });

  it("número positivo em base 2: 0110 → 110 (base 2)", () => {
    const r = fromTwosComplement("0110", 2);
    expect(r.decimal).toBe(6);
    expect(r.value).toBe("110");
  });

  it("string binária inválida é ignorada (apenas 0 e 1 contam)", () => {
    const r = fromTwosComplement("10A1B0", 10);
    expect(r.decimal).toBe(-6);
    expect(r.value).toBe("-6");
  });
});
