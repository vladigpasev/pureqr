# Security

## Supported model

PureQR is a static frontend application. It has no backend API, database,
server-side QR generation, account system, or user-upload endpoint.

## Reporting issues

Please open a GitHub issue for reproducible security concerns that affect this
codebase.

## Practical limits

No software can be guaranteed to be completely safe or unhackable. PureQR keeps
the attack surface small by performing QR encoding locally, avoiding persistent
storage, and shipping strict browser security headers.
