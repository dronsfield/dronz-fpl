import React from "react";
import {
  ActionFunction,
  ErrorBoundaryComponent,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import LogoutButton from "~/components/LogoutButton";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import { getManagerProfile, ManagerProfile } from "~/services/api";
import { createUserSession, getUser } from "~/services/session.server";
import { readRequestFormData } from "~/util/readFormData";
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
    return (
      <Section>
        <div children="My leagues:" />
        {data?.leagues.map((league) => (
          <div>
            <Link
              key={league.id}
              children={league.name}
              to={`/league/${league.id}`}
            />
          </div>
        ))}
        <Spacer height={16} />
        <div children="View another league" />
        <Form method="post">
          <input type="hidden" name="xd" value="league" />
          <input type="text" name="id" required placeholder="League ID" />
          <button type="submit" children="GO" />
          <Spacer height={32} />
          <LogoutButton />
        </Form>
      </Section>
    );
  } else {
    return <Login />;
  }
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
