import React from "react";
import { useParams } from "remix";
import ClientRedirect from "~/components/ClientRedirect";

export interface IndexProps {}
const Index: React.FC<IndexProps> = (props) => {
  const params = useParams();
  return <ClientRedirect to={`/league/${params.id}/standings`} />;
};

export default Index;
