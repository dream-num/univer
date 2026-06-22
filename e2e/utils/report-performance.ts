/* eslint-disable node/prefer-global/process */

import { PostHog } from 'posthog-node';

const SHOULD_REPORT_TO_POSTHOG = process.env.SHOULD_REPORT_TO_POSTHOG === 'true';
const GIT_HASH = process.env.GITHUB_SHA;

let client: PostHog | null = null;

/**
 * Report an event to PostHog. For Univer members, you can visit https://us.posthog.com/project/133116/dashboard/332238
 * for the dashboard.
 * @param event
 * @param properties
 * @returns {Promise<void>} A promise that resolves when the event is reported.
 */
// eslint-disable-next-line ts/no-explicit-any
export async function reportToPosthog(event: string, properties: Record<string | number, any>) {
    if (!SHOULD_REPORT_TO_POSTHOG) {
        return;
    }

    if (!client) {
        const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
        if (!POSTHOG_API_KEY) {
            return;
        }

        client = new PostHog(POSTHOG_API_KEY, { host: 'https://us.i.posthog.com' });
    }

    client.capture({
        timestamp: new Date(),
        event,
        distinctId: 'CI',
        properties: {
            ...properties,
            git_hash: GIT_HASH,
        },
    });

    await client.flush();
}

export async function shutdownPosthog() {
    if (client) {
        await client.shutdown();
        client = null;
    }
}
