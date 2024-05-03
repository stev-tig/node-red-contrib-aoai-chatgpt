import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

/*
 * initialize(endpoint, apikey)
 *
 * endpoint: string
 * apikey: string
 * returns: OpenAIClient
 */
export function initialize(endpoint, apikey) {
  return new OpenAIClient(endpoint, new AzureKeyCredential(apikey));
}

/*
 * chat(client, deploymentId, systemPrompt, messages, input)
 *
 * client: OpenAIClient
 * deploymentId: string
 * systemPrompt: string
 * messages: { role: string, content: string }[]
 * input: string
 * inputName: string?
 * returns: string
 */
export async function chat(client, deploymentId, systemPrompt, messages, input, inputName, maxTokens) {
  let response = "";

  let currMessage = { role: "user", content: input };
  if (inputName) {
    currMessage.name = inputName;
  }
  messages.push(currMessage);

  const chatCompletions = await client.getChatCompletions(
    deploymentId,
    [{ role: "system", content: systemPrompt }, ...messages],
    { maxTokens: maxTokens }
  );

  for (const choice of chatCompletions.choices) {
    const content = choice.message?.content
    if (content !== undefined) {
      response += content;
    }
  }
  messages.push({ role: "assistant", content: response });
  return response;
}
