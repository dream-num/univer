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

import { Checkbox, clsx, InputNumber, Select } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useDocDrawingPosition } from './use-doc-drawing-position';

export interface IDocDrawingPositionProps {
    drawings: IDrawingParam[];
}

export const DocDrawingPosition = (props: IDocDrawingPositionProps) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingParam = props.drawings[0];
    const scene = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId)?.scene : undefined;

    return drawingParam && scene ? <DocDrawingPositionContent {...props} /> : null;
};

function DocDrawingPositionContent(props: IDocDrawingPositionProps) {
    const { localeService, showPanel, disabled, hPosition, vPosition, followTextMove, HORIZONTAL_RELATIVE_FROM, VERTICAL_RELATIVE_FROM, handlePositionChange, handleHorizontalRelativeFromChange, handleVerticalRelativeFromChange, handleFollowTextMoveCheck, MIN_OFFSET, MAX_OFFSET } = useDocDrawingPosition(props);

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
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.title')}</div>
            </header>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.horizontal')}</div>
            </div>

            <div
                className={`
                  univer-grid univer-grid-cols-2 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                `}
            >
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.absolutePosition')}</span>
                    <InputNumber
                        min={MIN_OFFSET}
                        max={MAX_OFFSET}
                        precision={1}
                        disabled={disabled}
                        value={hPosition.posOffset}
                        onChange={(val) => {
                            if (val == null) {
                                return;
                            }
                            handlePositionChange('positionH', {
                                relativeFrom: hPosition.relativeFrom,
                                posOffset: val,
                            });
                        }}
                    />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.toTheRightOf')}</span>
                    <Select
                        value={String(hPosition.relativeFrom)}
                        disabled={disabled}
                        options={HORIZONTAL_RELATIVE_FROM}
                        onChange={handleHorizontalRelativeFromChange}
                    />
                </div>
            </div>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.vertical')}</div>
            </div>

            <div
                className={`
                  univer-grid univer-grid-cols-2 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                `}
            >
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.absolutePosition')}</span>
                    <InputNumber
                        min={MIN_OFFSET}
                        max={MAX_OFFSET}
                        precision={1}
                        disabled={disabled}
                        value={vPosition.posOffset}
                        onChange={(val) => {
                            if (val == null) {
                                return;
                            }
                            handlePositionChange('positionV', {
                                relativeFrom: vPosition.relativeFrom,
                                posOffset: val,
                            });
                        }}
                    />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.bellow')}</span>
                    <Select
                        disabled={disabled}
                        value={String(vPosition.relativeFrom)}
                        options={VERTICAL_RELATIVE_FROM}
                        onChange={handleVerticalRelativeFromChange}
                    />
                </div>
            </div>

            <div
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('docs-drawing-ui.image-position.options')}</div>
            </div>

            <div>
                <Checkbox
                    disabled={disabled}
                    checked={followTextMove}
                    onChange={handleFollowTextMoveCheck}
                >
                    {localeService.t<LocaleKey>('docs-drawing-ui.image-position.moveObjectWithText')}
                </Checkbox>
            </div>
        </div>
    );
}
