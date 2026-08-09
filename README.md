# claude

Design tooling for Claude Code.

## Installed

### UI/UX Pro Max — `.claude/skills/` (working)

[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
v2.14.1, installed with `npx ui-ux-pro-max-cli init --ai claude`.

Seven skills, loaded automatically by Claude Code from this repo:
`ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`,
`banner-design`, `slides`.

The searchable database (84 styles, 192 palettes, 74 font pairings,
99 UX guidelines, 25 chart types, 22 stacks) runs fully offline on the
Python 3 standard library:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS analytics landing page" \
  --design-system --project-name "My Project"
```

To update later: `npx ui-ux-pro-max-cli init --ai claude`.

### 21st.dev MCP — `.mcp.json` (needs two things from you)

[21st.dev](https://21st.dev) component registry, configured with
`npx @21st-dev/cli init --client claude --write`. The config points at the
hosted MCP server and reads the key from the environment, so no secret is
committed:

```json
{ "mcpServers": { "21st": {
  "type": "http",
  "url": "https://21st.dev/api/mcp",
  "headers": { "x-api-key": "${API_KEY_21ST}" }
} } }
```

It will not connect until both of these are done:

1. **Create an API key** at <https://21st.dev/settings/api-keys> (a
   `21st_sk_…` key) and export it as `API_KEY_21ST`. Only you can do this —
   it requires signing in to your 21st.dev account.
2. **Allow `21st.dev` egress.** Claude Code web sessions block it by default
   (`CONNECT tunnel failed, response 403`), so the MCP server is unreachable
   from a remote session. It works locally, or after adding `21st.dev` to
   the environment's network allowlist.

The CLI is also usable directly once the key is set — `21st search`,
`21st add <user>/<slug>`, `21st generate` — subject to the same two
requirements.
