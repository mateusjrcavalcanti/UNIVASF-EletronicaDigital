import type { Base } from "./converter";
import { convertFromDecimal, convertToDecimal } from "./converter";

export interface TwosComplementResult {
  binary: string;
  decimal: number;
  hex: string;
  isNegative: boolean;
}

/**
 * Converte um valor em qualquer base para sua representação em complemento de 2
 * com a largura de bits especificada.
 *
 * Lógica: o valor é convertido para decimal e "envolvido" (módulo 2^bitWidth)
 * para caber na largura escolhida. Se o bit mais significativo (MSB) for 1,
 * o valor é negativo: decimal = -(2^bitWidth - valor_sem_sinal).
 *
 * O campo `hex` representa o padrão de bits interpretado como unsigned
 * (ex.: 1010 em 4 bits → "A"), que é como o complemento de 2 costuma ser
 * exibido em ferramentas educacionais.
 */
export function toTwosComplement(
  value: string,
  fromBase: Base,
  bitWidth: number
): TwosComplementResult {
  const width = Math.max(1, Math.floor(bitWidth));
  const mod = Math.pow(2, width);

  const dec = convertToDecimal(value, fromBase);
  const rawDecimal = Math.trunc(parseFloat(dec.value));
  const wrapped = ((rawDecimal % mod) + mod) % mod;

  const binary = wrapped.toString(2).padStart(width, "0").slice(-width);
  const isNegative = binary[0] === "1";
  const decimal = isNegative ? wrapped - mod : wrapped;
  const hex = wrapped
    .toString(16)
    .toUpperCase()
    .padStart(Math.ceil(width / 4), "0");

  return { binary, decimal, hex, isNegative };
}

/**
 * Decodifica uma string binária em complemento de 2 para o valor decimal
 * correspondente e o converte para a base alvo.
 *
 * Se o bit mais significativo for 1, o valor é negativo:
 * decimal = unsigned - 2^bitWidth. Valores negativos são prefixados com "-"
 * na base de saída (ex.: -6 em hexadecimal → "-6").
 */
export function fromTwosComplement(
  binary: string,
  toBase: Base
): { value: string; decimal: number } {
  const bits = binary.replace(/[^01]/g, "");
  const width = bits.length;

  if (width === 0) {
    return { value: "0", decimal: 0 };
  }

  const unsigned = parseInt(bits, 2);
  const mod = Math.pow(2, width);
  const decimal = bits[0] === "1" ? unsigned - mod : unsigned;

  const sign = decimal < 0 ? "-" : "";
  const out = convertFromDecimal(Math.abs(decimal), toBase);

  return { value: `${sign}${out.value}`, decimal };
}
