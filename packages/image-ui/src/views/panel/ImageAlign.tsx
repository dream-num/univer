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

import type { IDrawingParam } from '@univerjs/core';
import { ICommandService, IDrawingManagerService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { Select } from '@univerjs/design';
import clsx from 'clsx';
import { IRenderManagerService } from '@univerjs/engine-render';
import styles from './index.module.less';

export interface IImageAlignProps {
    drawings: IDrawingParam[];
    alignShow: boolean;

}

enum AlignType {
    default = '0',
    left = '1',
    center = '2',
    right = '3',
    top = '4',
    middle = '5',
    bottom = '6',
    horizon = '7',
    vertical = '8',
}


export const ImageAlign = (props: IImageAlignProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings, alignShow } = props;

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
                }, {
                    label: localeService.t('image-panel.align.center'),
                    value: AlignType.center,
                }, {
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
                }, {
                    label: localeService.t('image-panel.align.middle'),
                    value: AlignType.middle,
                }, {
                    label: localeService.t('image-panel.align.bottom'),
                    value: AlignType.bottom,
                },
            ],
        }, {
            options: [
                {
                    label: localeService.t('image-panel.align.horizon'),
                    value: AlignType.horizon,
                }, {
                    label: localeService.t('image-panel.align.vertical'),
                    value: AlignType.vertical,
                },
            ],
        },


    ];

    function handleAlignChange(value: string | number | boolean) {
        setAlignValue((value as string));
    }

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    return (
        <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(alignShow) }}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.align.title')}</div>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn)}>
                    <Select value={alignValue} options={alignOptions} onChange={handleAlignChange} />
                </div>
            </div>
        </div>
    );
};
