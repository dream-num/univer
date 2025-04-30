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

import type { IAccessor, IMutation } from '@univerjs/core';
import type { ISheetNote } from '../../models/sheets-note.model';
import { CommandType } from '@univerjs/core';
import { SheetsNoteModel } from '../../models/sheets-note.model';

export interface IUpdateNoteMutationParams {
    unitId: string;
    sheetId: string;
    row: number;
    col: number;
    note: ISheetNote;
    silent?: boolean;
}

export const UpdateNoteMutation: IMutation<IUpdateNoteMutationParams> = {
    id: 'sheet.mutation.update-note',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IUpdateNoteMutationParams) => {
        const { unitId, sheetId, row, col, note, silent } = params;
        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        sheetsNoteModel.updateNote(unitId, sheetId, row, col, note, silent);
        return true;
    },
};

export interface IRemoveNoteMutationParams {
    unitId: string;
    sheetId: string;
    row: number;
    col: number;
    silent?: boolean;
}

export const RemoveNoteMutation: IMutation<IRemoveNoteMutationParams> = {
    id: 'sheet.mutation.remove-note',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IRemoveNoteMutationParams) => {
        const { unitId, sheetId, row, col, silent } = params;
        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        sheetsNoteModel.removeNote(unitId, sheetId, row, col, silent);
        return true;
    },
};

export interface IToggleNotePopupMutationParams {
    unitId: string;
    sheetId: string;
    row: number;
    col: number;
    silent?: boolean;
}

export const ToggleNotePopupMutation: IMutation<IToggleNotePopupMutationParams> = {
    id: 'sheet.mutation.toggle-note-popup',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IToggleNotePopupMutationParams) => {
        const { unitId, sheetId, row, col, silent } = params;
        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        sheetsNoteModel.toggleNotePopup(unitId, sheetId, row, col, silent);
        return true;
    },
};

export interface IUpdateNotePositionMutationParams {
    unitId: string;
    sheetId: string;
    row: number;
    col: number;
    newPosition: {
        row: number;
        col: number;
    };
    silent?: boolean;
}

export const UpdateNotePositionMutation: IMutation<IUpdateNotePositionMutationParams> = {
    id: 'sheet.mutation.update-note-position',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IUpdateNotePositionMutationParams) => {
        const { unitId, sheetId, row, col, newPosition, silent } = params;
        const sheetsNoteModel = accessor.get(SheetsNoteModel);
        sheetsNoteModel.updateNotePosition(unitId, sheetId, row, col, newPosition.row, newPosition.col, silent);
        return true;
    },
};
