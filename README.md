# Shubhayatra CMS

A React + TypeScript app built with Vite.

## Prerequisites

- Node.js 20 or later
- npm
- Docker and Docker Compose if you want to run the app in containers

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Run the linter:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Docker

The repository includes two Docker entry points:

- [Dockerfile.dev](Dockerfile.dev) for local development
- [Dockerfile](Dockerfile) for production builds served by Nginx

### Development with Docker Compose

Start the dev container:

```bash
docker compose up --build
```

The app is available at http://localhost:3000.

### Production image

Build the production image:

```bash
docker build -f Dockerfile -t shubhayarta-cms .
```

Run the production container:

```bash
docker run --rm -p 8080:80 shubhayarta-cms
```

Then open http://localhost:8080.

## Notes

- The dev container runs Vite on port 3000 with host binding enabled so it is reachable from the browser.
- The production image serves the Vite `dist` output through Nginx.
