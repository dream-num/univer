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
import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, clsx, Select } from '@univerjs/design';
import { CreateCopyIcon } from '@univerjs/icons';
import { ComponentManager, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import {
    AutoImageCropOperation,
    CloseImageCropOperation,
    CropType,
} from '../../commands/operations/image-crop.operation';
import { DrawingImageClipService, IMAGE_CLIP_SHAPE_PICKER_COMPONENT } from '../../services/drawing-image-clip.service';

export interface IImageCropperProps {
    drawings: IDrawingParam[];
    cropperShow: boolean;
}

export const ImageCropper = (props: IImageCropperProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const clipService = useDependency(DrawingImageClipService);
    const componentManager = useDependency(ComponentManager);
    const canUseShapeClip = useObservable(clipService.canUseShapeClip$, false);

    const { drawings, cropperShow } = props;

    const drawingParam = drawings[0];
    const [cropValue, setCropValue] = useState<string>(CropType.FREE as string);
    const cropStateRef = useRef(false);

    const cropOptions = [
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-panel.crop.mode'),
            value: CropType.FREE,
        },
        {
            label: '1:1',
            value: CropType.R1_1,
        },
        {
            label: '16:9',
            value: CropType.R16_9,
        },
        {
            label: '9:16',
            value: CropType.R9_16,
        },
        {
            label: '5:4',
            value: CropType.R5_4,
        },
        {
            label: '4:5',
            value: CropType.R4_5,
        },
        {
            label: '4:3',
            value: CropType.R4_3,
        },
        {
            label: '3:4',
            value: CropType.R3_4,
        },
        {
            label: '3:2',
            value: CropType.R3_2,
        },
        {
            label: '2:3',
            value: CropType.R2_3,
        },
    ];

    useEffect(() => {
        const onChangeStartObserver = commandService.onCommandExecuted((command) => {
            if (command.id === CloseImageCropOperation.id) {
                const params = command.params as { isAuto?: boolean };
                if (!params?.isAuto) {
                    cropStateRef.current = false;
                }
            }
        });

        return () => {
            onChangeStartObserver?.dispose();
        };
    }, []);

    if (drawingParam == null) {
        return null;
    }

    function handleCropChange(value: string | number | boolean) {
        setCropValue((value as string));
        if (cropStateRef.current) {
            commandService.executeCommand(AutoImageCropOperation.id, {
                cropType: value as CropType,
            });
        }
    }

    const onCropperBtnClick = (val: CropType) => {
        commandService.executeCommand(AutoImageCropOperation.id, {
            cropType: val,
        });
        cropStateRef.current = true;
    };

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': !cropperShow,
            })}
        >
            <header
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.crop.title')}</div>
            </header>

            <div className="univer-flex univer-items-center univer-justify-center univer-gap-2">
                <Button onClick={() => { onCropperBtnClick(cropValue as CropType); }}>
                    <CreateCopyIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.crop.start')}
                </Button>

                <Select value={cropValue} options={cropOptions} onChange={handleCropChange} />
            </div>

            {canUseShapeClip && (() => {
                const ShapeClipPicker = componentManager.get(IMAGE_CLIP_SHAPE_PICKER_COMPONENT);
                return ShapeClipPicker
                    ? <ShapeClipPicker />
                    : null;
            })()}
        </div>
    );
};
