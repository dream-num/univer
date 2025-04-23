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

import type { ICommand, IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams, ISetWorksheetColumnCountMutationParams, ISetWorksheetRowCountMutationParams } from '@univerjs/sheets';
import {
    CommandType,
    ICommandService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    Plugin,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import { FolderSingle } from '@univerjs/icons';
import {
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetWorksheetColumnCountMutation,
    SetWorksheetColumnCountUndoMutationFactory,
    SetWorksheetRowCountMutation,
    SetWorksheetRowCountUndoMutationFactory,
} from '@univerjs/sheets';
import { covertCellValues } from '@univerjs/sheets/facade';
import {
    ComponentManager,
    IMenuManagerService,
    MenuItemType,
    RibbonStartGroup,
} from '@univerjs/ui';

/**
 * wait user select csv file
 */
function waitUserSelectCSVFile(onSelect: (data: {
    data: string[][];
    colsCount: number;
    rowsCount: number;
}) => boolean): Promise<boolean> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.click();

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                if (typeof text !== 'string') return;

                // tip: use npm package to parse csv
                const rows = text.split(/\r\n|\n/);
                const data = rows.map((line) => line.split(','));

                const colsCount = data.reduce((max, row) => Math.max(max, row.length), 0);

                const result = onSelect({
                    data,
                    colsCount,
                    rowsCount: data.length,
                });

                resolve(result);
            };
            reader.readAsText(file);
        };
    });
}

/**
 * Import CSV Button Plugin
 * A simple Plugin example, show how to write a plugin.
 */
class ImportCSVButtonPlugin extends Plugin {
    static override pluginName = 'import-csv-plugin';

    constructor(
        _config: null,
        // inject injector, required
        @Inject(Injector) readonly _injector: Injector,
        // inject menu service, to add toolbar button
        @Inject(IMenuManagerService) private readonly menuManagerService: IMenuManagerService,
        // inject command service, to register command handler
        @Inject(ICommandService) private readonly commandService: ICommandService,
        // inject component manager, to register icon component
        @Inject(ComponentManager) private readonly componentManager: ComponentManager
    ) {
        super();
    }

    /**
     * The first lifecycle of the plugin mounted on the Univer instance,
     * the Univer business instance has not been created at this time.
     * The plugin should add its own module to the dependency injection system at this lifecycle.
     * It is not recommended to initialize the internal module of the plugin outside this lifecycle.
     */
    override onStarting() {
        // register icon component
        this.componentManager.register('FolderSingle', FolderSingle);

        const buttonId = 'import-csv-button';

        const command: ICommand = {
            type: CommandType.OPERATION,
            id: buttonId,
            handler: (accessor) => {
                // inject univer instance service
                const univerInstanceService = accessor.get(IUniverInstanceService);
                const commandService = accessor.get(ICommandService);
                const undoRedoService = accessor.get(IUndoRedoService);

                // get current sheet
                const worksheet = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
                const unitId = worksheet.getUnitId();
                const subUnitId = worksheet.getSheetId();

                // wait user select csv file, then assemble multiple mutations operation to enable correct undo/redo
                return waitUserSelectCSVFile(({ data, rowsCount, colsCount }) => {
                    const redoMutations: IMutationInfo[] = [];
                    const undoMutations: IMutationInfo[] = [];

                    // set sheet row count
                    const setRowCountMutationRedoParams: ISetWorksheetRowCountMutationParams = {
                        unitId,
                        subUnitId,
                        rowCount: rowsCount,
                    };
                    const setRowCountMutationUndoParams: ISetWorksheetRowCountMutationParams = SetWorksheetRowCountUndoMutationFactory(
                        accessor,
                        setRowCountMutationRedoParams
                    );
                    redoMutations.push({ id: SetWorksheetRowCountMutation.id, params: setRowCountMutationRedoParams });
                    undoMutations.push({ id: SetWorksheetRowCountMutation.id, params: setRowCountMutationUndoParams });

                    // set sheet column count
                    const setColumnCountMutationRedoParams: ISetWorksheetColumnCountMutationParams = {
                        unitId,
                        subUnitId,
                        columnCount: colsCount,
                    };
                    const setColumnCountMutationUndoParams: ISetWorksheetColumnCountMutationParams = SetWorksheetColumnCountUndoMutationFactory(
                        accessor,
                        setColumnCountMutationRedoParams
                    );
                    redoMutations.push({ id: SetWorksheetColumnCountMutation.id, params: setColumnCountMutationRedoParams });
                    undoMutations.unshift({ id: SetWorksheetColumnCountMutation.id, params: setColumnCountMutationUndoParams });

                    // parse csv to univer data
                    const cellValue = covertCellValues(data, {
                        startColumn: 0, // start column index
                        startRow: 0, // start row index
                        endColumn: colsCount - 1, // end column index
                        endRow: rowsCount - 1, // end row index
                    });

                    // set sheet data
                    const setRangeValuesMutationRedoParams: ISetRangeValuesMutationParams = {
                        unitId,
                        subUnitId,
                        cellValue,
                    };
                    const setRangeValuesMutationUndoParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
                        accessor,
                        setRangeValuesMutationRedoParams
                    );
                    redoMutations.push({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationRedoParams });
                    undoMutations.unshift({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationUndoParams });

                    const result = sequenceExecute(redoMutations, commandService);

                    if (result.result) {
                        undoRedoService.pushUndoRedo({
                            unitID: unitId,
                            undoMutations,
                            redoMutations,
                        });

                        return true;
                    }

                    return false;
                });
            },
        };

        const menuItemFactory = () => ({
            id: buttonId,
            title: 'Import CSV',
            tooltip: 'Import CSV',
            icon: 'FolderSingle', // icon name
            type: MenuItemType.BUTTON,
        });

        this.menuManagerService.mergeMenu({
            [RibbonStartGroup.OTHERS]: {
                [buttonId]: {
                    order: 10,
                    menuItemFactory,
                },
            },
        });

        this.commandService.registerCommand(command);
    }
}

export default ImportCSVButtonPlugin;
