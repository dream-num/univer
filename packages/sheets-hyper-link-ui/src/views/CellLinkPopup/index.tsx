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

import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import { CancelHyperLinkCommand, HyperLinkModel } from '@univerjs/sheets-hyper-link';
import React from 'react';
import { AllBorderSingle, CancelMergeSingle, CopySingle, LinkSingle, UnlinkSingle, WriteSingle, Xlsx } from '@univerjs/icons';
import { ICommandService } from '@univerjs/core';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { OpenHyperLinkSidebarOperation } from '../../commands/operations/sidebar.operations';
import styles from './index.module.less';

const iconsMap = {
    outer: <LinkSingle />,
    link: <LinkSingle />,
    sheet: <Xlsx />,
    range: <AllBorderSingle />,
    defineName: <AllBorderSingle />,
};

export const CellLinkPopup = () => {
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const hyperLinkModel = useDependency(HyperLinkModel);
    const commandService = useDependency(ICommandService);
    const currentPopup = useObservable(popupService.currentPopup$, popupService.currentPopup);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    if (!currentPopup) {
        return null;
    }
    const { unitId, subUnitId, id } = currentPopup;
    const link = hyperLinkModel.getHyperLink(unitId, subUnitId, id);
    if (!link) {
        return null;
    }
    const linkObj = resolverService.parseHyperLink(link.payload);

    return (
        <div className={styles.cellLink}>
            <div className={styles.cellLinkContent} onClick={linkObj.handler}>
                <div className={styles.cellLinkType}>
                    {iconsMap[linkObj.type]}
                </div>
                <div className={styles.cellLinkUrl}>
                    {linkObj.name}
                </div>
            </div>
            <div className={styles.cellLinkOperations}>
                <div
                    className={styles.cellLinkOperation}
                    onClick={() => {
                        if (linkObj.type !== 'outer') {
                            const url = new URL(window.location.href);
                            url.hash = linkObj.url.slice(1);
                            navigator.clipboard.writeText(url.href);
                        } else {
                            navigator.clipboard.writeText(linkObj.url);
                        }
                    }}
                >
                    <CopySingle />
                </div>
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
                    <WriteSingle />
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
                    <UnlinkSingle />
                </div>
            </div>
        </div>
    );
};

CellLinkPopup.componentKey = 'univer.sheet.cell-link-popup';
