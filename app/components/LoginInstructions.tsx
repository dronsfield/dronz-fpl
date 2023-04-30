import React from "react";
import styled from "styled-components";
import Button from "./Button";

const Container = styled.div``;

export interface LoginInstructionsProps {}

const LoginInstructions: React.FC<LoginInstructionsProps> = (props) => {
  return (
    <Container>
      <ol style={{ margin: 0, paddingInlineStart: 16 }}>
        <li>
          Login to{" "}
          <a href="https://fantasy.premierleague.com" target="_blank">
            fantasy.premierleague.com
          </a>{" "}
          (link opens in new tab )
        </li>
        <li>Click on "Points" in the nav bar</li>
        <li>Copy the page URL</li>
        <li>Return here and paste into the input</li>
      </ol>
    </Container>
  );
};

export default LoginInstructions;
