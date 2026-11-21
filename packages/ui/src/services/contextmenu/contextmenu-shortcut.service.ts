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
import { KeyCode, MetaKeys } from '../shortcut/keycode';
import { IShortcutService } from '../shortcut/shortcut.service';

type ContextMenuShortcutResolver = (target: HTMLElement) => (() => boolean) | undefined;

export interface IContextMenuShortcutService {
    register(resolve: ContextMenuShortcutResolver): IDisposable;
}

export const IContextMenuShortcutService = createIdentifier<IContextMenuShortcutService>('ui.contextmenu.shortcut.service');

export class ContextMenuShortcutService extends Disposable implements IContextMenuShortcutService {
    private readonly _resolvers = new Set<ContextMenuShortcutResolver>();

    constructor(
        @ICommandService commandService: ICommandService,
        @IShortcutService shortcutService: IShortcutService
    ) {
        super();

        const id = 'ui.operation.open-context-menu';
        this.disposeWithMe(commandService.registerCommand({
            id,
            type: CommandType.OPERATION,
            handler: () => this._resolve(document.activeElement)?.() ?? false,
        }));

        for (const binding of [KeyCode.F10 | MetaKeys.SHIFT, KeyCode.CONTEXT_MENU]) {
            this.disposeWithMe(shortcutService.registerShortcut({
                id,
                binding,
                description: 'ui.featureSearch.contextMenu',
                group: binding === KeyCode.CONTEXT_MENU ? undefined : '10_global-shortcut',
                groupTitle: 'ui.global-shortcut',
                eventPreconditions: (event) => !event.repeat && !!this._resolve(event.target),
            }));
        }
    }

    register(resolve: ContextMenuShortcutResolver): IDisposable {
        this._resolvers.add(resolve);
        return toDisposable(() => this._resolvers.delete(resolve));
    }

    private _resolve(target: EventTarget | null): (() => boolean) | undefined {
        if (!(target instanceof HTMLElement) || target.closest('[data-u-context-menu-panel], [data-u-context-menu-submenu], [role="menu"]')) {
            return;
        }

        for (const resolve of this._resolvers) {
            const open = resolve(target);
            if (open) {
                return open;
            }
        }
    }
}
