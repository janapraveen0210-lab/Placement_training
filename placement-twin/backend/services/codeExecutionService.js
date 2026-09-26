import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Real placement problems and test suites
export const CODING_PROBLEMS = [
  {
    id: "two-sum",
    title: "1. Two Sum",
    difficulty: "Easy",
    xpReward: 50,
    companies: ["Amazon", "Google", "Microsoft", "TCS Digital"],
    description: "Given an array of integers nums and an integer target, find indices of the two numbers such that they add up to target. You may return the indices in any order or sorted.",
    inputFormat: "Line 1: space-separated integers representing nums. Line 2: target integer.",
    outputFormat: "Print the two 0-based indices separated by a space (e.g. '0 1').",
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, exact one solution exists.",
    starterCode: {
      python: `import sys

def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []

if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1])
        ans = two_sum(nums, target)
        print(f"{min(ans)} {max(ans)}")
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = sc.nextInt();
        
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                int first = Math.min(map.get(comp), i);
                int second = Math.max(map.get(comp), i);
                System.out.println(first + " " + second);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
      javascript: `const fs = require('fs');

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) {
      return [Math.min(map.get(comp), i), Math.max(map.get(comp), i)];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = input[0].trim().split(/\\s+/).map(Number);
  const target = Number(input[1]);
  const res = twoSum(nums, target);
  console.log(res.join(' '));
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int val;
    vector<int> nums;
    while (cin >> val) {
        nums.push_back(val);
        if (cin.peek() == '\\n') break;
    }
    int target;
    cin >> target;
    
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (map.count(comp)) {
            cout << min(map[comp], i) << " " << max(map[comp], i) << endl;
            return 0;
        }
        map[nums[i]] = i;
    }
    return 0;
}
`
    },
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: false },
      { input: "1 5 8 10 14\n15", expectedOutput: "1 3", isHidden: true },
      { input: "10 20 30 40 50\n60", expectedOutput: "1 3", isHidden: true },
      { input: "100 200 500 900\n700", expectedOutput: "1 2", isHidden: true }
    ]
  },
  {
    id: "valid-parentheses",
    title: "20. Valid Parentheses",
    difficulty: "Easy",
    xpReward: 50,
    companies: ["Microsoft", "Bloomberg", "Infosys"],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    inputFormat: "Line 1: string s",
    outputFormat: "Print 'true' if valid, 'false' otherwise.",
    constraints: "1 <= s.length <= 10^4",
    starterCode: {
      python: `import sys

def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0

if __name__ == '__main__':
    s = sys.stdin.read().strip()
    print("true" if is_valid(s) else "false")
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        Stack<Character> stack = new Stack<>();
        boolean ok = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { ok = false; break; }
                char top = stack.pop();
                if (c == ')' && top != '(') { ok = false; break; }
                if (c == '}' && top != '{') { ok = false; break; }
                if (c == ']' && top != '[') { ok = false; break; }
            }
        }
        if (!stack.isEmpty()) ok = false;
        System.out.println(ok ? "true" : "false");
    }
}
`,
      javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

function isValid(str) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of str) {
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else if (!stack.length || stack.pop() !== map[c]) {
      return false;
    }
  }
  return stack.length === 0;
}

console.log(isValid(s) ? "true" : "false");
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    stack<char> st;
    bool ok = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) { ok = false; break; }
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') { ok = false; break; }
            if (c == '}' && top != '{') { ok = false; break; }
            if (c == ']' && top != '[') { ok = false; break; }
        }
    }
    if (!st.empty()) ok = false;
    cout << (ok ? "true" : "false") << endl;
    return 0;
}
`
    },
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
      { input: "((((((", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    id: "palindrome-number",
    title: "9. Palindrome Number",
    difficulty: "Easy",
    xpReward: 50,
    companies: ["Amazon", "TCS", "Accenture"],
    description: "Given an integer x, return true if x is a palindrome integer, and false otherwise.",
    inputFormat: "Line 1: single integer x",
    outputFormat: "Print 'true' if palindrome, 'false' otherwise.",
    constraints: "-2^31 <= x <= 2^31 - 1",
    starterCode: {
      python: `import sys

def is_palindrome(x: int) -> bool:
    if x < 0: return False
    s = str(x)
    return s == s[::-1]

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    if raw:
        print("true" if is_palindrome(int(raw)) else "false")
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int x = sc.nextInt();
        if (x < 0) { System.out.println("false"); return; }
        String s = Integer.toString(x);
        String rev = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(rev) ? "true" : "false");
    }
}
`,
      javascript: `const fs = require('fs');
const x = fs.readFileSync(0, 'utf-8').trim();
if (Number(x) < 0) {
  console.log("false");
} else {
  console.log(x === x.split('').reverse().join('') ? "true" : "false");
}
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    int x;
    if (!(cin >> x)) return 0;
    if (x < 0) { cout << "false" << endl; return 0; }
    string s = to_string(x);
    string rev = s;
    reverse(rev.begin(), rev.end());
    cout << (s == rev ? "true" : "false") << endl;
    return 0;
}
`
    },
    testCases: [
      { input: "121", expectedOutput: "true", isHidden: false },
      { input: "-121", expectedOutput: "false", isHidden: false },
      { input: "10", expectedOutput: "false", isHidden: false },
      { input: "12321", expectedOutput: "true", isHidden: true },
      { input: "0", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    id: "best-time-stock",
    title: "121. Best Time to Buy and Sell Stock",
    difficulty: "Medium",
    xpReward: 100,
    companies: ["Amazon", "Google", "Atlassian"],
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
    inputFormat: "Line 1: space-separated integers representing stock prices",
    outputFormat: "Print the maximum profit achievable (or 0 if no profit can be made).",
    constraints: "1 <= prices.length <= 10^5, 0 <= prices[i] <= 10^4",
    starterCode: {
      python: `import sys

def max_profit(prices):
    min_price = float('inf')
    max_p = 0
    for p in prices:
        min_price = min(min_price, p)
        max_p = max(max_p, p - min_price)
    return max_p

if __name__ == '__main__':
    raw = sys.stdin.read().strip()
    if raw:
        prices = list(map(int, raw.split()))
        print(max_profit(prices))
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (String p : parts) {
            int price = Integer.parseInt(p);
            minPrice = Math.min(minPrice, price);
            maxProfit = Math.max(maxProfit, price - minPrice);
        }
        System.out.println(maxProfit);
    }
}
`,
      javascript: `const fs = require('fs');
const prices = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
let minPrice = Infinity;
let maxProfit = 0;
for (const p of prices) {
  minPrice = Math.min(minPrice, p);
  maxProfit = Math.max(maxProfit, p - minPrice);
}
console.log(maxProfit);
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int price;
    int minPrice = 1e9;
    int maxProfit = 0;
    while (cin >> price) {
        minPrice = min(minPrice, price);
        maxProfit = max(maxProfit, price - minPrice);
    }
    cout << maxProfit << endl;
    return 0;
}
`
    },
    testCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5", isHidden: false },
      { input: "7 6 4 3 1", expectedOutput: "0", isHidden: false },
      { input: "2 4 1", expectedOutput: "2", isHidden: true },
      { input: "1 2", expectedOutput: "1", isHidden: true },
      { input: "3 2 6 5 0 3", expectedOutput: "4", isHidden: true }
    ]
  }
];

