import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundaryComponent } from "remix";
import NavBar from "~/components/NavBar";
import Section from "~/components/Section";
import { useProfileData } from "~/hooks/useRouteData";

export default function Settings() {
  const data = useProfileData();
  const queryClient = useQueryClient();

  const handleClearCache = () => {
    localStorage.clear();
    queryClient.invalidateQueries({ refetchType: "all" });
  };

  return (
    <>
      <NavBar />
      <Section>
        <div>
          <button type="button" onClick={handleClearCache}>
            Clear cached data
          </button>
        </div>
      </Section>
    </>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return <h1>Error</h1>;
};
