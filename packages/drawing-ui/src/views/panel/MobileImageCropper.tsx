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

import type { ReactNode } from 'react';
import type { CropType } from '../../commands/operations/image-crop.operation';
import type { LocaleKey } from '../../locale/types';
import { LocaleService } from '@univerjs/core';
import { MobileActionRow } from '@univerjs/design';
import { CropIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';

interface IMobileImageCropperProps {
    cropValue: CropType;
    cropOptions: { label: string; value: CropType }[];
    onCropChange: (value: CropType) => void;
    onStartCrop: () => void;
    children?: ReactNode;
}

export function MobileImageCropper(props: IMobileImageCropperProps) {
    const localeService = useDependency(LocaleService);

    return (
        <section className="univer-grid univer-gap-3 univer-py-3">
            <h3 className="univer-m-0 univer-text-sm univer-font-medium">
                {localeService.t<LocaleKey>('drawing-ui.image-panel.crop.title')}
            </h3>
            <div className="univer-grid univer-grid-cols-3 univer-gap-2">
                {props.cropOptions.map((option) => (
                    <MobileActionRow
                        key={option.value}
                        title={option.label}
                        variant="subtle"
                        aria-pressed={props.cropValue === option.value}
                        className="
                          univer-px-2 univer-text-center
                          aria-pressed:!univer-bg-primary-50 aria-pressed:!univer-text-primary-600
                        "
                        onClick={() => props.onCropChange(option.value)}
                    />
                ))}
            </div>
            <MobileActionRow
                icon={<CropIcon />}
                title={localeService.t<LocaleKey>('drawing-ui.image-panel.crop.start')}
                className="!univer-bg-primary-600 !univer-text-white"
                onClick={props.onStartCrop}
            />
            {props.children}
        </section>
    );
}
