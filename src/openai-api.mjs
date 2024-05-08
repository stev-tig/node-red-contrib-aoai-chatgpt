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
 * input: string | []  {type: "image_url", imageUrl: {url: string}} | {type: "text", text: string}
 * inputName: string?
 * options: {}
 * returns: { response: string?, toolCalls: ChatCompletionsToolCallUnion[] }
 */
export async function chat(client, deploymentId, systemPrompt, messages, input, inputName, options) {

  let currMessage = { role: "user", content: input };
  if (inputName) {
    currMessage.name = inputName;
  }
  messages.push(currMessage);

  const chatCompletions = await client.getChatCompletions(
    deploymentId,
    [{ role: "system", content: systemPrompt }, ...messages],
    options
  );


  const choice = chatCompletions.choices[0];

  return { response: choice.message?.content, toolCalls: choice.message?.toolCalls, rawMessage: choice.message };
}

/*
 * addToolCallRespsChat(client, deploymentId, systemPrompt, messages, toolcallResps, options)
 *
 * client: OpenAIClient
 * deploymentId: string
 * systemPrompt: string
 * messages: { role: string, content: string }[]
 * toolcallResps: { toolCall: ChatCompletionsToolCallUnion, toolResponse: string }[]
 * options: {}
 * returns: { response: string?, toolCalls: ChatCompletionsToolCallUnion[] }
 */
export async function addToolCallRespsChat(client, deploymentId, 
  systemPrompt, messages, 
  toolcallOrigMessage,
  toolcallResps, options) {

    messages.push(toolcallOrigMessage);

    for (const toolcallResp of toolcallResps) {

      const { toolCall, toolResponse } = toolcallResp;
      const toolMsg = {
        toolCallId: toolCall.id,
        role: "tool",
        name: toolCall.function.name,
        content: toolResponse,
      };

      messages.push(toolMsg);
    }

    const chatCompletions = await client.getChatCompletions(
      deploymentId,
      [{ role: "system", content: systemPrompt }, ...messages],
      options
    );

    const choice = chatCompletions.choices[0];
    return { response: choice.message?.content, toolCalls: choice.message?.toolCalls, rawMessage: choice.message };
}
