export async function readFormData(request: Request, fields: string[]) {
  const formData = await request.formData();
  return fields.map((fieldName) => {
    const value = formData.get(fieldName);
    if (typeof value !== "string")
      throw new Response("invalid form data", { status: 400 });
    return value;
  });
}
