# Playerprops (NFL)

NFL-focused player explorer: **search** uses a cached ESPN 32-team roster index; **player pages** for `espn-{id}` load ESPN core + stats + gamelog in parallel, then enrich with a **TheSportsDB** bio only when an `idESPN` match is found (no duplicate stat APIs). **Stat type tabs** on each live profile list every ESPN stat category returned for that player (passing, rushing, receiving, defense, returns, kicking, …); the default tab follows **listed position** (e.g. WR → receiving first) so you can still open passing or defensive lines when they exist.

See **[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)** for the five recommended sources and how responsibilities are split.

**Layout:** feature-ish pages live under `src/pages/` (e.g. `src/pages/props/` for the Props route + its CSS/config). Shared UI for a feature is under `src/components/` (e.g. `src/components/props/`). Offline fallbacks and demo payloads are in **`src/mocks/`**; shared palette tokens are in **`src/constants/`** (e.g. `nflTeamColors.js`). `preloadMedia.js` waits on headshot URLs before showing the Props grid.

Optional env:

- `REACT_APP_SPORTSDB_API_KEY` — TheSportsDB API key (defaults to public demo key `3`).
- `REACT_APP_ESPN_SITE_PROXY=1` — Force roster/overview `site.api` requests through your host’s `/api/espn-site` rewrite (needed when the app is not served from `localhost` but you still proxy ESPN).

### ESPN `site.api` and CORS

Team roster and some overview URLs hit **`site.api.espn.com`**, which often **does not** send `Access-Control-Allow-Origin` for arbitrary web origins. The app uses **`/api/espn-site`** (see `src/setupProxy.js` in dev and `vercel.json` in production) so the browser stays same-origin. Without that proxy, search index loading will fail in the console with CORS errors.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
