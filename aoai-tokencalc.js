module.exports = function (RED) {

  function AOAITokenCalc(config) {
    const node = this;
    RED.nodes.createNode(this, config);
    this.name = config.name;

    let openai = null;

    // Dynamic import while created the node synchronously, so, delay the library & openai client initialization
    node.on('input', async function (msg) {
      if (!openai) {
        openai = await import("./src/openai-api.mjs");
      }

      msg.inputToken = openai.countToken(msg.payload);
      node.send(msg);
    });


    node.on('close', function () {
    });

  }

  RED.nodes.registerType("aoai-tokencalc", AOAITokenCalc);
}
