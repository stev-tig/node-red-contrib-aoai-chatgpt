import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { get_encoding } from "tiktoken";

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
 * calculateToken(input)
 * Calculate token needed with cl100k_base
 *
 * input: string
 * returns: number
 */
export function countToken(input) {
  const encoding = get_encoding("cl100k_base");
  const tokens = encoding.encode(input);
  encoding.free();
  return tokens.length;
}

/*
 * embedding(client, deploymentId, input, dimensions)
 *
 * client: OpenAIClient
 * deploymentId: string
 * input: string
 * dimensions: number?
 * returns: number[]
 */
export async function embedding(client, deploymentId, input, dimensions) {
  const option = { dimensions: dimensions }
  if (!dimensions) {
    delete option.dimensions;
  }

  const vec = await client.getEmbeddings(deploymentId, [input], option);
  return vec?.data[0]?.embedding;
}

/*
 * chat(client, deploymentId, systemPrompt, messages, input, inputName, option)
 *
 * client: OpenAIClient
 * deploymentId: string
 * systemPrompt: string
 * messages: { role: string, content: string }[]
 * input: string | [] {type: "image_url", imageUrl: {url: string}} | {type: "text", text: string}
 * inputName: string?
 * options: {}
 * returns: { response: string?, toolCalls: ChatCompletionsToolCallUnion[] }
 */
export async function chat(client, deploymentId, systemPrompt, messages, currMessage, options) {

  // let currMessage = { role: "user", content: input };
  // if (inputName) {
  //   currMessage.name = inputName;
  // }
  // not automatically push into message anymore
  // messages.push(currMessage);

  let input = [{ role: "system", content: systemPrompt }, ...messages];
  if (currMessage) {
    input.push(currMessage);
  }

  const chatCompletions = await client.getChatCompletions(
    deploymentId,
    input,
    options
  );


  const choice = chatCompletions.choices[0];

  return { response: choice.message?.content, toolCalls: choice.message?.toolCalls, rawMessage: choice.message };
}

/*
 * addToolCallRespsChat(client, deploymentId, systemPrompt, messages, inputMessage(orig), toolcallResps, options)
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
  systemPrompt, messages, inputMessage,
  toolcallOrigMessage,
  toolcallResps, options) {

    let input = [{ role: "system", content: systemPrompt }, ...messages, inputMessage];
    
    input.push(toolcallOrigMessage);

    for (const toolcallResp of toolcallResps) {

      const { toolCall, toolResponse } = toolcallResp;
      const toolMsg = {
        toolCallId: toolCall.id,
        role: "tool",
        name: toolCall.function.name,
        content: toolResponse,
      };

      input.push(toolMsg);
    }

    const chatCompletions = await client.getChatCompletions(
      deploymentId,
      input,
      options
    );

    const choice = chatCompletions.choices[0];
    return { response: choice.message?.content, toolCalls: choice.message?.toolCalls, rawMessage: choice.message };
}
