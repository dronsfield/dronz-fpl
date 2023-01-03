import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  ErrorBoundaryComponent,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import NavTray from "./components/NavTray";
import { rootLoader } from "./loaders/rootLoader";
import GlobalStyle from "./style/global";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getUser } from "~/services/session.server";
import { useRootLoaderQuery } from "~/hooks/useRouteData";
import { Loader } from "~/components/Loader";
import colors from "~/style/colors";
import React from "react";
import { UserContext } from "~/hooks/useUser";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import styled from "styled-components";
import QueryStatus from "~/components/QueryStatus";

dayjs.extend(utc);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      cacheTime: Infinity,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});
const persister = createSyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : window.localStorage,
});

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return user;
};

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

const RootLoader = styled(Loader)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Layout: React.FC<{}> = (props) => {
  const { children } = props;
  const rootQuery = useRootLoaderQuery(true);

  if (rootQuery.data) {
    return (
      <>
        <Outlet />
        {children}
        <NavTray />
        <QueryStatus />
      </>
    );
  } else if (rootQuery.isLoading) {
    return <RootLoader size={36} color={colors.purple} />;
  } else if (rootQuery.error) {
    throw rootQuery.error;
  } else {
    return null;
  }
};

const App: React.FC<{}> = (props) => {
  const { children } = props;
  if (typeof window !== "undefined") (window as any).dayjs = dayjs;
  const user = useLoaderData();

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
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <UserContext.Provider value={user}>
            <Layout>{children}</Layout>
          </UserContext.Provider>
        </PersistQueryClientProvider>
        <GlobalStyle />
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
