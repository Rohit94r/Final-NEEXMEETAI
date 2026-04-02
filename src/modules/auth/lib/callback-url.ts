export function getSafeCallbackUrl(callbackUrl?: string | string[]) {
  const rawValue = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  if (!rawValue) {
    return "/";
  }

  return rawValue.startsWith("/") ? rawValue : "/";
}
