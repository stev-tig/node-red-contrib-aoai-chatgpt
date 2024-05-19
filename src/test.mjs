import 'dotenv/config';
import readline from 'readline';
import { initialize, chat, embedding, countToken } from "./openai-api.mjs";
import fs from 'fs/promises';

function dotp(x, y) {
  function dotp_sum(a, b) {
    return a + b;
  }
  function dotp_times(a, i) {
    return x[i] * y[i];
  }
  return x.map(dotp_times).reduce(dotp_sum, 0);
}

async function readFileAsync(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(err);
    return "";
  }
};


function cosineSimilarity(A, B) {
  var similarity = dotp(A, B) / (Math.sqrt(dotp(A, A)) * Math.sqrt(dotp(B, B)));
  return similarity;
}

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

  while (true) {
    const input = await waitForInput("You > ");
    const response = await chat(client, deploymentId, systemPrompts, messages,
      input, "User A",
      {
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        // stop: ["\n"]
      });
    console.log(`assistant: ${response}`);
  }
}

async function mainEmbedding() {
  const input1 = "rich dog";
  const input2 = "wealthy wolf";

  const input3 = await readFileAsync(process.env.EMBEDDING_FILE_PATH);
  const input4 = process.env.EMBEDDING_QUERY;

  const client = initialize(process.env.AOAI_ENDPOINT, process.env.AOAI_API_KEY);
  const deploymentId = process.env.AOAI_EMBEDDING_MODEL_DEPLOYMENT_ID;

  let vec3 = [];
  const input3Token = countToken(input3);
  if (input3Token < 8192) {
    vec3 = await embedding(client, deploymentId, input3, 1024);
    // console.log(input3, input3Token);
  }

  let vec4 = [];
  const input4Token = countToken(input4);
  if (input4Token < 8192) {
    vec4 = await embedding(client, deploymentId, input4, 1024);
    // console.log(input4, input4Token);
  }

  const s = cosineSimilarity(vec4, vec3);
  console.log("similarity: ", s);


  // const input1Token = countToken(input1);
  // const vec1 = await embedding(client, deploymentId, input1, 1024);
  // console.log(input1, input1Token);
  // const input2Token = countToken(input2);  
  // const vec2 = await embedding(client, deploymentId, input2, 1024);
  // console.log(input2, input2Token);
  // const s = cosineSimilarity(vec1, vec2);
  // console.log("similarity: ", s);
}

mainEmbedding().catch((err) => {
  console.error("The sample encountered an error:", err);
});
