import readline from "readline";

export function promptUserForQuery(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function compareRows(actual: any[], expected: any[]): boolean {
  if (actual.length !== expected.length) return false;
  return JSON.stringify(actual) === JSON.stringify(expected);
}