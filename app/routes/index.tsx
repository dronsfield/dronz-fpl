import React from "react";
import {
  ActionFunction,
  ErrorBoundaryComponent,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { getManagerProfile, ManagerProfile } from "~/services/api";
import { createUserSession, getUser } from "~/services/session.server";
import { readRequestFormData } from "~/util/readFormData";
import Home from "~/views/Home";
import Login from "~/views/Login";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  console.log("loader", user);

  const profile = user ? await getManagerProfile(user.userId) : null;
  return profile;
};

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
  const data = useLoaderData<ManagerProfile | null>();
  const actionData = useActionData();
  if (actionData) console.log(actionData);

  if (data) {
    return <Home data={data} />;
  } else {
    return <Login />;
  }
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
