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

import { ICommandService, LocaleService, useDependency } from '@univerjs/core';
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';
import React, { useEffect, useState } from 'react';
import { AllBorderSingle, CopySingle, LinkSingle, UnlinkSingle, WriteSingle, Xlsx } from '@univerjs/icons';
import cs from 'clsx';
import { MessageType, Tooltip } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';
import type { IHyperLinkPopup } from '../../services/popup.service';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { OpenHyperLinkSidebarOperation } from '../../commands/operations/sidebar.operations';
import { CancelHyperLinkCommand } from '../../commands/commands/remove-hyper-link.command';
import styles from './index.module.less';

const iconsMap = {
    outer: <LinkSingle />,
    link: <LinkSingle />,
    sheet: <Xlsx />,
    range: <AllBorderSingle />,
    defineName: <AllBorderSingle />,
    'range-error': <AllBorderSingle />,
    'sheet-error': <Xlsx />,
};

export const CellLinkPopup = () => {
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const hyperLinkModel = useDependency(HyperLinkModel);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const [currentPopup, setCurrentPopup] = useState<IHyperLinkPopup | null>(null);
    const resolverService = useDependency(SheetsHyperLinkResolverService);

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
    const { unitId, subUnitId, id } = currentPopup;
    const link = hyperLinkModel.getHyperLink(unitId, subUnitId, id);
    if (!link) {
        return null;
    }
    const linkObj = resolverService.parseHyperLink(link.payload);
    const isError = linkObj.type.indexOf('error') > -1;

    return (
        <div className={styles.cellLink} onClick={() => popupService.hideCurrentPopup()}>
            <div className={cs(styles.cellLinkContent, { [styles.cellLinkContentError]: isError })} onClick={linkObj.handler}>
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
                            if (linkObj.type !== 'outer') {
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
                                commandService.executeCommand(OpenHyperLinkSidebarOperation.id, {
                                    unitId,
                                    subUnitId,
                                    row: link.row,
                                    column: link.column,
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
                                commandService.executeCommand(CancelHyperLinkCommand.id, {
                                    unitId,
                                    subUnitId,
                                    id: link.id,
                                });
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
