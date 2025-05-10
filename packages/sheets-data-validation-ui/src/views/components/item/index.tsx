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

import type { ISheetDataValidationRule } from '@univerjs/core';
import { ColorKit, ICommandService, ThemeService } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { clsx } from '@univerjs/design';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle } from '@univerjs/icons';
import { RemoveSheetDataValidationCommand } from '@univerjs/sheets-data-validation';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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
    const ids = useRef<(string | null)[]>(undefined);
    const [isHover, setIsHover] = useState(false);
    const themeService = useDependency(ThemeService);
    const theme = useObservable(themeService.currentTheme$);
    const style = useMemo(() => {
        const defaultColor = themeService.getColorFromTheme('primary.600');
        const key = themeService.getColorFromTheme('loop-color.2');
        const color = themeService.getColorFromTheme(key) ?? defaultColor;

        const rgb = new ColorKit(color).toRgb();
        return {
            fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
            stroke: color,
        };
    }, [theme]);
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
            className={clsx(
                `
                  univer-rounded-md univer-bg-secondary univer-relative univer--ml-2 univer--mr-2 univer-box-border
                  univer-flex univer-w-[287px] univer-cursor-pointer univer-flex-col univer-justify-between
                  univer-overflow-hidden univer-p-2 univer-pr-9
                `,
                {
                    'hover:univer-bg-gray-50': !disable,
                    'univer-opacity-50': disable,
                }
            )}
            onClick={onClick}
            onMouseEnter={() => {
                if (disable) return;
                setIsHover(true);
                ids.current = rule.ranges.map((range) => markSelectionService.addShape({
                    range,
                    style,
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
            <div
                className={`
                  univer-truncate univer-text-sm univer-font-medium univer-leading-[22px] univer-text-gray-900
                  dark:univer-text-white
                `}
            >
                {validator?.generateRuleName(rule)}
            </div>
            <div
                className="univer-text-secondary univer-truncate univer-text-xs univer-leading-[18px]"
            >
                {rule.ranges.map((range) => serializeRange(range)).join(',')}
            </div>
            {isHover
                ? (
                    <div
                        className={`
                          univer-absolute univer-right-2 univer-top-[19px] univer-flex univer-h-5 univer-w-5
                          univer-items-center univer-justify-center univer-rounded
                          hover:univer-bg-gray-200
                        `}
                        onClick={handleDelete}
                    >
                        <DeleteSingle />
                    </div>
                )
                : null}
        </div>
    );
};
