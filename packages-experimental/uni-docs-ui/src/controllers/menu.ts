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
import type { IMenuButtonItem, IMenuItem } from '@univerjs/ui';
import { BooleanNumber, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { SetInlineFormatCommand } from '@univerjs/docs-ui';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { getHeaderFooterMenuHiddenObservable, getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, Observable } from 'rxjs';

export const DOC_ITALIC_MUTATION_ID = 'doc.command.uni-italic';
export const DOC_BOLD_MUTATION_ID = 'doc.command.uni-bold';
export const DOC_UNDERLINE_MUTATION_ID = 'doc.command.uni-underline';
export const DOC_STRIKE_MUTATION_ID = 'doc.command.uni-strike';
export const DOC_TABLE_MUTATION_ID = 'doc.command.uni-table';

export function DocBoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_BOLD_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const bl = textRun.ts?.bl;

                    subscriber.next(bl === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DocItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_ITALIC_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const it = textRun.ts?.it;

                    subscriber.next(it === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DocUnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_UNDERLINE_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const ul = textRun.ts?.ul;

                    subscriber.next(ul?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DocStrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_STRIKE_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const st = textRun.ts?.st;

                    subscriber.next(st?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DocTableMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DOC_TABLE_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'GridSingle',
        tooltip: 'toolbar.table.main',
        disabled$: getTableDisabledObservable(accessor),
        // Do not show header footer menu and insert table at zen mode.
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getInsertTableHiddenObservable(accessor), getHeaderFooterMenuHiddenObservable(accessor), (one, two, three) => {
            return one || two || three;
        }),
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(DocSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveTextRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset! >= st && startOffset! <= ed);
    return textRun;
}

function getTableDisabledObservable(accessor: IAccessor): Observable<boolean> {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);

    return new Observable((subscriber) => {
        const subscription = docSelectionManagerService.textSelection$.subscribe((selection) => {
            if (selection == null) {
                subscriber.next(true);
                return;
            }

            const { textRanges } = selection;

            if (textRanges.length !== 1) {
                subscriber.next(true);
                return;
            }

            const textRange = textRanges[0];
            const { collapsed, startNodePosition } = textRange;

            if (!collapsed) {
                subscriber.next(true);
                return;
            }

            if (startNodePosition != null) {
                const { path } = startNodePosition;

                // TODO: Not support insert table in table cell now.
                if (path.indexOf('cells') !== -1) {
                    subscriber.next(true);
                    return;
                }
            }

            subscriber.next(false);
        });

        return () => subscription.unsubscribe();
    });
}

function getInsertTableHiddenObservable(
    accessor: IAccessor
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            const univerType = univerInstanceService.getUnitType(unitId);

            if (univerType !== UniverInstanceType.UNIVER_DOC) {
                return subscriber.next(true);
            }

            const currentRender = renderManagerService.getRenderById(unitId);
            if (currentRender == null) {
                return subscriber.next(true);
            }

            const viewModel = currentRender.with(DocSkeletonManagerService).getViewModel();

            viewModel.editAreaChange$.subscribe((editArea) => {
                subscriber.next(editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER);
            });
        });

        return () => subscription.unsubscribe();
    });
}
