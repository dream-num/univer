/**
 * Copyright 2023 DreamNum Inc.
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

import { ICellEditorManagerService } from '@univerjs/sheets-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import type { IHelpFunctionOperationParams } from '../../../services/prompt.service';
import { IFormulaPromptService } from '../../../services/prompt.service';
import styles from './index.module.less';

export function ErrorFunction() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0 });
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    useEffect(() => {
        // TODO@Dushusir: use cell notification service
        const subscription = promptService.help$.subscribe((params: IHelpFunctionOperationParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { visible } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            const { endX = 0, startY = 0 } = selection;
            setPosition({ left: endX, top: startY });
            setVisible(visible);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    return visible ? (
        <div className={styles.formulaErrorFunction} style={{ left: position.left, top: position.top }}>
            {/* TODO@Dushusir replace with CellError Component */}
            {/* CellError */}
        </div>
    ) : null;
}
