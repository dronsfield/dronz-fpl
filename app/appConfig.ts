import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// get create-react-app env var (REACT_APP_*)
function craEnv(suffix: string) {
  return process.env[`REACT_APP_${suffix}`] || "";
}

const appConfig = {
  LEAGUE_ID: 10465,
  MAX_MANAGERS: 40,
  BASE_URL:
    "https://dronz-proxy-cbdo9ru7u-dronz.vercel.app/fantasy.premierleague.com/api",
  // "https://fantasy.premierleague.com/api",
  DIRECT_BROWSER_FETCHING: false,
};
export default appConfig;
