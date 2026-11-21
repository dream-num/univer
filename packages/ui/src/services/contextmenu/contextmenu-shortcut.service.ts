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
import { CommandType, Disposable, ICommandService, toDisposable } from '@univerjs/core';
import { KeyCode, MetaKeys } from '../shortcut/keycode';
import { IShortcutService } from '../shortcut/shortcut.service';
import { IContextMenuService } from './contextmenu.service';

type ContextMenuShortcutResolver = (target: HTMLElement) => ((event: MouseEvent) => boolean) | undefined;

/** Registers the focused editing surface that owns the keyboard context menu. */
export class ContextMenuShortcutService extends Disposable {
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
            handler: () => {
                const target = document.activeElement;
                const open = this._resolve(target);
                if (!open || !target) {
                    return false;
                }
                const rect = target.getBoundingClientRect();
                const offset = target.closest('[data-u-context-menu-trigger]') ? 8 : Infinity;
                return open(new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    button: 2,
                    clientX: rect.left + Math.min(offset, rect.width / 2),
                    clientY: rect.top + Math.min(offset, rect.height / 2),
                }));
            },
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

    private _resolve(target: Element | null): ReturnType<ContextMenuShortcutResolver> {
        if (this._contextMenuService.disabled || !(target instanceof HTMLElement)) {
            return;
        }

        if (target.closest('[data-u-context-menu-trigger]') && !target.isContentEditable
            && !target.matches('input:not([type="checkbox"]), textarea, select')) {
            return (event) => !target.dispatchEvent(event);
        }

        for (const [resolve] of [...this._resolvers].sort((a, b) => b[1] - a[1])) {
            const open = resolve(target);
            if (open) {
                return open;
            }
        }
    }
}
