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

import type { ICustomRange, Nullable, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { AllBorderIcon, LinkIcon, SheetsMultiIcon } from '@univerjs/icons';
import {
    CancelHyperLinkCommand,
    CancelRichHyperLinkCommand,
    SheetHyperLinkType,
    SheetsHyperLinkParserService,
} from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { HyperlinkPreview, IMessageService, useDependency, useObservable } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { OpenHyperLinkEditPanelOperation } from '../commands/operations/popup.operations';
import { ISheetsHyperLinkPopupService } from '../services/popup.service';
import { SheetsHyperLinkResolverService } from '../services/resolver.service';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';

const iconsMap = {
    [SheetHyperLinkType.URL]: <LinkIcon />,
    [SheetHyperLinkType.SHEET]: <SheetsMultiIcon className="univer-text-green-500" />,
    [SheetHyperLinkType.RANGE]: <AllBorderIcon />,
    [SheetHyperLinkType.DEFINE_NAME]: <AllBorderIcon />,
    [SheetHyperLinkType.INVALID]: <AllBorderIcon />,
};

interface ICellLinkPopupPureProps {
    customRange?: Nullable<ICustomRange>;
    row: number;
    col: number;
    unitId: string;
    subUnitId: string;
    editPermission?: boolean;
    copyPermission?: boolean;
    type: HyperLinkEditSourceType;
}

export const CellLinkPopupPure = (props: ICellLinkPopupPureProps) => {
    const popupService = useDependency(ISheetsHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const parserHyperLinkService = useDependency(SheetsHyperLinkParserService);
    const { customRange, row, col, unitId, subUnitId, editPermission, copyPermission, type } = props;

    if (!customRange?.properties?.url) {
        return null;
    }
    const linkObj = parserHyperLinkService.parseHyperLink(customRange.properties.url ?? '');
    const tooltip = customRange.properties.tooltip ?? customRange.properties._xlsxHyperlinkTooltip;
    const isError = linkObj.type === SheetHyperLinkType.INVALID;

    return (
        <HyperlinkPreview
            title={linkObj.name}
            icon={iconsMap[linkObj.type]}
            description={typeof tooltip === 'string' ? tooltip : undefined}
            invalid={isError}
            copyDisabled={!copyPermission}
            className="univer-mb-1 univer-p-2"
            labels={{ copy: localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy'), edit: localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.edit'), remove: localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.cancel') }}
            onDismiss={() => popupService.hideCurrentPopup()}
            onOpen={() => { resolverService.navigate(linkObj); }}
            onCopy={async () => {
                if (linkObj.type !== SheetHyperLinkType.URL) {
                    const url = new URL(window.location.href);
                    url.hash = linkObj.url.slice(1);
                    await navigator.clipboard.writeText(url.href);
                } else {
                    await navigator.clipboard.writeText(linkObj.url);
                }
                messageService.show({ content: localeService.t<LocaleKey>('sheets-hyper-link-ui.message.coped'), type: MessageType.Info });
            }}
            onEdit={editPermission ? () => commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, { unitId, subUnitId, row, col, customRangeId: customRange.rangeId, type }) : undefined}
            onRemove={editPermission
                ? () => {
                    const commandId = type === HyperLinkEditSourceType.EDITING ? CancelRichHyperLinkCommand.id : CancelHyperLinkCommand.id;
                    if (commandService.syncExecuteCommand(commandId, {
                        unitId,
                        subUnitId,
                        id: customRange.rangeId,
                        row,
                        column: col,
                        documentId: editorBridgeService.getCurrentEditorId(),
                    })) {
                        popupService.hideCurrentPopup(undefined, true);
                    }
                }
                : undefined}
        />
    );
};

export const CellLinkPopup = () => {
    const popupService = useDependency(ISheetsHyperLinkPopupService);
    const currentPopup = useObservable(popupService.currentPopup$, popupService.currentPopup);
    const univerInstanceService = useDependency(IUniverInstanceService);

    if (!currentPopup) {
        return null;
    }
    if (currentPopup.showAll) {
        const workbook = univerInstanceService.getUnit<Workbook>(currentPopup.unitId, UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getSheetBySheetId(currentPopup.subUnitId);
        const cell = worksheet?.getCell(currentPopup.row, currentPopup.col);
        const customRanges = cell?.p?.body?.customRanges;
        return customRanges?.length
            ? (
                <div>
                    {customRanges.map((customRange) => {
                        return <CellLinkPopupPure key={customRange.rangeId} {...currentPopup} customRange={customRange} />;
                    })}
                </div>
            )
            : null;
    }
    return <CellLinkPopupPure {...currentPopup} />;
};

CellLinkPopup.componentKey = 'univer.sheet.cell-link-popup';
