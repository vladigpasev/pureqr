# PureQR

PureQR is a free, client-side QR code encoder. It creates QR codes for text,
links, Wi-Fi credentials, and contact cards without shortening URLs, tracking
users, uploading content, or saving generated data on a server.

## Features

- Browser-only QR encoding
- SVG and PNG export
- Text, URL, Wi-Fi, and vCard contact presets
- Custom foreground/background colors
- Square, rounded, and dot module styles
- Optional raster logo/image embedding
- No analytics, accounts, cookies, or backend API

## Privacy model

All QR code generation happens in the visitor's browser. The app does not send
the entered text, uploaded image, or generated QR code to any server. The Vercel
deployment serves static files only.

## Security posture

PureQR is intentionally static and has no server-side QR generation, database,
authentication, or file upload endpoint. The production deployment includes
strict security headers through `vercel.json`, including a Content Security
Policy that blocks outbound application connections.

No website can be described as unhackable. This project reduces attack surface
by avoiding server-side processing and storage.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
```

## License

MIT
