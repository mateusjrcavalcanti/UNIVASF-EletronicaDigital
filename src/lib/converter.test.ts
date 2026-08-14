import { describe, expect, it } from "vitest";
import {
  convert,
  convertFromDecimal,
  convertToDecimal,
  digitToValue,
  filterInput,
  getBaseName,
  isValidForBase,
  valueToDigit,
} from "./converter";

describe("getBaseName", () => {
  it("retorna o nome em português de cada base", () => {
    expect(getBaseName(2)).toBe("Binário");
    expect(getBaseName(3)).toBe("Ternário");
    expect(getBaseName(8)).toBe("Octal");
    expect(getBaseName(10)).toBe("Decimal");
    expect(getBaseName(16)).toBe("Hexadecimal");
    expect(getBaseName(36)).toBe("Hexatrigesimal");
  });
});

describe("digitToValue", () => {
  it("mapeia dígitos de 0 a 9", () => {
    expect(digitToValue("0")).toBe(0);
    expect(digitToValue("5")).toBe(5);
    expect(digitToValue("9")).toBe(9);
  });

  it("mapeia letras A-Z (maiúsculas e minúsculas)", () => {
    expect(digitToValue("A")).toBe(10);
    expect(digitToValue("F")).toBe(15);
    expect(digitToValue("G")).toBe(16);
    expect(digitToValue("Z")).toBe(35);
    expect(digitToValue("a")).toBe(10);
    expect(digitToValue("z")).toBe(35);
  });

  it("retorna NaN para caracteres inválidos", () => {
    expect(Number.isNaN(digitToValue("@"))).toBe(true);
    expect(Number.isNaN(digitToValue(""))).toBe(true);
    expect(Number.isNaN(digitToValue("-"))).toBe(true);
  });
});

describe("valueToDigit", () => {
  it("mapeia valores 0-35 para dígitos", () => {
    expect(valueToDigit(0)).toBe("0");
    expect(valueToDigit(7)).toBe("7");
    expect(valueToDigit(10)).toBe("A");
    expect(valueToDigit(15)).toBe("F");
    expect(valueToDigit(16)).toBe("G");
    expect(valueToDigit(35)).toBe("Z");
  });

  it("retorna '?' para valores fora do intervalo", () => {
    expect(valueToDigit(-1)).toBe("?");
    expect(valueToDigit(36)).toBe("?");
  });
});

describe("isValidForBase", () => {
  it("aceita dígitos válidos para a base", () => {
    expect(isValidForBase("1", 2)).toBe(true);
    expect(isValidForBase("0", 2)).toBe(true);
    expect(isValidForBase("2", 3)).toBe(true);
    expect(isValidForBase("7", 8)).toBe(true);
    expect(isValidForBase("9", 10)).toBe(true);
    expect(isValidForBase("F", 16)).toBe(true);
    expect(isValidForBase("Z", 36)).toBe(true);
    expect(isValidForBase("a", 16)).toBe(true);
  });

  it("rejeita dígitos maiores ou iguais à base", () => {
    expect(isValidForBase("2", 2)).toBe(false);
    expect(isValidForBase("3", 3)).toBe(false);
    expect(isValidForBase("8", 8)).toBe(false);
    expect(isValidForBase("10", 10)).toBe(false);
    expect(isValidForBase("G", 16)).toBe(false);
    expect(isValidForBase("Z", 20)).toBe(false);
    expect(isValidForBase("C", 12)).toBe(false);
  });
});

describe("filterInput", () => {
  it("remove caracteres inválidos para a base", () => {
    expect(filterInput("10201", 2)).toBe("1001");
    expect(filterInput("189", 8)).toBe("1");
    expect(filterInput("1G2a", 16)).toBe("12A");
    expect(filterInput("0x1F", 16)).toBe("01F");
    expect(filterInput("3", 3)).toBe("");
  });

  it("aceita letras até o limite da base", () => {
    expect(filterInput("Z9", 36)).toBe("Z9");
    expect(filterInput("j", 20)).toBe("J");
  });

  it("converte letras para maiúsculas", () => {
    expect(filterInput("abc", 16)).toBe("ABC");
    expect(filterInput("deadbeef", 16)).toBe("DEADBEEF");
    expect(filterInput("z", 36)).toBe("Z");
  });

  it("permite apenas um ponto decimal", () => {
    expect(filterInput("12.3.4", 10)).toBe("12.34");
    expect(filterInput("1.01", 2)).toBe("1.01");
  });

  it("trata ponto inicial, final e isolado", () => {
    expect(filterInput(".5", 10)).toBe("0.5");
    expect(filterInput("5.", 10)).toBe("5");
    expect(filterInput(".", 10)).toBe("0");
    expect(filterInput("..5", 10)).toBe("0.5");
  });

  it("remove dígitos inválidos mesmo em números fracionários", () => {
    expect(filterInput("1.2", 2)).toBe("1");
  });
});

