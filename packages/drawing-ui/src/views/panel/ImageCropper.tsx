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
import { ICommandService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { CreateCopySingle } from '@univerjs/icons';
import { Button, Select } from '@univerjs/design';
import clsx from 'clsx';
import { AutoImageCropOperation, CropType } from '../../commands/operations/image-crop.operation';
import styles from './index.module.less';

export interface IImageCropperProps {
    drawings: IDrawingParam[];
    cropperShow: boolean;
}

export const ImageCropper = (props: IImageCropperProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);

    const { drawings, cropperShow } = props;

    const drawingParam = drawings[0];

    if (drawingParam == null) {
        return;
    }

    const [cropValue, setCropValue] = useState<string>(CropType.FREE as string);
    const cropOptions = [
        {
            label: localeService.t('image-panel.crop.mode'),
            value: CropType.FREE,
        }, {
            label: '1:1',
            value: CropType.R1_1,
        }, {
            label: '16:9',
            value: CropType.R16_9,
        }, {
            label: '9:16',
            value: CropType.R9_16,
        }, {
            label: '5:4',
            value: CropType.R5_4,
        }, {
            label: '4:5',
            value: CropType.R4_5,
        }, {
            label: '4:3',
            value: CropType.R4_3,
        }, {
            label: '3:4',
            value: CropType.R3_4,
        }, {
            label: '3:2',
            value: CropType.R3_2,
        }, {
            label: '2:3',
            value: CropType.R2_3,
        },
    ];

    function handleCropChange(value: string | number | boolean) {
        setCropValue((value as string));
    }

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    const onCropperBtnClick = (val: CropType) => {
        commandService.executeCommand(AutoImageCropOperation.id, {
            cropType: val,
        });
    };

    return (
        <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(cropperShow) }}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.crop.title')}</div>
                </div>
            </div>
            <div className={clsx(styles.imageCommonPanelRow, styles.imageCommonPanelRowVertical)}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onCropperBtnClick(cropValue as CropType); }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.crop.start')}</div>
                    </Button>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Select value={cropValue} options={cropOptions} onChange={handleCropChange} />
                </div>
            </div>
        </div>
    );
};
