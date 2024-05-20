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

// FIXME: DO NOT USE GLOBAL STYLES
import './index.less';

import { ICommandService, LocaleService, Range } from '@univerjs/core';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import type { FormatType } from '@univerjs/sheets';
import { SelectionManagerService } from '@univerjs/sheets';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import React from 'react';

import { MENU_OPTIONS } from '../../base/const/MENU-OPTIONS';
import { SetNumfmtCommand } from '../../commands/commands/set-numfmt.command';
import { OpenNumfmtPanelOperator } from '../../commands/operations/open.numfmt.panel.operation';
import { getPatternPreview, getPatternType } from '../../utils/pattern';

export const MORE_NUMFMT_TYPE_KEY = 'sheet.numfmt.moreNumfmtType';
export const OPTIONS_KEY = 'sheet.numfmt.moreNumfmtType.options';

export const MoreNumfmtType = (props: { value?: string }) => {
    const localeService = useDependency(LocaleService);
    const value = props.value ?? localeService.t('sheet.numfmt.general');
    return <span className="more-numfmt-type">{value}</span>;
};

export const Options = () => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const injector = useInjector();

    const selectionManagerService = useDependency(SelectionManagerService);
    const setNumfmt = (pattern: string | null) => {
        const selection = selectionManagerService.getLast();
        if (!selection) {
            return;
        }
        const textSelectionRenderManager = injector.get(ITextSelectionRenderManager);
        const range = selection.range;
        const values: Array<{ row: number; col: number; pattern?: string; type?: FormatType }> = [];
        Range.foreach(range, (row, col) => {
            if (pattern) {
                values.push({ row, col, pattern, type: getPatternType(pattern) });
            } else {
                values.push({ row, col });
            }
        });
        commandService.executeCommand(SetNumfmtCommand.id, { values });
        textSelectionRenderManager.focus();
    };
    const handleOnclick = (index: number) => {
        if (index === 0) {
            setNumfmt(null);
        } else if (index === MENU_OPTIONS.length - 1) {
            commandService.executeCommand(OpenNumfmtPanelOperator.id);
        } else {
            const item = MENU_OPTIONS[index] as { pattern: string };
            item.pattern && setNumfmt(item.pattern);
        }
    };

    const defaultValue = 1220;

    return (
        <div className="more-numfmt-type-options">
            {MENU_OPTIONS.map((item, index) => {
                if (item === '|') {
                    return <div key={index} className="line m-t-4" onClick={(e) => e.stopPropagation()} />;
                }
                return (
                    <div
                        className="option-item m-t-4"
                        key={index}
                        onClick={() => {
                            handleOnclick(index);
                        }}
                    >
                        <div>{localeService.t(item.label)}</div>
                        <div className="m-l-26">
                            {item.pattern ? getPatternPreview(item.pattern || '', defaultValue, localeService.getCurrentLocale()).result : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
