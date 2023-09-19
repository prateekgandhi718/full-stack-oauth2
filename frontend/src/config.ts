const CLIENT_ID: string = process.env.REACT_APP_OKTA_CLIENT_ID || "{clientId}"
const ISSUER: string = process.env.REACT_APP_OKTA_ISSUER || "https://{yourOktaDomain}.com/oauth2/default"
const OKTA_DISABLEHTTPSCHECK: string | false = process.env.REACT_APP_OKTA_DISABLEHTTPSCHECK || false
const BASENAME: string = process.env.PUBLIC_URL || ""
const REDIRECT_URI: string = `${window.location.origin}${BASENAME}/login/callback`
const ENVIRONMENT_TARGET: string = process.env.REACT_APP_ENVIRONMENT || "n/a"

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ["openid", "profile", "email", "offline_access"],
    pkce: true,
    disableHttpsCheck: OKTA_DISABLEHTTPSCHECK,
  },
  app: {
    basename: BASENAME,
    environmentTarget: ENVIRONMENT_TARGET,
  },
}