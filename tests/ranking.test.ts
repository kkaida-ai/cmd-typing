import { describe, expect, it } from "vitest";
import { addEntry, KEY, load, record, type Entry } from "../src/ranking";

function fakeStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

describe("addEntry", () => {
  it("スコアの高い順に並べる", () => {
    let r = addEntry([], { score: 3, at: 1 });
    r = addEntry(r, { score: 10, at: 2 });
    r = addEntry(r, { score: 5, at: 3 });
    expect(r.map((e) => e.score)).toEqual([10, 5, 3]);
  });

  it("同点は新しい順", () => {
    let r = addEntry([], { score: 5, at: 1 });
    r = addEntry(r, { score: 5, at: 2 });
    expect(r.map((e) => e.at)).toEqual([2, 1]);
  });

  it("同点で時刻も同じなら件数は減らない", () => {
    let r = addEntry([], { score: 5, at: 1 });
    r = addEntry(r, { score: 5, at: 1 });
    expect(r).toHaveLength(2);
  });

  it("上位5件だけ残す", () => {
    let r: Entry[] = [];
    for (let i = 1; i <= 7; i++) r = addEntry(r, { score: i, at: i });
    expect(r.map((e) => e.score)).toEqual([7, 6, 5, 4, 3]);
  });
});

describe("load / record", () => {
  it("空や壊れたデータは空配列", () => {
    expect(load(fakeStorage())).toEqual([]);
    expect(load(fakeStorage({ [KEY]: "not json" }))).toEqual([]);
    expect(load(fakeStorage({ [KEY]: "[1" }))).toEqual([]);
    expect(load(fakeStorage({ [KEY]: '[{"score":"x"},{"score":2,"at":1}]' }))).toEqual([
      { score: 2, at: 1 },
    ]);
  });

  it("保存して読み戻せる", () => {
    const s = fakeStorage();
    record(s, 4, 1);
    record(s, 9, 2);
    expect(load(s).map((e) => e.score)).toEqual([9, 4]);
  });
});
