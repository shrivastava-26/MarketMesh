# Copilot Instructions for marketmesh

## Project Overview
- This is a React application bootstrapped with Vite for fast development and HMR (Hot Module Replacement).
- The codebase is minimal, focused on client-side React logic, with entry points in `src/main.jsx` and the main app component in `src/App.jsx`.
- Static assets are located in `src/assets/` and `public/`.

## Build & Run Workflows
- **Development:** Use `npm run dev` to start the Vite development server (see `package.json`).
- **Production Build:** Use `npm run build` to generate optimized assets in `dist/`.
- **Preview Production Build:** Use `npm run preview` to serve the built app locally.
- No test scripts or test frameworks are present by default.

## Linting & Code Quality
- ESLint is configured via `eslint.config.js` for basic React linting. Run `npx eslint .` to check code quality.
- No custom lint rules or pre-commit hooks are present.

## Key Architectural Patterns
- **Single Page App:** All routing and logic are handled client-side in React.
- **Component Structure:** Main UI logic is in `src/App.jsx`. Styles are in `src/App.css` and `src/index.css`.
- **Asset Usage:** Images and SVGs are imported directly into components from `src/assets/` or referenced from `public/`.
- **No API/Backend:** There is no backend integration or API calls in the default template.

## Project-Specific Conventions
- Use functional React components and hooks (see `src/App.jsx`).
- Prefer direct imports for assets (e.g., `import logo from './assets/react.svg'`).
- Keep global styles in `src/index.css`; component-specific styles in their respective `.css` files.
- No TypeScript or advanced state management (Redux, Context) is present by default.

## External Dependencies
- Core dependencies: `react`, `react-dom`, `vite`.
- Plugins: Vite React plugin (see `vite.config.js`).
- No custom middleware, service boundaries, or cross-component communication patterns beyond standard React props/hooks.

## Example: Adding a New Component
1. Create a new file in `src/` (e.g., `MyComponent.jsx`).
2. Use functional component syntax:
   ```jsx
   export default function MyComponent() {
     return <div>Hello from MyComponent!</div>;
   }
   ```
3. Import and use in `App.jsx`:
   ```jsx
   import MyComponent from './MyComponent';
   // ...
   <MyComponent />
   ```

## References
- See `README.md` for official plugin links and further setup tips.
- For advanced configuration, review `vite.config.js` and `eslint.config.js`.

---
_If any conventions or workflows are unclear, please provide feedback to improve these instructions._
