import React from "react";
import { Form } from "remix";

export interface LogoutButtonProps {}
const LogoutButton: React.FC<LogoutButtonProps> = (props) => {
  return (
    <Form action="/logout" method="post">
      <button type="submit" children="Logout" />
    </Form>
  );
};

export default LogoutButton;
