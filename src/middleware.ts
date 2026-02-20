import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
    locales,
    defaultLocale,
    localePrefix: "as-needed",
});

export const config = {
    matcher: [
        // Match all pathnames except API, _next, and static files
        "/((?!api|_next|.*\\..*).*)",
    ],
};
