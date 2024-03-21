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

import React, { useEffect } from 'react';

import { ICommandService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import styles from './index.module.less';

export interface IDefinedNameOverlayProps {

}

export function DefinedNameOverlay(props: IDefinedNameOverlayProps) {
    const commandService = useDependency(ICommandService);

    useEffect(() => {

    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    const openSlider = () => {
        commandService.executeCommand(SidebarDefinedNameOperation.id, { value: 'open' });
    };

    return (
        <div className={styles.definedNameOverlay}>
            <div className={styles.definedNameOverlayManager} onClick={openSlider}>
                <div className={styles.definedNameOverlayManagerTitle}>Manager named</div>
                <div className={styles.definedNameOverlayManagerContent}>Create a named range by selecting cells and entering the desired name into the text box.</div>
            </div>
        </div>
    );
}
