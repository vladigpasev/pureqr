import qrcode from "qrcode-generator";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type ModuleShape = "square" | "rounded" | "dots";

export interface QRRenderOptions {
  data: string;
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
  shape: ModuleShape;
  margin: number;
  size: number;
  logoDataUrl?: string;
  logoSize: number;
}

export interface QRRenderResult {
  svg: string;
  moduleCount: number;
  payloadLength: number;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function renderQrSvg(options: QRRenderOptions): QRRenderResult {
  const payload = options.data.trim() || "https://pureqr-six.vercel.app/";
  const foreground = cleanColor(options.foreground, "#111827");
  const background = cleanColor(options.background, "#ffffff");
  const margin = clamp(Math.round(options.margin), 2, 12);
  const outputSize = clamp(Math.round(options.size), 192, 1600);

  const qr = qrcode(0, options.errorCorrection);
  qr.addData(payload, "Byte");
  qr.make();

  const moduleCount = qr.getModuleCount();
  const viewSize = moduleCount + margin * 2;
  const logoModules = options.logoDataUrl
    ? Math.max(0, Math.min(moduleCount * 0.24, moduleCount * options.logoSize))
    : 0;

  const pieces: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="0 0 ${viewSize} ${viewSize}" role="img" aria-label="Generated QR code">`,
    `<rect width="${viewSize}" height="${viewSize}" fill="${background}"/>`
  ];

  pieces.push(`<g fill="${foreground}">`);
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.isDark(row, col) || isFinder(row, col, moduleCount)) {
        continue;
      }
      pieces.push(renderModule(col + margin, row + margin, options.shape));
    }
  }
  pieces.push("</g>");

  pieces.push(renderFinder(margin, margin, foreground, background));
  pieces.push(renderFinder(moduleCount - 7 + margin, margin, foreground, background));
  pieces.push(renderFinder(margin, moduleCount - 7 + margin, foreground, background));

  if (options.logoDataUrl && logoModules > 0) {
    const logoX = margin + (moduleCount - logoModules) / 2;
    const logoY = margin + (moduleCount - logoModules) / 2;
    const pad = Math.max(0.75, logoModules * 0.09);
    const plateX = logoX - pad;
    const plateY = logoY - pad;
    const plateSize = logoModules + pad * 2;

    pieces.push("<defs>");
    pieces.push(
      `<clipPath id="pureqr-logo-clip"><rect x="${fmt(logoX)}" y="${fmt(logoY)}" width="${fmt(
        logoModules
      )}" height="${fmt(logoModules)}" rx="${fmt(Math.max(0.8, logoModules * 0.12))}"/></clipPath>`
    );
    pieces.push("</defs>");
    pieces.push(
      `<rect x="${fmt(plateX)}" y="${fmt(plateY)}" width="${fmt(plateSize)}" height="${fmt(
        plateSize
      )}" rx="${fmt(Math.max(1, logoModules * 0.16))}" fill="${background}"/>`
    );
    pieces.push(
      `<image href="${escapeAttribute(options.logoDataUrl)}" x="${fmt(logoX)}" y="${fmt(
        logoY
      )}" width="${fmt(logoModules)}" height="${fmt(
        logoModules
      )}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pureqr-logo-clip)"/>`
    );
  }

  pieces.push("</svg>");

  return {
    svg: pieces.join(""),
    moduleCount,
    payloadLength: payload.length
  };
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildWifiPayload({
  ssid,
  password,
  encryption,
  hidden
}: {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}): string {
  return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden ? "true" : "false"};;`;
}

export function buildVCardPayload({
  name,
  phone,
  email,
  organization,
  website
}: {
  name: string;
  phone: string;
  email: string;
  organization: string;
  website: string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(name)}`,
    organization ? `ORG:${escapeVCard(organization)}` : "",
    phone ? `TEL:${escapeVCard(phone)}` : "",
    email ? `EMAIL:${escapeVCard(email)}` : "",
    website ? `URL:${escapeVCard(website)}` : "",
    "END:VCARD"
  ];

  return lines.filter(Boolean).join("\n");
}

function renderModule(x: number, y: number, shape: ModuleShape): string {
  if (shape === "dots") {
    return `<circle cx="${fmt(x + 0.5)}" cy="${fmt(y + 0.5)}" r="0.42"/>`;
  }

  if (shape === "rounded") {
    return `<rect x="${x}" y="${y}" width="1" height="1" rx="0.26"/>`;
  }

  return `<rect x="${x}" y="${y}" width="1" height="1"/>`;
}

function renderFinder(x: number, y: number, foreground: string, background: string): string {
  return [
    `<g>`,
    `<rect x="${x}" y="${y}" width="7" height="7" rx="1.3" fill="${foreground}"/>`,
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="0.75" fill="${background}"/>`,
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.45" fill="${foreground}"/>`,
    `</g>`
  ].join("");
}

function isFinder(row: number, col: number, size: number): boolean {
  const inTop = row < 7;
  const inBottom = row >= size - 7;
  const inLeft = col < 7;
  const inRight = col >= size - 7;
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}

function cleanColor(value: string, fallback: string): string {
  return HEX_COLOR.test(value) ? value : fallback;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fmt(value: number): string {
  return Number(value.toFixed(3)).toString();
}
