import React from "react";
import { LoaderFunction, redirect } from "remix";

export const loader: LoaderFunction = ({ params }) => {
  return redirect(`/league/${params.id}/standings`);
};

export interface IndexProps {}
const Index: React.FC<IndexProps> = (props) => {
  return null;
};

export default Index;
