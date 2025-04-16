/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
