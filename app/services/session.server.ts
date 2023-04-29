import { createCookieSessionStorage, redirect } from "remix";

const sessionSecret = process.env.SESSION_SECRET || "lul";
if (!sessionSecret) throw new Error("SESSION_SECRET required");

export const storage = createCookieSessionStorage({
  cookie: {
    name: "fpl.dronz",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export async function createUserSession(userId: number, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);

  const userId = await session.get("userId");
  if (typeof userId !== "number") return null;
  return userId;
}

export type User = { userId: number } | null;
export async function getUser(request: Request): Promise<User> {
  const userId = await getUserId(request);
  if (!userId) return null;
  return { userId };
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect(`/`, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
