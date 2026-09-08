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
import {
    WrapTextType,
} from '@univerjs/core';
import { clsx, InputNumber, Radio, RadioGroup } from '@univerjs/design';
import { TextWrappingStyle } from '@univerjs/docs-drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';

import { useDocDrawingTextWrap } from './use-doc-drawing-text-wrap';

export interface IDocDrawingTextWrapProps {
    drawings: IDrawingParam[];
}

export const DocDrawingTextWrap = (props: IDocDrawingTextWrapProps) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingParam = props.drawings[0];
    const scene = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId)?.scene : undefined;

    return drawingParam && scene ? <DocDrawingTextWrapContent {...props} /> : null;
};

function DocDrawingTextWrapContent(props: IDocDrawingTextWrapProps) {
    const { localeService, showPanel, wrappingStyle, wrapText, distToText, disableWrapText, disableDistTB, disableDistLR, handleWrappingStyleChange, handleWrapTextChange, handleDistToTextChange, MIN_MARGIN, MAX_MARGIN } = useDocDrawingTextWrap(props);

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': !showPanel,
            })}
        >
            <header
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.title')}</div>
            </header>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.wrappingStyle')}</div>
            </div>

            <div>
                <RadioGroup value={wrappingStyle} onChange={handleWrappingStyleChange} direction="vertical">
                    <Radio value={TextWrappingStyle.INLINE}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.inline')}</Radio>
                    <Radio value={TextWrappingStyle.WRAP_SQUARE}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.square')}</Radio>
                    <Radio value={TextWrappingStyle.WRAP_TOP_AND_BOTTOM}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.topAndBottom')}</Radio>
                    <Radio value={TextWrappingStyle.BEHIND_TEXT}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.behindText')}</Radio>
                    <Radio value={TextWrappingStyle.IN_FRONT_OF_TEXT}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.inFrontText')}</Radio>
                </RadioGroup>
            </div>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.wrapText')}</div>
            </div>

            <div>
                <RadioGroup disabled={disableWrapText} value={String(wrapText)} onChange={handleWrapTextChange} direction="horizontal">
                    <Radio value={String(WrapTextType.BOTH_SIDES)}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.bothSide')}</Radio>
                    <Radio value={String(WrapTextType.LEFT)}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.leftOnly')}</Radio>
                    <Radio value={String(WrapTextType.RIGHT)}>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.rightOnly')}</Radio>
                </RadioGroup>
            </div>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.distanceFromText')}</div>
            </div>

            <div
                className={`
                  univer-grid univer-grid-cols-2 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                `}
            >
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.top')}</span>
                    <InputNumber
                        min={MIN_MARGIN}
                        max={MAX_MARGIN}
                        disabled={disableDistTB}
                        precision={1}
                        value={distToText.distT}
                        onChange={(val) => { handleDistToTextChange(val, 'distT'); }}
                    />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.left')}</span>
                    <InputNumber
                        min={MIN_MARGIN}
                        max={MAX_MARGIN}
                        disabled={disableDistLR}
                        precision={1}
                        value={distToText.distL}
                        onChange={(val) => { handleDistToTextChange(val, 'distL'); }}
                    />
                </div>
            </div>

            <div
                className={`
                  univer-grid univer-grid-cols-2 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                `}
            >
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.bottom')}</span>
                    <InputNumber
                        min={MIN_MARGIN}
                        max={MAX_MARGIN}
                        disabled={disableDistTB}
                        precision={1}
                        value={distToText.distB}
                        onChange={(val) => { handleDistToTextChange(val, 'distB'); }}
                    />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.right')}</span>
                    <InputNumber
                        min={MIN_MARGIN}
                        max={MAX_MARGIN}
                        disabled={disableDistLR}
                        precision={1}
                        value={distToText.distR}
                        onChange={(val) => { handleDistToTextChange(val, 'distR'); }}
                    />
                </div>
            </div>
        </div>
    );
}
