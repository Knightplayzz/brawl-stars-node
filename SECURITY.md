# 🛡️ Security Policy

## Supported Versions

We currently support and patch the following versions of **brawl-stars-node**:

| Version | Supported |
|----------|------------|
| 2.x.x    | ✅ Active Support |
| 1.0.0  | ❌ No longer supported |

If you’re using an older version, please upgrade to the latest release on [npm](https://www.npmjs.com/package/brawl-stars-node).

---

## Reporting a Vulnerability

If you discover a security issue or vulnerability, **please do not create a public GitHub issue.**

Instead, report it responsibly by sending a detailed email to:

📧 **philippesmeets@icloud.com**

Please include:
- A clear description of the vulnerability.
- Steps to reproduce (if possible).
- Any relevant code snippets or logs.
- Impact assessment (what could an attacker do?).

---

## Response Process

1. You’ll receive an **acknowledgment within 48 hours** confirming that your report has been received.
2. The issue will be **investigated privately**, and a fix or mitigation plan will be created.
3. Once resolved, a **new version will be released** and the issue will be documented in the changelog.
4. Credit will be given to the reporter (if desired).

---

## Security Best Practices

When using this package:
- Never share your **Brawl Stars API token** publicly.
- Always **store tokens in environment variables** or secure configuration files.
- Use **latest versions** of Node.js and dependencies.
- Avoid running this client in environments without HTTPS.

---

## Scope

This policy applies to vulnerabilities found in:
- Source code under [`/src`](https://github.com/Knightplayzz/brawl-stars/tree/main/src)
- Build and runtime scripts
- Published NPM package `brawl-stars-node`

It does **not** apply to:
- Third-party libraries used in this project
- Brawl Stars API itself (report those to [Supercell](https://supercell.com/en/fan-content-policy/))

---

## Thank You

We deeply appreciate the time and effort of security researchers and community members who help keep **brawl-stars-node** safe and reliable for everyone.
