import conversation from "../data/conversation.json";

export type Message = {
  id: number;
  sender: "USER" | "BOT";
  text: string;
};

export function getScriptedBotMessages(): Message[] {
  return conversation.map((m: any) => ({ id: m.id, sender: m.sender, text: m.text }));
}

export function getScriptedItemsWithTiming() {
  return conversation.map((m: any) => ({ ...m }));
}

