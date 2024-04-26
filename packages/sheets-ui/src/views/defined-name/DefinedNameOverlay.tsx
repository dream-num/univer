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

import React, { useEffect, useState } from 'react';

import type { Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import styles from './index.module.less';

export interface IDefinedNameOverlayProps {

}

export function DefinedNameOverlay(props: IDefinedNameOverlayProps) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
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

    const openSlider = () => {
        commandService.executeCommand(SidebarDefinedNameOperation.id, { value: 'open' });
    };

    const focusDefinedName = (definedName: IDefinedNamesServiceParam) => {
        definedNamesService.focusRange(unitId, definedName.id);
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
