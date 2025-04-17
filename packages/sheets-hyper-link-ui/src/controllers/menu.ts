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

import type { DocumentDataModel, IAccessor, Nullable } from '@univerjs/core';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IMenuItem, IShortcutItem } from '@univerjs/ui';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getSheetCommandTarget, RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetInsertHyperlinkPermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { getCurrentRangeDisable$, IEditorBridgeService, whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, KeyCode, MenuItemType, MetaKeys } from '@univerjs/ui';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { InsertHyperLinkOperation, InsertHyperLinkToolbarOperation } from '../commands/operations/popup.operations';
import { DisableLinkType, getShouldDisableCellLink, shouldDisableAddLink } from '../utils';

const getEditingLinkDisable$ = (accessor: IAccessor, unitId = DOCS_ZEN_EDITOR_UNIT_ID_KEY) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const docSelctionService = accessor.get(IRenderManagerService).getRenderById(unitId)?.with(DocSelectionRenderService);
    if (!docSelctionService) {
        return of(true);
    }

    return docSelctionService.textSelectionInner$.pipe(map(() => {
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const state = editorBridgeService.getEditCellState();
        if (!state) {
            return true;
        }
        const target = getSheetCommandTarget(univerInstanceService, { unitId: state.unitId, subUnitId: state.sheetId });
        if (!target?.worksheet) {
            return true;
        }

        if (getShouldDisableCellLink(accessor, target.worksheet, state.row, state.column) === 1) {
            return true;
        }

        return shouldDisableAddLink(accessor);
    }));
};

const getLinkDisable$ = (accessor: IAccessor) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;

    const disableCell$ = editorBridgeService?.currentEditCellState$.pipe(
        map((state) => {
            if (!state) {
                return (DisableLinkType.DISABLED_BY_CELL);
            }
            const target = getSheetCommandTarget(univerInstanceService, { unitId: state.unitId, subUnitId: state.sheetId });
            if (!target) {
                return (DisableLinkType.DISABLED_BY_CELL);
            }

            return (getShouldDisableCellLink(accessor, target.worksheet, state.row, state.column));
        }),
        switchMap((disableCell) => {
            if (disableCell === DisableLinkType.DISABLED_BY_CELL) {
                return of(true);
            }

            const isEditing$ = (editorBridgeService ? editorBridgeService.visible$ : of<Nullable<IEditorBridgeServiceVisibleParam>>(null));
            return combineLatest([isEditing$, univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)]).pipe(
                switchMap(
                    ([editing, focusingDoc]) => {
                        return editing?.visible ?
                            focusingDoc?.getUnitId() === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                                ? of(true)
                                : getEditingLinkDisable$(accessor, DOCS_NORMAL_EDITOR_UNIT_ID_KEY)
                            : of(disableCell !== DisableLinkType.ALLOWED);
                    }
                )
            );
        })
    ) ?? of(true);

    return disableCell$.pipe(
        switchMap((disableCell) => {
            if (disableCell) {
                return of(true);
            } else {
                return getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true);
            }
        })
    );
};

const linkMenu = {
    commandId: InsertHyperLinkOperation.id,
    type: MenuItemType.BUTTON,
    title: 'hyperLink.menu.add',
    icon: 'LinkSingle',
};

export const genZenEditorMenuId = (id: string) => `${id}-zen-editor`;

export const insertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        ...linkMenu,
        id: linkMenu.commandId,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getLinkDisable$(accessor),
        // disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })),
    } as IMenuItem;
};

export const zenEditorInsertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        ...linkMenu,
        id: genZenEditorMenuId(linkMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getEditingLinkDisable$(accessor),
    } as IMenuItem;
};

const linkToolbarMenu = {
    tooltip: 'hyperLink.form.addTitle',
    commandId: InsertHyperLinkToolbarOperation.id,
    type: MenuItemType.BUTTON,
    icon: 'LinkSingle',
};

export const insertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        ...linkToolbarMenu,
        id: linkToolbarMenu.commandId,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getLinkDisable$(accessor),
    };
};

export const zenEditorInsertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        ...linkToolbarMenu,
        id: genZenEditorMenuId(linkToolbarMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getEditingLinkDisable$(accessor),
    };
};

export const InsertLinkShortcut: IShortcutItem = {
    id: InsertHyperLinkToolbarOperation.id,
    binding: KeyCode.K | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
};
