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

import type { IDisposable } from '@univerjs/core';
import { CommandType, createIdentifier, Disposable, ICommandService, toDisposable } from '@univerjs/core';
import type { ContextMenuEvent } from './contextmenu.service';
import { KeyCode, MetaKeys } from '../shortcut/keycode';
import { IShortcutService } from '../shortcut/shortcut.service';
import { IContextMenuService } from './contextmenu.service';

type ContextMenuShortcutResolver = (target: HTMLElement) => ((event: ContextMenuEvent) => boolean) | undefined;

export interface IContextMenuShortcutService {
    register(resolve: ContextMenuShortcutResolver, priority?: number): IDisposable;
    registerElement(element: HTMLElement, open: () => void): IDisposable;
}

export const IContextMenuShortcutService = createIdentifier<IContextMenuShortcutService>('ui.contextmenu-shortcut.service');

/** Registers the focused editing surface that owns the keyboard context menu. */
export class ContextMenuShortcutService extends Disposable implements IContextMenuShortcutService {
    private readonly _elements = new WeakMap<HTMLElement, () => void>();
    private readonly _resolvers = new Map<ContextMenuShortcutResolver, number>();

    constructor(
        @ICommandService commandService: ICommandService,
        @IShortcutService shortcutService: IShortcutService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService
    ) {
        super();

        const id = 'ui.operation.open-context-menu';
        this.disposeWithMe(commandService.registerCommand({
            id,
            type: CommandType.OPERATION,
            handler: () => this._resolve(document.activeElement)?.() ?? false,
        }));

        this.disposeWithMe(shortcutService.registerShortcut({
            id,
            binding: KeyCode.F10 | MetaKeys.SHIFT,
            description: 'ui.featureSearch.contextMenu',
            group: '10_global-shortcut',
            groupTitle: 'ui.global-shortcut',
            eventPreconditions: (event) => !event.repeat && event.target === document.activeElement && !!this._resolve(document.activeElement),
        }));
    }

    /** A selected object or table cell can take precedence over its canvas. */
    register(resolve: ContextMenuShortcutResolver, priority = 0): IDisposable {
        this._resolvers.set(resolve, priority);
        return toDisposable(() => this._resolvers.delete(resolve));
    }

    registerElement(element: HTMLElement, open: () => void): IDisposable {
        this._elements.set(element, open);
        return toDisposable(() => {
            if (this._elements.get(element) === open) {
                this._elements.delete(element);
            }
        });
    }

    private _resolve(target: Element | null): (() => boolean) | undefined {
        if (this._contextMenuService.disabled || !(target instanceof HTMLElement)) {
            return;
        }

        if (!target.isContentEditable && !target.matches('input:not([type="checkbox"]), textarea, select')) {
            for (let element: HTMLElement | null = target; element; element = element.parentElement) {
                const open = this._elements.get(element);
                if (open) {
                    return () => {
                        open();
                        return true;
                    };
                }
            }
        }

        for (const [resolve] of [...this._resolvers].sort((a, b) => b[1] - a[1])) {
            const open = resolve(target);
            if (open) {
                return () => {
                    const rect = target.getBoundingClientRect();
                    return open({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, stopPropagation() {} });
                };
            }
        }
    }
}
