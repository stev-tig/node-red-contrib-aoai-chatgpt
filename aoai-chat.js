module.exports = function (RED) {

  function AOAIChatGPTNode(config) {

    const node = this;
    RED.nodes.createNode(this, config);
    this.name = config.name;

    const aoaiconfig = RED.nodes.getNode(config.config);

    if (!aoaiconfig) {
      node.status({ fill: "red", shape: "ring", text: "missing config" });
      return;
    }

    const deploymentId = aoaiconfig.deploymentId;
    node.status({ fill: "green", shape: "ring", text: "Ready" });

    // Dynamic import while created the node synchronously, so, delay the library & openai client initialization
    let openai = null;
    let client = null;

    node.on('input', async function (msg) {

      if (!openai) {
        openai = await import("./src/openai-api.mjs");
      }

      if (!client) {
        client = await openai.initialize(aoaiconfig.credentials.endpoint, aoaiconfig.credentials.apikey);
      }

      const systemPrompt = msg.payload.systemPrompt;
      const historicalPrompts = msg.payload.historicalPrompts ?? [];
      const maxTokens = msg.payload.maxTokens ?? parseInt(config.maxTokens);
      const temperature = msg.payload.temperature ?? parseFloat(config.temperature);
      const topP = msg.payload.topP ?? parseFloat(config.topP);
      const frequencyPenalty = msg.payload.frequencyPenalty ?? parseInt(config.frequencyPenalty);
      const presencePenalty = msg.payload.presencePenalty ?? parseInt(config.presencePenalty);
      const tools = msg.payload.tools ? msg.payload.tools : null;
      const toolChoice = msg.payload.toolChoice ?? "auto";
      // const stop = msg.payload.stop ?? config.stop;

      node.status({ fill: "blue", shape: "ring", text: "Busy" });
      
      let option = {
        maxTokens: maxTokens ?? null,
        temperature: temperature ?? null,
        topP: topP ?? null,
        frequencyPenalty: frequencyPenalty ?? null,
        presencePenalty: presencePenalty ?? null,
        // stop: (stop && stop.trim() !== '') ? stop : null
        tools: tools,
        toolChoice: tools ? toolChoice : null
      };

      // gpt-4-vision doesn't support tools
      if (msg.payload.inputMessage && msg.payload.inputMessage.content.length > 1) {
        console.log("no-tools");
        delete option.tools;
        delete option.toolChoice;
      }
      // gpt-4-vision doesn't support tools
      for (const prompt of historicalPrompts) {
        if (Array.isArray(prompt.content) && prompt.content.length > 1) {
          console.log("no-tools");
          delete option.tools;
          delete option.toolChoice;
          break;  
        }
      }

      try {

        const response = await openai.chat(client, deploymentId, systemPrompt, historicalPrompts, msg.payload.inputMessage, option);

        if (response.response) {
          msg.payload.response = response.response;
          node.send([msg, null]);
        } else {
          msg.payload.toolCallMsg = response.rawMessage;
          msg.payload.toolCalls = response.toolCalls;
          node.send([null, msg]);
        }
        node.status({ fill: "green", shape: "ring", text: "Ready" });

      } catch (err) {
        console.error("encountered an error - chat: ", err);
        console.error("encountered an error - chat (cont.): ", historicalPrompts.length > 2? historicalPrompts.slice(-2) : historicalPrompts)
        
        msg.payload.error = true;
        msg.payload.response = JSON.stringify(err);
        node.send([msg, null]);
        node.status({ fill: "red", shape: "ring", text: "Error" });
      }
    });


    node.on('close', function () {
    });

  }

  RED.nodes.registerType("aoai-chat", AOAIChatGPTNode);
}
