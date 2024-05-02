import 'dotenv/config';
import { waitForInput } from "./helper.mjs";
import { initialize } from "./openai-api.mjs";

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
    const response = await chat(client, deploymentId, systemPrompts, messages, input, 128);
    console.log(`assistant: ${response}`);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
