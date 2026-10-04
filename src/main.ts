import { WORDS } from "./words";
import { current, isOver, start, submit, tick } from "./game";

const q = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const prompt = q<HTMLParagraphElement>("#prompt");
const answer = q<HTMLInputElement>("#answer");
const score = q<HTMLSpanElement>("#score");
const combo = q<HTMLSpanElement>("#combo");
const time = q<HTMLSpanElement>("#time");
const result = q<HTMLElement>("#result");
const finalScore = q<HTMLSpanElement>("#final-score");
const finalCombo = q<HTMLSpanElement>("#final-combo");
const retry = q<HTMLButtonElement>("#retry");

const TICK_MS = 100;
let state = start();
let timer: number | undefined;
let lastTime = 0;

function render() {
  prompt.textContent = current(WORDS, state);
  score.textContent = String(state.score);
  combo.textContent = String(state.combo);
  time.textContent = String(Math.ceil(state.timeLeft / 1000));
  if (isOver(state)) {
    finalScore.textContent = String(state.score);
    finalCombo.textContent = String(state.maxCombo);
    result.hidden = false;
    answer.disabled = true;
  }
}

// 最初の入力で時間が動き出す
function startTimer() {
  if (timer !== undefined) return;
  lastTime = Date.now();
  timer = window.setInterval(() => {
    const now = Date.now();
    state = tick(state, now - lastTime);
    lastTime = now;
    if (isOver(state)) stopTimer();
    render();
  }, TICK_MS);
}

function stopTimer() {
  window.clearInterval(timer);
  timer = undefined;
}

answer.addEventListener("keydown", (e) => {
  if (isOver(state)) return;
  startTimer();
  if (e.key !== "Enter") return;
  state = submit(WORDS, state, answer.value);
  answer.value = "";
  render();
});

retry.addEventListener("click", () => {
  stopTimer();
  state = start();
  result.hidden = true;
  answer.disabled = false;
  answer.value = "";
  render();
  answer.focus();
});

render();
answer.focus();
