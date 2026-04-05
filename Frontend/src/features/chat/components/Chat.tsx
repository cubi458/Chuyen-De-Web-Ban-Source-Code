import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useScriptedChat } from "../hooks/useScriptedChat";
import "./chat.css";

type ChatProps = {
  title?: string;
  placeholder?: string;
  onSend?: (text: string) => void;
};

export const Chat: React.FC<ChatProps> = ({ title = "Chat Bot", placeholder = "Gõ tin nhắn...", onSend }) => {
  const { messages, sendMessage, isBotTyping, start, reset } = useScriptedChat();
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);

  function renderMessageText(raw: string) {
    const phoneRegex = /(\+?\d[\d\s.-]{7,}\d)/g;
    const parts = raw.split(phoneRegex);

    return parts.map((p, idx) => {
      if (idx % 2 === 1) {
        return (
          <span key={idx} className="chat-phone">
            {p}
          </span>
        );
      }
      return <React.Fragment key={idx}>{p}</React.Fragment>;
    });
  }

  const startedOnceRef = useRef(false);
  const launcherDragRef = useRef<any>(null);

  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const LAUNCHER_SIZE = 56;
  const PANEL_WIDTH = 340;
  const CORNER_OFFSET = 20;
  const PANEL_GAP = 70;

  const CHAT_HEIGHT = 420;

  const [launcherPos, setLauncherPos] = useState<{ left: number; top: number } | null>(null);

  const snapLauncherToCorner = () => {
    const defaultLeft = Math.max(8, window.innerWidth - CORNER_OFFSET - LAUNCHER_SIZE);
    const defaultTop = Math.max(8, window.innerHeight - CORNER_OFFSET - LAUNCHER_SIZE);
    setLauncherPos({ left: defaultLeft, top: defaultTop });
  };

  useEffect(() => {
    const saved = localStorage.getItem("chatLauncherPos");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (typeof obj.left === "number" && typeof obj.top === "number") {
          setLauncherPos(obj);
          return;
        }
      } catch (err) {}
    }
    const defaultLeft = window.innerWidth - CORNER_OFFSET - LAUNCHER_SIZE;
    const defaultTop = window.innerHeight - CORNER_OFFSET - LAUNCHER_SIZE;
    setLauncherPos({ left: defaultLeft, top: defaultTop });
  }, []);

  useEffect(() => {
    if (open) snapLauncherToCorner();
  }, [open]);

  useEffect(() => {
    if (!launcherPos) return;
    localStorage.setItem("chatLauncherPos", JSON.stringify(launcherPos));
  }, [launcherPos]);

  function startPointerDrag(e: React.PointerEvent<HTMLDivElement>) {
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = launcherPos ? launcherPos.left : window.innerWidth - CORNER_OFFSET - LAUNCHER_SIZE;
    const startTop = launcherPos ? launcherPos.top : window.innerHeight - CORNER_OFFSET - LAUNCHER_SIZE;

    const st: any = { startX, startY, startLeft, startTop, moved: false };
    launcherDragRef.current = st;

    const onMove = (ev: any) => {
      const dx = ev.clientX - st.startX;
      const dy = ev.clientY - st.startY;
      if (!st.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) st.moved = true;
      const left = Math.max(8, Math.min(window.innerWidth - LAUNCHER_SIZE - 8, st.startLeft + dx));
      const top = Math.max(8, Math.min(window.innerHeight - LAUNCHER_SIZE - 8, st.startTop + dy));
      setLauncherPos({ left, top });
      ev.preventDefault?.();
    };

    const onUp = (ev: any) => {
      document.removeEventListener("pointermove", onMove as any);
      document.removeEventListener("pointerup", onUp as any);

      launcherDragRef.current = null;

      if (!st.moved) {
        const x = ev.clientX;
        const y = ev.clientY;

        setOpen((s) => {
          const next = !s;
          if (next) {
            const defaultLeft = Math.max(8, window.innerWidth - CORNER_OFFSET - LAUNCHER_SIZE);
            const defaultTop = Math.max(8, window.innerHeight - CORNER_OFFSET - LAUNCHER_SIZE);
            setLauncherPos({ left: defaultLeft, top: defaultTop });
            if (!startedOnceRef.current) {
              startedOnceRef.current = true;
              setTimeout(() => start(), 0);
            }
          }
          return next;
        });

        setTimeout(() => createRippleAt(x, y), 40);
      }
    };

    document.addEventListener("pointermove", onMove as any, { passive: false } as AddEventListenerOptions);
    document.addEventListener("pointerup", onUp as any, { passive: false } as AddEventListenerOptions);

    try {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    } catch (err) {}
  }

  function createRippleAt(clientX: number, clientY: number) {
    const el = launcherRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  const panelStyle: React.CSSProperties = {};
  if (launcherPos) {
    const left = Math.round(launcherPos.left + LAUNCHER_SIZE - PANEL_WIDTH);
    const clampedLeft = Math.max(8, Math.min(window.innerWidth - PANEL_WIDTH - 8, left));

    const launcherBottom = launcherPos.top + LAUNCHER_SIZE;
    const desiredTop = Math.round(launcherBottom - PANEL_GAP - CHAT_HEIGHT);
    const clampedTop = Math.max(8, Math.min(window.innerHeight - CHAT_HEIGHT - 8, desiredTop));

    panelStyle.position = "fixed";
    panelStyle.left = `${clampedLeft}px`;
    panelStyle.top = `${clampedTop}px`;
    panelStyle.zIndex = 999999;
  }

  const [shownIds, setShownIds] = useState<number[]>([]);
  const shownRef = useRef<number[]>([]);

  const dragRef = useRef<{
    clone?: HTMLElement;
    orig?: HTMLElement;
    offsetX?: number;
    offsetY?: number;
    pointerId?: number;
  } | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const newIds = messages.map((m) => m.id).filter((id) => !shownRef.current.includes(id));
    if (newIds.length === 0) return;
    newIds.forEach((id, i) => {
      setTimeout(() => {
        shownRef.current = [...shownRef.current, id];
        setShownIds((s) => [...s, id]);
      }, i * 80);
    });
  }, [messages]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const onPointerMove = (ev: PointerEvent) => {
    const d = dragRef.current;
    if (!d || !d.clone) return;
    const x = ev.clientX - (d.offsetX || 0);
    const y = ev.clientY - (d.offsetY || 0);
    d.clone.style.left = `${x}px`;
    d.clone.style.top = `${y}px`;
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    try {
      if (d.clone && d.clone.parentNode) d.clone.parentNode.removeChild(d.clone);
    } catch (err) {
    }
    if (d.orig) d.orig.classList.remove("dragging-original");
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove as any);
    window.removeEventListener("pointerup", endDrag as any);
  };

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.buttons ?? 1) !== 1 && e.pointerType !== "touch") return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const clone = target.cloneNode(true) as HTMLElement;
    clone.classList.add("drag-clone");
    clone.style.position = "fixed";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = "0";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);

    target.classList.add("dragging-original");

    dragRef.current = { clone, orig: target, offsetX, offsetY, pointerId: e.pointerId };

    window.addEventListener("pointermove", onPointerMove as any);
    window.addEventListener("pointerup", endDrag as any);

    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch (err) {
    }
  }

  useEffect(() => {
    const up = () => {};
    return () => {
      const d = dragRef.current;
      if (d && d.clone && d.clone.parentNode) d.clone.parentNode.removeChild(d.clone);
      if (d && d.orig) d.orig.classList.remove("dragging-original");
      dragRef.current = null;
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("pointerup", up as any);
    };
  }, []);

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text.trim());
    onSend && onSend(text.trim());
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const portalRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-chat-portal", "true");
    document.body.appendChild(el);
    portalRootRef.current = el;
    return () => {
      if (portalRootRef.current && portalRootRef.current.parentNode) {
        portalRootRef.current.parentNode.removeChild(portalRootRef.current);
      }
      portalRootRef.current = null;
    };
  }, []);

  function handleRestart() {
    startedOnceRef.current = true;
    reset();
    setTimeout(() => start(), 0);
  }

  const chatUI = (
    <div className="chat-wrapper" aria-live="polite">
      <div
        className={`chat-launcher ${open ? "open" : ""}`}
        title="Mở chat"
        onPointerDown={startPointerDrag}
        ref={launcherRef}
        style={launcherPos ? { position: "fixed", left: launcherPos.left, top: launcherPos.top, zIndex: 1000001 } : undefined}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" role="img">
          <title>Chat hỗ trợ</title>
          <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-6z" />
          <path d="M14 2v6h6" />
          <rect x="9" y="9" width="2" height="2" rx="0.3" />
          <rect x="9" y="12" width="2" height="2" rx="0.3" />
          <rect x="9" y="15" width="2" height="2" rx="0.3" />
          <rect x="9" y="18" width="2" height="2" rx="0.3" />
        </svg>
      </div>

      <div
        ref={panelRef}
        className={`chat-panel ${open ? "open" : ""} ${launcherPos ? 'anchored' : ''}`}
        role="dialog"
        aria-label={title}
        style={open && panelStyle ? panelStyle : undefined}
      >
        <div className="chat-container" role="region" aria-label={title}>
          <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-link btn-sm"
                onClick={handleRestart}
                aria-label="Bắt đầu lại"
                title="Bắt đầu lại"
              >
                ↻
              </button>
              <button className="btn btn-link btn-sm" onClick={() => setOpen(false)} aria-label="Đóng">
                ×
              </button>
            </div>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.sender === "BOT" ? "bot" : "user"} ${shownIds.includes(m.id) ? 'show' : ''}`}>
                <div className="bubble draggable" onPointerDown={(e) => startDrag(e)}>
                  {renderMessageText(m.text)}
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="message bot">
                <div className="bubble typing">Đang nhập...</div>
              </div>
            )}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" onClick={handleSend}>
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (portalRootRef.current) {
    return ReactDOM.createPortal(chatUI, portalRootRef.current);
  }
  return chatUI;
};
