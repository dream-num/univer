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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    ReplayLocalRecordCommand,
    ReplayLocalRecordOnActiveCommand,
    ReplayLocalRecordOnNamesakeCommand,
} from '../commands/commands/replay.command';
import { OpenRecordPanelOperation } from '../commands/operations/operation';
import {
    menuSchema,
    OpenRecorderMenuItemFactory,
    RECORD_MENU_ITEM_ID,
    RecordMenuItemFactory,
    ReplayLocalRecordMenuItemFactory,
    ReplayLocalRecordOnActiveMenuItemFactory,
    ReplayLocalRecordOnNamesakeMenuItemFactory,
} from '../menu/action-recorder.menu';
import { ActionRecorderController } from './action-recorder.controller';

describe('action-recorder menu factories', () => {
    it('RecordMenuItemFactory should produce a menu item with the record item id', () => {
        const item = RecordMenuItemFactory();
        expect(item.id).toBe(RECORD_MENU_ITEM_ID);
    });

    it('OpenRecorderMenuItemFactory should produce a menu item linked to the open-panel operation', () => {
        const panelOpened$ = new BehaviorSubject(false);
        const item = OpenRecorderMenuItemFactory({
            get: vi.fn(() => ({ panelOpened$: panelOpened$.asObservable() })),
        } as never);

        expect(item.id).toBe(OpenRecordPanelOperation.id);
    });

    it('replay menu factories should produce items with matching command ids', () => {
        expect(ReplayLocalRecordMenuItemFactory().id).toBe(ReplayLocalRecordCommand.id);
        expect(ReplayLocalRecordOnNamesakeMenuItemFactory().id).toBe(ReplayLocalRecordOnNamesakeCommand.id);
        expect(ReplayLocalRecordOnActiveMenuItemFactory().id).toBe(ReplayLocalRecordOnActiveCommand.id);
    });
});

describe('ActionRecorderController', () => {
    it('should register commands, UI components, icons and menu schema on construction', () => {
        const registerCommand = vi.fn();
        const registerComponent = vi.fn();
        const mergeMenu = vi.fn();
        const registerIcon = vi.fn(() => ({ dispose: vi.fn() }));
        const registerRecordedCommand = vi.fn();

        const controller = new ActionRecorderController(
            { registerCommand } as never,
            { registerComponent } as never,
            { mergeMenu } as never,
            { register: registerIcon } as never,
            { registerRecordedCommand } as never,
            {} as never
        );

        expect(registerCommand).toHaveBeenCalled();
        expect(registerComponent).toHaveBeenCalledTimes(1);
        expect(registerIcon).toHaveBeenCalledWith('RecordIcon', expect.anything());
        expect(mergeMenu).toHaveBeenCalledWith(menuSchema);
        expect(registerRecordedCommand).toHaveBeenCalled();

        controller.dispose();
    });

    it('should clean up resources on dispose', () => {
        const disposables: Array<{ dispose: () => void }> = [];
        const registerIcon = vi.fn(() => {
            const d = { dispose: vi.fn() };
            disposables.push(d);
            return d;
        });

        const controller = new ActionRecorderController(
            { registerCommand: vi.fn() } as never,
            { registerComponent: vi.fn() } as never,
            { mergeMenu: vi.fn() } as never,
            { register: registerIcon } as never,
            { registerRecordedCommand: vi.fn() } as never,
            {} as never
        );

        controller.dispose();

        for (const d of disposables) {
            expect(d.dispose).toHaveBeenCalled();
        }
    });
});
