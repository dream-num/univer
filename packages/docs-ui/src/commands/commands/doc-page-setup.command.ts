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

import type {
    DocumentDataModel,
    ICommand,
    ICommandInfo,
    IDocumentStyle,
    ISize,
    ITable,
    ITables,
    JSONXActions,
    PageOrientType,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    CommandType,
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MODERN_DOCUMENT_DEFAULT_MARGIN,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface IDocPageSetupCommandParams {
    pageSize: ISize;
    pageOrient: PageOrientType;
    documentFlavor?: DocumentFlavor;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}

const PAGE_FILL_TABLE_TOLERANCE = 2;

interface IPageContentWidthConfig {
    documentFlavor?: DocumentFlavor;
    pageSize?: ISize;
    marginLeft?: number;
    marginRight?: number;
}

function getPageContentWidth(config: IPageContentWidthConfig) {
    const pageWidth = config.pageSize?.width ?? 0;

    if (!pageWidth) {
        return 0;
    }

    if (config.documentFlavor === DocumentFlavor.MODERN) {
        return Math.max(0, pageWidth - MODERN_DOCUMENT_DEFAULT_MARGIN * 2);
    }

    return Math.max(0, pageWidth - (config.marginLeft ?? 0) - (config.marginRight ?? 0));
}

function getTableColumnTotalWidth(table: ITable) {
    return table.tableColumns.reduce((total, column) => total + (column.size.width.v ?? 0), 0);
}

function isPageFillTable(table: ITable, oldContentWidth: number) {
    if (oldContentWidth <= 0 || table.tableColumns.length === 0) {
        return false;
    }

    const columnTotalWidth = getTableColumnTotalWidth(table);
    const tableWidth = columnTotalWidth || table.size.width.v;
    return Math.abs(tableWidth - oldContentWidth) <= PAGE_FILL_TABLE_TOLERANCE;
}

function resizePageFillTables(jsonX: JSONX, rawActions: NonNullable<JSONXActions>, tableSource: ITables | undefined, oldContentWidth: number, newContentWidth: number) {
    if (!tableSource || oldContentWidth <= 0 || newContentWidth <= 0 || Math.abs(oldContentWidth - newContentWidth) <= PAGE_FILL_TABLE_TOLERANCE) {
        return;
    }

    Object.entries(tableSource).forEach(([tableId, table]) => {
        if (!isPageFillTable(table, oldContentWidth)) {
            return;
        }

        const totalColumnWidth = getTableColumnTotalWidth(table);
        if (totalColumnWidth <= 0) {
            return;
        }

        const tableWidthAction = jsonX.replaceOp(['tableSource', tableId, 'size', 'width', 'v'], table.size.width.v, newContentWidth);
        tableWidthAction && rawActions.push(tableWidthAction);

        table.tableColumns.forEach((column, index) => {
            const nextWidth = (column.size.width.v / totalColumnWidth) * newContentWidth;
            const action = jsonX.replaceOp(['tableSource', tableId, 'tableColumns', index, 'size', 'width', 'v'], column.size.width.v, nextWidth);
            action && rawActions.push(action);
        });
    });
}

export const DocPageSetupCommand: ICommand<IDocPageSetupCommandParams> = {
    id: 'docs.command.page-setup',
    type: CommandType.COMMAND,
    // eslint-disable-next-line complexity, max-lines-per-function
    handler: (accessor, params) => {
        if (!params) return false;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) return false;
        const { documentFlavor, marginLeft, marginRight, marginBottom, marginTop, pageOrient, pageSize } = params;
        const jsonX = JSONX.getInstance();
        const documentStyle = docDataModel.getDocumentStyle();
        const snapshot = docDataModel.getSnapshot();
        const newDocumentStyle: IDocumentStyle = {
            ...documentStyle,
            documentFlavor: documentFlavor ?? documentStyle.documentFlavor,
            marginBottom,
            marginLeft,
            marginRight,
            marginTop,
            pageOrient,
            pageSize,
        };
        const {
            marginBottom: oldMarginBottom,
            marginLeft: oldMarginLeft,
            marginRight: oldMarginRight,
            marginTop: oldMarginTop,
            pageOrient: oldPageOrient,
            pageSize: oldPageSize,
            documentFlavor: oldDocumentFlavor,
        } = documentStyle;
        const rawActions: NonNullable<JSONXActions> = [];

        resizePageFillTables(
            jsonX,
            rawActions,
            snapshot.tableSource,
            getPageContentWidth(documentStyle),
            getPageContentWidth(newDocumentStyle)
        );

        if (documentFlavor !== undefined) {
            if (oldDocumentFlavor === undefined) {
                const action = jsonX.insertOp(['documentStyle', 'documentFlavor'], documentFlavor);
                action && rawActions.push(action);
            } else {
                const action = jsonX.replaceOp(['documentStyle', 'documentFlavor'], oldDocumentFlavor, documentFlavor);
                action && rawActions.push(action);
            }
        }

        if (oldMarginBottom === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginBottom'], marginBottom);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginBottom'], oldMarginBottom, marginBottom);
            action && rawActions.push(action);
        }

        if (oldMarginLeft === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginLeft'], marginLeft);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginLeft'], oldMarginLeft, marginLeft);
            action && rawActions.push(action);
        }

        if (oldMarginRight === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginRight'], marginRight);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginRight'], oldMarginRight, marginRight);
            action && rawActions.push(action);
        }

        if (oldMarginTop === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginTop'], marginTop);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginTop'], oldMarginTop, marginTop);
            action && rawActions.push(action);
        }

        if (oldPageSize === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'pageSize'], pageSize);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'pageSize'], oldPageSize, pageSize);
            action && rawActions.push(action);
        }

        if (oldPageOrient === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'pageOrient'], pageOrient);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'pageOrient'], oldPageOrient, pageOrient);
            action && rawActions.push(action);
        }

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: docDataModel.getUnitId(),
                actions: [],
                textRanges: undefined,
            },
        };

        doMutation.params!.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
