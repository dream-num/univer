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
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from '../commands/commands/record.command';
import { ReplayLocalRecordCommand, ReplayLocalRecordOnActiveCommand, ReplayLocalRecordOnNamesakeCommand } from '../commands/commands/replay.command';
import { CloseRecordPanelOperation, OpenRecordPanelOperation } from '../commands/operations/operation';
import { ActionRecorderController } from './action-recorder.controller';
import { menuSchema, OpenRecorderMenuItemFactory, RECORD_MENU_ITEM_ID, RecordMenuItemFactory, ReplayLocalRecordMenuItemFactory, ReplayLocalRecordOnActiveMenuItemFactory, ReplayLocalRecordOnNamesakeMenuItemFactory } from './action-recorder.menu';

describe('action-recorder controller/menu', () => {
    it('should create menu items', () => {
        const recordItem = RecordMenuItemFactory();
        expect(recordItem.id).toBe(RECORD_MENU_ITEM_ID);

        const panelOpened$ = new BehaviorSubject(false);
        const openItem = OpenRecorderMenuItemFactory({
            get: vi.fn(() => ({ panelOpened$: panelOpened$.asObservable() })),
        } as never);
        expect(openItem.id).toBe(OpenRecordPanelOperation.id);
        expect(openItem.disabled$).toBeDefined();

        expect(ReplayLocalRecordMenuItemFactory().id).toBe(ReplayLocalRecordCommand.id);
        expect(ReplayLocalRecordOnNamesakeMenuItemFactory().id).toBe(ReplayLocalRecordOnNamesakeCommand.id);
        expect(ReplayLocalRecordOnActiveMenuItemFactory().id).toBe(ReplayLocalRecordOnActiveCommand.id);
        expect(Object.keys(menuSchema).length).toBeGreaterThan(0);
    });

    it('should register commands/ui/menu and sheet-recorded commands', () => {
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

        expect(registerCommand).toHaveBeenCalledWith(StartRecordingActionCommand);
        expect(registerCommand).toHaveBeenCalledWith(StopRecordingActionCommand);
        expect(registerCommand).toHaveBeenCalledWith(CompleteRecordingActionCommand);
        expect(registerCommand).toHaveBeenCalledWith(OpenRecordPanelOperation);
        expect(registerCommand).toHaveBeenCalledWith(CloseRecordPanelOperation);
        expect(registerCommand).toHaveBeenCalledWith(ReplayLocalRecordCommand);
        expect(registerCommand).toHaveBeenCalledWith(ReplayLocalRecordOnNamesakeCommand);
        expect(registerCommand).toHaveBeenCalledWith(ReplayLocalRecordOnActiveCommand);

        expect(registerComponent).toHaveBeenCalledTimes(1);
        const componentFactory = registerComponent.mock.calls[0][1] as () => unknown;
        expect(componentFactory()).toBeDefined();
        expect(registerIcon).toHaveBeenCalledWith('RecordIcon', expect.anything());
        expect(mergeMenu).toHaveBeenCalledWith(menuSchema);

        expect(registerRecordedCommand).toHaveBeenCalled();
        expect(registerRecordedCommand.mock.calls.length).toBeGreaterThan(20);

        controller.dispose();
    });
});
