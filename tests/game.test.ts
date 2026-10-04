import { describe, expect, it } from "vitest";
import { MAX_BONUS, TIME_LIMIT_MS, current, isOver, start, submit, tick, type State } from "../src/game";

const words = ["a", "b"];

describe("game", () => {
  it("正しく打つと次の問題に進み、スコアが増える", () => {
    const s = submit(words, start(), "a");
    expect(s.score).toBe(1);
    expect(current(words, s)).toBe("b");
  });
  it("間違えると何も変わらない", () => {
    expect(submit(words, start(), "x")).toEqual(start());
  });
});

describe("コンボとタイマー", () => {
  const ok = (s: State) => submit(words, s, current(words, s));

  it("連続正解でコンボが増え、得点が 1,2,3 と増える", () => {
    const s1 = ok(start());
    const s2 = ok(s1);
    const s3 = ok(s2);
    expect([s1.score, s2.score, s3.score]).toEqual([1, 3, 6]);
    expect(s3.combo).toBe(3);
  });
  it("間違えるとコンボは 0 に戻り、最大コンボは残る", () => {
    const s = submit(words, ok(ok(start())), "x");
    expect(s.combo).toBe(0);
    expect(s.maxCombo).toBe(2);
  });
  it("ボーナスは +5 で頭打ち", () => {
    let s = start();
    for (let i = 0; i < 6; i++) s = ok(s);
    const before = s.score;
    expect(ok(s).score - before).toBe(1 + MAX_BONUS);
  });
  it("tick で時間が減り、0 未満にならない", () => {
    expect(tick(start(), 1000).timeLeft).toBe(TIME_LIMIT_MS - 1000);
    const s = tick(start(), TIME_LIMIT_MS + 5000);
    expect(s.timeLeft).toBe(0);
    expect(isOver(s)).toBe(true);
  });
  it("時間切れ後は submit しても変わらない", () => {
    const s = tick(start(), TIME_LIMIT_MS);
    expect(submit(words, s, current(words, s))).toEqual(s);
  });
});
