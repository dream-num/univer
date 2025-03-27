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

import type { IImageWatermarkConfig, ITextWatermarkConfig, IUserInfoWatermarkConfig } from '@univerjs/engine-render';

export const UNIVER_WATERMARK_MENU = 'UNIVER_WATERMARK_MENU';

export const WATERMARK_PANEL = 'WATERMARK_PANEL';

export const WATERMARK_PANEL_FOOTER = 'WATERMARK_PANEL_FOOTER';

export const WATERMARK_IMAGE_ALLOW_IMAGE_LIST = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];

export const WatermarkTextBaseConfig: ITextWatermarkConfig = {
    content: '',
    fontSize: 16,
    color: 'rgb(0,0,0)',
    bold: false,
    italic: false,
    direction: 'ltr',
    x: 60,
    y: 36,
    repeat: true,
    spacingX: 200,
    spacingY: 100,
    rotate: 0,
    opacity: 0.15,
};

export const WatermarkImageBaseConfig: IImageWatermarkConfig = {
    url: '',
    width: 100,
    height: 100,
    maintainAspectRatio: true,
    originRatio: 1,
    x: 60,
    y: 36,
    repeat: true,
    spacingX: 200,
    spacingY: 100,
    rotate: 0,
    opacity: 0.15,
};

export const WatermarkUserInfoBaseConfig: IUserInfoWatermarkConfig = {
    name: true,
    email: false,
    phone: false,
    uid: false,
    fontSize: 16,
    color: 'rgb(0,0,0)',
    bold: false,
    italic: false,
    direction: 'ltr',
    x: 60,
    y: 60,
    repeat: true,
    spacingX: 200,
    spacingY: 100,
    rotate: -30,
    opacity: 0.15,
};
