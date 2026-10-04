export type Entry = { score: number; at: number };

export const KEY = "cmd-typing:ranking";
export const LIMIT = 5;

// 高い順、同点は新しい順。新しい記録を先頭に足してから安定ソートする
export function addEntry(entries: Entry[], entry: Entry, limit = LIMIT): Entry[] {
  return [entry, ...entries]
    .sort((a, b) => b.score - a.score || b.at - a.at)
    .slice(0, limit);
}

export function load(storage: Pick<Storage, "getItem">): Entry[] {
  try {
    const data = JSON.parse(storage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter(
      (e): e is Entry => typeof e?.score === "number" && typeof e?.at === "number",
    );
  } catch {
    return [];
  }
}

export function record(
  storage: Pick<Storage, "getItem" | "setItem">,
  score: number,
  at = Date.now(),
): Entry[] {
  const entries = addEntry(load(storage), { score, at });
  storage.setItem(KEY, JSON.stringify(entries));
  return entries;
}
