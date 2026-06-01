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

import type { Injector } from '@univerjs/core';
import type { IUpdateNoteMutationParams } from '@univerjs/sheets-note';
import type { ISheetNoteAddEventParams, ISheetNoteDeleteEventParams, ISheetNoteHideEventParams, ISheetNoteShowEventParams, ISheetNoteUpdateEventParams } from './f-event';
import { CanceledError, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '@univerjs/sheets-note';

export class FUniverSheetsNoteMixin extends FUniver {
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteAdd,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && !change.oldNote && change.newNote) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetCommandTarget({ unitId, subUnitId });
                            if (!target) return;

                            const { workbook, worksheet } = target;

                            const eventParams: ISheetNoteAddEventParams = {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                                note: newNote,
                            };
                            this.fireEvent(this.Event.SheetNoteAdd, eventParams);
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteDelete,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && !change.newNote) {
                            const { unitId, subUnitId, oldNote } = change;
                            const target = this.getSheetCommandTarget({ unitId, subUnitId });
                            if (!target) return;

                            const { workbook, worksheet } = target;

                            const eventParams: ISheetNoteDeleteEventParams = {
                                workbook,
                                worksheet,
                                row: oldNote.row,
                                col: oldNote.col,
                                oldNote,
                            };
                            this.fireEvent(this.Event.SheetNoteDelete, eventParams);
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteUpdate,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote) {
                            const { unitId, subUnitId, oldNote, newNote } = change;
                            const target = this.getSheetCommandTarget({ unitId, subUnitId });
                            if (!target) return;

                            const { workbook, worksheet } = target;

                            const eventParams: ISheetNoteUpdateEventParams = {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                                note: newNote,
                                oldNote,
                            };
                            this.fireEvent(this.Event.SheetNoteUpdate, eventParams);
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteShow,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote && !change.oldNote.show && change.newNote.show) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetCommandTarget({ unitId, subUnitId });
                            if (!target) return;

                            const { workbook, worksheet } = target;

                            const eventParams: ISheetNoteShowEventParams = {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                            };
                            this.fireEvent(this.Event.SheetNoteShow, eventParams);
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNoteHide,
                () => {
                    const model = injector.get(SheetsNoteModel);
                    return model.change$.subscribe((change) => {
                        if (change.type === 'update' && change.oldNote && change.newNote && change.oldNote.show && !change.newNote.show) {
                            const { unitId, subUnitId, newNote } = change;
                            const target = this.getSheetCommandTarget({ unitId, subUnitId });
                            if (!target) return;

                            const { workbook, worksheet } = target;

                            const eventParams: ISheetNoteHideEventParams = {
                                workbook,
                                worksheet,
                                row: newNote.row,
                                col: newNote.col,
                            };
                            this.fireEvent(this.Event.SheetNoteHide, eventParams);
                        }
                    });
                }
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteAdd,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const params = command.params as IUpdateNoteMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet, unitId, subUnitId } = target;
                        const { row, col, note } = params;

                        const oldNote = injector.get(SheetsNoteModel).getNote(unitId, subUnitId, { noteId: note.id, row, col });
                        if (oldNote) return;

                        const eventParams: ISheetNoteAddEventParams = {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                        };
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteAdd, eventParams);

                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteDelete,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetDeleteNoteCommand.id) {
                        const target = this.getSheetCommandTarget();
                        if (!target) return;

                        const selection = injector.get(SheetsSelectionsService).getCurrentLastSelection();
                        if (!selection?.primary) return;

                        const { workbook, worksheet, unitId, subUnitId } = target;
                        const { actualRow: row, actualColumn: col } = selection.primary;

                        const oldNote = injector.get(SheetsNoteModel).getNote(unitId, subUnitId, { row, col });
                        if (!oldNote) return;

                        const eventParams: ISheetNoteDeleteEventParams = {
                            workbook,
                            worksheet,
                            row,
                            col,
                            oldNote,
                        };
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteDelete, eventParams);

                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteUpdate,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetUpdateNoteCommand.id) {
                        const params = command.params as IUpdateNoteMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet, unitId, subUnitId } = target;
                        const { row, col, note } = params;

                        const oldNote = injector.get(SheetsNoteModel).getNote(unitId, subUnitId, { row, col });
                        if (!oldNote) return;

                        const eventParams: ISheetNoteUpdateEventParams = {
                            workbook,
                            worksheet,
                            row,
                            col,
                            note,
                            oldNote,
                        };
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteUpdate, eventParams);

                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteShow,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const target = this.getSheetCommandTarget();
                        if (!target) return;

                        const selection = injector.get(SheetsSelectionsService).getCurrentLastSelection();
                        if (!selection?.primary) return;

                        const { workbook, worksheet, unitId, subUnitId } = target;
                        const { actualRow: row, actualColumn: col } = selection.primary;

                        const note = injector.get(SheetsNoteModel).getNote(unitId, subUnitId, { row, col });
                        if (!note || note.show) return;

                        const eventParams: ISheetNoteShowEventParams = {
                            workbook,
                            worksheet,
                            row,
                            col,
                        };
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteShow, eventParams);

                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNoteHide,
                () => commandService.beforeCommandExecuted((command) => {
                    if (command.id === SheetToggleNotePopupCommand.id) {
                        const target = this.getSheetCommandTarget();
                        if (!target) return;

                        const selection = injector.get(SheetsSelectionsService).getCurrentLastSelection();
                        if (!selection?.primary) return;

                        const { workbook, worksheet, unitId, subUnitId } = target;
                        const { actualRow: row, actualColumn: col } = selection.primary;

                        const note = injector.get(SheetsNoteModel).getNote(unitId, subUnitId, { row, col });
                        if (!note || !note.show) return;

                        const eventParams: ISheetNoteHideEventParams = {
                            workbook,
                            worksheet,
                            row,
                            col,
                        };
                        const cancel = this.fireEvent(this.Event.BeforeSheetNoteHide, eventParams);

                        if (cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );
    }
}

FUniver.extend(FUniverSheetsNoteMixin);
