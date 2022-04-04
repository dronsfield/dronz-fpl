import React from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink,
} from "remix";

interface InclusiveLinkProps extends RouterLinkProps {
  targetBlank?: boolean;
  isNav?: boolean;
}
type LinkProps = Omit<Omit<InclusiveLinkProps, "component">, "href">;

const Link: React.FC<LinkProps> = (props) => {
  const { to, replace, children, targetBlank, isNav, ...rest } = props;

  if (typeof to === "string" && (targetBlank || to.startsWith("http"))) {
    const passedProps = {
      tag: "a",
      href: to,
      target: "_blank",
      rel: "noopener noreferrer",
      children: children,
      ...rest,
    };
    return <a {...passedProps} />;
  } else {
    const passedProps = {
      ...rest,
      to: to,
      replace: replace,
      children: children,
      activeClassName: "active",
    };
    const Comp = isNav ? NavLink : RouterLink;
    return <Comp {...passedProps} />;
  }
};

export default Link;
