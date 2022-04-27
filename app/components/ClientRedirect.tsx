import React from "react";
import { useNavigate } from "remix";

export interface ClientRedirectProps {
  to: string;
}
const ClientRedirect: React.FC<ClientRedirectProps> = (props) => {
  const { to } = props;
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace: true });
  }, []);
  return null;
};

export default ClientRedirect;
