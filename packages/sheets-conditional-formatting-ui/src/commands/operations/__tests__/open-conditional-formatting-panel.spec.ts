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

import type { IAccessor } from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { CFRuleType, CFSubRuleType, ClearRangeCfCommand, ClearWorksheetCfCommand } from '@univerjs/sheets-conditional-formatting';
import { describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingPanelController } from '../../../controllers/cf.panel.controller';
import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../open-conditional-formatting-panel';

describe('OpenConditionalFormattingOperator', () => {
    const range = {
        startRow: 1,
        endRow: 2,
        startColumn: 3,
        endColumn: 4,
    };

    function createAccessor() {
        const controller = {
            openPanel: vi.fn(),
        };
        const selectionManagerService = {
            getCurrentSelections: vi.fn(() => [{ range }]),
        };
        const commandService = {
            executeCommand: vi.fn(),
        };

        const get: IAccessor['get'] = ((token: unknown) => {
            if (token === ConditionalFormattingPanelController) {
                return controller;
            }

            if (token === SheetsSelectionsService) {
                return selectionManagerService;
            }

            if (token === ICommandService) {
                return commandService;
            }

            throw new Error('Unknown dependency');
        }) as IAccessor['get'];
        const has: IAccessor['has'] = (() => false) as IAccessor['has'];

        const accessor: IAccessor = {
            get,
            has,
        };

        return { accessor, controller, commandService };
    }

    it('opens the panel with a formula rule seeded from the current selection', () => {
        const { accessor, controller } = createAccessor();

        expect(OpenConditionalFormattingOperator.handler(accessor, { value: CF_MENU_OPERATION.formula })).toBe(true);
        expect(controller.openPanel).toHaveBeenCalledWith({
            ranges: [range],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.formula,
                value: '=',
            },
        });
    });

    it('opens the panel without payload for the manage-rules action', () => {
        const { accessor, controller } = createAccessor();

        OpenConditionalFormattingOperator.handler(accessor, { value: CF_MENU_OPERATION.viewRule });

        expect(controller.openPanel).toHaveBeenCalledWith();
    });

    it('dispatches clear commands for range and worksheet actions', () => {
        const { accessor, commandService } = createAccessor();

        OpenConditionalFormattingOperator.handler(accessor, { value: CF_MENU_OPERATION.clearRangeRules });
        OpenConditionalFormattingOperator.handler(accessor, { value: CF_MENU_OPERATION.clearWorkSheetRules });

        expect(commandService.executeCommand).toHaveBeenNthCalledWith(1, ClearRangeCfCommand.id, {
            ranges: [range],
        });
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, ClearWorksheetCfCommand.id);
    });
});