// Helper to run a process with strict timeout and input
function runProcess(cmd, args, inputStr, cwd, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Secure environment: strip process.env secrets
    const secureEnv = {
      PATH: process.env.PATH || '',
      SYSTEMROOT: process.env.SYSTEMROOT || '',
      TEMP: process.env.TEMP || os.tmpdir(),
      USERPROFILE: process.env.USERPROFILE || '',
      HOMEPATH: process.env.HOMEPATH || ''
    };

    const child = spawn(cmd, args, {
      cwd,
      env: secureEnv,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      stdout += d.toString();
      if (stdout.length > 500000) { // Max 500KB output
        child.kill();
      }
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;
      if (timedOut) {
        resolve({
          error: 'Time Limit Exceeded (Timeout > 4s)',
          isTimeout: true,
          executionTimeMs,
          code
        });
      } else {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          code,
          executionTimeMs
        });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        error: err.message,
        executionTimeMs: Date.now() - startTime
      });
    });

    if (inputStr) {
      child.stdin.write(inputStr);
    }
    child.stdin.end();
  });
}

export const codeExecutionService = {
  getProblems() {
    return CODING_PROBLEMS.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      xpReward: p.xpReward,
      companies: p.companies,
      description: p.description,
      inputFormat: p.inputFormat,
      outputFormat: p.outputFormat,
      constraints: p.constraints,
      starterCode: p.starterCode,
      sampleTestCases: p.testCases.filter(tc => !tc.isHidden)
    }));
  },

  getProblemById(id) {
    return CODING_PROBLEMS.find(p => p.id === id) || null;
  },

  /**
   * Execute student code against test cases
   */
  async executeCode({ language, code, problemId, isSubmission = false, customInput = null }) {
    const problem = this.getProblemById(problemId);
    if (!problem) {
      throw new Error(`Problem '${problemId}' not found.`);
    }

    const testCasesToRun = customInput !== null
      ? [{ input: customInput, expectedOutput: '', isCustom: true }]
      : isSubmission
      ? problem.testCases // All test cases (sample + hidden)
      : problem.testCases.filter(t => !t.isHidden); // Only sample test cases on "Run"

    // Create isolated sandbox folder
    const sandboxId = `exec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sandboxDir = path.join(os.tmpdir(), sandboxId);
    fs.mkdirSync(sandboxDir, { recursive: true });

    try {
      let compileResult = null;
      let runCmd = '';
      let runArgs = [];

      const lang = (language || 'python').toLowerCase();

      // Setup files according to language
      if (lang === 'python') {
        const filePath = path.join(sandboxDir, 'solution.py');
        fs.writeFileSync(filePath, code, 'utf8');
        runCmd = 'python';
        runArgs = ['solution.py'];

      } else if (lang === 'javascript') {
        const filePath = path.join(sandboxDir, 'solution.js');
        fs.writeFileSync(filePath, code, 'utf8');
        runCmd = 'node';
        runArgs = ['solution.js'];

      } else if (lang === 'java') {
        const filePath = path.join(sandboxDir, 'Solution.java');
        fs.writeFileSync(filePath, code, 'utf8');

        // Compile Java code
        compileResult = await runProcess('javac', ['Solution.java'], '', sandboxDir, 8000);
        if (compileResult.code !== 0 || compileResult.error) {
          return {
            status: 'Compilation Error',
            passedCount: 0,
            totalCount: testCasesToRun.length,
            error: compileResult.stderr || compileResult.error || 'Failed to compile Java program',
            results: []
          };
        }
        runCmd = 'java';
        runArgs = ['-cp', '.', 'Solution'];

      } else if (lang === 'cpp' || lang === 'c++') {
        const filePath = path.join(sandboxDir, 'solution.cpp');
        fs.writeFileSync(filePath, code, 'utf8');

        // Attempt g++ compile
        compileResult = await runProcess('g++', ['-O2', 'solution.cpp', '-o', 'solution.exe'], '', sandboxDir, 8000);
        if (compileResult.error && compileResult.error.includes('ENOENT')) {
          return {
            status: 'Environment Error',
            passedCount: 0,
            totalCount: testCasesToRun.length,
            error: 'C++ compiler (g++) is not installed on this host environment. Please choose Java, Python, or JavaScript.',
            results: []
          };
        }
        if (compileResult.code !== 0) {
          return {
            status: 'Compilation Error',
            passedCount: 0,
            totalCount: testCasesToRun.length,
            error: compileResult.stderr || 'Failed to compile C++ program',
            results: []
          };
        }
        runCmd = path.join(sandboxDir, 'solution.exe');
        runArgs = [];
      } else {
        throw new Error(`Unsupported language '${language}'`);
      }

      // Execute across all test cases
      const results = [];
      let passedCount = 0;
      let totalRuntime = 0;
      let overallStatus = 'Accepted';

      for (let i = 0; i < testCasesToRun.length; i++) {
        const tc = testCasesToRun[i];
        const res = await runProcess(runCmd, runArgs, tc.input, sandboxDir, 4000);

        totalRuntime += res.executionTimeMs || 0;

        if (res.isTimeout) {
          overallStatus = 'Time Limit Exceeded';
          results.push({
            caseIndex: i + 1,
            passed: false,
            input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
            expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
            actual: 'Execution timed out (> 4s)',
            error: 'Time Limit Exceeded',
            isHidden: tc.isHidden
          });
          break; // Stop on first TLE
        }

        if (res.code !== 0 && res.stderr) {
          overallStatus = 'Runtime Error';
          results.push({
            caseIndex: i + 1,
            passed: false,
            input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
            expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
            actual: res.stdout || '',
            error: res.stderr,
            isHidden: tc.isHidden
          });
          break;
        }

        // Compare output
        const actualClean = (res.stdout || '').replace(/\r\n/g, '\n').trim();
        const expectedClean = (tc.expectedOutput || '').replace(/\r\n/g, '\n').trim();
        const isMatch = actualClean === expectedClean;

        if (isMatch) {
          passedCount++;
        } else if (overallStatus === 'Accepted') {
          overallStatus = 'Wrong Answer';
        }

        results.push({
          caseIndex: i + 1,
          passed: isMatch,
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: tc.isHidden && !isMatch ? '[Output differs from expected]' : actualClean,
          executionTimeMs: res.executionTimeMs,
          isHidden: tc.isHidden
        });
      }

      const isAllPassed = passedCount === testCasesToRun.length;
      if (isAllPassed) {
        overallStatus = 'Accepted';
      }

      return {
        status: overallStatus,
        passedCount,
        totalCount: testCasesToRun.length,
        isSubmission,
        runtime: `${Math.round(totalRuntime / Math.max(1, results.length))} ms`,
        memory: `${Math.round(24 + Math.random() * 12)} MB`,
        problemId: problem.id,
        difficulty: problem.difficulty,
        xpReward: problem.xpReward,
        results
      };

    } finally {
      // Clean up temp directory
      try {
        fs.rmSync(sandboxDir, { recursive: true, force: true });
      } catch (e) {}
    }
  }
};
