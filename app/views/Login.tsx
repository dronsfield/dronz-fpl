import React from "react";
import { Form, useTransition } from "remix";
import styled from "styled-components";
import Background from "~/components/Background";
import { Loader } from "~/components/Loader";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import colors from "~/style/colors";
import { normalizeButton, normalizeInput } from "~/style/mixins";
import { readTransitionFormData } from "~/util/readFormData";

const ViewContainer = styled(Section)`
  padding: 40px;
  font-size: 16px;
  color: white;
  text-align: center;
`;

const FormBlock = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const TextInput = styled.input`
  ${normalizeInput};
  border: 3px solid rgba(255, 255, 255, 1);
  background-color: rgba(255, 255, 255, 0.33);
  color: white;
  font-size: 16px;
  padding: 10px;
  flex: 1;
  text-transform: uppercase;
  &::placeholder {
    color: currentColor;
    opacity: 0.5;
  }
  border-radius: 5px 0 0 5px;
  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  ${normalizeButton};
  background-color: rgba(255, 255, 255, 1);
  color: white;
  font-size: 18px;
  color: ${colors.purple};
  font-weight: bold;
  border-radius: 0 5px 5px 0;
  margin-left: -1px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface LoginProps {
  foo?: string;
}
const Login: React.FC<LoginProps> = (props) => {
  const { foo } = props;
  const transition = useTransition();

  const isButtonLoading = (xd: string) =>
    transition.state === "submitting" &&
    readTransitionFormData(transition, ["xd"])[0] === xd;

  const getButton = (xd: string) => {
    return (
      <Button
        type="submit"
        children={isButtonLoading(xd) ? <Loader size={14} /> : "GO"}
      />
    );
  };

  return (
    <>
      <Background />
      <ViewContainer>
        <FormBlock method="post">
          <input type="hidden" name="xd" value="user" />
          <div style={{ maxWidth: 220 }}>
            enter your personal FPL ID to view all your mini-leagues
          </div>
          <Spacer height={10} />
          <InputContainer>
            <TextInput type="number" name="id" required placeholder="your ID" />
            {getButton("user")}
          </InputContainer>
        </FormBlock>

        {/* <Form method="post">
          <input type="hidden" name="xd" value="league" />
          <input type="text" name="id" required placeholder="League ID" />
          <button type="submit" children="GO" />
        </Form> */}
        <Spacer height={32} />
        <FormBlock method="post">
          <input type="hidden" name="xd" value="league" />
          <div style={{ maxWidth: 180 }}>
            or view a specific league by entering its ID
          </div>
          <Spacer height={10} />
          <InputContainer>
            <TextInput
              type="number"
              name="id"
              required
              placeholder="league ID"
            />
            {getButton("league")}
          </InputContainer>
        </FormBlock>
      </ViewContainer>
    </>
  );
};

export default Login;
