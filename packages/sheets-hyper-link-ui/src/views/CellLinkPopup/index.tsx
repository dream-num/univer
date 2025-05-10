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
import type { IHyperLinkPopup } from '../../services/popup.service';
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, MessageType, Tooltip } from '@univerjs/design';
import { AllBorderSingle, CopySingle, LinkSingle, UnlinkSingle, WriteSingle, Xlsx } from '@univerjs/icons';
import { CancelHyperLinkCommand, CancelRichHyperLinkCommand, SheetHyperLinkType, SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IMessageService, IZenZoneService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { OpenHyperLinkEditPanelOperation } from '../../commands/operations/popup.operations';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';

const iconsMap = {
    [SheetHyperLinkType.URL]: <LinkSingle />,
    [SheetHyperLinkType.SHEET]: <Xlsx />,
    [SheetHyperLinkType.RANGE]: <AllBorderSingle />,
    [SheetHyperLinkType.DEFINE_NAME]: <AllBorderSingle />,
    [SheetHyperLinkType.INVALID]: <AllBorderSingle />,
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
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const parserHyperLinkService = useDependency(SheetsHyperLinkParserService);
    const zenZoneService = useDependency(IZenZoneService);
    const { customRange, row, col, unitId, subUnitId, editPermission, copyPermission, type } = props;

    if (!customRange?.properties?.url) {
        return null;
    }
    const linkObj = parserHyperLinkService.parseHyperLink(customRange.properties.url ?? '');
    const isError = linkObj.type === SheetHyperLinkType.INVALID;

    return (
        <div
            className={clsx(`
              univer-mb-1 univer-flex univer-max-w-80 univer-flex-row univer-items-center univer-justify-between
              univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-3 univer-shadow-md
              dark:univer-bg-gray-900
            `, borderClassName)}
            onClick={() => popupService.hideCurrentPopup()}
        >
            <div
                className={clsx(`
                  univer-flex univer-h-6 univer-flex-1 univer-cursor-pointer univer-flex-row univer-items-center
                  univer-truncate univer-text-sm univer-leading-5 univer-text-primary-600
                `, { 'univer-text-red-500': isError })}
                onClick={() => {
                    if (zenZoneService.visible) {
                        return;
                    }

                    if (isError) {
                        return;
                    }

                    resolverService.navigate(linkObj);
                }}
            >
                <div
                    className={`
                      univer-mr-2 univer-flex univer-h-5 univer-w-5 univer-flex-none univer-items-center
                      univer-justify-center univer-text-base univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    {iconsMap[linkObj.type]}
                </div>
                <Tooltip showIfEllipsis title={linkObj.name} asChild>
                    <span className="univer-flex-1 univer-overflow-hidden univer-text-ellipsis">{linkObj.name}</span>
                </Tooltip>
            </div>
            <div
                className={`
                  univer-flex univer-h-6 univer-flex-none univer-flex-row univer-items-center univer-justify-center
                `}
            >
                {copyPermission && (
                    <div
                        className={clsx(`
                          univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row
                          univer-items-center univer-justify-center univer-rounded univer-text-base
                          dark:hover:univer-bg-gray-700
                          hover:univer-bg-gray-100
                        `, { 'univer-text-red-500': isError })}
                        onClick={() => {
                            if (isError) {
                                return;
                            }
                            if (linkObj.type !== SheetHyperLinkType.URL) {
                                const url = new URL(window.location.href);
                                url.hash = linkObj.url.slice(1);
                                navigator.clipboard.writeText(url.href);
                            } else {
                                navigator.clipboard.writeText(linkObj.url);
                            }
                            messageService.show({
                                content: localeService.t('hyperLink.message.coped'),
                                type: MessageType.Info,
                            });
                        }}
                    >
                        <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.copy')}>
                            <CopySingle className="dark:univer-text-white" />
                        </Tooltip>
                    </div>
                )}
                {editPermission && (
                    <>
                        <div
                            className={`
                              univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row
                              univer-items-center univer-justify-center univer-rounded univer-text-base
                              dark:hover:univer-bg-gray-700
                              hover:univer-bg-gray-100
                            `}
                            onClick={() => {
                                commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                    customRangeId: customRange.rangeId,
                                    type,
                                });
                            }}
                        >
                            <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.edit')}>
                                <WriteSingle className="dark:univer-text-white" />
                            </Tooltip>
                        </div>
                        <div
                            className={`
                              univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-flex-row
                              univer-items-center univer-justify-center univer-rounded univer-text-base
                              dark:hover:univer-bg-gray-700
                              hover:univer-bg-gray-100
                            `}
                            onClick={() => {
                                const commandId = (type === HyperLinkEditSourceType.EDITING || type === HyperLinkEditSourceType.ZEN_EDITOR) ? CancelRichHyperLinkCommand.id : CancelHyperLinkCommand.id;
                                if (commandService.syncExecuteCommand(commandId, {
                                    unitId,
                                    subUnitId,
                                    id: customRange.rangeId,
                                    row,
                                    column: col,
                                    documentId: type === HyperLinkEditSourceType.ZEN_EDITOR ?
                                        DOCS_ZEN_EDITOR_UNIT_ID_KEY
                                        : editorBridgeService.getCurrentEditorId(),
                                })) {
                                    popupService.hideCurrentPopup(undefined, true);
                                }
                            }}
                        >
                            <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.cancel')}>
                                <UnlinkSingle className="dark:univer-text-white" />
                            </Tooltip>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const CellLinkPopup = () => {
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const [currentPopup, setCurrentPopup] = useState<IHyperLinkPopup | null>(null);
    const univerInstanceService = useDependency(IUniverInstanceService);

    useEffect(() => {
        setCurrentPopup(popupService.currentPopup);
        const ob = popupService.currentPopup$.subscribe((popup) => {
            setCurrentPopup(popup);
        });
        return () => {
            ob.unsubscribe();
        };
    }, [popupService.currentPopup, popupService.currentPopup$]);

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
