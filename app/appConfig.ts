import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// get create-react-app env var (REACT_APP_*)
function craEnv(suffix: string) {
  return process.env[`REACT_APP_${suffix}`] || "";
}

const appConfig = {
  LEAGUE_ID: 1011990,
  MAX_MANAGERS: 20,
};
export default appConfig;
