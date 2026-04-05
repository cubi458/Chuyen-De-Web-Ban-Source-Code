import { useEffect, useRef, useState } from "react";
import { getScriptedItemsWithTiming, Message } from "../utils/chatApi";

type ScriptItem = {
  id: number;
  sender: "BOT" | "USER";
  text: string;
  delay?: number;
  typing?: number;
};

const STORAGE_KEY = "app_chat_state_v1";

export function useScriptedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scriptRef = useRef<ScriptItem[]>([]);
  const pointerRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);

  const schedulingRef = useRef(false);

  useEffect(() => {
    scriptRef.current = getScriptedItemsWithTiming();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { messages?: Message[]; pointer?: number; started?: boolean };
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
        if (typeof parsed.pointer === "number") pointerRef.current = parsed.pointer;
        if (parsed.started) startedRef.current = true;
        if (startedRef.current) {
          const t = window.setTimeout(() => scheduleNextBot(), 300);
          timersRef.current.push(t);
        }
      }
    } catch (e) {
    }

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      schedulingRef.current = false;
    };
  }, []);

  function persistState(nextMessages?: Message[]) {
    try {
      const payload = {
        messages: nextMessages ?? messages,
        pointer: pointerRef.current,
        started: startedRef.current,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function pushMessage(msg: Message) {
    setMessages((s) => {
      const next = [...s, msg];
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ messages: next, pointer: pointerRef.current, started: startedRef.current })
        );
      } catch (e) {}
      return next;
    });
  }

  function scheduleNextBot() {
    if (schedulingRef.current) return;
    schedulingRef.current = true;

    const items = scriptRef.current;
    const idx = pointerRef.current;
    if (idx >= items.length) {
      schedulingRef.current = false;
      return;
    }

    const item = items[idx];

    if (item.sender !== "BOT") {
      pointerRef.current += 1;
      persistState();
      schedulingRef.current = false;
      scheduleNextBot();
      return;
    }

    const delay = item.delay ?? 1000;
    const typing = item.typing ?? 600;

    const t1 = window.setTimeout(() => {
      setIsBotTyping(true);
      const t2 = window.setTimeout(() => {
        setIsBotTyping(false);
        pushMessage({ id: item.id, sender: "BOT", text: item.text });
        pointerRef.current += 1;
        persistState();
        schedulingRef.current = false;
        scheduleNextBot();
      }, typing);
      timersRef.current.push(t2);
    }, delay);

    timersRef.current.push(t1);
  }

  function start() {
    if (startedRef.current) {
      scheduleNextBot();
      return;
    }
    startedRef.current = true;
    if (pointerRef.current <= 0) pointerRef.current = 0;
    persistState();
    scheduleNextBot();
  }

  function sendMessage(text: string) {
    const id = Date.now();
    const msg: Message = { id, sender: "USER", text };
    pushMessage(msg);

    if (!startedRef.current) {
      start();
    } else {
      scheduleNextBot();
    }
    return msg;
  }

  function clearAllTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function reset() {
    // reset để test
    clearAllTimers();
    schedulingRef.current = false;
    startedRef.current = false;
    pointerRef.current = 0;
    setIsBotTyping(false);
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  return { messages, sendMessage, isBotTyping, start, reset } as const;
}
