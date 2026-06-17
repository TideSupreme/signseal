# SignSeal

> the first digital signature that doesn't need a digital signature platform

## Why use it

# SignSeal — The Pitch

**Hello, Sharks!**

Last year, DocuSign processed over a billion agreements — real estate closings, divorce settlements, seven-figure contracts — and every single one of them authenticated with the same security model as a newsletter signup: an email address plus a click. That's not a signature. That's a pinky promise with a logo.

I'm here to tell you that the e-signature industry is a $5 billion house of cards built on a single missing primitive: a signature that is cryptographically bound to a proven human, with no key to steal, no admin to bribe, and no platform you have to trust to keep honest records.

We built SignSeal — the first digital signature that doesn't need a digital signature platform.

Here's how it works. You prove who you are once through Tide's zero-knowledge threshold authentication. No password. No SIM-swappable phone number. A live cryptographic proof that no phishing attack can replay. From that moment, every document you sign produces a Tide-fragmented signature — the signing key is mathematically split across independent ORK nodes so no private key exists anywhere to be exfiltrated. The signed document carries its own proof: the signer's identity, the timestamp, and the content integrity are all verifiable by anyone, anywhere, without ever contacting a central service. The "envelope" that DocuSign charges $25 for becomes a mathematical property of the document itself.

Why can't DocuSign build this? Because every e-signature product on earth is a custodian business model. They hold the keys, they run the audit log, they vouch for the identity — and they charge you rent forever for the privilege. SignSeal eliminates the custodian entirely. We use two Tide primitives that make this impossible to replicate without the Tide protocol: doEncrypt/doDecrypt for self-sealing documents where the platform literally cannot read your data, and Forseti policy-governed signing where a signature only executes if the contract validates your identity, your role, and the document hash — enforced at the ORK network level, not in our application code.

The market is anyone who signs anything that matters. Real estate — 5 million transactions a year in the US alone. Legal — every notarized document. Healthcare — every patient consent form. Enterprise procurement — every contract over $50,000. And here's the kicker: we don't compete with DocuSign on price. We compete on a property they can never offer — a signature whose trust is self-contained in the document, verifiable forever, with zero ongoing platform dependency. You can verify a SignSeal document in 2046 without SignSeal even existing as a company. Try doing that with a DocuSign envelope.

## What it is

A [Next.js](https://nextjs.org) app secured with [TideCloak](https://tidecloak.com) — decentralized identity where keys are split across a network, so **no single server (not even this app) ever holds a usable copy**. Login, sessions, and the app's sensitive data are protected by that model.

## Prerequisites

- **Node.js 20+**
- **Docker** (to run TideCloak locally)
- **`jq`** and **`curl`** (used by the init script)

## Run it locally

**1. Start TideCloak** (the public dev image — has a pre-configured entrypoint, do *not* append `start-dev`):

```bash
docker run -d --name tidecloak -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=password \
  tideorg/tidecloak-dev:latest

# wait until it answers:
until curl -sf http://localhost:8080 >/dev/null; do sleep 3; done
```

**2. Install and initialise** (the init script wires up TideCloak — see below):

```bash
cd app
npm install
npm run init
```

**3. Start the app:**

```bash
npm run dev
```

Open **http://localhost:3000**.

## Initialising TideCloak (what `npm run init` does)

`npm run init` runs [`init/tcinit.sh`](app/init/tcinit.sh) against your local TideCloak and:

- creates the **`nextjs-test`** realm and the **`myclient`** client,
- enables the **Tide IdP** and **IGA** (identity governance),
- creates an **`admin`** user and prints an account-link invite,
- writes the adapter config to **`tidecloak.json`**, which the app reads.

TideCloak admin console: **http://localhost:8080** (`admin` / `password`).

## Using it

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

---

Built on [TideCloak](https://tidecloak.com). The product story is in **[pitch.md](pitch.md)**.
