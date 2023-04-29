import React from "react";
import { Form, useTransition } from "remix";
import styled from "styled-components";
import Background from "~/components/Background";
import { Dialog } from "~/components/Dialog";
import { Loader } from "~/components/Loader";
import LoginInstructions from "~/components/LoginInstructions";
import { ModalTrigger } from "~/components/ModalTrigger";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import colors from "~/style/colors";
import { normalizeButton, normalizeInput } from "~/style/mixins";
import { readTransitionFormData } from "~/util/readFormData";
import Button from "~/components/Button";

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
  width: 100%;
  max-width: 400px;
`;

const TextInput = styled.input`
  ${normalizeInput};
  border: 3px solid rgba(255, 255, 255, 1);
  background-color: rgba(255, 255, 255, 0.33);
  color: white;
  font-size: 16px;
  padding: 10px;
  flex: 1;
  &::placeholder {
    color: currentColor;
    opacity: 0.5;
    text-transform: uppercase;
  }
  border-radius: 5px 0 0 5px;
  &:focus {
    outline: none;
  }
`;

const InputButton = styled.button`
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

const InstructionsButton = styled.button`
  ${normalizeButton};
  color: white;
  text-decoration: underline;
  font-size: 0.9em;
`;

export interface LoginProps {
  foo?: string;
  formError?: string;
}
const Login: React.FC<LoginProps> = (props) => {
  const { formError } = props;
  const transition = useTransition();

  const isButtonLoading = (xd: string) =>
    transition.state !== "idle" &&
    readTransitionFormData(transition, ["xd"])[0] === xd;

  const getButton = (xd: string) => {
    return (
      <InputButton
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
            log in with your FPL ID or URL to view all your mini-leagues
          </div>
          <Spacer height={10} />
          <InputContainer>
            <TextInput type="text" name="id" placeholder="your ID" />
            {getButton("user")}
          </InputContainer>
          <Spacer height={10} />

          <ModalTrigger
            isDismissable
            label="view instructions"
            renderTrigger={(props) => (
              <InstructionsButton
                onClick={(evt) => props.onPress?.(evt as any)}
                type="button"
                children="view instructions"
              />
            )}
            renderModal={(close) => (
              <Dialog>
                <LoginInstructions />
                <Button
                  onClick={close}
                  children="Close instructions"
                  variant="PRIMARY"
                />
              </Dialog>
            )}
          />
        </FormBlock>

        {/* <Form method="post">
          <input type="hidden" name="xd" value="league" />
          <input type="text" name="id" required placeholder="League ID" />
          <button type="submit" children="GO" />
        </Form> */}
        <Spacer height={48} />
        <FormBlock method="post">
          <input type="hidden" name="xd" value="league" />
          <div style={{ maxWidth: 180 }}>
            or view a single league by entering its ID or URL
          </div>
          <Spacer height={10} />
          <InputContainer>
            <TextInput type="text" name="id" required placeholder="league ID" />
            {getButton("league")}
          </InputContainer>
        </FormBlock>

        <Spacer height={48} />
        {formError ? <div>Invalid submission!!</div> : null}
      </ViewContainer>
    </>
  );
};

export default Login;
