# Contributing to MiruroAPI

Thank you for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/MiruroAPI.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

## Project Structure

```
MiruroAPI/
├── server.js              # Express entry point
├── src/
│   ├── helpers/           # AniList, pipe + embed providers, cache integrations
│   └── routes/            # Express routes
├── public/                # Static files (landing page, Swagger UI)
└── docs/                  # API documentation
```

## Adding a New Endpoint

1. Create helper in `src/helpers/yourHelper.js` if needed
2. Add route in `src/routes/apiRoutes.js`
3. Update `docs/endpoints.md` with documentation
4. Test with `curl http://localhost:3000/api/your-endpoint`

> For streaming endpoints, consider adding direct embed providers (megavid, anixo) 
> in `src/helpers/pipe.js` — these bypass Cloudflare and work from any environment.

## Code Style

- Use CommonJS (`require`/`module.exports`)
- Add JSDoc comments for new functions
- Follow existing patterns in the codebase
- Keep helpers focused on one task

### File Headers

```js
/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — filename.js
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   What this module does.
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */
```

### Section Markers

```js
// ══════════════════════════════════════════════════════════════
// SECTION NAME
// ══════════════════════════════════════════════════════════════
```

### Feature Markers

```js
// ---- FEATURE: Name ----
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance

## Pull Request Guidelines

- Keep PRs focused on one feature or fix
- Update CHANGELOG.md with your changes
- Test your changes locally before submitting
- Follow existing code style

## Reporting Issues

- Use GitHub Issues for bug reports
- Include steps to reproduce
- Include expected vs actual behavior
- Include your Node.js version

## Contributing Bypass Solutions (Priority)

Streaming endpoints are blocked on cloud platforms. This is the most impactful contribution you can make.

### What to Build

Add a new fallback method in `src/helpers/pipe.js`. The file already has 3 methods (direct, ScraperAPI, FlareSolverr) — add yours as a 4th.

### Free/Open Source Options

| Tool | Language | Install |
|------|----------|---------|
| [nodriver](https://github.com/ultrafunkamsterdam/nodriver) | Python | `pip install nodriver` |
| [Camoufox](https://github.com/nicandris/camoufox) | Python | `pip install camoufox` |
| [curl_cffi](https://github.com/nicandris/curl_cffi) | Python | `pip install curl_cffi` |
| [patchright](https://github.com/nicandris/patchright) | Python | `pip install patchright` |
| [Scrape.do](https://scrape.do) | HTTP API | 1K free credits/mo |

### Steps

1. Fork and clone
2. Add your method in `src/helpers/pipe.js`
3. Add your API key/URL to `.env.example`
4. Test: `curl http://localhost:3000/api/episodes/20`
5. Submit PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
