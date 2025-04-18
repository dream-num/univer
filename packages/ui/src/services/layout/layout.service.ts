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

import type { ContextService, IDisposable, Nullable } from '@univerjs/core';
import { createIdentifier, Disposable, DocumentDataModel, FOCUSING_UNIVER_EDITOR, IContextService, IUniverInstanceService, remove, SlideDataModel, toDisposable, UniverInstanceType, Workbook } from '@univerjs/core';
import { fromEvent } from 'rxjs';

type FocusHandlerFn = (unitId: string) => void;

export const FOCUSING_UNIVER = 'FOCUSING_UNIVER';
const givingBackFocusElements = [
    'app-layout',
    // 'univer-toolbar-btn',
    // 'univer-menu-item',
    'button',
    'sheet-bar-append-button',
    'render-canvas',
    'workbench-layout',
];

export interface ILayoutService {
    readonly isFocused: boolean;

    get rootContainerElement(): Nullable<HTMLElement>;
    /** Re-focus the currently focused Univer business instance. */
    focus(): void;

    /** Register a focus handler to focus on certain type of Univer unit. */
    registerFocusHandler(type: UniverInstanceType, handler: FocusHandlerFn): IDisposable;
    /** Register the root container element. */
    registerRootContainerElement(container: HTMLElement): IDisposable;
    /** Register a content element. */
    registerContentElement(container: HTMLElement): IDisposable;
    /** Register an element as a container, especially floating components like Dialogs and Notifications. */
    registerContainerElement(container: HTMLElement): IDisposable;

    getContentElement(): HTMLElement;

    checkElementInCurrentContainers(element: HTMLElement): boolean;
    checkContentIsFocused(): boolean;
}
export const ILayoutService = createIdentifier<ILayoutService>('ui.layout-service');

/**
 * This service is responsible for storing layout information of the current
 * Univer application instance.
 */
export class DesktopLayoutService extends Disposable implements ILayoutService {
    private _rootContainerElement: Nullable<HTMLElement> = null;
    private _isFocused = false;

    get isFocused(): boolean {
        return this._isFocused;
    }

    private readonly _focusHandlers = new Map<UniverInstanceType, FocusHandlerFn>();

    // FIXME: this don't need to be plural
    private _contentElements: HTMLElement[] = [];
    private _allContainers: HTMLElement[] = [];

    constructor(
        @IContextService private readonly _contextService: ContextService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initUniverFocusListener();
        this._initEditorStatus();
    }

    get rootContainerElement() {
        return this._rootContainerElement;
    }

    focus(): void {
        const currentFocused = this._univerInstanceService.getFocusedUnit();
        if (!currentFocused) {
            return;
        }

        let handler: Nullable<FocusHandlerFn>;
        if (currentFocused instanceof Workbook) {
            handler = this._focusHandlers.get(UniverInstanceType.UNIVER_SHEET);
        } else if (currentFocused instanceof DocumentDataModel) {
            handler = this._focusHandlers.get(UniverInstanceType.UNIVER_DOC);
        } else if (currentFocused instanceof SlideDataModel) {
            handler = this._focusHandlers.get(UniverInstanceType.UNIVER_SLIDE);
        }

        if (handler) {
            handler(currentFocused.getUnitId());
        }
    }

    registerFocusHandler(type: UniverInstanceType, handler: FocusHandlerFn): IDisposable {
        if (this._focusHandlers.has(type)) {
            throw new Error(`[DesktopLayoutService]: handler of type ${type} bas been registered!`);
        }

        this._focusHandlers.set(type, handler);
        return toDisposable(() => this._focusHandlers.delete(type));
    }

    registerContentElement(container: HTMLElement): IDisposable {
        if (this._contentElements.indexOf(container) === -1) {
            this._contentElements.push(container);
            return toDisposable(() => remove(this._contentElements, container));
        }

        throw new Error('[DesktopLayoutService]: content container already registered!');
    }

    getContentElement(): HTMLElement {
        return this._contentElements[0];
    }

    registerRootContainerElement(container: HTMLElement): IDisposable {
        if (this._rootContainerElement) {
            throw new Error('[DesktopLayoutService]: root container already registered!');
        }

        this._rootContainerElement = container;
        const dis = this.registerContainerElement(container);

        return toDisposable(() => {
            this._rootContainerElement = null;
            dis.dispose();
        });
    }

    registerContainerElement(container: HTMLElement): IDisposable {
        if (this._allContainers.indexOf(container) === -1) {
            this._allContainers.push(container);
            return toDisposable(() => remove(this._allContainers, container));
        }

        throw new Error('[LayoutService]: container already registered!');
    }

    checkElementInCurrentContainers(element: HTMLElement): boolean {
        return this._allContainers.some((container) => container.contains(element));
    }

    checkContentIsFocused(): boolean {
        return this._contentElements.some((contentEl) => contentEl === document.activeElement || contentEl.contains(document.activeElement));
    }

    private _initUniverFocusListener(): void {
        this.disposeWithMe(
            fromEvent(window, 'focusin').subscribe((event) => {
                const target = event.target as HTMLElement;

                if (this._rootContainerElement?.contains(target) && givingBackFocusElements.some((item) => target.dataset.uComp === item)) {
                    queueMicrotask(() => this.focus());
                    return;
                }

                if (target && this.checkElementInCurrentContainers(target as HTMLElement)) {
                    this._isFocused = true;
                } else {
                    this._isFocused = false;
                }

                this._contextService.setContextValue(FOCUSING_UNIVER, this._isFocused);
                this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR, getFocusingUniverEditorStatus());
            })
        );
    }

    private _initEditorStatus(): void {
        this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR, getFocusingUniverEditorStatus());
    }
}

function getFocusingUniverEditorStatus(): boolean {
    return (document.activeElement as HTMLElement)?.dataset.uComp === 'editor';
}
