import { toRelativeUrl } from "@okta/okta-auth-js"
import { useOktaAuth } from "@okta/okta-react"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Loading from "./Loading"
import Unauthorized from "./Unauthorized"
import React from "react"
export interface Props {
  rolesPermissions: string[] | undefined
}

function ProtectedRoute({ rolesPermissions }: Props) {
  const { oktaAuth, authState } = useOktaAuth()
  const isAuthenticated = authState?.isAuthenticated

  useEffect(() => {
    if (!authState) {
      return
    }
    if (!isAuthenticated) {
      const originalUri = toRelativeUrl(window.location.href, window.location.origin)
      oktaAuth.setOriginalUri(originalUri)
      oktaAuth.signInWithRedirect()
    }
  }, [oktaAuth, authState, isAuthenticated])

  if (!authState || !isAuthenticated) {
    return <Loading />
  }
  if (rolesPermissions) {
    // check the authority on this person. We can implement the authorization part as well. Protect route props would have an array of string with the roles. we can check from the token if the user has that role or not. If yes, return outlet otherwise Unauthorized.
    let verified: boolean[] = [false]
    try {
      verified = [true]
    } catch (err: any) {}
    if (verified.indexOf(true) === -1) {
      return <Unauthorized />
    }
  }
  return <Outlet />
}

export default ProtectedRoute