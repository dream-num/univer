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

import type { IDrawingParam } from '@univerjs/core';
import { ICommandService, LocaleService } from '@univerjs/core';
import { borderTopClassName, clsx, Select } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { AlignType, SetDrawingAlignOperation } from '../../commands/operations/drawing-align.operation';

export interface IDrawingAlignProps {
    drawings: IDrawingParam[];
    alignShow: boolean;
}

export const DrawingAlign = (props: IDrawingAlignProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);

    const { alignShow } = props;

    const [alignValue, setAlignValue] = useState<string>(AlignType.default as string);
    const alignOptions = [
        {
            label: localeService.t('image-panel.align.default'),
            value: AlignType.default,
        },
        {
            options: [
                {
                    label: localeService.t('image-panel.align.left'),
                    value: AlignType.left,
                },
                {
                    label: localeService.t('image-panel.align.center'),
                    value: AlignType.center,
                },
                {
                    label: localeService.t('image-panel.align.right'),
                    value: AlignType.right,
                },
            ],
        },
        {
            options: [
                {
                    label: localeService.t('image-panel.align.top'),
                    value: AlignType.top,
                },
                {
                    label: localeService.t('image-panel.align.middle'),
                    value: AlignType.middle,
                },
                {
                    label: localeService.t('image-panel.align.bottom'),
                    value: AlignType.bottom,
                },
            ],
        },
        {
            options: [
                {
                    label: localeService.t('image-panel.align.horizon'),
                    value: AlignType.horizon,
                },
                {
                    label: localeService.t('image-panel.align.vertical'),
                    value: AlignType.vertical,
                },
            ],
        },
    ];

    function handleAlignChange(value: string | number | boolean) {
        setAlignValue((value as string));
        commandService.executeCommand(SetDrawingAlignOperation.id, {
            alignType: value as AlignType,
        });
    }

    return (
        <div
            className={clsx('univer-relative univer-w-full', borderTopClassName, {
                'univer-hidden': !alignShow,
            })}
        >
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div
                    className={`
                      univer-w-full univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-panel.align.title')}</div>
                </div>
            </div>
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div
                    className={`
                      univer-w-full univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <Select value={alignValue} options={alignOptions} onChange={handleAlignChange} />
                </div>
            </div>
        </div>
    );
};
