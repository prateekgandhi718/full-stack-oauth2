import React from "react"
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js"
import config from "./config"
import { Security } from "@okta/okta-react"
import AppRouter from "./AppRouter"

export const oktaAuth = new OktaAuth(config.oidc)

function App() {
  const [, setAuthNeededModalOpen] = React.useState(false)

  const triggerLogin = async () => {
    await oktaAuth.signInWithRedirect()
  }

  const restoreOriginalUri = async (_oktaAuth: any, originalUri: any) => {
    window.location.replace(toRelativeUrl(originalUri || "/", window.location.origin))
  }

  const customAuthHandler = async () => {
    const previousAuthState = oktaAuth.authStateManager.getPreviousAuthState()

    if (!previousAuthState || !previousAuthState.isAuthenticated) {
      // App initialization stage
      await triggerLogin()
    } else {
      // Ask the user to trigger the login process during token autoRenew process
      setAuthNeededModalOpen(true)
    }
  }

  return (
    <Security oktaAuth={oktaAuth} onAuthRequired={customAuthHandler} restoreOriginalUri={restoreOriginalUri}>
      <AppRouter />
    </Security>
  )
}

export default App