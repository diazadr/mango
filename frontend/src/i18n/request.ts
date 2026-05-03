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

  return {
    locale,
    messages: {
      ...publicMessages.default,
      ...dashboardMessages.default
    }
  };
});