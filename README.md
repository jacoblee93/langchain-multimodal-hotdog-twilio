# Multimodal GPT-4V Not Hotdog

OpenAI had a ton of awesome announcements at their most recent Developer Day, including multimodal support.

I immediately seized the opportunity to use billions of dollars of hard work and AI research to create the ultimate product:
a [Twilio](https://twilio.com) powered app that can detect whether an image contains a hotdog or not!

It leverages GPT-4V, [LangChain.js](https://github.com/langchain-ai/langchainjs), and Twilio. The live deployment runs on a Cloudflare worker.

## Setup

First, you'll need to claim a phone number with MMS capability from [Twilio](https://twilio.com). You'll need to get it approved, which can unfortunately be a lengthy process.

You'll need to set your OpenAI key in `.dev.vars` and in your Cloudflare console:

```
OPENAI_API_KEY=
```

Run `npm install`. You can run the `src/index.ts` file locally with `npx wrangler dev`, but it's easiest to test with a live Twilio number.

When you're ready, deploy with `npx wrangler deploy`. Take note of the URL and put it as the recipient webhook in Twilio.

And that's it! Text your phone number a picture, and it will respond with whether it's a hotdog or not.

## Thank you!

I hope this helps you eat healthier!

Thank you to [Craig](https://twitter.com/craigsdennis) and [Lizzie](https://twitter.com/lizziepika) for their help with this!

For more, follow me on X (formerly Twitter) [@Hacubu](https://x.com/hacubu/) and LangChain [@LangChainAI](https://x.com/LangChainAI/).
