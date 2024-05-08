module.exports = function (RED) {
  function AOAIConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.name = n.name;
    this.deploymentId = n.deploymentId;
  }

  RED.nodes.registerType("aoai-config", AOAIConfigNode, {
    credentials: {
      apikey: { type: "text" },
      endpoint: { type: "text" },
    }
  });
}