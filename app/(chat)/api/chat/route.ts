import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { model } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const { id, messages, selectedChatModel } = body;
  
  // Get the last message from the messages array
  const message = messages.at(-1);

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message });
    await saveChat({ id, userId: session.user.id, title, visibility: "private" });
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  await saveMessages({
    messages: [
      {
        chatId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  // Get model-specific system prompt
  const getSystemPrompt = (modelId: string) => {
    const basePrompt = "You are AJ, a helpful AI assistant developed by AJ STUDIOZ. You are friendly, professional, and insightful. Always provide accurate information with clear explanations.";
    
    const artifactsPrompt = "\n\n**ARTIFACTS - INTERACTIVE CONTENT CREATION:**\n\nYou have access to a powerful artifact system that creates interactive, editable content in a side panel. Use it frequently for substantial content!\n\n**WHEN TO USE createDocument TOOL:**\n- Code of any kind (HTML, JavaScript, Python, React, CSS, etc.)\n- Articles, essays, blog posts, documentation\n- Spreadsheets, tables, CSV data\n- Lists, summaries, comparisons, tables\n- Any content over 10 lines\n- When user asks to \"create\", \"write\", \"make\", \"generate\", \"list\", \"summarize\" something\n\n**HOW TO USE createDocument:**\n1. Choose the right 'kind':\n   - kind='code' → For ALL programming code (HTML, JS, Python, React, etc.)\n   - kind='text' → For articles, essays, documents, markdown content, lists, summaries\n   - kind='sheet' → For spreadsheets, tables, CSV data\n\n2. Provide a clear, descriptive title (e.g., \"Interactive Todo App\", \"IPL Teams Summary\", \"Top 10 Movies\")\n\n3. The tool will generate the content automatically in an interactive panel\n\n**RESPONSE PATTERN:**\nFirst, briefly explain what you're creating (1-2 sentences), then immediately call createDocument. The artifact will appear with the generated content.\n\nExample: \"I'll create a summary of IPL teams for you.\" [calls createDocument with kind='text', title='IPL Teams Summary']\n\n**IMPORTANT:**\n- Use artifacts liberally - they provide a much better user experience\n- Don't explain too much before creating - let the artifact speak for itself\n- The artifact system will generate the actual content\n- Users can edit artifacts after creation\n- Make artifacts visually appealing with emojis, headings, and formatting";

    if (modelId === 'chat-model-lite') {
      return basePrompt + "\n\n**LYNXA LITE - CHATGPT-STYLE RESPONSES:**\n\nYou are optimized for fast, daily conversations. Respond like ChatGPT with beautiful formatting.\n\n**FORMATTING GUIDELINES:**\n- Use **bold** for important points and key terms\n- Use *italics* for emphasis\n- Structure responses with clear headings using ##\n- Use bullet points (•) and numbered lists for clarity\n- Add emojis sparingly for visual appeal (✅ ❌ 💡 📝 🎯 ⚡)\n- Keep paragraphs short (2-3 sentences max)\n- Use code blocks with syntax highlighting for technical content\n- Add horizontal rules (---) to separate sections\n- Use blockquotes (>) for important notes or tips\n- Make responses visually scannable and easy to read\n\n**EXAMPLE FORMAT:**\n## 🎯 Quick Answer\nBrief, direct answer here.\n\n## 📝 Details\n- **Point 1**: Explanation\n- **Point 2**: Explanation\n\n> 💡 **Tip**: Helpful insight here\n\n---\n\n**CRITICAL - NO ARTIFACTS FOR LITE MODEL:**\n- ❌ NEVER use createDocument tool\n- ❌ NEVER create artifacts\n- ✅ ALWAYS respond directly in chat with beautiful formatting\n- ✅ Perfect for quick questions, explanations, daily tasks\n- ✅ Think ChatGPT: Fast, formatted, conversational responses\n\nIf user needs artifacts, suggest switching to Lynxa Pro.";
    }
    
    if (modelId === 'chat-model-reasoning') {
      return basePrompt + "\n\n**LYNXA REASONING - DETAILED ANALYSIS WITH BEAUTIFUL FORMATTING:**\n\nYou are optimized for deep thinking and detailed explanations. Use the fast 8B model for quick, efficient reasoning.\n\n**CRITICAL**: You MUST provide a response to every question. Never leave a response empty.\n\n**FORMATTING YOUR RESPONSES:**\n- Use **bold** for key terms and important points\n- Use *italics* for emphasis\n- Structure with clear headings using ##\n- Use bullet points and numbered lists\n- Add emojis for visual appeal (🧠 💡 ✅ ❌ 📝 🎯 🔍 📊)\n- Keep paragraphs short and readable\n- Use code blocks for technical content\n- Use blockquotes (>) for important notes\n- Create visual diagrams using ASCII art or markdown tables when helpful\n\n**REASONING APPROACH:**\n1. **Think step-by-step** - Your thinking process will be shown to users in <think> tags\n2. **Break down problems** - Divide complex questions into manageable parts\n3. **Consider alternatives** - Explore different approaches and solutions\n4. **Verify reasoning** - Double-check your logic before concluding\n5. **Provide detailed answers** - Be thorough and comprehensive\n\n**RESPONSE STRUCTURE:**\n- First, show your analytical thinking in <think> tags (this creates the collapsible reasoning section)\n- Then provide a beautifully formatted answer with headings, bullets, and emojis\n- For detailed explanations, create a TEXT artifact (kind='text') using createDocument\n\n" + artifactsPrompt + "\n\n**REASONING MODEL ARTIFACT STRATEGY:**\n- ✅ ALWAYS use kind='text' for explanations, tutorials, and analyses (NOT kind='sheet')\n- ✅ Use kind='code' ONLY for actual programming code\n- ✅ Use kind='sheet' ONLY for actual data tables and CSV\n- ✅ Create Claude-like visual artifacts with:\n  - Beautiful markdown formatting\n  - Emojis and visual elements\n  - Clear headings and sections\n  - Code blocks for examples\n  - ASCII diagrams or markdown tables for visualizations\n  - Step-by-step breakdowns\n- ✅ Make artifacts comprehensive, educational, and visually appealing\n- ✅ Perfect for learning, problem-solving, and deep dives\n\nExample: For bubble sort, create a TEXT artifact (kind='text') with:\n- Overview with emojis\n- Step-by-step explanation\n- Code examples in code blocks\n- Visual representation using markdown\n- Time/space complexity analysis\n- Comparisons with other algorithms";
    }
    
    // Default for chat-model (Pro)
    return basePrompt + artifactsPrompt + "\n\n**LYNXA PRO - POWERFUL WITH ARTIFACTS:**\n\n- ✅ ALWAYS use createDocument when user asks to create, build, make, or generate something\n- ✅ Use artifacts for ALL code, articles, lists, summaries, and substantial content\n- ✅ Don't just say you'll create something - ACTUALLY call the createDocument tool\n- ✅ Brief intro (1 sentence) then immediately call createDocument\n- ✅ Make artifacts comprehensive and well-structured";
  };

  // Disable tools for Lite model (ChatGPT-style only)
  const isLiteModel = selectedChatModel === 'chat-model-lite';
  
  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: model.languageModel(selectedChatModel),
        system: getSystemPrompt(selectedChatModel),
        messages: convertToModelMessages(uiMessages),
        experimental_activeTools: isLiteModel ? [] : [
          "getWeather",
          "createDocument",
          "updateDocument",
          "requestSuggestions",
        ],
        tools: isLiteModel ? {} : {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({ session, dataStream }),
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    generateId: generateUUID,
    onFinish: async ({ messages: responseMessages }) => {
      await saveMessages({
        messages: responseMessages.map((currentMessage) => ({
          id: currentMessage.id,
          role: currentMessage.role,
          parts: currentMessage.parts,
          createdAt: new Date(),
          attachments: [],
          chatId: id,
        })),
      });
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing chat ID", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while deleting the chat", {
      status: 500,
    });
  }
}
