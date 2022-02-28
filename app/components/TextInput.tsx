import React from "react";
import styled from "styled-components";
import { normalizeInput } from "~/style/mixins";

const BaseInput = styled.input`
  ${normalizeInput};
  border: 1px solid black;
`;

export interface TextInputProps {
  onChange?: (text: string) => void;
  value?: string;
  name: string;
  required?: boolean;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  const { onChange, value, name, required } = props;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    if (onChange) onChange(evt.target.value);
  };

  const inputProps = {
    onChange: handleChange,
    value,
    name,
    required,
    type: "text",
  };

  return <BaseInput {...inputProps} />;
};

export default TextInput;
