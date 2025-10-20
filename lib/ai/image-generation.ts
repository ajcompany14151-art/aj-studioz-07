// lib/ai/image-generation.ts
// Image generation capabilities using multiple providers

export type ImageProvider = 'openai' | 'stability' | 'replicate' | 'huggingface';

export interface ImageGenerationOptions {
  prompt: string;
  provider?: ImageProvider;
  size?: string;
  style?: string;
  quality?: string;
  n?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  provider: string;
}

export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { prompt, provider = 'openai', size = '1024x1024', style = 'natural', quality = 'standard', n = 1 } = options;

  try {
    // OpenAI DALL-E 3 (Best Quality)
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(prompt, size, style, quality, n);
    }

    // Stability AI (Stable Diffusion)
    if (provider === 'stability' && process.env.STABILITY_API_KEY) {
      return await generateWithStability(prompt, size);
    }

    // Replicate (Multiple Models)
    if (provider === 'replicate' && process.env.REPLICATE_API_TOKEN) {
      return await generateWithReplicate(prompt, size);
    }

    // Hugging Face (Free Tier Available)
    if (provider === 'huggingface' && process.env.HUGGINGFACE_API_KEY) {
      return await generateWithHuggingFace(prompt);
    }

    // Try fallback providers
    const providers: ImageProvider[] = ['openai', 'stability', 'replicate', 'huggingface'];
    for (const fallbackProvider of providers) {
      if (fallbackProvider !== provider) {
        const result = await generateImage({ ...options, provider: fallbackProvider });
        if (result.success) {
          return result;
        }
      }
    }

    return {
      success: false,
      error: 'No image generation service available. Please add API keys for OpenAI, Stability AI, Replicate, or Hugging Face.',
      provider: 'none'
    };

  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider
    };
  }
}

async function generateWithOpenAI(prompt: string, size: string, style: string, quality: string, n: number): Promise<ImageGenerationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: size as any,
        style: style,
        quality: quality,
        n: n,
        response_format: 'url'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        imageUrl: data.data[0]?.url,
        provider: 'OpenAI DALL-E 3'
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `OpenAI API error: ${error}`,
        provider: 'openai'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `OpenAI generation failed: ${error}`,
      provider: 'openai'
    };
  }
}

async function generateWithStability(prompt: string, size: string): Promise<ImageGenerationResult> {
  try {
    const [width, height] = size.split('x').map(Number);
    
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        width: width || 1024,
        height: height || 1024,
        output_format: 'jpeg'
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      // Convert blob to data URL for immediate use
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            success: true,
            imageUrl: reader.result as string,
            provider: 'Stability AI'
          });
        };
        reader.readAsDataURL(blob);
      });
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `Stability AI error: ${error}`,
        provider: 'stability'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Stability AI generation failed: ${error}`,
      provider: 'stability'
    };
  }
}

async function generateWithReplicate(prompt: string, size: string): Promise<ImageGenerationResult> {
  try {
    // Using Flux-1.1-pro model on Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "818ed4c4fa0b2c77a0fd9a5f8318394af3b17e736b033cc43501571bc7ec8c02", // Flux-1.1-pro
        input: {
          prompt: prompt,
          width: parseInt(size.split('x')[0]) || 1024,
          height: parseInt(size.split('x')[1]) || 1024,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Poll for completion
      let result = data;
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          }
        });
        result = await statusResponse.json();
      }

      if (result.status === 'succeeded') {
        return {
          success: true,
          imageUrl: result.output[0],
          provider: 'Replicate Flux'
        };
      } else {
        return {
          success: false,
          error: `Replicate generation failed: ${result.error}`,
          provider: 'replicate'
        };
      }
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `Replicate API error: ${error}`,
        provider: 'replicate'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Replicate generation failed: ${error}`,
      provider: 'replicate'
    };
  }
}

async function generateWithHuggingFace(prompt: string): Promise<ImageGenerationResult> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024
        }
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      // Convert blob to data URL
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            success: true,
            imageUrl: reader.result as string,
            provider: 'Hugging Face FLUX'
          });
        };
        reader.readAsDataURL(blob);
      });
    } else {
      const error = await response.text();
      return {
        success: false,
        error: `Hugging Face error: ${error}`,
        provider: 'huggingface'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Hugging Face generation failed: ${error}`,
      provider: 'huggingface'
    };
  }
}

// Helper function to detect image generation requests
export function isImageGenerationRequest(message: string): boolean {
  const imageKeywords = [
    'generate image', 'create image', 'make image', 'draw', 'generate picture',
    'create picture', 'make picture', 'generate photo', 'create photo',
    'make photo', 'visualize', 'illustrate', 'render', 'design',
    'generate art', 'create art', 'make art', 'paint', 'sketch'
  ];
  
  const lowerMessage = message.toLowerCase();
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Extract prompt from user message
export function extractImagePrompt(message: string): string {
  // Remove common prefixes
  const prefixes = [
    'generate image of', 'create image of', 'make image of',
    'generate picture of', 'create picture of', 'make picture of',
    'generate photo of', 'create photo of', 'make photo of',
    'generate', 'create', 'make', 'draw', 'paint', 'sketch',
    'visualize', 'illustrate', 'render', 'design'
  ];
  
  let prompt = message.toLowerCase();
  
  for (const prefix of prefixes) {
    if (prompt.startsWith(prefix)) {
      prompt = prompt.substring(prefix.length).trim();
      break;
    }
  }
  
  // Remove common words
  prompt = prompt.replace(/^(an?|the|some|)\s*/i, '');
  
  return prompt || message; // Fallback to original message
}