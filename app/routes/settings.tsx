import { ErrorBoundaryComponent } from "remix";
import NavBar from "~/components/NavBar";
import Section from "~/components/Section";
import { useProfileData } from "~/hooks/useRouteData";

export default function Settings() {
  const data = useProfileData();

  return (
    <>
      <NavBar />
      <Section>This page hasn't been built yet :)</Section>
    </>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
