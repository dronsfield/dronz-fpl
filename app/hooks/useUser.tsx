import React from "react"
import {User} from "~/services/session.server";

export const UserContext = React.createContext<User>(null)
export const useUser = () => {
  return React.useContext(UserContext)
}