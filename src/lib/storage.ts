import { z } from "zod";
import type { Base, ConversionRecord } from "./converter";

const STORAGE_KEY = "conversor-bases:history:v1";

const ALL_BASES = [2, 3, 5, 7, 8, 10, 12, 16, 20, 36] as const;

const recordSchema = z.object({
  id: z.string(),
  inputValue: z.string(),
  inputBase: z.coerce.number().pipe(z.custom<Base>((val) => ALL_BASES.includes(val as Base))),
  outputValue: z.string(),
  outputBase: z.coerce.number().pipe(z.custom<Base>((val) => ALL_BASES.includes(val as Base))),
  steps: z.array(
    z.object({
      description: z.string(),
      math: z.string().optional(),
      result: z.string().optional(),
    })
  ),
  timestamp: z.number(),
});

const historySchema = z.array(recordSchema);

export function loadHistory(): ConversionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    const result = historySchema.safeParse(parsed);
    if (result.success) {
      return result.data as ConversionRecord[];
    }
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
}

export function saveHistory(history: ConversionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function addRecord(record: ConversionRecord) {
  const history = loadHistory();
  history.unshift(record);
  if (history.length > 50) history.pop();
  saveHistory(history);
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
