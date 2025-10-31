import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { toast } from "sonner";

const STORAGE_KEY = 'diet_chat_messages';

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = (msgs: Message[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const saveMeal = (mealData: any) => {
    try {
      const stored = localStorage.getItem('diet_meals');
      const meals = stored ? JSON.parse(stored) : [];
      
      const newMeal = {
        id: crypto.randomUUID(),
        ...mealData,
        meal_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      
      meals.push(newMeal);
      localStorage.setItem('diet_meals', JSON.stringify(meals));
      
      // Trigger event for other components to update
      window.dispatchEvent(new Event('meals-updated'));
      
      toast.success('Meal logged successfully! 🎉');
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal data');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    saveMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diet-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulatedContent = "";

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedContent += content;
              setStreamingContent(accumulatedContent);
            }
          } catch {
            continue;
          }
        }
      }

      if (accumulatedContent) {
        const finalMessages = [...newMessages, { role: "assistant" as const, content: accumulatedContent }];
        setMessages(finalMessages);
        saveMessages(finalMessages);
        
        // Extract and save meal data from JSON code blocks
        const jsonMatch = accumulatedContent.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const mealData = JSON.parse(jsonMatch[1]);
            saveMeal(mealData);
          } catch (error) {
            console.error('Error parsing meal data:', error);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <div className="text-6xl">🥗</div>
            <h2 className="text-2xl font-bold text-foreground">Welcome to Your Diet Tracker</h2>
            <p className="text-muted-foreground max-w-md">
              I'm your AI nutrition assistant. Tell me what you ate, and I'll help you track your meals
              and nutrition!
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}

        {streamingContent && <ChatMessage role="assistant" content={streamingContent} />}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you ate... (e.g., 'I had scrambled eggs and toast for breakfast')"
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isStreaming}
          />
          <Button type="submit" size="icon" className="h-[60px]" disabled={isStreaming || !input.trim()}>
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
};
