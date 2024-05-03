import 'dotenv/config';
import readline from 'readline';
import { initialize } from "./openai-api.mjs";

export function waitForInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

async function main() {
  const client = initialize(process.env.AOAI_ENDPOINT, process.env.AOAI_API_KEY);
  const deploymentId = process.env.AOAI_MODEL_DEPLOYMENT_ID;
  const systemPrompts = process.env.CHATGPT_SYSTEM_PROMPT;
  const promptHistory = process.env.CHATGPT_PROMPT_HISTORY == "" ? "[]" : process.env.CHATGPT_PROMPT_HISTORY;

  let messages = [...JSON.parse(promptHistory)];

  // console.debug("system: " + systemPrompts);
  // console.debug("promptHistory: " + JSON.stringify(messages));

  while (true) {
    const input = await waitForInput("You > ");
    const response = await chat(client, deploymentId, systemPrompts, messages, input, "User A", 128);
    console.log(`assistant: ${response}`);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
