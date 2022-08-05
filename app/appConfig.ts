import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// get create-react-app env var (REACT_APP_*)
function craEnv(suffix: string) {
  return process.env[`REACT_APP_${suffix}`] || "";
}

const appConfig = {
  LEAGUE_ID: 272162,
  MAX_MANAGERS: 40,
};
export default appConfig;
