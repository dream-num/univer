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

import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';

import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SetWorksheetShowCommand } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import type { Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import { DEFINED_NAME_CONTAINER } from './component-name';
import styles from './index.module.less';

export interface IDefinedNameOverlayProps {

}

export function DefinedNameOverlay(props: IDefinedNameOverlayProps) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sidebarService = useDependency(ISidebarService);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();

    const getDefinedNameMap = () => {
        const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
        if (definedNameMap) {
            return Array.from(Object.values(definedNameMap));
        }
        return [];
    };

    const [definedNames, setDefinedNames] = useState<IDefinedNamesServiceParam[]>(getDefinedNameMap());

    useEffect(() => {
        const definedNamesSubscription = definedNamesService.update$.subscribe(() => {
            setDefinedNames(getDefinedNameMap());
        });

        return () => {
            definedNamesSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    // 关闭面板的时候,清除 react 缓存
    useEffect(() => {
        sidebarService.sidebarOptions$.subscribe((info) => {
            if (info.id === DEFINED_NAME_CONTAINER) {
                if (!info.visible) {
                    setTimeout(() => {
                        sidebarService.sidebarOptions$.next({ visible: false });
                    });
                }
            }
        });
    }, []);

    const openSlider = () => {
        commandService.executeCommand(SidebarDefinedNameOperation.id, { value: 'open' });
    };

    const focusDefinedName = async (definedName: IDefinedNamesServiceParam) => {
        // The worksheet may be hidden, so we need to show it first
        const { formulaOrRefString, id } = definedName;
        const worksheet = definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);
        if (!worksheet) {
            return;
        }

        const isHidden = worksheet.isSheetHidden();
        if (isHidden) {
            await commandService.executeCommand(SetWorksheetShowCommand.id, { unitId, subUnitId: worksheet.getSheetId() });
        }

        definedNamesService.focusRange(unitId, id);
    };

    return (
        <div className={styles.definedNameOverlay}>
            <div className={styles.definedNameOverlayContainer}>
                {definedNames.map((definedName, index) => {
                    return (
                        <div key={index} className={styles.definedNameOverlayItem} onClick={() => { focusDefinedName(definedName); }}>
                            <div className={styles.definedNameOverlayItemName} title={definedName.name}>{definedName.name}</div>
                            <div className={styles.definedNameOverlayItemFormula} title={definedName.formulaOrRefString}>{definedName.formulaOrRefString}</div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.definedNameOverlayManager} onClick={openSlider}>
                <div className={styles.definedNameOverlayManagerTitle}>{localeService.t('definedName.managerTitle')}</div>
                <div className={styles.definedNameOverlayManagerContent}>{localeService.t('definedName.managerDescription')}</div>
            </div>
        </div>
    );
}
