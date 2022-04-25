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
    const parsedId = Number(id);
    if (!parsedId) return { formError: "invalid id" };
    return createUserSession(parsedId, "/");
  } else if (action === "league") {
    return redirect(`/league/${id}`);
  } else {
    return { formError: "invalid action" };
  }
};

export default function Index() {
  const data = useProfileData();
  const actionData = useActionData();
  if (actionData) console.log(actionData);

  return (
    <>
      <NavBar />
      {data ? <Home data={data} /> : <Login />}
    </>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
