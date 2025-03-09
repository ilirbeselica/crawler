import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export async function openrouterWriter({
  apiKey,
  model,
  prompt,
  url,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  url?: string;
}) {
    const openrouter = createOpenRouter({ apiKey });

    const { text } = await generateText({
        model: openrouter(model),
        prompt: prompt,
    });

    console.log(text);
    return text;
}
