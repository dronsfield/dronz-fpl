import React from "react";
import {
  ActionFunction,
  ErrorBoundaryComponent,
  redirect,
  useActionData,
} from "remix";
import NavBar from "~/components/NavBar";
import { useProfileData } from "~/hooks/useRouteData";
import { createUserSession } from "~/services/session.server";
import { readRequestFormData } from "~/util/readFormData";
import Home from "~/views/Home";
import Login from "~/views/Login";

export const action: ActionFunction = async ({ request }) => {
  const [action, id] = await readRequestFormData(request, ["xd", "id"]);
  if (action === "user") {
    const urlRegex = /entry\/(?<id>\d+)/g;
    const match = urlRegex.exec(id);
    const parsedId = Number(match?.groups?.id) || Number(id);
    if (!parsedId) return { formError: "invalid id" };
    return createUserSession(parsedId, "/");
  } else if (action === "league") {
    const urlRegex = /leagues\/(?<id>\d+)/g;
    const match = urlRegex.exec(id);
    const parsedId = Number(match?.groups?.id) || Number(id);
    if (!parsedId) return { formError: "invalid id" };
    return redirect(`/league/${parsedId}`);
  } else {
    return { formError: "invalid action" };
  }
};

export default function Index() {
  const data = useProfileData();

  const { formError } = useActionData() || {};

  return (
    <>
      <NavBar />
      {data ? <Home data={data} /> : <Login formError={formError} />}
    </>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
