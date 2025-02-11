import { OAuthSDK } from "nanuid-websdk";

export async function getValidToken(): Promise<string | null> {
  const currentToken = OAuthSDK.getToken();

  if (currentToken) {
    const validation = OAuthSDK.validateToken(currentToken);

    if (validation.isValid) {
      return currentToken;
    }
    
    const refreshToken = OAuthSDK.getRefreshToken();
    if (refreshToken) {
      const newToken = await OAuthSDK.reissueToken(refreshToken);
      if (newToken) {
        return newToken;
      }
    }
  }

  return null;
}
