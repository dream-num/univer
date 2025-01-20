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

import { ICommandService, type ISheetDataValidationRule } from '@univerjs/core';
import { useDependency } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle } from '@univerjs/icons';
import { RemoveSheetDataValidationCommand } from '@univerjs/sheets-data-validation';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

export interface IDataValidationDetailProps {
    rule: ISheetDataValidationRule;
    onClick: () => void;
    unitId: string;
    subUnitId: string;
    disable?: boolean;
}

export const DataValidationItem = (props: IDataValidationDetailProps) => {
    const { rule, onClick, unitId, subUnitId, disable } = props;
    const validatorRegistry = useDependency(DataValidatorRegistryService);
    const commandService = useDependency(ICommandService);
    const markSelectionService = useDependency(IMarkSelectionService);
    const validator = validatorRegistry.getValidatorItem(rule.type);
    const ids = useRef<(string | null)[]>();
    const [isHover, setIsHover] = useState(false);
    const handleDelete = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        commandService.executeCommand(RemoveSheetDataValidationCommand.id, {
            ruleId: rule.uid,
            unitId,
            subUnitId,
        });
        e.stopPropagation();
    };

    useEffect(() => {
        return () => {
            if (ids.current) {
                ids.current?.forEach((id) => {
                    id && markSelectionService.removeShape(id);
                });
            }
        };
    }, [markSelectionService]);

    return (
        <div
            className={styles.dataValidationItemContainer}
            onClick={onClick}
            onMouseEnter={() => {
                if (disable) return;
                setIsHover(true);
                ids.current = rule.ranges.map((range) => markSelectionService.addShape({
                    range,
                    style: {
                        // hasAutoFill: false,
                        fill: 'rgba(73, 184, 17, 0.05)',
                        strokeWidth: 1,
                        stroke: '#49B811',
                        widgets: {},
                    },
                    primary: null,
                }));
            }}
            onMouseLeave={() => {
                setIsHover(false);
                ids.current?.forEach((id) => {
                    id && markSelectionService.removeShape(id);
                });
                ids.current = undefined;
            }}
        >
            <div className={styles.dataValidationItemTitle}>
                {validator?.generateRuleName(rule)}
            </div>
            <div className={styles.dataValidationItemContent}>
                {rule.ranges.map((range) => serializeRange(range)).join(',')}
            </div>
            {isHover
                ? (
                    <div className={styles.dataValidationItemIcon} onClick={handleDelete}>
                        <DeleteSingle />
                    </div>
                )
                : null}
        </div>
    );
};
