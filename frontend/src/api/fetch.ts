import config from "../config";
import { ClientError } from "./error";

interface HeadersObject {
  [key: string]: string;
}

const OKTA_TOKEN_STORAGE_KEY = "okta-token-storage";

export const loadAccessToken = () => {
  const oktaToken = localStorage.getItem(OKTA_TOKEN_STORAGE_KEY);
  const oktaTokenParsed = oktaToken ? JSON.parse(oktaToken) : null;
  return {
    value: oktaTokenParsed ? oktaTokenParsed.accessToken?.accessToken : null,
  };
};

const getRefreshToken = () => {
  const oktaToken = localStorage.getItem(OKTA_TOKEN_STORAGE_KEY);
  const oktaTokenParsed = oktaToken ? JSON.parse(oktaToken) : null;
  return oktaTokenParsed ? oktaTokenParsed.refreshToken?.refreshToken : null;
};

const accessToken = loadAccessToken();

export const getAccessToken = () => {
  return accessToken.value;
};
// This is in memory!
const setAccessToken = (token: string) => {
  accessToken.value = token;
};

let commonTokenRefreshPromise: Promise<any> | null = null

export const refreshOktaTokens = async () => {
  if (commonTokenRefreshPromise === null) {
    commonTokenRefreshPromise = _refreshOktaTokens();
  }
  let refreshResponse;
  try {
    refreshResponse = await commonTokenRefreshPromise;
  } finally {
    commonTokenRefreshPromise = null;
  }
  return refreshResponse;
};

const _refreshOktaTokens = async () => {
  const refreshToken = getRefreshToken();

  if (refreshToken.length > 0) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Cache-Control", "no-cache");
    const url = `${config.oidc.issuer}/v1/token?client_id=${config.oidc.clientId}&grant_type=refresh_token&scope=offline_access openid profile&refresh_token=${refreshToken}`;
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(""),
      redirect: "follow" as RequestRedirect,
    };

    const refreshResponseTokens = await fetch(url, requestOptions);
    const refreshResponseTokensJson = await refreshResponseTokens.json();

    if (refreshResponseTokensJson) {
      const oktaToken = localStorage.getItem(OKTA_TOKEN_STORAGE_KEY);
      const oktaTokenParsed = oktaToken ? JSON.parse(oktaToken) : null;
      const newAccessToken = refreshResponseTokensJson?.access_token;
      const newRefreshToken = refreshResponseTokensJson?.refresh_token;

      if (oktaTokenParsed) {
        oktaTokenParsed.accessToken.accessToken = newAccessToken;
        oktaTokenParsed.refreshToken.refreshToken = newRefreshToken;
        localStorage.setItem(
          OKTA_TOKEN_STORAGE_KEY,
          JSON.stringify(oktaTokenParsed)
        );
      }

      if (refreshResponseTokensJson?.access_token) {
        setAccessToken(refreshResponseTokensJson?.access_token); //seting the in memory token as the new one as well.
      }

      return {
        accessToken: refreshResponseTokensJson?.access_token,
        refreshToken: refreshResponseTokensJson?.refresh_token,
      };
    } else {
      throw new Error("Failed to refresh tokens.");
    }
  }
};

export const handleLoginAndRedirect = async () => {
  window.location.href = config.oidc.redirectUri;
};

export const BE_API_ENDPOINT = process.env.REACT_APP_BE_API_ENDPOINT || "";



const getHeaders = (): HeadersObject => {
  const headers: HeadersObject = {
    "Content-Type": "application/json",
  }
  if (accessToken?.value) {
    headers.Authorization = `Bearer ${accessToken.value}`
  }
  return headers
}

export const getRequest = (baseUrl: string): Promise<any> => {
  return fetch(baseUrl, {
    method: "GET",
    headers: getHeaders(),
  })
}

export const authenticatedGetRequest = async (
  baseUrl: string,
): Promise<any> => {
  // console.log(baseUrl)
  try {
    const response = await fetchWithRetry(baseUrl, {
      method: "GET",
      headers: getHeaders(),
    })
    return response
  } catch (error) {
    console.log("Request failed:", error)
    throw new Error("Request failed.")
  }
}

export const authenticatedPostJsonRequest = async (baseUrl: string, data: any): Promise<any> => {
  try {
    const response = await fetchWithRetry(baseUrl, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return response
  } catch (error) {
    console.log("Request failed:", error)
    throw new Error("Request failed.")
  }
}

const fetchWithRetry = async (url: string, options: any, retryCount = 0): Promise<Response> => {
  const response = await fetch(url, options)
  const responseToJson = await response.json()

  if (response.status === 400) {
    throw new ClientError(responseToJson.message || responseToJson.errors || "Bad request.")
  } else if (response.status === 500) {
    throw new ClientError(responseToJson.message || "Internal server error.")
  }

  if (responseToJson.messageCode === "TE401") {
    if (retryCount < 3) {
      try {
        await refreshOktaTokens()

        if (accessToken?.value) {
          options.headers.Authorization = `Bearer ${accessToken.value}`
        }

        return fetchWithRetry(url, options, retryCount + 1) //recursion!
      } catch (error) {
        handleLoginAndRedirect()
        throw new Error("Token refresh failed.")
      }
    } else {
      throw new Error("Max retry attempts exceeded.")
    }
  } else {
    return responseToJson
  }
}