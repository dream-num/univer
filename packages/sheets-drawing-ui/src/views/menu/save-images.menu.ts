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

import type { IAccessor, ICellData, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IMenuItem } from '@univerjs/ui';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { SaveCellImagesCommand } from '../../commands/commands/save-cell-images.command';

export const SAVE_CELL_IMAGES_MENU_ID = 'sheet.menu.save-cell-images';

/**
 * Check if a cell has image
 */
function cellHasImage(cell: Nullable<ICellData>): boolean {
    return !!(cell?.p?.drawingsOrder?.length && cell?.p?.drawingsOrder?.length > 0);
}

/**
 * Check if selection range has any images
 */
function selectionHasImages(
    workbook: Workbook,
    selection: IRange
): boolean {
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return false;

    const cellMatrix = worksheet.getCellMatrix();
    const { startRow, endRow, startColumn, endColumn } = selection;

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startColumn; col <= endColumn; col++) {
            const cell = cellMatrix.getValue(row, col);
            if (cellHasImage(cell)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if File System Access API is supported
 */
function isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
}

export function SaveCellImagesMenuFactory(accessor: IAccessor): IMenuItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionService = accessor.get(SheetsSelectionsService);

    // Hide menu if File System Access API is not supported or no images in selection
    const hidden$ = combineLatest([
        getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
            switchMap((workbook) => {
                if (!workbook) return of(true);

                return selectionService.selectionMoveEnd$.pipe(
                    map(() => {
                        // Hide if File System Access API is not supported
                        if (!isFileSystemAccessSupported()) {
                            return true;
                        }

                        const selections = selectionService.getCurrentSelections();
                        if (!selections || selections.length === 0) {
                            return true;
                        }

                        // Check if any selection has images
                        for (const selection of selections) {
                            if (selectionHasImages(workbook, selection.range)) {
                                return false;
                            }
                        }

                        return true;
                    })
                );
            })
        ),
    ]).pipe(
        map(([hidden, noImages]) => hidden || noImages)
    );

    return {
        id: SaveCellImagesCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheetImage.save.menuLabel',
        hidden$,
    };
}
