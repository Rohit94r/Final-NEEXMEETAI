export function getSafeCallbackUrl(callbackUrl?: string | string[]) {
  const rawValue = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  if (!rawValue || rawValue === "/" || rawValue === "/sign-in" || rawValue === "/sign-up") {
    return "/dashboard";
  }

  return rawValue.startsWith("/") ? rawValue : "/dashboard";
}
