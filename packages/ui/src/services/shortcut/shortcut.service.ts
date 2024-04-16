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

import { Disposable, ICommandService, IContextService, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Optional } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { fromGlobalEvent } from '../../common/lifecycle';
import { ILayoutService } from '../layout/layout.service';
import { IPlatformService } from '../platform/platform.service';
import { KeyCodeToChar, MetaKeys } from './keycode';

export interface IShortcutItem<P extends object = object> {
    /** This should reuse the corresponding command's id. */
    id: string;
    /** Description of the shortcut. */
    description?: string;

    /** If two shortcuts have the same binding, the one with higher priority would be check first. */
    priority?: number;
    /** A callback that will be triggered to examine if the shortcut should be invoked. */
    preconditions?: (contextService: IContextService) => boolean;

    /** A command can be bound to several bindings, with different static parameters perhaps. */
    binding: number;
    mac?: number;
    win?: number;
    linux?: number;

    /**
     * The group of the menu item should belong to. The shortcut item would be rendered in the
     * panel if this is set.
     */
    group?: string;

    /** Static parameters of this shortcut. Would be send to `CommandService.executeCommand`. */
    staticParameters?: P;
}

export interface IShortcutService {
    shortcutChanged$: Observable<void>;

    forceEscape(): IDisposable;
    // registerCaptureSelector(selector: string): IDisposable;
    // registerEscapeSelector(selector: string): IDisposable;

    registerShortcut(shortcut: IShortcutItem): IDisposable;
    getShortcutDisplay(shortcut: IShortcutItem): string;
    getShortcutDisplayOfCommand(id: string): string | null;
    getAllShortcuts(): IShortcutItem[];
    setDisable(disable: boolean): void;
}

export const IShortcutService = createIdentifier<IShortcutService>('univer.shortcut');

export class DesktopShortcutService extends Disposable implements IShortcutService {
    private readonly _shortCutMapping = new Map<number, Set<IShortcutItem>>();
    private readonly _commandIDMapping = new Map<string, Set<IShortcutItem>>();

    private readonly _shortcutChanged$ = new Subject<void>();
    readonly shortcutChanged$ = this._shortcutChanged$.asObservable();

    private _forceEscaped = false;

    private _disable = false;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IPlatformService private readonly _platformService: IPlatformService,
        @IContextService private readonly _contextService: IContextService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();

        // Register native keydown event handler to trigger shortcuts.
        this.disposeWithMe(
            fromGlobalEvent('keydown', (e: KeyboardEvent) => {
                this._resolveKeyboardEvent(e);
            }, {
                capture: true,
            })
        );
    }

    setDisable(disable: boolean): void {
        this._disable = disable;
    }

    getAllShortcuts(): IShortcutItem[] {
        return Array.from(this._shortCutMapping.values())
            .map((v) => Array.from(v.values()))
            .flat();
    }

    registerShortcut(shortcut: IShortcutItem): IDisposable {
        // first map shortcut to a number, so it could be converted and fetched quickly
        const binding = this._getBindingFromItem(shortcut);
        const bindingSet = this._shortCutMapping.get(binding);
        if (bindingSet) {
            bindingSet.add(shortcut);
        } else {
            this._shortCutMapping.set(binding, new Set([shortcut]));
        }

        const commandID = shortcut.id;
        const commandIDSet = this._commandIDMapping.get(commandID);
        if (commandIDSet) {
            commandIDSet.add(shortcut);
        } else {
            this._commandIDMapping.set(commandID, new Set([shortcut]));
        }

        this._emitShortcutChanged();
        return toDisposable(() => {
            this._shortCutMapping.get(binding)?.delete(shortcut);
            if (this._shortCutMapping.get(binding)?.size === 0) {
                this._shortCutMapping.delete(binding);
            }

            this._commandIDMapping.get(commandID)?.delete(shortcut);
            if (this._commandIDMapping.get(commandID)?.size === 0) {
                this._commandIDMapping.delete(commandID);
            }

            this._emitShortcutChanged();
        });
    }

    getShortcutDisplayOfCommand(id: string): string | null {
        const set = this._commandIDMapping.get(id);
        // if (!set || set.size > 1) {
        if (!set) {
            return null;
        }

        return this.getShortcutDisplay(set.values().next().value);
    }

    getShortcutDisplay(shortcut: IShortcutItem): string {
        const binding = this._getBindingFromItem(shortcut);
        const ctrlKey = binding & MetaKeys.CTRL_COMMAND;
        const shiftKey = binding & MetaKeys.SHIFT;
        const altKey = binding & MetaKeys.ALT;
        const macCtrl = binding & MetaKeys.MAC_CTRL;

        const body = KeyCodeToChar[binding & 0xFF] ?? '<->';

        if (this._platformService.isMac) {
            return `${ctrlKey ? '⌘' : ''}${shiftKey ? '⇧' : ''}${altKey ? '⌥' : ''}${macCtrl ? '⌃' : ''}${body}`;
        }
        return `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${body}`;
    }

    private _emitShortcutChanged(): void {
        this._shortcutChanged$.next();
    }

    forceEscape(): IDisposable {
        this._forceEscaped = true;
        return toDisposable(() => (this._forceEscaped = false));
    }

    private _resolveKeyboardEvent(e: KeyboardEvent): void {
        // Should get the container element of the Univer instance and see if
        // the event target is a descendant of the container element.
        // Also we should check through escape list and force catching list.
        // if the target is not focused on the univer instance we should ingore the keyboard event
        if (this._forceEscaped) {
            return;
        }

        if (this._disable) {
            return;
        }

        if (
            this._layoutService &&
            !this._layoutService.checkElementInCurrentContainers(e.target as HTMLElement)
        ) {
            return;
        }

        const shouldPreventDefault = this._dispatch(e);
        if (shouldPreventDefault) {
            e.preventDefault();
        }
    }

    private _dispatch(e: KeyboardEvent) {
        const binding = this._deriveBindingFromEvent(e);
        if (binding === null) {
            return false;
        }

        const shortcuts = this._shortCutMapping.get(binding);
        if (shortcuts === undefined) {
            return false;
        }

        const shouldTrigger = Array.from(shortcuts)
            .sort((s1, s2) => (s2.priority ?? 0) - (s1.priority ?? 0))
            .find((s) => s.preconditions?.(this._contextService) ?? true);

        if (shouldTrigger) {
            this._commandService.executeCommand(shouldTrigger.id, shouldTrigger.staticParameters);
            return true;
        }

        return false;
    }

    private _getBindingFromItem(item: IShortcutItem): number {
        if (this._platformService.isMac && item.mac) {
            return item.mac;
        }

        if (this._platformService.isWindows && item.win) {
            return item.win;
        }

        if (this._platformService.isLinux && item.linux) {
            return item.linux;
        }

        return item.binding;
    }

    private _deriveBindingFromEvent(e: KeyboardEvent): number | null {
        const { shiftKey, metaKey, altKey, keyCode } = e;

        let binding = keyCode;

        if (shiftKey) {
            binding |= MetaKeys.SHIFT;
        }

        if (altKey) {
            binding |= MetaKeys.ALT;
        }

        const ctrlKey = this._platformService.isMac ? metaKey : e.ctrlKey;
        if (ctrlKey) {
            binding |= MetaKeys.CTRL_COMMAND;
        }

        if (this._platformService.isMac && e.ctrlKey) {
            binding |= MetaKeys.MAC_CTRL;
        }

        return binding;
    }
}
