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
import type { IMessageProps } from './Message';
import { useEffect } from 'react';
import { Button } from '../button/Button';
import { message, Messager, MessageType, removeMessage } from './Message';

const meta: Meta<typeof Messager> = {
    title: 'Components / Message',
    component: Messager,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

const lightPreset: IMessageProps[] = [
    {
        id: 'story-message-light-success',
        type: MessageType.Success,
        content: 'Workbook synchronized and saved to cloud.',
        duration: Infinity,
    },
    {
        id: 'story-message-light-info',
        type: MessageType.Info,
        content: '12 collaborators are editing this sheet in real time.',
        duration: Infinity,
    },
    {
        id: 'story-message-light-warning',
        type: MessageType.Warning,
        content: 'Formula references contain 3 circular dependencies.',
        duration: Infinity,
    },
    {
        id: 'story-message-light-error',
        type: MessageType.Error,
        content: 'Auto-save failed. Retrying in 15 seconds.',
        duration: Infinity,
    },
];

const darkPreset: IMessageProps[] = [
    {
        id: 'story-message-dark-success',
        type: MessageType.Success,
        content: 'Chart theme switched to Night Analytics.',
        duration: Infinity,
    },
    {
        id: 'story-message-dark-info',
        type: MessageType.Info,
        content: 'Background sync is active for 8 connected data sources.',
        duration: Infinity,
    },
    {
        id: 'story-message-dark-warning',
        type: MessageType.Warning,
        content: 'Large pivot table may impact performance on older devices.',
        duration: Infinity,
    },
    {
        id: 'story-message-dark-loading',
        type: MessageType.Loading,
        content: 'Rebuilding dependency graph and recalculating formulas...',
        duration: Infinity,
    },
];

const edgePreset: IMessageProps[] = [
    {
        id: 'story-message-edge-long',
        type: MessageType.Info,
        content: 'Publishing in progress. We are validating named ranges, chart bindings, permission rules, and comment threads before exposing this workbook to external viewers.',
        duration: Infinity,
    },
    {
        id: 'story-message-edge-loading',
        type: MessageType.Loading,
        content: 'Importing 24,392 rows from data warehouse...',
        duration: Infinity,
    },
];

function MessageStoryShell({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
    return (
        <section
            className={`
              univer-relative univer-min-h-[520px] univer-overflow-hidden univer-bg-gradient-to-br univer-from-slate-100
              univer-via-cyan-50 univer-to-blue-100 univer-p-8
            `}
        >
            <div
                className={`
                  univer-border-white/70 univer-bg-white/80 univer-mx-auto univer-max-w-5xl univer-rounded-3xl
                  univer-border univer-border-solid univer-p-8 univer-shadow-[0_30px_60px_-35px_rgba(15,23,42,0.55)]
                  univer-backdrop-blur-xl
                `}
            >
                <h2
                    className="
                      univer-m-0 univer-font-sans univer-text-2xl univer-font-semibold univer-tracking-tight
                      univer-text-slate-800
                    "
                >
                    {title}
                </h2>
                <p
                    className="
                      univer-mb-0 univer-mt-2 univer-max-w-2xl univer-font-sans univer-text-sm univer-leading-6
                      univer-text-slate-600
                    "
                >
                    {description}
                </p>
                <div className="univer-mt-6">{children}</div>
            </div>
        </section>
    );
}

function PresetMessages({ theme, preset }: { theme: 'light' | 'dark'; preset: IMessageProps[] }) {
    useEffect(() => {
        preset.forEach((item) => item.id && removeMessage(item.id));
        preset.forEach((item) => message(item));

        return () => {
            preset.forEach((item) => item.id && removeMessage(item.id));
        };
    }, [preset]);

    return <Messager theme={theme} />;
}

export const InteractivePlayground = {
    render: () => {
        const handleOpen = (type: MessageType, content: string, duration?: number) => {
            message({ type, content, duration });
        };

        return (
            <MessageStoryShell
                title="Message Interaction Lab"
                description="A modern toast playground for manual QA. Includes quick triggers, long-content coverage, and persistent loading state checks."
            >
                <div className="univer-flex univer-flex-wrap univer-gap-3">
                    <Button variant="primary" onClick={() => handleOpen(MessageType.Success, 'Dataset exported as CSV.')}>
                        Trigger Success
                    </Button>
                    <Button onClick={() => handleOpen(MessageType.Info, '3 filters applied to the current view.')}>
                        Trigger Info
                    </Button>
                    <Button onClick={() => handleOpen(MessageType.Warning, 'Some values were rounded during import.')}>
                        Trigger Warning
                    </Button>
                    <Button variant="danger" onClick={() => handleOpen(MessageType.Error, 'Permission denied for this operation.')}>
                        Trigger Error
                    </Button>
                    <Button onClick={() => handleOpen(MessageType.Loading, 'Syncing workbook metadata...', Infinity)}>
                        Trigger Loading
                    </Button>
                    <Button onClick={() => removeMessage()}>Clear All</Button>
                </div>
                <div
                    className="
                      univer-mt-4 univer-grid univer-gap-3
                      md:univer-grid-cols-2
                    "
                >
                    <div className="univer-rounded-2xl univer-bg-slate-100/80 univer-p-4">
                        <p
                            className="
                              univer-m-0 univer-text-xs univer-font-medium univer-uppercase univer-tracking-wide
                              univer-text-slate-500
                            "
                        >
                            Visual checks
                        </p>
                        <p className="univer-mb-0 univer-mt-2 univer-text-sm univer-text-slate-700">
                            Check stacking order, icon color contrast, and long-text wrapping in both compact and dense bursts.
                        </p>
                    </div>
                    <div className="univer-rounded-2xl univer-bg-sky-100/70 univer-p-4">
                        <p
                            className="
                              univer-m-0 univer-text-xs univer-font-medium univer-uppercase univer-tracking-wide
                              univer-text-sky-700
                            "
                        >
                            Interaction checks
                        </p>
                        <p className="univer-mb-0 univer-mt-2 univer-text-sm univer-text-sky-900">
                            Verify timed dismiss, persistent loading behavior, and explicit `removeMessage()` clearing.
                        </p>
                    </div>
                </div>
                <Messager />
            </MessageStoryShell>
        );
    },
};

export const VisualRegressionLight = {
    render: () => (
        <MessageStoryShell
            title="Message Visual Baseline - Light"
            description="Deterministic snapshot with four toast types, fixed content, and persistent duration for stable visual diffing."
        >
            <PresetMessages theme="light" preset={lightPreset} />
        </MessageStoryShell>
    ),
};

export const VisualRegressionDark = {
    render: () => (
        <MessageStoryShell
            title="Message Visual Baseline - Dark"
            description="Dark theme parity validation for icon tones, elevation, border clarity, and text readability."
        >
            <div className="univer-rounded-3xl univer-bg-slate-900/90 univer-p-6">
                <PresetMessages theme="dark" preset={darkPreset} />
            </div>
        </MessageStoryShell>
    ),
};

export const LongContentAndLoading = {
    render: () => (
        <MessageStoryShell
            title="Message Edge Cases"
            description="Regression scene for long-copy wrapping, persistent loading rhythm, and overlap spacing under mixed priority messages."
        >
            <PresetMessages theme="light" preset={edgePreset} />
        </MessageStoryShell>
    ),
};
