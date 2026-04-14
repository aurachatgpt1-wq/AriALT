import React from "react";
import {
  interFont,
  CHAT_COLORS,
  SIDEBAR_WIDTH,
  CHAT_MAX_WIDTH,
} from "../constants";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  opacity?: number; // for dimming past messages
}

interface ChatGPTWindowProps {
  inputText?: string;
  userText?: string;
  responseText?: string;
  showCursor?: boolean;
  selectionOpacity?: number;
  dimOpacity?: number;
  messages?: ChatMessage[];
  scrollY?: number; // px to scroll messages up (positive = scroll down)
}

export const ChatGPTWindow: React.FC<ChatGPTWindowProps> = ({
  inputText = "",
  userText = "",
  responseText = "",
  showCursor = false,
  selectionOpacity = 0,
  dimOpacity = 1,
  messages = [],
  scrollY = 0,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        fontFamily: interFont,
        opacity: dimOpacity,
        overflow: "hidden",
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: SIDEBAR_WIDTH,
          backgroundColor: CHAT_COLORS.sidebar,
          display: "flex",
          flexDirection: "column",
          padding: "8px",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              backgroundColor: CHAT_COLORS.gptGreen,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "white",
              fontWeight: 800,
            }}
          >
            G
          </div>
          <span
            style={{
              color: CHAT_COLORS.sidebarText,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            ChatGPT
          </span>
        </div>

        {/* New Chat */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.06)",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 15 }}>✏</span>
          <span
            style={{ color: CHAT_COLORS.sidebarText, fontSize: 13 }}
          >
            New chat
          </span>
        </div>

        {/* Today */}
        <div
          style={{
            color: CHAT_COLORS.sidebarSecondary,
            fontSize: 11,
            padding: "0 12px",
            marginBottom: 4,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          TODAY
        </div>
        {[
          "Motor M-401 maintenance",
          "PM Schedule Q1 2024",
          "Hydraulic system fault",
        ].map((chat, i) => (
          <div
            key={i}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              backgroundColor:
                i === 0 ? "rgba(255,255,255,0.1)" : "transparent",
              color:
                i === 0
                  ? CHAT_COLORS.sidebarText
                  : CHAT_COLORS.sidebarSecondary,
              fontSize: 13,
              marginBottom: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {chat}
          </div>
        ))}

        <div
          style={{
            color: CHAT_COLORS.sidebarSecondary,
            fontSize: 11,
            padding: "10px 12px 4px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginTop: 8,
          }}
        >
          YESTERDAY
        </div>
        {[
          "Pump #3 failure root cause",
          "Work order WO-0839 status",
          "Spare parts inventory Q4",
        ].map((chat, i) => (
          <div
            key={i}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              color: CHAT_COLORS.sidebarSecondary,
              fontSize: 13,
              marginBottom: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {chat}
          </div>
        ))}
      </div>

      {/* ── MAIN AREA ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: CHAT_COLORS.mainBg,
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 52,
            borderBottom: `1px solid ${CHAT_COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              backgroundColor: "#F9FAFB",
              borderRadius: 20,
              border: `1px solid ${CHAT_COLORS.border}`,
              fontSize: 14,
              fontWeight: 500,
              color: "#111827",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                backgroundColor: CHAT_COLORS.gptGreen,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: 800,
              }}
            >
              G
            </div>
            ChatGPT 4o ▾
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "28px 0 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: CHAT_MAX_WIDTH,
              padding: "0 28px",
              transform: `translateY(${-scrollY}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            {/* History messages */}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ opacity: msg.opacity ?? 1, marginBottom: 20 }}>
                {msg.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      maxWidth: "72%",
                      backgroundColor: CHAT_COLORS.userBubble,
                      borderRadius: 18,
                      padding: "10px 16px",
                      fontSize: 14,
                      color: CHAT_COLORS.textDark,
                      lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28,
                      backgroundColor: CHAT_COLORS.gptGreen,
                      borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: "white", fontWeight: 800, marginTop: 2,
                    }}>G</div>
                    <div style={{ fontSize: 14, color: CHAT_COLORS.textDark, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Active user message */}
            {userText.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                <div style={{
                  maxWidth: "72%",
                  backgroundColor: CHAT_COLORS.userBubble,
                  borderRadius: 18,
                  padding: "12px 18px",
                  fontSize: 15,
                  color: CHAT_COLORS.textDark,
                  lineHeight: 1.55,
                }}>
                  {userText}
                </div>
              </div>
            )}

            {/* Active AI Response */}
            {responseText.length > 0 && (
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{
                  width: 30, height: 30,
                  backgroundColor: CHAT_COLORS.gptGreen,
                  borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "white", fontWeight: 800, marginTop: 2,
                }}>G</div>
                <div style={{ flex: 1, position: "relative" }}>
                  {selectionOpacity > 0 && (
                    <div style={{
                      position: "absolute", top: -4, left: -4, right: -4, bottom: -4,
                      backgroundColor: `rgba(59,130,246,${selectionOpacity * 0.28})`,
                      borderRadius: 6, pointerEvents: "none",
                    }} />
                  )}
                  <div style={{
                    fontSize: 15, color: CHAT_COLORS.textDark,
                    lineHeight: 1.7, whiteSpace: "pre-wrap", position: "relative", zIndex: 1,
                  }}>
                    {responseText}
                    {showCursor && (
                      <span style={{
                        display: "inline-block", width: 2, height: 17,
                        backgroundColor: "#000", marginLeft: 1, verticalAlign: "text-bottom",
                      }} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div style={{ padding: "0 28px 18px", flexShrink: 0 }}>
          <div
            style={{
              maxWidth: CHAT_MAX_WIDTH,
              margin: "0 auto",
              backgroundColor: CHAT_COLORS.inputBg,
              borderRadius: 16,
              border: `1px solid ${CHAT_COLORS.inputBorder}`,
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 15,
                color: inputText ? CHAT_COLORS.textDark : "#9CA3AF",
              }}
            >
              {inputText ? (
                <>
                  {inputText}
                  <span style={{ display: "inline-block", width: 2, height: 15, backgroundColor: "#000", marginLeft: 1, verticalAlign: "middle" }} />
                </>
              ) : "Ask anything..."}
            </div>
            <div
              style={{
                width: 34,
                height: 34,
                backgroundColor: inputText ? "#0D0D0D" : "#D1D5DB",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 17,
              }}
            >
              ↑
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#9CA3AF",
              marginTop: 8,
            }}
          >
            ChatGPT can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
};
