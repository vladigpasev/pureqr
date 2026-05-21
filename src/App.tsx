import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Trash2,
  Wifi
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import {
  buildVCardPayload,
  buildWifiPayload,
  ErrorCorrectionLevel,
  ModuleShape,
  renderQrSvg,
  svgToDataUri
} from "./qr";

type Preset = "text" | "url" | "wifi" | "contact";
type Encryption = "WPA" | "WEP" | "nopass";

const sourceUrl = "https://github.com/vladigpasev/pureqr";

const swatches = [
  { color: "#111827", className: "swatch-ink" },
  { color: "#0f7f5c", className: "swatch-green" },
  { color: "#1d4ed8", className: "swatch-blue" },
  { color: "#7c2d12", className: "swatch-rust" },
  { color: "#6d28d9", className: "swatch-violet" },
  { color: "#be123c", className: "swatch-rose" }
];

const tabs: Array<{ id: Preset; label: string }> = [
  { id: "text", label: "Text" },
  { id: "url", label: "URL" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "contact", label: "Contact" }
];

function App() {
  const [preset, setPreset] = useState<Preset>("url");
  const [text, setText] = useState("Create QR codes without uploading anything.");
  const [url, setUrl] = useState("https://pureqr-six.vercel.app/");
  const [ssid, setSsid] = useState("Guest Wi-Fi");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<Encryption>("WPA");
  const [hidden, setHidden] = useState(false);
  const [contactName, setContactName] = useState("Ada Lovelace");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("https://pureqr-six.vercel.app/");
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const [shape, setShape] = useState<ModuleShape>("rounded");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>("H");
  const [size, setSize] = useState(1024);
  const [margin, setMargin] = useState(4);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();
  const [logoName, setLogoName] = useState("");
  const [logoSize, setLogoSize] = useState(0.18);
  const [notice, setNotice] = useState("");

  const payload = useMemo(() => {
    if (preset === "wifi") {
      return buildWifiPayload({ ssid, password, encryption, hidden });
    }

    if (preset === "contact") {
      return buildVCardPayload({
        name: contactName,
        phone,
        email,
        organization,
        website
      });
    }

    if (preset === "url") {
      return normalizeUrl(url);
    }

    return text;
  }, [contactName, email, encryption, hidden, organization, password, phone, preset, ssid, text, url, website]);

  const qr = useMemo(() => {
    try {
      return {
        result: renderQrSvg({
          data: payload,
          foreground,
          background,
          errorCorrection,
          shape,
          margin,
          size,
          logoDataUrl,
          logoSize
        }),
        error: ""
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "Unable to generate this QR code."
      };
    }
  }, [background, errorCorrection, foreground, logoDataUrl, logoSize, margin, payload, shape, size]);

  const svgMarkup = qr.result?.svg ?? "";
  const previewSrc = svgMarkup ? svgToDataUri(svgMarkup) : "";
  const canExport = Boolean(svgMarkup);

  async function downloadSvg() {
    if (!svgMarkup) return;
    downloadBlob(new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }), "pureqr-code.svg");
    flash("SVG downloaded");
  }

  async function downloadPng() {
    if (!svgMarkup) return;
    const pngBlob = await svgToPngBlob(svgMarkup, size);
    if (pngBlob) {
      downloadBlob(pngBlob, "pureqr-code.png");
      flash("PNG downloaded");
    }
  }

  async function copySvg() {
    if (!svgMarkup) return;
    await navigator.clipboard.writeText(svgMarkup);
    flash("SVG copied");
  }

  function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      flash("Use PNG, JPG, or WebP for embedded images");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      flash("Image must be under 4 MB");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setLogoDataUrl(reader.result);
        setLogoName(file.name);
        setErrorCorrection("H");
        flash("Image added locally");
      }
    });
    reader.readAsDataURL(file);
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="PureQR home">
          <span className="brand-mark">
            <QrCode size={19} strokeWidth={2.4} />
          </span>
          <span>PureQR</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#privacy">Privacy</a>
          <a href={sourceUrl}>Source</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <main>
        <section className="generator" aria-labelledby="generator-title">
          <div className="intro">
            <h1 id="generator-title">Free QR code generator</h1>
            <p>Encode text, links, Wi-Fi, or contact details directly in your browser.</p>
          </div>

          <div className="tool-grid">
            <section className="workspace-panel controls-panel" aria-label="QR code controls">
              <div className="tabs" role="tablist" aria-label="QR payload type">
                {tabs.map((tab) => (
                  <button
                    className={preset === tab.id ? "active" : ""}
                    key={tab.id}
                    onClick={() => setPreset(tab.id)}
                    role="tab"
                    aria-selected={preset === tab.id}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="payload-area">{renderPayloadFields()}</div>

              <div className="control-section">
                <div className="section-heading">
                  <FileCode2 size={17} />
                  <h2>Style</h2>
                </div>

                <div className="field-row">
                  <label>
                    Foreground
                    <input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} />
                  </label>
                  <label>
                    Background
                    <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
                  </label>
                </div>

                <div className="swatches" aria-label="Foreground color presets">
                  {swatches.map((swatch) => (
                    <button
                      className={`swatch-button ${swatch.className}${foreground === swatch.color ? " selected" : ""}`}
                      key={swatch.color}
                      onClick={() => setForeground(swatch.color)}
                      title={swatch.color}
                      type="button"
                    />
                  ))}
                </div>

                <div className="segmented" aria-label="QR module shape">
                  {(["square", "rounded", "dots"] as ModuleShape[]).map((item) => (
                    <button
                      className={shape === item ? "active" : ""}
                      key={item}
                      onClick={() => setShape(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="segmented" aria-label="Error correction level">
                  {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((level) => (
                    <button
                      className={errorCorrection === level ? "active" : ""}
                      key={level}
                      onClick={() => setErrorCorrection(level)}
                      type="button"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-section">
                <div className="section-heading">
                  <ImageIcon size={17} />
                  <h2>Image</h2>
                </div>
                <div className="upload-row">
                  <label className="file-button">
                    <ImageIcon size={16} />
                    Choose image
                    <input accept="image/png,image/jpeg,image/webp" onChange={onLogoChange} type="file" />
                  </label>
                  {logoDataUrl ? (
                    <button className="icon-button danger" onClick={() => {
                      setLogoDataUrl(undefined);
                      setLogoName("");
                    }} title="Remove embedded image" type="button">
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <p className="small-note">{logoName || "PNG, JPG, or WebP stays in this browser session."}</p>
                <label className="range-field">
                  Image size
                  <input
                    disabled={!logoDataUrl}
                    max="0.24"
                    min="0.12"
                    onChange={(event) => setLogoSize(Number(event.target.value))}
                    step="0.01"
                    type="range"
                    value={logoSize}
                  />
                </label>
              </div>

              <div className="control-section compact">
                <label className="range-field">
                  Export size
                  <input
                    max="1600"
                    min="192"
                    onChange={(event) => setSize(Number(event.target.value))}
                    step="32"
                    type="range"
                    value={size}
                  />
                  <span>{size}px</span>
                </label>
                <label className="range-field">
                  Quiet zone
                  <input
                    max="12"
                    min="2"
                    onChange={(event) => setMargin(Number(event.target.value))}
                    step="1"
                    type="range"
                    value={margin}
                  />
                  <span>{margin} modules</span>
                </label>
              </div>
            </section>

            <section className="workspace-panel preview-panel" aria-label="QR code preview">
              <div className="preview-topline">
                <div>
                  <p className="panel-label">Live preview</p>
                  <p className="status-line">
                    <LockKeyhole size={15} />
                    Browser only, nothing stored
                  </p>
                </div>
                {notice ? (
                  <span className="toast">
                    <Check size={14} />
                    {notice}
                  </span>
                ) : null}
              </div>

              <div className="qr-frame">
                {previewSrc ? <img alt="Generated QR code preview" src={previewSrc} /> : null}
                {qr.error ? <p className="error-message">{qr.error}</p> : null}
              </div>

              <div className="qr-meta">
                <span>{qr.result?.moduleCount ?? 0} x {qr.result?.moduleCount ?? 0}</span>
                <span>{qr.result?.payloadLength ?? payload.length} characters</span>
                <span>ECC {errorCorrection}</span>
              </div>

              <div className="export-actions">
                <button className="primary-action" disabled={!canExport} onClick={downloadSvg} type="button">
                  <Download size={17} />
                  Download SVG
                </button>
                <button disabled={!canExport} onClick={downloadPng} type="button">
                  <Download size={17} />
                  Download PNG
                </button>
                <button disabled={!canExport} onClick={copySvg} type="button">
                  <Copy size={17} />
                  Copy SVG
                </button>
              </div>

              <div className="assurance-strip">
                <span>
                  <ShieldCheck size={16} />
                  No URL shortener
                </span>
                <span>
                  <Wifi size={16} />
                  Static deployment
                </span>
                <a href={sourceUrl}>
                  <Code2 size={16} />
                  Open source
                </a>
              </div>
            </section>
          </div>
        </section>

        <section className="seo-grid" id="privacy" aria-label="Privacy and SEO content">
          <article>
            <h2>Client-side QR encoding</h2>
            <p>
              PureQR turns your text into a QR code inside the browser. The site has no QR generation API, upload
              endpoint, user accounts, or database.
            </p>
          </article>
          <article>
            <h2>No short links, no tracking</h2>
            <p>
              The generated QR code contains the exact value you provide. It does not create redirect links, tracking
              links, or hosted landing pages.
            </p>
          </article>
          <article>
            <h2>High-quality exports</h2>
            <p>
              Download a scalable SVG for print workflows or a sharp PNG for everyday use. Colors, module shape, quiet
              zone, and embedded raster images are customizable.
            </p>
          </article>
        </section>

        <section className="faq" id="faq" aria-label="Frequently asked questions">
          <h2>FAQ</h2>
          <details>
            <summary>Does PureQR store QR code content?</summary>
            <p>No. QR code content is processed in local browser memory and is not sent to this app's server.</p>
          </details>
          <details>
            <summary>Does PureQR shorten URLs?</summary>
            <p>No. URL QR codes encode the destination directly, without a redirect service.</p>
          </details>
          <details>
            <summary>Can a QR code be illegal?</summary>
            <p>
              A QR code is an encoding format. People remain responsible for the content they encode, publish, and
              distribute.
            </p>
          </details>
        </section>
      </main>

      <footer>
        <span>PureQR is free and open source.</span>
        <a href={sourceUrl}>GitHub</a>
        <a href="#privacy">Privacy model</a>
      </footer>
    </div>
  );

  function renderPayloadFields() {
    if (preset === "wifi") {
      return (
        <div className="field-stack">
          <label>
            Network name
            <input autoComplete="off" value={ssid} onChange={(event) => setSsid(event.target.value)} />
          </label>
          <label>
            Password
            <input
              autoComplete="new-password"
              disabled={encryption === "nopass"}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="field-row">
            <label>
              Security
              <select value={encryption} onChange={(event) => setEncryption(event.target.value as Encryption)}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </label>
            <label className="checkbox-field">
              <input checked={hidden} onChange={(event) => setHidden(event.target.checked)} type="checkbox" />
              Hidden network
            </label>
          </div>
        </div>
      );
    }

    if (preset === "contact") {
      return (
        <div className="field-stack">
          <label>
            Name
            <input value={contactName} onChange={(event) => setContactName(event.target.value)} />
          </label>
          <div className="field-row">
            <label>
              Phone
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label>
              Organization
              <input value={organization} onChange={(event) => setOrganization(event.target.value)} />
            </label>
            <label>
              Website
              <input value={website} onChange={(event) => setWebsite(event.target.value)} />
            </label>
          </div>
        </div>
      );
    }

    if (preset === "url") {
      return (
        <label>
          URL to encode
          <textarea
            rows={5}
            spellCheck={false}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
      );
    }

    return (
      <label>
        Content to encode
        <textarea rows={6} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
    );
  }
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function svgToPngBlob(svg: string, size: number): Promise<Blob | null> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, size, size);

    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default App;
