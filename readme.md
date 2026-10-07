
# nexus

! A newer and easier-to-self-host alternative, [better-nexus](https://github.com/yuktn/better-nexus) is released!  
As a result, this repo is getting archived.

nexus is a project that lets devices send 'heartbeats' (requests comprised of the name, load, and timestamp) to the main server,
which are then requested by the web server to be visualized.

You can check the project in action at [nexus](https://nexus.yuktn.dev)! (Redirects to better nexus now)


## API Reference

#### Upload heartbeat

```http
  POST /api/heartbeat
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `deviceName` | `string` | **Required**. The name of the heartbeat's sender device. |
| `currentLoad` | `number` | Current load of the device (collected by `systeminformation`) |
| `timestamp` | `string` | Time when the heartbeat was sent |

The POST endpoint is guarded by a middleware, that expects a token for authorization.
Check `package/server/example.env` and `package/agent/example.env`. The contents should match in order for the requests to be authorized.


#### Get the list of heartbeats

```http
  GET /api/heartbeat
```

| Response | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `heartbeats` | `Heartbeat[][]` | **Required**. The name of the heartbeat's sender device. |



**! Heartbeats older than 30 seconds are automatically deleted by the server !**


## Workspace

This pnpm monorepo uses `package/agent`, `package/server`, `package/web`, and
`package/shared`. Shared API types live in `package/shared/types` and are
exported by the private `@nexus/shared` workspace package. Use `import type` from
`@nexus/shared/types/heartbeat` or the `@nexus/shared` type-only barrel for API
types. Web-only UI props live in `package/web/types/ui.ts` and use `@/types/ui`. Third-party types
remain imported from their owning libraries. Shared has no runtime exports or
build artifacts; UI type dependencies belong to web.

## Run Locally

Use Node.js 24+ and pnpm 11.13.0. Run commands from the repository root:

```bash
pnpm install --frozen-lockfile
```

Copy `package/server/example.env` to `package/server/.env` and
`package/agent/example.env` to `package/agent/.env`, then fill in their values.
The server requires `MONGODB_URI` and both processes need matching `SHARED_PEPPER`.

```bash
pnpm dev                     # all three apps
pnpm --filter server dev     # or run each app independently
pnpm --filter agent dev
pnpm --filter web dev
pnpm typecheck
pnpm lint
pnpm build
```

After building, use `pnpm --filter server start`, `pnpm --filter agent start`,
and `pnpm --filter web start` as needed. Deployment scripts must use these
workspace commands or the new `package/<app>` paths. The SSH deployment command
is configured on the deployment host and should be updated there if it refers
to the previous top-level application directories.
