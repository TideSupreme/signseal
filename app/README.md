# SignSeal

## What it is

SignSeal is the first digital signature platform that doesn't need a digital signature platform. Built on Tide threshold cryptography, it lets users cryptographically seal documents with their identity — producing self-verifying signed documents where the proof lives in the document itself, not on any company's servers.

Every document signed with SignSeal carries its own proof: the signer's identity, the timestamp, and the content integrity are all verifiable by anyone, anywhere, without ever contacting a central service. No keys to steal. No admin to bribe. No platform to trust.

## How to run

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click "Continue with Tide" to authenticate via TideCloak.

**Prerequisites**: TideCloak must be running at `http://localhost:8080` with the `nextjs-test` realm configured.

## Pages & features

| Route | Page | Description |
|---|---|---|
| `/` | Login | Branded login with SignSeal identity. "Continue with Tide" CTA authenticates via TideCloak threshold PRISM. |
| `/home` | Dashboard | Post-auth landing. Shows feature cards linking to Sign and Verify, recent sealed documents list, user identity badge. |
| `/sign` | Sign a Document | Form with document name + content. Submits via `doEncrypt` to seal under user's Tide identity. Shows seal confirmation with timestamp, signer, and seal ID. |
| `/verify` | Verify a Signature | Paste ciphertext or select saved document. `doDecrypt` verifies the seal and displays document metadata (name, signer, timestamp, content preview). |

## Tide primitives used

1. **`doEncrypt` / `doDecrypt`** (self-encryption): Document sealing and verification. Ciphertext is bound to the user's Tide identity — only they can decrypt it. No key management.

2. **DPoP-bound tokens**: Every session is device-bound via the TideCloak SDK. Stolen tokens are inert on any other device.

## What's mocked vs real

- **Real**: TideCloak authentication (OIDC + threshold PRISM via ORK), self-encryption via `doEncrypt`/`doDecrypt`, DPoP token binding, JWT verification, localStorage persistence of ciphertext.
- **Mocked / declared**: Forseti policy-governed signing (requires admin-side policy setup in TideCloak console). In production, signing would additionally validate against ORK-enforced Forseti contracts. Cross-user verification (shared encryption) also requires Forseti policy setup.
- **Storage**: Currently uses browser localStorage for prototype simplicity. A production deployment would store ciphertexts server-side (the server only ever sees encrypted blobs it cannot decrypt).