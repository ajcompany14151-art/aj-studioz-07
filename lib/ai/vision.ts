// lib/ai/vision.ts
// Vision capabilities for image analysis

export async function analyzeImage(imageUrl: string, userQuestion?: string): Promise<string> {
  try {
    // Option 1: Use OpenAI GPT-4 Vision (requires OPENAI_API_KEY)
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userQuestion || 'Describe this image in detail. What do you see?'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || 'Could not analyze image';
      }
    }

    // Option 2: Use Google Gemini Vision (requires GOOGLE_API_KEY)
    if (process.env.GOOGLE_API_KEY) {
      // Implement Gemini Vision API call here
      // This would require converting image to base64 first
    }

    // Fallback: Return helpful message
    return `I can see you've uploaded an image, but I need a vision-capable model to analyze it. 
    
Please describe what you see in the image, and I'll be happy to help you with:
    • Explaining concepts shown in the image
    • Answering questions about the content
    • Creating related documents or guides
    • Solving problems related to what you describe`;

  } catch (error) {
    console.error('Vision analysis error:', error);
    return 'Sorry, I encountered an error while trying to analyze the image. Please describe what you see and I\'ll help you with that instead.';
  }
}

export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}