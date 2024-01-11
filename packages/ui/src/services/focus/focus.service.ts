/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ContextService, Nullable } from '@univerjs/core';
import { Disposable, IContextService, ILogService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { fromEvent } from 'rxjs';

/**
 * FocusService manages focusing state of the Univer application instance.
 */
export const IFocusService = createIdentifier<IFocusService>('univer.focus-service');
export interface IFocusService {
    readonly isFocused: boolean;

    forceFocus(): void;
    setContainerElement(container: HTMLElement): void;
}

export const FOCUSING_UNIVER = 'FOCUSING_UNIVER';

@OnLifecycle(LifecycleStages.Ready, IFocusService)
export class DesktopFocusService extends Disposable implements IFocusService {
    private _containerElement: Nullable<HTMLElement> = null;

    private _isUniverFocused = true;

    get isFocused(): boolean {
        return this._isUniverFocused;
    }

    constructor(
        @IContextService private readonly _contextService: ContextService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._initFocusListener();
        // TODO: we may call context service to set context values
    }

    override dispose(): void {
        super.dispose();

        this._containerElement = null;
    }

    setContainerElement(container: HTMLElement): void {
        this._containerElement = container;
    }

    forceFocus(): void {
        // TODO@Jocs: should focus the focused element's input handler
        setTimeout(() => this._containerElement?.focus(), 16);
    }

    private _initFocusListener(): void {
        this.disposeWithMe(
            toDisposable(
                fromEvent(window, 'focusin').subscribe((event) => {
                    if (event.target && this._containerElement?.contains(event.target as Node)) {
                        this._isUniverFocused = true;
                    } else {
                        this._isUniverFocused = false;
                    }

                    this._contextService.setContextValue(FOCUSING_UNIVER, this._isUniverFocused);
                })
            )
        );
    }
}
