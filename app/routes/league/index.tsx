import React from "react";
import { ActionFunction, Form, json, redirect, useTransition } from "remix";
import styled from "styled-components";
import Button from "~/components/Button";
import Section from "~/components/Section";
import TextInput from "~/components/TextInput";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return json("no id", { status: 500 });
  }
  return redirect(`/league/${id}`);
};

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface LeagueIndexProps {
  foo: string;
}

const LeagueIndex: React.FC<LeagueIndexProps> = (props) => {
  const { foo } = props;

  const transition = useTransition();

  return (
    <Section>
      <Inner>
        <div>League Index</div>
        <div>{transition.state}</div>
        <Form method="post">
          <div>
            <label>
              <TextInput name="id" required />
            </label>
            <Button type="submit" children="Go" />
          </div>
        </Form>
      </Inner>
    </Section>
  );
};

export default LeagueIndex;
