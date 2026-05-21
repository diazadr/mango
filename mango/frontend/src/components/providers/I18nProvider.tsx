"use client";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

export function I18nProvider({ 
  locale,
  messages, 
  children 
}: { 
  locale: string;
  messages: AbstractIntlMessages; 
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider 
      locale={locale}
      messages={messages}
      getMessageFallback={({namespace, key, error}) => {
        return [namespace, key].filter((part) => part != null).join('.');
      }}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') {
            return;
        }
        console.error(error);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
