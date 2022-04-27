import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  ErrorBoundaryComponent,
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import NavTray from "./components/NavTray";
import { rootLoader } from "./loaders/rootLoader";
import GlobalStyle from "./style/global";

dayjs.extend(utc);

export const loader = rootLoader;
export const meta: MetaFunction = () => {
  return { title: "FPL.DRONZ" };
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", type: "text/css", href: "/normalize.min.css" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;700&display=swap",
      rel: "stylesheet",
    },
  ];
};

const App: React.FC<{}> = (props) => {
  const { children } = props;
  if (typeof window !== "undefined") (window as any).dayjs = dayjs;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        <GlobalStyle />
        <Outlet />
        {children}
        <NavTray />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default App;

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return (
    <App>
      <h1>Error</h1>
    </App>
  );
};

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <App>
      <h1>
        {caught.status} {"&&"} {caught.statusText}
      </h1>
      <a href="/" children="Home" />
    </App>
  );
}
