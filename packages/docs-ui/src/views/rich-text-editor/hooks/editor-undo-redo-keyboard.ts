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

import type { DocumentDataModel, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IKeyboardEventConfig } from './use-keyboard-event';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';

export interface IExecuteEditorUndoRedoCommandOptions {
    commandId: string;
    commandService: ICommandService;
    editorUnitId: string;
    univerInstanceService: IUniverInstanceService;
}

export interface ICreateEditorUndoRedoKeyboardConfigOptions {
    commandService: ICommandService;
    univerInstanceService: IUniverInstanceService;
    editorUnitId: string;
    keyCodes?: IKeyboardEventConfig['keyCodes'];
    handler?: IKeyboardEventConfig['handler'];
}

function isSheetFormulaEditor(editorUnitId: string, univerInstanceService: IUniverInstanceService): boolean {
    if (editorUnitId !== DOCS_NORMAL_EDITOR_UNIT_ID_KEY && editorUnitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
        return false;
    }

    const documentModel = univerInstanceService.getUnit<DocumentDataModel>(editorUnitId, UniverInstanceType.UNIVER_DOC);
    return documentModel?.getBody()?.dataStream?.startsWith('=') ?? false;
}

export function executeEditorUndoRedoCommand(options: IExecuteEditorUndoRedoCommandOptions): void {
    const { commandId, commandService, editorUnitId, univerInstanceService } = options;
    const shouldUseSheetEditorContext =
        editorUnitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY ||
        editorUnitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

    if (isSheetFormulaEditor(editorUnitId, univerInstanceService)) {
        return;
    }

    const previousFocusedUnitId = univerInstanceService.getFocusedUnit()?.getUnitId() ?? null;
    const shouldRestoreFocus = !shouldUseSheetEditorContext && previousFocusedUnitId !== null && previousFocusedUnitId !== editorUnitId;

    if (!shouldUseSheetEditorContext && previousFocusedUnitId !== editorUnitId) {
        univerInstanceService.focusUnit(editorUnitId);
    }

    commandService.executeCommand(commandId).finally(() => {
        if (shouldRestoreFocus) {
            univerInstanceService.focusUnit(previousFocusedUnitId);
        }
    });
}

export function createEditorUndoRedoKeyboardConfig(options: ICreateEditorUndoRedoKeyboardConfigOptions): IKeyboardEventConfig {
    const { commandService, editorUnitId, handler, keyCodes = [], univerInstanceService } = options;
    const ctrlCommand = MetaKeys.CTRL_COMMAND;
    const ctrlCommandShift = MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT;

    return {
        keyCodes: [
            { keyCode: KeyCode.Z, metaKey: ctrlCommand },
            { keyCode: KeyCode.Y, metaKey: ctrlCommand },
            { keyCode: KeyCode.Z, metaKey: ctrlCommandShift },
            ...keyCodes,
        ],
        handler: (keyCode, metaKey) => {
            const normalizedMetaKey = metaKey ?? 0;
            const shortcut = `${keyCode}:${normalizedMetaKey}`;

            switch (shortcut) {
                case `${KeyCode.Z}:${ctrlCommand}`:
                    executeEditorUndoRedoCommand({ commandId: UndoCommand.id, commandService, editorUnitId, univerInstanceService });
                    return;
                case `${KeyCode.Y}:${ctrlCommand}`:
                case `${KeyCode.Z}:${ctrlCommandShift}`:
                    executeEditorUndoRedoCommand({ commandId: RedoCommand.id, commandService, editorUnitId, univerInstanceService });
                    return;
            }

            handler?.(keyCode, metaKey);
        },
    };
}
