// PreToolUse: テストを消す編集と、人間がやるべき git/gh 操作を止める
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const { tool_name: tool, tool_input: t = {} } = input;

function deny(reason) {
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
  }));
  process.exit(0);
}

const count = (s = "", re) => (s.match(re) || []).length;
const TEST_FILE = /(^|\/)(tests|e2e)\//;
const CASES = /\b(it|test)(\.skip|\.only)?\s*\(|expect\s*\(/g;

if (tool === "Edit" && TEST_FILE.test(t.file_path ?? "")) {
  if (count(t.new_string, CASES) < count(t.old_string, CASES)) {
    deny("テストケースや expect を減らす編集はできません。テストが間違っていると思うなら、直さずに報告してください。");
  }
  if (/\.(skip|only)\s*\(/.test(t.new_string ?? "") && !/\.(skip|only)\s*\(/.test(t.old_string ?? "")) {
    deny("テストを skip / only にする編集はできません。");
  }
}

if (tool === "Bash") {
  const cmd = t.command ?? "";
  if (/\bgh\s+pr\s+merge\b/.test(cmd)) deny("マージは人間が承認してから行います。PR を作ったところで止めてください。");
  if (/\bgit\s+push\b.*(--force|-f\b)|\bgit\s+push\b.*\bmain\b/.test(cmd)) deny("main への push と force push は禁止です。");
  if (/\brm\s+-[a-z]*r[a-z]*\s+.*(tests|e2e)\b/.test(cmd)) deny("テストのディレクトリは消せません。");
}
process.exit(0);
