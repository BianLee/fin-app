import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
    try {
        const { messages, currentLesson, pageContext } = await request.json();

        // Get the generative model with correct configuration
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 256,
            },
        });

        // Create a chat session with properly formatted history
        const chat = model.startChat({
            history: messages
                .filter(
                    (msg: { role: string; content: string }) =>
                        msg.role === "user"
                )
                .map((msg: { role: string; content: string }) => ({
                    role: "user",
                    parts: [{ text: msg.content }],
                })),
        });

        // Get the last user message
        const lastUserMessage = messages[messages.length - 1].content;

        // Generate a response based on the current lesson context and user's message
        const contextPrompt = `You are a helpful financial literacy assistant. The student is currently learning about ${currentLesson}. 
        ${
            pageContext.description
                ? `\n\nPage Description: ${pageContext.description}`
                : ""
        }
        ${
            pageContext.keyConcepts
                ? `\n\nKey Concepts: ${pageContext.keyConcepts.join(", ")}`
                : ""
        }
        ${
            pageContext.learningObjectives
                ? `\n\nLearning Objectives: ${pageContext.learningObjectives.join(
                      ", "
                  )}`
                : ""
        }
        ${
            pageContext.currentData
                ? `\n\nCurrent Data/State: ${JSON.stringify(
                      pageContext.currentData
                  )}`
                : ""
        }
        
        Your role is to help them understand the concepts they're learning about. Please:
        1. Keep responses very brief - aim for 1-2 sentences
        2. If more detail is needed, offer to explain further
        3. Use bullet points only for lists of 2-3 items
        4. Focus on the most relevant information
        5. Avoid any unnecessary context or repetition
        
        If they're confused, explain in simple terms. Use examples only if essential.
        If they ask about something outside the current topic, give a brief answer and relate it back to financial literacy.
        Keep responses friendly but extremely concise.`;

        const result = await chat.sendMessage(
            `${contextPrompt}\n\nStudent's message: ${lastUserMessage}`
        );
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ message: text });
    } catch (error: unknown) {
        console.error("Error in chat route:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            {
                error: "Failed to process chat message",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