describe("convertToDecimal", () => {
  it("converte binário para decimal", () => {
    const result = convertToDecimal("1010", 2);
    expect(result.value).toBe("10");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].description).toContain("Binário");
  });

  it("converte octal para decimal", () => {
    expect(convertToDecimal("17", 8).value).toBe("15");
  });

  it("converte hexadecimal para decimal", () => {
    expect(convertToDecimal("1A", 16).value).toBe("26");
    expect(convertToDecimal("FF", 16).value).toBe("255");
  });

  it("converte bases estendidas (3, 12, 20, 36)", () => {
    expect(convertToDecimal("102", 3).value).toBe("11");
    expect(convertToDecimal("1B", 12).value).toBe("23");
    expect(convertToDecimal("3G", 20).value).toBe("76");
    expect(convertToDecimal("Z", 36).value).toBe("35");
  });

  it("aceita base 10 (identidade)", () => {
    expect(convertToDecimal("42", 10).value).toBe("42");
  });

  it("converte números fracionários", () => {
    expect(convertToDecimal("101.1", 2).value).toBe("5.5");
    expect(convertToDecimal("1A.8", 16).value).toBe("26.5");
  });

  it("trata valores vazios e zero", () => {
    expect(convertToDecimal("", 2).value).toBe("0");
    expect(convertToDecimal("0", 2).value).toBe("0");
  });

  it("gera passos com operações matemáticas", () => {
    const result = convertToDecimal("1010", 2);
    expect(result.steps.some((s) => s.math?.includes("×"))).toBe(true);
  });
});

describe("convertFromDecimal", () => {
  it("converte decimal para binário", () => {
    const result = convertFromDecimal(10, 2);
    expect(result.value).toBe("1010");
    expect(result.steps[0].description).toContain("Binário");
  });

  it("converte decimal para octal", () => {
    expect(convertFromDecimal(15, 8).value).toBe("17");
  });

  it("converte decimal para hexadecimal", () => {
    expect(convertFromDecimal(26, 16).value).toBe("1A");
    expect(convertFromDecimal(255, 16).value).toBe("FF");
  });

  it("converte decimal para bases estendidas", () => {
    expect(convertFromDecimal(11, 3).value).toBe("102");
    expect(convertFromDecimal(35, 36).value).toBe("Z");
    expect(convertFromDecimal(23, 12).value).toBe("1B");
    expect(convertFromDecimal(76, 20).value).toBe("3G");
  });

  it("converte zero", () => {
    expect(convertFromDecimal(0, 2).value).toBe("0");
  });

  it("converte números fracionários", () => {
    expect(convertFromDecimal(0.5, 2).value).toBe("0.1");
    expect(convertFromDecimal(5.5, 2).value).toBe("101.1");
  });

  it("limita a parte fracionária a 10 iterações", () => {
    const result = convertFromDecimal(0.1, 2);
    expect(result.value.startsWith("0.000110011")).toBe(true);
    const fracDigits = result.value.split(".")[1];
    expect(fracDigits.length).toBeLessThanOrEqual(10);
  });

  it("gera passos com divisões sucessivas", () => {
    const result = convertFromDecimal(10, 2);
    expect(result.steps.some((s) => s.math?.includes("÷"))).toBe(true);
  });
});

describe("convert", () => {
  it("retorna o valor inalterado quando as bases são iguais", () => {
    const result = convert("1010", 2, 2);
    expect(result.value).toBe("1010");
    expect(result.steps[0].description).toContain("Mesma base");
    expect(result.steps).toHaveLength(1);
  });

  it("converte decimal para binário", () => {
    expect(convert("26", 10, 2).value).toBe("11010");
  });

  it("converte binário para decimal", () => {
    expect(convert("1010", 2, 10).value).toBe("10");
  });

  it("converte hexadecimal para octal via decimal (conversão indireta)", () => {
    const result = convert("1A", 16, 8);
    expect(result.value).toBe("32");
    expect(result.steps[0].description).toContain("Conversão indireta");
    expect(result.steps.length).toBeGreaterThan(2);
  });

  it("converte binário para hexadecimal", () => {
    expect(convert("11111111", 2, 16).value).toBe("FF");
  });

  it("converte entre bases estendidas", () => {
    expect(convert("Z", 36, 2).value).toBe("100011");
    expect(convert("102", 3, 10).value).toBe("11");
    expect(convert("1B", 12, 16).value).toBe("17");
  });

  it("converte frações entre bases", () => {
    expect(convert("10.5", 10, 2).value).toBe("1010.1");
  });
});
