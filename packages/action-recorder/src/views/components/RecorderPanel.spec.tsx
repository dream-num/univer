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

/* eslint-disable import/first */

import { describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({
    useDependency: vi.fn(),
    useObservable: vi.fn(),
    callbacks: [] as Array<(...args: unknown[]) => unknown>,
}));

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        useDependency: mocked.useDependency,
        useObservable: mocked.useObservable,
    };
});

vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useCallback: <T extends (...args: never[]) => unknown>(fn: T) => {
            mocked.callbacks.push(fn as unknown as (...args: unknown[]) => unknown);
            return fn;
        },
    };
});

import { ICommandService } from '@univerjs/core';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from '../../commands/commands/record.command';
import { CloseRecordPanelOperation } from '../../commands/operations/operation';
import { RecorderPanel } from './RecorderPanel';

function getButtonsFromPanel(panelElement: {
    props: { children: Array<{ props: Record<string, unknown> }> };
}) {
    const buttonContainer = panelElement.props.children[2] as {
        props: { children: Array<{ props: { onClick: () => void } }> };
    };
    return buttonContainer.props.children;
}

describe('RecorderPanel', () => {
    it('should return null when panel is closed', () => {
        mocked.useDependency.mockReturnValue({ panelOpened$: {} });
        mocked.useObservable.mockReturnValue(false);
        expect(RecorderPanel()).toBeNull();
    });

    it('should trigger close/start/start(N) commands when not recording', () => {
        mocked.callbacks.length = 0;
        const executeCommand = vi.fn();
        mocked.useDependency.mockImplementation((token: unknown) => {
            if (token === ICommandService) {
                return { executeCommand };
            }
            return { panelOpened$: {}, recording$: {}, recordedCommands$: {} };
        });
        mocked.useObservable
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce([]);

        const root = RecorderPanel() as { type: (props: unknown) => unknown; props: unknown };
        const panelElement = root.type(root.props) as {
            props: { children: Array<{ props: Record<string, unknown> }> };
        };
        const buttons = getButtonsFromPanel(panelElement);

        buttons[0].props.onClick();
        buttons[1].props.onClick();
        buttons[2].props.onClick();
        mocked.callbacks[2]();
        mocked.callbacks[3]();

        expect(executeCommand).toHaveBeenCalledWith(CloseRecordPanelOperation.id);
        expect(executeCommand).toHaveBeenCalledWith(StartRecordingActionCommand.id, { replaceId: undefined });
        expect(executeCommand).toHaveBeenCalledWith(StartRecordingActionCommand.id, { replaceId: true });
    });

    it('should trigger cancel/save commands when recording', () => {
        mocked.callbacks.length = 0;
        const executeCommand = vi.fn();
        mocked.useDependency.mockImplementation((token: unknown) => {
            if (token === ICommandService) {
                return { executeCommand };
            }
            return { panelOpened$: {}, recording$: {}, recordedCommands$: {} };
        });
        mocked.useObservable
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce([{ id: 'last.command' }]);

        const root = RecorderPanel() as { type: (props: unknown) => unknown; props: unknown };
        const panelElement = root.type(root.props) as {
            props: { children: Array<{ props: Record<string, unknown> }> };
        };
        const buttons = getButtonsFromPanel(panelElement);

        buttons[0].props.onClick();
        buttons[1].props.onClick();
        mocked.callbacks[0]();
        mocked.callbacks[1](true);

        expect(executeCommand).toHaveBeenCalledWith(StopRecordingActionCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(CompleteRecordingActionCommand.id);
    });

    it('should show recording placeholder title when command list is empty/undefined', () => {
        mocked.callbacks.length = 0;
        mocked.useDependency.mockImplementation((token: unknown) => {
            if (token === ICommandService) {
                return { executeCommand: vi.fn() };
            }
            return { panelOpened$: {}, recording$: {}, recordedCommands$: {} };
        });
        mocked.useObservable
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(undefined);

        const root = RecorderPanel() as { type: (props: unknown) => unknown; props: unknown };
        const panelElement = root.type(root.props) as {
            props: { children: Array<{ props: { children: unknown } }> };
        };
        const title = panelElement.props.children[1].props.children;
        expect(title).toBe('Recording...');
    });
});
