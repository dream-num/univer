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

import type { ICommandInfo, IDisposable } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import { CommandType, ICommandService, Injector } from '@univerjs/core';
import { SetFormulaCalculationStopMutation } from '@univerjs/engine-formula';
import { TriggerCalculationController } from '@univerjs/sheets-formula';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaProgressBar } from '../FormulaProgress';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface ITestProgress {
    done: number;
    count: number;
    label?: string;
}

class TestCommandService {
    readonly executed: Array<{ id: string; params?: unknown }> = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.executed.push({ id, params });
        return Promise.resolve(true);
    }

    registerCommand(): IDisposable {
        return { dispose: () => {} };
    }

    registerMultipleCommand(): IDisposable {
        return { dispose: () => {} };
    }

    beforeCommandExecuted() {
        return { dispose: () => {} };
    }

    onCommandExecuted() {
        return { dispose: () => {} };
    }

    syncExecuteCommand(): boolean {
        return true;
    }

    setCommandExecutedListener(): void {}

    getCommands(): Map<string, ICommandInfo> {
        return new Map();
    }

    getCommand(): ICommandInfo {
        return { id: 'test.command', type: CommandType.OPERATION };
    }
}

class TestTriggerCalculationController {
    private readonly _progress$ = new BehaviorSubject<ITestProgress>({ done: 2, count: 5, label: 'Calculating' });
    readonly progress$ = this._progress$.asObservable();
    cleared = 0;

    setProgress(progress: ITestProgress): void {
        this._progress$.next(progress);
    }

    clearProgress(): void {
        this.cleared += 1;
        this._progress$.next({ done: 0, count: 0 });
    }
}

function createProgressTestBed() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([TriggerCalculationController, { useClass: TestTriggerCalculationController as never }]);

    return {
        injector,
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
        controller: injector.get(TriggerCalculationController) as unknown as TestTriggerCalculationController,
    };
}

describe('FormulaProgressBar', () => {
    let container: HTMLDivElement;
    let root: Root;
    let requestAnimationFrameDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        requestAnimationFrameDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestAnimationFrame');
        Object.defineProperty(globalThis, 'requestAnimationFrame', {
            configurable: true,
            value: (callback: FrameRequestCallback) => {
                callback(0);
                return 1;
            },
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        if (requestAnimationFrameDescriptor) {
            Object.defineProperty(globalThis, 'requestAnimationFrame', requestAnimationFrameDescriptor);
        } else {
            delete (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame;
        }
    });

    function renderProgress(injector: Injector) {
        act(() => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <FormulaProgressBar />
                </RediContext.Provider>
            );
        });
    }

    it('sends the stop-calculation command when the user terminates progress', async () => {
        const { commandService, injector } = createProgressTestBed();

        renderProgress(injector);

        const closeButton = container.querySelector('button') as HTMLButtonElement;
        expect(closeButton).toBeDefined();

        await act(async () => {
            closeButton.click();
            await Promise.resolve();
        });

        expect(commandService.executed).toEqual([
            { id: SetFormulaCalculationStopMutation.id, params: undefined },
        ]);
    });

    it('clears progress after a completed progress transition ends', async () => {
        const { controller, injector } = createProgressTestBed();

        renderProgress(injector);

        await act(async () => {
            controller.setProgress({ done: 3, count: 3, label: 'Done' });
            await Promise.resolve();
        });

        const progressBarInner = Array.from(container.querySelectorAll('div'))
            .find((node) => node.style.width === '100%') as HTMLDivElement | undefined;
        expect(progressBarInner).toBeDefined();

        await act(async () => {
            progressBarInner!.dispatchEvent(new Event('transitionend', { bubbles: true }));
            await Promise.resolve();
        });

        expect(controller.cleared).toBe(1);
    });

    it('keeps in-progress calculation visible until completion finishes transitioning', async () => {
        const { controller, injector } = createProgressTestBed();

        renderProgress(injector);

        await act(async () => {
            controller.setProgress({ done: 1, count: 2, label: 'Halfway' });
            await Promise.resolve();
        });

        const progressBarInner = Array.from(container.querySelectorAll('div'))
            .find((node) => node.style.width === '50%') as HTMLDivElement | undefined;
        expect(progressBarInner).toBeDefined();

        await act(async () => {
            progressBarInner!.dispatchEvent(new Event('transitionend', { bubbles: true }));
            await Promise.resolve();
        });

        expect(controller.cleared).toBe(0);
        expect(container.textContent).toContain('Halfway');

        await act(async () => {
            controller.setProgress({ done: 2, count: 2, label: 'Done' });
            await Promise.resolve();
        });

        expect(progressBarInner!.style.width).toBe('100%');

        await act(async () => {
            progressBarInner!.dispatchEvent(new Event('transitionend', { bubbles: true }));
            await Promise.resolve();
        });

        expect(controller.cleared).toBe(1);
    });
});
