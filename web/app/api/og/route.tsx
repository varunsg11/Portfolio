import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d0d0d",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 800, color: "#ffffff", textAlign: "center" }}>
          Varun Sadashive Gowda
        </div>
        <div style={{ fontSize: 32, color: "#e63946", marginTop: 20 }}>
          Agentic AI Developer
        </div>
        <div style={{ fontSize: 22, color: "#888888", marginTop: 14 }}>
          Incoming MCS · Texas A&M · ex-SAP Labs
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
