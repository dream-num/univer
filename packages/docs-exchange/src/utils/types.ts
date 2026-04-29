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

export interface IUniverTextStyle {
    bl?: 0 | 1;
    it?: 0 | 1;
    ul?: { s: 0 | 1 };
    st?: { s: 0 | 1 };
    fs?: number;
    ff?: string;
    cl?: { rgb: string };
    bg?: { rgb: string };
    va?: number;
}

export interface IUniverTextRun {
    st: number;
    ed: number;
    ts?: IUniverTextStyle;
}

export interface IDrawingTransform {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IDocTransform {
    size: { width: number; height: number };
    positionH: { relativeFrom: number; posOffset: number };
    positionV: { relativeFrom: number; posOffset: number };
    angle: number;
}

export interface ISimpleDrawing {
    drawingId: string;
    drawingType: number;
    imageSourceType?: 'BASE64' | 'URL';
    source?: string;
    transform?: IDrawingTransform;
    docTransform?: IDocTransform;
}
