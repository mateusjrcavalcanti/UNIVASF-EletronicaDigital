// Lógica de conversão de bases numéricas (client-side, precisão com BigInt)

export const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export const AVAILABLE_BASES = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36] as const

export type Base = (typeof AVAILABLE_BASES)[number]

export const COMMON_BASES = [2, 8, 10, 16] as const

export const BASE_NAMES: Record<number, string> = {
  2: "Binário",
  3: "Ternário",
  5: "Quinário",
  7: "Base 7",
  8: "Octal",
  10: "Decimal",
  12: "Duodecimal",
  16: "Hexadecimal",
  20: "Vigesimal",
  36: "Base 36",
}

export function baseLabel(base: number): string {
  return BASE_NAMES[base] ?? `Base ${base}`
}

const SUBSCRIPTS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
}

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
}

export function toSubscript(n: number | string): string {
  return String(n)
    .split("")
    .map((c) => SUBSCRIPTS[c] ?? c)
    .join("")
}

export function toSuperscript(n: number | string): string {
  return String(n)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("")
}

/** Normaliza a entrada removendo espaços e deixando maiúsculas */
export function normalizeInput(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase()
}

/** Verifica se a string é um valor válido na base informada */
export function isValid(value: string, base: number): boolean {
  const v = normalizeInput(value)
  if (v === "" || v === "-") return false
  const body = v.startsWith("-") ? v.slice(1) : v
  if (body === "") return false
  const valid = DIGITS.slice(0, base)
  for (const ch of body) {
    if (!valid.includes(ch)) return false
  }
  return true
}

/** Converte uma string de qualquer base para BigInt decimal */
export function toDecimal(value: string, base: number): bigint {
  const v = normalizeInput(value)
  const negative = v.startsWith("-")
  const body = negative ? v.slice(1) : v
  let result = 0n
  const b = BigInt(base)
  for (const ch of body) {
    const digit = DIGITS.indexOf(ch)
    result = result * b + BigInt(digit)
  }
  return negative ? -result : result
}

/** Converte um BigInt decimal para string na base informada */
export function fromDecimal(dec: bigint, base: number): string {
  if (dec === 0n) return "0"
  const negative = dec < 0n
  let n = negative ? -dec : dec
  const b = BigInt(base)
  let out = ""
  while (n > 0n) {
    const rem = Number(n % b)
    out = DIGITS[rem] + out
    n = n / b
  }
  return negative ? "-" + out : out
}

/** Conversão direta entre duas bases */
export function convert(value: string, fromBase: number, toBase: number): string {
  return fromDecimal(toDecimal(value, fromBase), toBase)
}

/** Passos da expansão polinomial (base -> decimal) */
export interface PolynomialStep {
  digit: string
  digitValue: number
  power: number
  weight: bigint
  product: bigint
}

export function polynomialExpansion(value: string, base: number): PolynomialStep[] {
  const v = normalizeInput(value).replace("-", "")
  const steps: PolynomialStep[] = []
  const len = v.length
  const b = BigInt(base)
  for (let i = 0; i < len; i++) {
    const ch = v[i]
    const digitValue = DIGITS.indexOf(ch)
    const power = len - 1 - i
    const weight = b ** BigInt(power)
    steps.push({
      digit: ch,
      digitValue,
      power,
      weight,
      product: BigInt(digitValue) * weight,
    })
  }
  return steps
}

/** Passos das divisões sucessivas (decimal -> base) */
export interface DivisionStep {
  dividend: bigint
  divisor: number
  quotient: bigint
  remainder: number
  remainderDigit: string
}

export function successiveDivisions(dec: bigint, base: number): DivisionStep[] {
  const steps: DivisionStep[] = []
  let n = dec < 0n ? -dec : dec
  const b = BigInt(base)
  if (n === 0n) {
    return [{ dividend: 0n, divisor: base, quotient: 0n, remainder: 0, remainderDigit: "0" }]
  }
  while (n > 0n) {
    const remainder = Number(n % b)
    const quotient = n / b
    steps.push({
      dividend: n,
      divisor: base,
      quotient,
      remainder,
      remainderDigit: DIGITS[remainder],
    })
    n = quotient
  }
  return steps
}

/** Formata binário em grupos de 4 bits para leitura */
export function groupBits(binary: string, size = 4): string {
  const negative = binary.startsWith("-")
  let body = negative ? binary.slice(1) : binary
  const pad = (size - (body.length % size)) % size
  body = "0".repeat(pad) + body
  const groups = body.match(new RegExp(`.{1,${size}}`, "g")) ?? [body]
  return (negative ? "-" : "") + groups.join(" ")
}

/** Representação binária de largura fixa (complemento de 2 para negativos) */
export interface TwoComplementResult {
  bits: string
  bitArray: number[]
  signBit: number
  isNegative: boolean
  decimalValue: bigint
  overflow: boolean
  width: number
}

export function twoComplement(dec: bigint, width: number): TwoComplementResult {
  const total = 1n << BigInt(width)
  const min = -(1n << BigInt(width - 1))
  const max = (1n << BigInt(width - 1)) - 1n
  const overflow = dec < min || dec > max

  // valor efetivo dentro da largura (wrap-around)
  let stored = ((dec % total) + total) % total
  const bits = stored.toString(2).padStart(width, "0").slice(-width)
  const bitArray = bits.split("").map(Number)
  const signBit = bitArray[0]

  // Interpretação em complemento de 2
  let decimalValue: bigint
  if (signBit === 1) {
    decimalValue = stored - total
  } else {
    decimalValue = stored
  }

  return {
    bits,
    bitArray,
    signBit,
    isNegative: signBit === 1,
    decimalValue,
    overflow,
    width,
  }
}

// ---------- Operações ----------

export type OperationType = "add" | "sub" | "and" | "or" | "xor" | "shl" | "shr"

export const OPERATIONS: { id: OperationType; label: string; symbol: string }[] = [
  { id: "add", label: "Adição", symbol: "+" },
  { id: "sub", label: "Subtração", symbol: "−" },
  { id: "and", label: "AND", symbol: "&" },
  { id: "or", label: "OR", symbol: "|" },
  { id: "xor", label: "XOR", symbol: "^" },
  { id: "shl", label: "Shift Left", symbol: "<<" },
  { id: "shr", label: "Shift Right", symbol: ">>" },
]

export interface OperationResult {
  value: bigint
  binary: string
  carry: boolean
  borrow: boolean
  overflow: boolean
  width: number
}

export function computeOperation(
  a: bigint,
  b: bigint,
  op: OperationType,
  width = 8,
): OperationResult {
  let value = 0n
  let carry = false
  let borrow = false
  let overflow = false

  const max = (1n << BigInt(width - 1)) - 1n
  const min = -(1n << BigInt(width - 1))
  const mask = (1n << BigInt(width)) - 1n

  switch (op) {
    case "add": {
      value = a + b
      carry = a + b > mask
      overflow = value > max || value < min
      break
    }
    case "sub": {
      value = a - b
      borrow = a < b
      overflow = value > max || value < min
      break
    }
    case "and":
      value = a & b
      break
    case "or":
      value = a | b
      break
    case "xor":
      value = a ^ b
      break
    case "shl":
      value = a << (b < 0n ? 0n : b)
      carry = value > mask
      break
    case "shr":
      value = a >> (b < 0n ? 0n : b)
      break
  }

  return {
    value,
    binary: fromDecimal(value, 2),
    carry,
    borrow,
    overflow,
    width,
  }
}
