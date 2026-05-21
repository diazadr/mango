import { BaseErrorView } from "@/src/components/common/BaseErrorView";

/**
 * Global 404 page — rendered inside root layout (app/layout.tsx).
 * html/body are provided by the root layout; this only needs the content.
 */
export default function NotFound() {
    return (
        <BaseErrorView
            statusCode={404}
            title="Page Not Found"
            description="Sorry, the page you are looking for might have been moved, deleted, or never existed in the MANGO system."
            goBackText="Go Back"
            goHomeText="Back to Home"
            useNativeLink={true}
        />
    );
}
