import { Transition } from "@remix-run/react/transition";

function readFormData(formData: FormData, fields: string[]) {
  return fields.map((fieldName) => {
    const value = formData.get(fieldName);
    if (typeof value !== "string")
      throw new Response("invalid form data", { status: 400 });
    return value;
  });
}

export async function readRequestFormData(request: Request, fields: string[]) {
  const formData = await request.formData();
  return readFormData(formData, fields);
}

export function readTransitionFormData(
  transition: Transition,
  fields: string[]
) {
  const formData = transition.submission?.formData;
  if (!formData) throw new Error("no form data");
  return readFormData(formData, fields);
}
