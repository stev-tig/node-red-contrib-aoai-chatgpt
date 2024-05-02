const { initialize } = require("./src/openai-api.mjs");

module.exports = function (RED) {
  function AOAIChatGPTConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.deploymentId = n.deploymentId;
  }

  RED.nodes.registerType("aoai-chatgpt-config", AOAIChatGPTConfigNode, {
    credentials: {
        apikey: {type: "text"},
        endpoint: {type: "text"},
    }
  });

  function AOAIChatGPTNode(config) {
        
    RED.nodes.createNode(this, config);

    const aoaiconfig = RED.nodes.getNode(config.config);
    const deploymentId = aoaiconfig.deploymentId;

    if (!this.config) {
      this.status({fill: "red", shape: "ring", text: "missing config"});
      return;
    }

    this.status({fill: "green", shape: "ring", text: "Ready"});

    const client = initialize(aoaiconfig.credentials.endpoint, aoaiconfig.credentials.apikey)

    this.on('input', function(msg) {

      const systemPrompt = msg.payload.systemPrompt;
      const historicalPrompts = msg.payload.historicalPrompts;
      const inputPrompt = msg.payload.inputPrompt;
      const maxTokens = msg.payload.maxTokens ?? config.maxTokens;

      this.status({fill: "blue", shape: "ring", text: "Busy"});

      try {
        const response = chat(client, deploymentId, systemPrompt, historicalPrompts, inputPrompt, maxTokens);
        msg.payload = response;
        this.send(msg);
        this.status({fill: "green", shape: "ring", text: "Ready"});

      } catch (err) {
        console.error("encountered an error:", err);
        this.status({fill: "red", shape: "ring", text: "Error"});
      }
    });

    this.on('close', function() {
    });

  }

  RED.nodes.registerType("aoai-chatgpt",AOAIChatGPTNode);
}
