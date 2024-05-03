module.exports = function (RED) {
  function AOAIChatGPTConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.deploymentId = n.deploymentId;
  }

  RED.nodes.registerType("aoai-chatgpt-config", AOAIChatGPTConfigNode, {
    credentials: {
      apikey: { type: "text" },
      endpoint: { type: "text" },
    }
  });

  function AOAIChatGPTNode(config) {

    const nthis = this;
    RED.nodes.createNode(this, config);
    this.name = config.name;

    const aoaiconfig = RED.nodes.getNode(config.config);

    if (!aoaiconfig) {
      nthis.status({ fill: "red", shape: "ring", text: "missing config" });
      return;
    }

    const deploymentId = aoaiconfig.deploymentId;
    nthis.status({ fill: "green", shape: "ring", text: "Ready" });

    // Dynamic import while created the node synchronously, so, delay the library & openai client initialization
    let openai = null;
    let client = null;

    nthis.on('input', async function (msg) {

      if (!openai) {
        openai = await import("./src/openai-api.mjs");
      }

      if (!client) {
        client = await openai.initialize(aoaiconfig.credentials.endpoint, aoaiconfig.credentials.apikey);
      }

      const systemPrompt = msg.payload.systemPrompt;
      const historicalPrompts = msg.payload.historicalPrompts ?? [];
      const inputPrompt = msg.payload.inputPrompt;
      const user = msg.payload.user ?? null;
      const maxTokens = msg.payload.maxTokens ?? config.maxTokens;

      nthis.status({ fill: "blue", shape: "ring", text: "Busy" });

      try {
        const response = await openai.chat(client, deploymentId, systemPrompt, historicalPrompts, inputPrompt, user, maxTokens);
        msg.payload.response = response;
        nthis.send(msg);
        nthis.status({ fill: "green", shape: "ring", text: "Ready" });

      } catch (err) {
        console.error("encountered an error:", err);
        nthis.status({ fill: "red", shape: "ring", text: "Error" });
      }
    });


    nthis.on('close', function () {
    });

  }

  RED.nodes.registerType("aoai-chatgpt", AOAIChatGPTNode);
}
