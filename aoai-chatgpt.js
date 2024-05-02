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

    const nthis = this;
    import("./src/openai-api.mjs").then((openai) => {
      RED.nodes.createNode(this, config);
      this.name = config.name;

      const aoaiconfig = RED.nodes.getNode(config.config);
  
      if (!aoaiconfig) {
        nthis.status({fill: "red", shape: "ring", text: "missing config"});
        return;
      }
  
      const deploymentId = aoaiconfig.deploymentId;
      nthis.status({fill: "green", shape: "ring", text: "Ready"});
  
      const client = openai.initialize(aoaiconfig.credentials.endpoint, aoaiconfig.credentials.apikey)
  
      nthis.on('input', async function(msg) {
  
        const systemPrompt = msg.payload.systemPrompt;
        const historicalPrompts = msg.payload.historicalPrompts;
        const inputPrompt = msg.payload.inputPrompt;
        const maxTokens = msg.payload.maxTokens ?? config.maxTokens;
  
        nthis.status({fill: "blue", shape: "ring", text: "Busy"});
  
        try {
          const response = await openai.chat(client, deploymentId, systemPrompt, historicalPrompts, inputPrompt, maxTokens);
          msg.payload.response = response;
          nthis.send(msg);
          nthis.status({fill: "green", shape: "ring", text: "Ready"});
  
        } catch (err) {
          console.error("encountered an error:", err);
          nthis.status({fill: "red", shape: "ring", text: "Error"});
        }
      });
  
      nthis.on('close', function() {
      });
  
    });
  }

  RED.nodes.registerType("aoai-chatgpt",AOAIChatGPTNode);
}
