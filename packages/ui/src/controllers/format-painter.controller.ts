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

import type { ICommand, IOperation } from '@univerjs/core';
import { CommandType, Disposable, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import { fromGlobalEvent } from '../common/lifecycle';
import { FORMAT_PAINTER_CURSOR_CSS } from '../services/format-painter/format-painter-canvas';
import { FormatPainterSessionService } from '../services/format-painter/format-painter-session.service';
import { KeyCode } from '../services/shortcut/keycode';
import { IShortcutService } from '../services/shortcut/shortcut.service';

export const ActivateFormatPainterOperation: IOperation = {
    id: 'ui.operation.activate-format-painter',
    type: CommandType.OPERATION,
    handler: (accessor) => accessor.get(FormatPainterSessionService).activate(),
};
export const ContinuousFormatPainterOperation: IOperation = {
    id: 'ui.operation.continuous-format-painter',
    type: CommandType.OPERATION,
    handler: (accessor) => accessor.get(FormatPainterSessionService).activate(true),
};
export const ClearFormattingCommand: ICommand = {
    id: 'ui.command.clear-formatting',
    type: CommandType.COMMAND,
    handler: (accessor) => accessor.get(FormatPainterSessionService).clearFormatting(),
};
const CancelFormatPainterOperation: IOperation = {
    id: 'ui.operation.cancel-format-painter',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        accessor.get(FormatPainterSessionService).cancel();
        return true;
    },
};

export class FormatPainterController extends Disposable {
    constructor(
        @Inject(FormatPainterSessionService) session: FormatPainterSessionService,
        @ICommandService commandService: ICommandService,
        @IShortcutService shortcutService: IShortcutService,
        @IUniverInstanceService instanceService: IUniverInstanceService
    ) {
        super();
        const cursorStyle = document.createElement('style');
        cursorStyle.textContent = FORMAT_PAINTER_CURSOR_CSS;
        document.head.appendChild(cursorStyle);
        this.disposeWithMe({ dispose: () => cursorStyle.remove() });
        for (const command of [ActivateFormatPainterOperation, ContinuousFormatPainterOperation, CancelFormatPainterOperation, ClearFormattingCommand]) {
            this.disposeWithMe(commandService.registerCommand(command));
        }
        this.disposeWithMe(shortcutService.registerShortcut({
            id: CancelFormatPainterOperation.id,
            binding: KeyCode.ESC,
            priority: 1000,
            preconditions: () => session.mode !== 'off',
        }));
        // Ribbon buttons intentionally bypass the canvas shortcut router.
        this.disposeWithMe(fromGlobalEvent('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape' && session.mode !== 'off' && event.target instanceof HTMLElement &&
                event.target.closest(`[data-u-command="${ActivateFormatPainterOperation.id}"]`)) {
                commandService.syncExecuteCommand(CancelFormatPainterOperation.id);
                event.preventDefault();
                event.stopPropagation();
            }
        }, { capture: true }));
        this.disposeWithMe(instanceService.unitDisposed$.subscribe((unit) => {
            if (unit.getUnitId() === session.unitId) {
                session.cancel();
            }
        }));
        this.disposeWithMe(instanceService.focused$.subscribe((unitId) => {
            if (unitId && session.unitId && unitId !== session.unitId) {
                session.cancel();
            }
            session.refresh();
        }));
    }
}
