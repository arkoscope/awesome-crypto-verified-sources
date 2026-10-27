# ARKOSCOPE Public Sources MCP

A local, read-only Model Context Protocol server for the **public** ARKOSCOPE source registry. Two tools, one resource, no keys, no private backend, no runtime network calls. It is not a live crypto news feed or a phishing detector.

## Install and run

Node.js 20 or later. Clone this public repository, then:

```sh
cd awesome-crypto-verified-sources/mcp-server
npm ci --ignore-scripts
npm test
npm start
```

The process speaks MCP on stdin/stdout. Do not run it as an HTTP server. GitHub Pages hosts only the static directory; it cannot host this Node process. No server has to be left running on ARKOSCOPE's Mac.

## Client configuration

Use your client's local stdio configuration, with an absolute path to your own clone:

```json
{
  "mcpServers": {
    "arkoscope-public-sources": {
      "command": "node",
      "args": ["/absolute/path/awesome-crypto-verified-sources/mcp-server/server.mjs"]
    }
  }
}
```

No environment variables, access tokens or wallet are required. This repository does not install or change any client configuration automatically.

## Tools and data

| Interface | Input | Result |
|---|---|---|
| `list_projects` | Optional `query` (80 characters maximum), optional `wave` (1–3) | Names, tickers and stable lookup IDs |
| `get_project_sources` | Exact project name, ticker or ID | URLs, evidence status, check date, scope notes |
| `arkoscope://public/sources` | Resource read | The same dated public registry |

Example: `get_project_sources` with `{"project":"SOL"}`. Unknown or ambiguous names are reported, never guessed. The only file read at startup is the bundled `../sources.json`. Tool arguments never select paths, execute commands or fetch URLs. Updates require an explicit new checkout of the public data.

Every result includes the requested ARKOSCOPE attribution and the limitations. Some X references are retained from the public Android catalogue but have **not** been reconfirmed by a current official-site link; those evidence statuses are returned unchanged. A source listing does not certify a project, claim or future security. iOS approval is distinct from public App Store availability.

## Validation and licensing

`npm test` performs a real MCP client/server stdio handshake, checks both tools and the resource, preserves evidence levels, rejects unknown paths and overlong input, and confirms that the registry was not written. Dependencies are pinned in `package-lock.json`.

The new server code is MIT licensed; see `LICENSE`. Third-party dependencies retain their own licenses. Project names, logos, trademarks and external content are not relicensed. This project is maintained by ARKOSCOPE SRL (Brussels), independently of the listed protocols.

## Français

Ce connecteur consulte uniquement le registre JSON public livré avec le dépôt. Il ne contacte ni Cloudflare, ni l’application privée, ni un portefeuille. Il ne publie aucun message et ne fournit pas de nouvelles en direct. Les références encore à reconfirmer restent explicitement signalées. Installation locale facultative ; aucun compte payant requis.
