import React from "react";

export interface CaptainsProps {
  foo: string;
}

const Captains: React.FC<CaptainsProps> = (props) => {
  const { foo } = props;

  return <div>Captains</div>;
};

export default Captains;
