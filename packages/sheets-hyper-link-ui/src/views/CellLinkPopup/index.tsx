/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IHyperLinkPopup } from '../../services/popup.service';
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, LocaleService, useDependency } from '@univerjs/core';
import { MessageType, Tooltip } from '@univerjs/design';
import { AllBorderSingle, CopySingle, LinkSingle, UnlinkSingle, WriteSingle, Xlsx } from '@univerjs/icons';
import { CancelHyperLinkCommand, CancelRichHyperLinkCommand, SheetHyperLinkType, SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { IMessageService, IZenZoneService } from '@univerjs/ui';
import cs from 'clsx';
import React, { useEffect, useState } from 'react';
import { OpenHyperLinkEditPanelOperation } from '../../commands/operations/popup.operations';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import styles from './index.module.less';

const iconsMap = {
    [SheetHyperLinkType.URL]: <LinkSingle />,
    [SheetHyperLinkType.SHEET]: <Xlsx />,
    [SheetHyperLinkType.RANGE]: <AllBorderSingle />,
    [SheetHyperLinkType.DEFINE_NAME]: <AllBorderSingle />,
    [SheetHyperLinkType.INVALID]: <AllBorderSingle />,
};

export const CellLinkPopup = () => {
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const [currentPopup, setCurrentPopup] = useState<IHyperLinkPopup | null>(null);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const parserHyperLinkService = useDependency(SheetsHyperLinkParserService);
    const zenZoneService = useDependency(IZenZoneService);

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

    const { unitId, subUnitId, customRange, row, col } = currentPopup;
    if (!customRange?.properties?.url) {
        return null;
    }
    const linkObj = parserHyperLinkService.parseHyperLink(customRange.properties.url ?? '');
    const isError = linkObj.type === SheetHyperLinkType.INVALID;

    return (
        <div className={styles.cellLink} onClick={() => popupService.hideCurrentPopup()}>
            <div
                className={cs(styles.cellLinkContent, { [styles.cellLinkContentError]: isError })}
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
                <div className={styles.cellLinkType}>
                    {iconsMap[linkObj.type]}
                </div>
                <Tooltip showIfEllipsis title={linkObj.name}>
                    <span className={styles.cellLinkUrl}>{linkObj.name}</span>
                </Tooltip>
            </div>
            <div className={styles.cellLinkOperations}>
                {currentPopup.copyPermission && (
                    <div
                        className={cs(styles.cellLinkOperation, { [styles.cellLinkOperationError]: isError })}
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
                            <CopySingle />
                        </Tooltip>

                    </div>
                )}
                {currentPopup.editPermission && (
                    <>
                        <div
                            className={styles.cellLinkOperation}
                            onClick={() => {
                                commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
                                    unitId,
                                    subUnitId,
                                    row,
                                    col,
                                    customRangeId: customRange.rangeId,
                                    type: currentPopup.type,
                                });
                            }}
                        >
                            <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.edit')}>
                                <WriteSingle />
                            </Tooltip>
                        </div>
                        <div
                            className={styles.cellLinkOperation}
                            onClick={() => {
                                const commandId = (currentPopup.type === HyperLinkEditSourceType.EDITING || currentPopup.type === HyperLinkEditSourceType.ZEN_EDITOR) ? CancelRichHyperLinkCommand.id : CancelHyperLinkCommand.id;
                                if (commandService.syncExecuteCommand(commandId, {
                                    unitId,
                                    subUnitId,
                                    id: customRange.rangeId,
                                    row,
                                    column: col,
                                    documentId: currentPopup.type === HyperLinkEditSourceType.ZEN_EDITOR ?
                                        DOCS_ZEN_EDITOR_UNIT_ID_KEY
                                        : editorBridgeService.getCurrentEditorId(),
                                })) {
                                    popupService.hideCurrentPopup(undefined, true);
                                }
                            }}
                        >
                            <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.cancel')}>
                                <UnlinkSingle />
                            </Tooltip>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

CellLinkPopup.componentKey = 'univer.sheet.cell-link-popup';
