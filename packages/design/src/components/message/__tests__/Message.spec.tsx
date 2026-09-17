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

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { message, Messager, MessageType, removeMessage } from '../Message';

function InitialWarning() {
    useEffect(() => {
        const id = message({ content: 'Initial collision warning', type: MessageType.Warning, duration: Infinity });
        return () => removeMessage(id);
    }, []);
    return null;
}

afterEach(() => {
    cleanup();
    removeMessage();
});

it('delivers a warning emitted by an earlier sibling effect during toaster mounting', async () => {
    render(
        <>
            <InitialWarning />
            <Messager />
        </>
    );
    expect(await screen.findByText('Initial collision warning')).toBeTruthy();
});

it('cancels a queued message without cancelling another message', async () => {
    render(<Messager />);
    const cancelled = message({ content: 'Cancelled warning', duration: Infinity });
    removeMessage(cancelled);
    message({ content: 'Surviving warning', duration: Infinity });
    expect(await screen.findByText('Surviving warning')).toBeTruthy();
    expect(screen.queryByText('Cancelled warning')).toBeNull();
});

it('cancels all queued messages before a later message is shown', async () => {
    render(<Messager />);
    message({ content: 'First cancelled warning', duration: Infinity });
    message({ content: 'Second cancelled warning', duration: Infinity });
    removeMessage();
    message({ content: 'New warning', duration: Infinity });
    expect(await screen.findByText('New warning')).toBeTruthy();
    expect(screen.queryByText('First cancelled warning')).toBeNull();
    expect(screen.queryByText('Second cancelled warning')).toBeNull();
});

it('keeps the latest update when a queued message id is reused', async () => {
    render(<Messager />);
    const id = message({ id: 'updated-warning', content: 'Outdated warning', duration: Infinity });
    removeMessage(id);
    expect(message({ id, content: 'Current warning', duration: Infinity })).toBe(id);
    expect(await screen.findByText('Current warning')).toBeTruthy();
    expect(screen.queryByText('Outdated warning')).toBeNull();
});

it('closes a displayed message once when disposed repeatedly', async () => {
    render(<Messager />);
    const onClose = vi.fn();
    const id = message({ content: 'Closable warning', duration: Infinity, onClose });
    expect(await screen.findByText('Closable warning')).toBeTruthy();
    removeMessage(id);
    removeMessage(id);
    await waitFor(() => expect(screen.queryByText('Closable warning')).toBeNull());
    expect(onClose).toHaveBeenCalledTimes(1);
});

it.each([
    { all: false, reuse: false },
    { all: true, reuse: false },
    { all: false, reuse: true },
])('does not resurrect a cancelled message when animation frames precede timers ($all, $reuse)', async ({ all, reuse }) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
    try {
        render(<Messager />);
        const id = message({ content: 'Cancelled before mount', duration: Infinity });
        await act(async () => {
            await Promise.resolve();
        });
        removeMessage(all ? undefined : id);
        message({ content: 'Independent warning', duration: Infinity });
        if (reuse) {
            message({ id, content: 'Replacement warning', duration: Infinity });
        }
        await act(async () => {
            while (frames.length) {
                frames.shift()!(performance.now());
            }
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
        });
        await act(async () => {
            while (frames.length) {
                frames.shift()!(performance.now());
            }
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
        });
        expect(screen.queryByText('Cancelled before mount')).toBeNull();
        expect(screen.queryByText('Independent warning')).not.toBeNull();
        if (reuse) {
            expect(screen.queryByText('Replacement warning')).not.toBeNull();
        }
    } finally {
        await act(async () => {
            removeMessage();
            await vi.runOnlyPendingTimersAsync();
            while (frames.length) {
                frames.shift()!(performance.now());
            }
            await vi.runOnlyPendingTimersAsync();
        });
        cleanup();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    }
});
