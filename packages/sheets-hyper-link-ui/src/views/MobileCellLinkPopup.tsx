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
import type { LocaleKey } from '../locale/types';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { MessageType, MobileActionRow } from '@univerjs/design';
import {
    CancelHyperLinkCommand,
    CancelRichHyperLinkCommand,
    SheetHyperLinkType,
    SheetsHyperLinkParserService,
} from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IMessageService, useDependency, useObservable } from '@univerjs/ui';
import { OpenHyperLinkEditPanelOperation } from '../commands/operations/popup.operations';
import { ISheetsHyperLinkPopupService } from '../services/popup.service';
import { SheetsHyperLinkResolverService } from '../services/resolver.service';
import { HyperLinkEditSourceType } from '../types/enums/edit-source';

interface IMobileCellLinkPopupPureProps {
    customRange?: Nullable<ICustomRange>;
    row: number;
    col: number;
    unitId: string;
    subUnitId: string;
    editPermission?: boolean;
    copyPermission?: boolean;
    type: HyperLinkEditSourceType;
}

export function MobileCellLinkPopupPure(props: IMobileCellLinkPopupPureProps) {
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

    const linkObj = parserHyperLinkService.parseHyperLink(customRange.properties.url);
    const isError = linkObj.type === SheetHyperLinkType.INVALID;
    const close = () => popupService.hideCurrentPopup(undefined, true);

    return (
        <div className="univer-flex univer-flex-col univer-gap-2">
            <MobileActionRow
                title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.open')}
                value={linkObj.name}
                valueType="text"
                aria-label={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.open')}
                variant="subtle"
                disabled={isError}
                onClick={() => {
                    resolverService.navigate(linkObj);
                    close();
                }}
            />
            {copyPermission && (
                <MobileActionRow
                    title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy')}
                    aria-label={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy')}
                    variant="subtle"
                    disabled={isError}
                    onClick={() => {
                        let url = linkObj.url;
                        if (linkObj.type !== SheetHyperLinkType.URL) {
                            const currentUrl = new URL(window.location.href);
                            currentUrl.hash = linkObj.url.slice(1);
                            url = currentUrl.href;
                        }

                        return navigator.clipboard.writeText(url).then(() => {
                            messageService.show({
                                content: localeService.t<LocaleKey>('sheets-hyper-link-ui.message.coped'),
                                type: MessageType.Info,
                            });
                            close();
                        });
                    }}
                />
            )}
            {editPermission && (
                <>
                    <MobileActionRow
                        title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.edit')}
                        aria-label={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.edit')}
                        variant="subtle"
                        onClick={() => {
                            close();
                            return commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
                                unitId,
                                subUnitId,
                                row,
                                col,
                                customRangeId: customRange.rangeId,
                                type,
                            });
                        }}
                    />
                    <MobileActionRow
                        title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.cancel')}
                        aria-label={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.cancel')}
                        variant="subtle"
                        onClick={() => {
                            const commandId = type === HyperLinkEditSourceType.EDITING
                                ? CancelRichHyperLinkCommand.id
                                : CancelHyperLinkCommand.id;
                            if (commandService.syncExecuteCommand(commandId, {
                                unitId,
                                subUnitId,
                                id: customRange.rangeId,
                                row,
                                column: col,
                                documentId: editorBridgeService.getCurrentEditorId(),
                            })) {
                                close();
                            }
                        }}
                    />
                </>
            )}
        </div>
    );
}

export function MobileCellLinkPopup() {
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
                    {customRanges.map((customRange) => (
                        <MobileCellLinkPopupPure
                            key={customRange.rangeId}
                            {...currentPopup}
                            customRange={customRange}
                        />
                    ))}
                </div>
            )
            : null;
    }

    return <MobileCellLinkPopupPure {...currentPopup} />;
}

MobileCellLinkPopup.componentKey = 'univer.sheet.mobile-cell-link-popup';
