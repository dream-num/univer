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

import type { DocumentDataModel } from '@univerjs/core';
import type { MenuSchemaType } from '@univerjs/ui';
import { CustomRangeType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { ContextMenuGroup, ContextMenuPosition, MenuItemType, MenuManagerPosition } from '@univerjs/ui';
import { combineLatest, map, startWith } from 'rxjs';
import { CloseHeaderFooterCommand } from '../commands/commands/doc-header-footer.command';
import { UpdateSelectedDocFieldsCommand } from '../commands/commands/refresh-header-footer-fields.command';
import {
    DOC_HEADER_FOOTER_RIBBON_CONTROL,
    DOC_HEADER_FOOTER_RIBBON_TAB,
} from '../views/header-footer/panel/component-name';
import { disableMenuWithoutDocumentUnitPermission } from './menu';

export const headerFooterRibbonSchema: MenuSchemaType = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.FORMAT]: {
            [UpdateSelectedDocFieldsCommand.id]: {
                order: 1,
                menuItemFactory: (accessor) => {
                    const instances = accessor.get(IUniverInstanceService);
                    const selections = accessor.get(DocSelectionManagerService);
                    return {
                        id: UpdateSelectedDocFieldsCommand.id,
                        type: MenuItemType.BUTTON,
                        title: 'docs-ui.headerFooter.refreshFields',
                        disabled$: disableMenuWithoutDocumentUnitPermission(accessor, UnitAction.Edit),
                        hidden$: combineLatest([
                            instances.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC),
                            selections.textSelection$.pipe(startWith(null)),
                        ]).pipe(map(([model]) => !model || !(selections.getTextRanges({ unitId: model.getUnitId(), subUnitId: model.getUnitId() }) ?? [])
                            .some((selection) => model.getSelfOrHeaderFooterModel(selection.segmentId)?.getBody()?.customRanges?.some((field) =>
                                field.rangeType === CustomRangeType.FIELD && selection.startOffset <= field.endIndex && selection.endOffset > field.startIndex)))),
                    };
                },
            },
        },
    },
    [MenuManagerPosition.RIBBON]: {
        [DOC_HEADER_FOOTER_RIBBON_TAB]: {
            order: 90,
            title: 'docs-ui.toolbar.headerFooter',
            contextual: true,
            ...Object.fromEntries(['insertion', 'navigation', 'options', 'position'].map((kind, order) => [
                `${DOC_HEADER_FOOTER_RIBBON_TAB}.${kind}`,
                {
                    order,
                    [`${DOC_HEADER_FOOTER_RIBBON_CONTROL}.${kind}`]: {
                        order: 0,
                        gridLayout: { row: 1, column: 1, rowSpan: 2 },
                        menuItemFactory: () => ({
                            id: `${DOC_HEADER_FOOTER_RIBBON_CONTROL}.${kind}`,
                            type: MenuItemType.BUTTON,
                            label: { name: DOC_HEADER_FOOTER_RIBBON_CONTROL, hoverable: false, props: { kind } },
                        }),
                    },
                },
            ])),
            'docs-ui.headerFooter.close': {
                order: 5,
                [CloseHeaderFooterCommand.id]: {
                    order: 0,
                    gridLayout: { row: 1, column: 1, rowSpan: 2, showLabel: true },
                    menuItemFactory: () => ({
                        id: CloseHeaderFooterCommand.id,
                        type: MenuItemType.BUTTON,
                        icon: 'CloseIcon',
                        title: 'docs-ui.headerFooter.closeHeaderFooter',
                        tooltip: 'docs-ui.headerFooter.closeHeaderFooter',
                    }),
                },
            },
        },
    },
};
