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
import { Button, clsx, Select } from '@univerjs/design';
import { CreateCopyIcon } from '@univerjs/icons';

import { useImageCropper } from './use-image-cropper';

export interface IImageCropperProps {
    drawings: IDrawingParam[];
    cropperShow: boolean;
    onCropStart?: () => void;
}

export const ImageCropper = (props: IImageCropperProps) => {
    const { drawingParam, cropperShow, localeService, cropValue, cropOptions, handleCropChange, onCropperBtnClick, ShapeClipPicker } = useImageCropper(props);
    if (!drawingParam) {
        return null;
    }

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
                <Button onClick={() => onCropperBtnClick(cropValue)}>
                    <CreateCopyIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.crop.start')}
                </Button>

                <Select value={cropValue} options={cropOptions} onChange={handleCropChange} />
            </div>

            {ShapeClipPicker && <ShapeClipPicker />}
        </div>
    );
};
