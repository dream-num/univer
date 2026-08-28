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
import { borderClassName, Button, clsx, MessageType, Tooltip } from '@univerjs/design';
import { AllBorderIcon, CopyIcon, LinkIcon, SheetsMultiIcon, UnlinkIcon, WriteIcon } from '@univerjs/icons';
import {
    CancelHyperLinkCommand,
    CancelRichHyperLinkCommand,
    SheetHyperLinkType,
    SheetsHyperLinkParserService,
} from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IDialogService, IMessageService, isMobileDialogService, useDependency, useObservable } from '@univerjs/ui';
import { OpenHyperLinkEditPanelOperation } from '../commands/operations/popup.operations';
import { SheetsHyperLinkPopupService } from '../services/popup.service';
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
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const parserHyperLinkService = useDependency(SheetsHyperLinkParserService);
    const dialogService = useDependency(IDialogService);
    const { customRange, row, col, unitId, subUnitId, editPermission, copyPermission, type } = props;

    if (!customRange?.properties?.url) {
        return null;
    }
    const linkObj = parserHyperLinkService.parseHyperLink(customRange.properties.url ?? '');
    const isError = linkObj.type === SheetHyperLinkType.INVALID;

    if (isMobileDialogService(dialogService)) {
        const rowClassName = `
          univer-flex univer-h-12 univer-w-full univer-items-center univer-rounded-xl univer-border-0
          univer-bg-gray-100 univer-px-4 univer-text-left univer-text-base univer-text-gray-900
          active:univer-bg-gray-200
          disabled:univer-opacity-40
          dark:!univer-bg-gray-800 dark:!univer-text-gray-0 dark:active:!univer-bg-gray-700
        `;
        const close = () => popupService.hideCurrentPopup(undefined, true);
        return (
            <div className="univer-flex univer-flex-col univer-gap-2" data-u-comp="mobile-hyper-link-actions">
                <button
                    type="button"
                    className={rowClassName}
                    disabled={isError}
                    onClick={() => {
                        resolverService.navigate(linkObj);
                        close();
                    }}
                >
                    <span className="univer-truncate">{linkObj.name}</span>
                </button>
                {copyPermission && (
                    <button
                        type="button"
                        className={rowClassName}
                        disabled={isError}
                        onClick={() => {
                            if (linkObj.type !== SheetHyperLinkType.URL) {
                                const url = new URL(window.location.href);
                                url.hash = linkObj.url.slice(1);
                                navigator.clipboard.writeText(url.href);
                            } else {
                                navigator.clipboard.writeText(linkObj.url);
                            }
                            messageService.show({
                                content: localeService.t<LocaleKey>('sheets-hyper-link-ui.message.coped'),
                                type: MessageType.Info,
                            });
                            close();
                        }}
                    >
                        {localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy')}
                    </button>
                )}
                {editPermission && (
                    <>
                        <button
                            type="button"
                            className={rowClassName}
                            onClick={() => {
                                close();
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
                            {localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.edit')}
                        </button>
                        <button
                            type="button"
                            className={rowClassName}
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
                        >
                            {localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.cancel')}
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div
            className={clsx(`
              univer-mb-1 univer-flex univer-max-w-80 univer-flex-row univer-items-center univer-justify-between
              univer-gap-2 univer-overflow-hidden univer-rounded-lg univer-bg-gray-0 univer-p-2 univer-shadow-md
              dark:!univer-bg-gray-900
            `, borderClassName)}
            onClick={() => popupService.hideCurrentPopup()}
        >
            <div
                className={clsx(`
                  univer-flex univer-h-6 univer-flex-1 univer-cursor-pointer univer-flex-row univer-items-center
                  univer-gap-1 univer-truncate univer-text-sm univer-leading-5 univer-text-primary-600
                `, { 'univer-text-red-500': isError })}
                onClick={() => {
                    if (isError) {
                        return;
                    }

                    resolverService.navigate(linkObj);
                }}
            >
                <div
                    className={`
                      univer-flex univer-size-5 univer-flex-none univer-items-center univer-justify-center
                      univer-text-base univer-text-gray-900
                      dark:!univer-text-gray-0
                    `}
                >
                    {iconsMap[linkObj.type]}
                </div>
                <Tooltip showIfEllipsis title={linkObj.name} asChild>
                    <span className="univer-flex-1 univer-truncate">{linkObj.name}</span>
                </Tooltip>
            </div>
            <div
                className={`
                  univer-flex univer-h-6 univer-flex-none univer-flex-row univer-items-center univer-justify-center
                  univer-gap-2
                `}
            >
                <Button
                    type="button"
                    variant="text"
                    size="small"
                    data-u-comp="cell-link-popup-copy"
                    aria-label={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy')}
                    className={clsx(`
                      !univer-flex univer-size-6 !univer-rounded !univer-border-0 !univer-p-0 !univer-text-base
                      !univer-font-normal
                      disabled:!univer-pointer-events-auto
                    `, { 'univer-text-red-500': isError })}
                    disabled={!copyPermission || isError}
                    onClick={() => {
                        if (linkObj.type !== SheetHyperLinkType.URL) {
                            const url = new URL(window.location.href);
                            url.hash = linkObj.url.slice(1);
                            navigator.clipboard.writeText(url.href);
                        } else {
                            navigator.clipboard.writeText(linkObj.url);
                        }
                        messageService.show({
                            content: localeService.t<LocaleKey>('sheets-hyper-link-ui.message.coped'),
                            type: MessageType.Info,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.copy')}>
                        <CopyIcon className="dark:!univer-text-gray-0" />
                    </Tooltip>
                </Button>
                {editPermission && (
                    <>
                        <div
                            data-u-comp="cell-link-popup-edit"
                            className={`
                              univer-flex univer-size-6 univer-cursor-pointer univer-flex-row univer-items-center
                              univer-justify-center univer-rounded univer-text-base
                              hover:univer-bg-gray-100
                              dark:hover:!univer-bg-gray-700
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
                            <Tooltip placement="bottom" title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.edit')}>
                                <WriteIcon className="dark:!univer-text-gray-0" />
                            </Tooltip>
                        </div>
                        <div
                            data-u-comp="cell-link-popup-remove"
                            className={`
                              univer-flex univer-size-6 univer-cursor-pointer univer-flex-row univer-items-center
                              univer-justify-center univer-rounded univer-text-base
                              hover:univer-bg-gray-100
                              dark:hover:!univer-bg-gray-700
                            `}
                            onClick={() => {
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
                            }}
                        >
                            <Tooltip placement="bottom" title={localeService.t<LocaleKey>('sheets-hyper-link-ui.popup.cancel')}>
                                <UnlinkIcon className="dark:!univer-text-gray-0" />
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
