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
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';
import React from 'react';
import { CreateCopySingle, EditRegionSingle, LinkSingle } from '@univerjs/icons';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import styles from './index.module.less';

export const CellLinkPopup = () => {
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const hyperLinkModel = useDependency(HyperLinkModel);
    const currentPopup = useObservable(popupService.currentPopup$, popupService.currentPopup);
    if (!currentPopup) {
        return null;
    }
    const { unitId, subUnitId, id } = currentPopup;
    const link = hyperLinkModel.getHyperLink(unitId, subUnitId, id);
    if (!link) {
        return null;
    }

    return (
        <div className={styles.cellLink}>
            <div className={styles.cellLinkContent}>
                {link.payload}
            </div>
            <div className={styles.cellLinkOperations}>
                <div className={styles.cellLinkOperation}>
                    <CreateCopySingle />
                </div>
                <div className={styles.cellLinkOperation}>
                    <EditRegionSingle />
                </div>
                <div className={styles.cellLinkOperation}>
                    <LinkSingle />
                </div>
            </div>
        </div>
    );
};

CellLinkPopup.componentKey = 'univer.sheet.cell-link-popup';
