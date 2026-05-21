import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  const [publicMessages, dashboardMessages] = await Promise.all([
    import(`../../messages/public/${locale}.json`),
    import(`../../messages/dashboard/${locale}.json`)
  ]);

  const pMessages = publicMessages.default || {};
  const dMessages = dashboardMessages.default || {};
  const mergedMessages: any = { ...pMessages };

  for (const key of Object.keys(dMessages)) {
    if (mergedMessages[key] && typeof mergedMessages[key] === 'object' && !Array.isArray(mergedMessages[key])) {
      mergedMessages[key] = { ...mergedMessages[key], ...dMessages[key] };
    } else {
      mergedMessages[key] = dMessages[key];
    }
  }

  return {
    locale,
    messages: mergedMessages,
    getMessageFallback({namespace, key, error}) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      if (error.code === 'MISSING_MESSAGE') {
        return path;
      }
      return path;
    },
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') {
        // Completely suppress missing message errors to avoid Next.js dev overlay
        return;
      } else {
        console.error(error);
      }
    }
  };
});