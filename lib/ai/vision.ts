// lib/ai/vision.ts
// Vision capabilities for image analysis
import { Buffer } from 'buffer';

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
      try {
        // Convert image to base64 for Gemini
        const base64Image = await convertImageToBase64(imageUrl);
        const base64Data = base64Image.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: userQuestion || 'Analyze this image in detail. What do you see? Describe the content, objects, text, and any important details.'
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (analysis) {
            return `🔍 **Image Analysis:**\n\n${analysis}`;
          }
        } else {
          console.error('Gemini API error:', await response.text());
        }
      } catch (error) {
        console.error('Gemini Vision analysis error:', error);
      }
    }

    // Fallback: Return helpful message
    return `📸 **Image Uploaded Successfully!**

I can see you've uploaded an image. To provide the best assistance, please describe what you see in the image, and I'll help you with:

✨ **What I Can Help With:**
• **Explain concepts** shown in diagrams or screenshots
• **Solve math problems** if you describe the equations  
• **Answer questions** about the content you describe
• **Create documents** based on what you're working on
• **Provide step-by-step guides** for processes you show me
• **Help with homework** if you tell me what subject it's about

**Just describe what you see and ask your question!** 🚀`;

  } catch (error) {
    console.error('Vision analysis error:', error);
    return 'Sorry, I encountered an error while trying to analyze the image. Please describe what you see and I\'ll help you with that instead.';
  }
}

export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to base64 using browser-compatible method
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}