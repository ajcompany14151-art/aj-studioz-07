import { z } from "zod";
import { generateImage, isImageGenerationRequest, extractImagePrompt } from "../image-generation";

export const generateImageTool = {
  description: `Generate images from text descriptions using AI. Call this when users ask to:
  - Generate, create, or make images/pictures/photos
  - Draw, paint, sketch, or illustrate something  
  - Visualize or render concepts
  - Create art or designs

  Examples:
  - "Generate an image of a sunset over mountains"
  - "Create a picture of a futuristic city"
  - "Draw a cute cat wearing a hat"
  - "Make an illustration of quantum physics"`,
  parameters: z.object({
    prompt: z.string().describe("Detailed description of the image to generate. Be specific and descriptive."),
    style: z.enum(["natural", "vivid", "artistic", "photographic", "digital_art"]).optional().describe("Style of the image"),
    size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).optional().describe("Size of the generated image"),
  }),
  execute: async ({ prompt, style = "natural", size = "1024x1024" }: { 
    prompt: string; 
    style?: string; 
    size?: string; 
  }) => {
    try {
      console.log('🎨 Generating image with prompt:', prompt);
      
      const result = await generateImage({
        prompt,
        style,
        size,
        provider: 'openai' // Try OpenAI first, will fallback to other providers
      });

      if (result.success && result.imageUrl) {
        return {
          success: true,
          message: `🎨 **Image Generated Successfully!**\n\n**Prompt:** ${prompt}\n**Style:** ${style}\n**Provider:** ${result.provider}\n\n![Generated Image](${result.imageUrl})`,
          imageUrl: result.imageUrl,
          provider: result.provider
        };
      } else {
        return {
          success: false,
          message: `❌ **Image Generation Failed**\n\n**Error:** ${result.error}\n\n**Alternative:** I can help you refine your prompt or suggest a different approach. You can also try:\n- Being more specific in your description\n- Adding style keywords like "photorealistic", "cartoon", "abstract"\n- Describing colors, lighting, and composition\n\n**Note:** Image generation requires API keys for services like OpenAI DALL-E, Stability AI, or Hugging Face.`,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Image generation tool error:', error);
      return {
        success: false,
        message: `❌ **Image Generation Error**\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or rephrase your request.`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};