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

import type { Meta } from '@storybook/react';
import { Button, toast, Toaster } from '@univerjs/design';
import { useEffect } from 'react';

import { notification, Notification } from './Notification';

const meta: Meta<typeof Notification> = {
    title: 'Components / Notification',
    component: Notification,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

function NotificationStoryShell({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
    return (
        <section
            className={`
              univer-relative univer-min-h-[560px] univer-overflow-hidden univer-bg-gradient-to-tr univer-from-slate-950
              univer-via-blue-950 univer-to-cyan-900 univer-p-8
            `}
        >
            <div
                className={`
                  univer-border-white/20 univer-bg-white/10 univer-mx-auto univer-max-w-5xl univer-rounded-3xl
                  univer-border univer-border-solid univer-p-8 univer-backdrop-blur-xl
                `}
            >
                <h2
                    className="
                      univer-m-0 univer-font-sans univer-text-2xl univer-font-semibold univer-tracking-tight
                      univer-text-white
                    "
                >
                    {title}
                </h2>
                <p
                    className="
                      univer-mb-0 univer-mt-2 univer-max-w-3xl univer-font-sans univer-text-sm univer-leading-6
                      univer-text-slate-200
                    "
                >
                    {description}
                </p>
                <div className="univer-mt-6">{children}</div>
            </div>
        </section>
    );
}

function SeedNotifications({ seed }: { seed: 'light' | 'dark' | 'positions' | 'edge' }) {
    useEffect(() => {
        toast.dismiss();

        if (seed === 'light') {
            notification.show({
                type: 'success',
                title: 'Publishing complete',
                content: 'Dashboard release v2.3 is now live for all users.',
                duration: Infinity,
            });
            notification.show({
                type: 'info',
                title: 'Background processing active',
                content: 'Processing 1,284 queued automation jobs.',
                duration: Infinity,
            });
            notification.show({
                type: 'warning',
                title: 'Quota nearly reached',
                content: 'Storage usage is at 92%. Consider archiving old files.',
                duration: Infinity,
            });
            notification.show({
                type: 'error',
                title: 'Webhook delivery failed',
                content: 'The endpoint returned HTTP 500. Automatic retry is enabled.',
                duration: Infinity,
            });
        }

        if (seed === 'dark') {
            notification.show({
                type: 'message',
                title: 'Workspace switched to Focus mode',
                content: 'Only high-priority alerts will be displayed.',
                duration: Infinity,
            });
            notification.show({
                type: 'loading',
                title: 'Syncing cross-sheet references',
                content: 'This operation can take up to 20 seconds.',
                duration: Infinity,
            });
            notification.show({
                type: 'success',
                title: 'Snapshot saved',
                content: 'A restore point was created for this workbook.',
                duration: Infinity,
            });
        }

        if (seed === 'positions') {
            notification.show({
                type: 'success',
                title: 'Top right',
                content: 'Default placement validation.',
                position: 'top-right',
                duration: Infinity,
            });
            notification.show({
                type: 'info',
                title: 'Bottom right',
                content: 'Secondary placement validation.',
                position: 'bottom-right',
                duration: Infinity,
            });
            notification.show({
                type: 'warning',
                title: 'Top left',
                content: 'Alternative placement validation.',
                position: 'top-left',
                duration: Infinity,
            });
            notification.show({
                type: 'error',
                title: 'Bottom left',
                content: 'Edge placement validation.',
                position: 'bottom-left',
                duration: Infinity,
            });
        }

        if (seed === 'edge') {
            notification.show({
                type: 'info',
                title: 'Long content wrap',
                content: 'Validation in progress for permission inheritance, named range collisions, dependency graph integrity, and localized number formats across all sheets in this workbook.',
                duration: Infinity,
            });
            notification.show({
                type: 'loading',
                title: 'Importing transaction records',
                content: 'Current stage: deduplication, schema mapping, and formula reconciliation.',
                duration: Infinity,
            });
        }

        return () => {
            toast.dismiss();
        };
    }, [seed]);

    return null;
}

export const InteractivePlayground = {
    render: () => (
        <NotificationStoryShell
            title="Notification Interaction Lab"
            description="Manual QA scene with actions for all severity levels, persistent loading, and instant cleanup for rapid regression checks."
        >
            <div className="univer-flex univer-flex-wrap univer-gap-3">
                <Button
                    variant="primary"
                    onClick={() =>
                        notification.show({
                            title: 'Event has been created',
                            type: 'success',
                            content: 'Sunday, December 03, 2023 at 9:00 AM',
                        })}
                >
                    Trigger Success
                </Button>
                <Button
                    onClick={() =>
                        notification.show({
                            type: 'info',
                            title: 'Data pipeline update',
                            content: 'Ingestion completed for region APAC.',
                        })}
                >
                    Trigger Info
                </Button>
                <Button
                    onClick={() =>
                        notification.show({
                            type: 'warning',
                            title: 'Indexing delay detected',
                            content: 'Results may be stale for up to 3 minutes.',
                        })}
                >
                    Trigger Warning
                </Button>
                <Button
                    variant="danger"
                    onClick={() =>
                        notification.show({
                            type: 'error',
                            title: 'Notification Error',
                            content: 'Unable to connect to analytics endpoint.',
                        })}
                >
                    Trigger Error
                </Button>
                <Button
                    onClick={() =>
                        notification.show({
                            type: 'loading',
                            title: 'Rebuilding access index',
                            content: 'Please wait...',
                            duration: Infinity,
                        })}
                >
                    Trigger Loading
                </Button>
                <Button onClick={() => toast.dismiss()}>Clear All</Button>
            </div>
            <Toaster theme="dark" />
        </NotificationStoryShell>
    ),
};

export const VisualRegressionLight = {
    render: () => (
        <NotificationStoryShell
            title="Notification Visual Baseline - Light"
            description="Deterministic scene with four notification levels, fixed copy, and persistent duration for reliable snapshot comparisons."
        >
            <Toaster theme="light" />
            <SeedNotifications seed="light" />
        </NotificationStoryShell>
    ),
};

export const VisualRegressionDark = {
    render: () => (
        <NotificationStoryShell
            title="Notification Visual Baseline - Dark"
            description="Dark surface contrast baseline covering default message, loading state, and success feedback."
        >
            <Toaster theme="dark" />
            <SeedNotifications seed="dark" />
        </NotificationStoryShell>
    ),
};

export const PlacementMatrix = {
    render: () => (
        <NotificationStoryShell
            title="Notification Placement Matrix"
            description="Regression scene that validates corner placements and overlap behavior across top and bottom viewports."
        >
            <Toaster theme="dark" />
            <SeedNotifications seed="positions" />
        </NotificationStoryShell>
    ),
};

export const LongContentAndLoading = {
    render: () => (
        <NotificationStoryShell
            title="Notification Edge Cases"
            description="Long-copy wrapping, loading cadence, and content rhythm checks under constrained viewport space."
        >
            <Toaster theme="light" />
            <SeedNotifications seed="edge" />
        </NotificationStoryShell>
    ),
};
