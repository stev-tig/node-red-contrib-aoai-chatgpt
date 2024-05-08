# NodeRed Azure OpenAI module

## Configuration

Create the openai instance in Azure, then create a model, then with an API Key you're good to go.

## Supported models

currently only supports models with getChatCompletions
(so gpt-35-turbo-instruct isn't supported yet)

### Tested on

- gpt-35-turbo
- gpt-4

## GPT4 vision

as gpt4 vision models also supports to input with vision

the type input is no longer "text", but []ChatMessage, where ChatMessage would be the following

- `{type: "text", text: string}`
- `{type: "image_url", imageUrl: {url: "data:image/jpeg;base64,{base64-encoded-image}"}}`
- ...

## TODO

- see if there's anything to do with Azure AI Search Service
- support more models

## Support

If you like this project a lot, you can buy some food for my dogs in [Patreon](https://www.patreon.com/supportpiggy)
