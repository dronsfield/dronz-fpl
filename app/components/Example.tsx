import React from "react";

export interface ExampleProps {
  foo: string;
}

const Example: React.FC<ExampleProps> = (props) => {
  const { foo } = props;

  return <div>Example</div>;
};

export default Example;
