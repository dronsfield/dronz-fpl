import Mixpanel from "mixpanel";

const mp = Mixpanel.init("33a3e5c57f95f41ceaa6fa88c4fe8359");

export const track = mp.track;
