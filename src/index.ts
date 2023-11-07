import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage } from "langchain/schema";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";

export interface Env {
  OPENAI_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request: Request): Promise<Record<string, any>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json() as any;
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    const body: Record<string, any> = {};
    for (const entry of formData.entries()) {
      body[entry[0] as string] = entry[1];
    }
    return body;
  } else {
    throw new Error("Invalid content type header.");
  }
}

const sendRequest = async ({ to, from, body, accountSid, authToken }: { to: string, from: string, body: string, accountSid: string, authToken: string }) => {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(accountSid + ':' + authToken)}`
    },
    body: new URLSearchParams({
      'To': to,
      'From': from,
      'Body': body
    }).toString()
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const chat = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4-vision-preview",
    });
    const body = await readRequestBody(request);
    const { From: originNumber, To: recipientNumber, MediaUrl0: imageUrl } = body;
    if (!imageUrl) {
      await sendRequest({
        body: `Send a picture and I'll tell you whether it's a hotdog or not!`,
        to: originNumber,
        from: recipientNumber,
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
      });
      throw new Error("No image url found in incoming message.");
    }
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an image classifer that only knows two words: "Yes" or "No". Answer the user question with only a one word answer. Do not respond with anything else.`],
      new MessagesPlaceholder("input"),
    ]);
    const chain = prompt.pipe(chat).pipe(new StringOutputParser());
    const result = await chain.invoke({
      input: [
        new HumanMessage({
          content: [
            {
              type: "text",
              text: "Is this image a hotdog?"
            },
            {
              type: "image_url",
              image_url: imageUrl
            },
          ],
        }),
      ],
    });
    console.log("RESULT", result);
    const responseText = result === "Yes" ? `✅ Hotdog` : `❌ Not Hotdog`;
    await sendRequest({
      body: responseText,
      to: originNumber,
      from: recipientNumber,
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
    });
		return new Response('OK');
	},
};
