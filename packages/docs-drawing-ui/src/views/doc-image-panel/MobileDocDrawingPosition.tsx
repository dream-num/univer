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

import type { IObjectPositionH, IObjectPositionV } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import type { IDocDrawingPositionProps } from './DocDrawingPosition';
import { DocumentFlavor, LocaleService } from '@univerjs/core';
import { InputNumber, MobileActionRow } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useDocDrawingPosition } from './use-doc-drawing-position';

interface IMobileDocDrawingPositionProps {
    disabled: boolean;
    followTextMove: boolean;
    disableFollowTextMove: boolean;
    hPosition: IObjectPositionH;
    vPosition: IObjectPositionV;
    horizontalOptions: { label: string; value: string }[];
    verticalOptions: { label: string; value: string; disabled?: boolean }[];
    minOffset: number;
    maxOffset: number;
    onHorizontalOffsetChange: (value: number) => void;
    onVerticalOffsetChange: (value: number) => void;
    onHorizontalReferenceChange: (value: string) => void;
    onVerticalReferenceChange: (value: string) => void;
    onFollowTextMoveChange: (value: boolean) => void;
}

function MobileDocDrawingPositionControls(props: IMobileDocDrawingPositionProps) {
    const localeService = useDependency(LocaleService);
    const axes: {
        title: LocaleKey;
        reference: LocaleKey;
        position: IObjectPositionH | IObjectPositionV;
        options: { label: string; value: string; disabled?: boolean }[];
        onOffsetChange: (value: number) => void;
        onReferenceChange: (value: string) => void;
    }[] = [
        {
            title: 'docs-drawing-ui.image-position.horizontal',
            reference: 'docs-drawing-ui.image-position.toTheRightOf',
            position: props.hPosition,
            options: props.horizontalOptions,
            onOffsetChange: props.onHorizontalOffsetChange,
            onReferenceChange: props.onHorizontalReferenceChange,
        },
        {
            title: 'docs-drawing-ui.image-position.vertical',
            reference: 'docs-drawing-ui.image-position.bellow',
            position: props.vPosition,
            options: props.verticalOptions,
            onOffsetChange: props.onVerticalOffsetChange,
            onReferenceChange: props.onVerticalReferenceChange,
        },
    ];

    return (
        <div className="univer-grid univer-gap-5">
            {axes.map((axis) => (
                <section key={axis.title} className="univer-grid univer-gap-3">
                    <h3 className="univer-m-0 univer-text-sm univer-font-medium">{localeService.t<LocaleKey>(axis.title)}</h3>
                    <label className="univer-grid univer-gap-2 univer-text-sm">
                        {localeService.t<LocaleKey>('docs-drawing-ui.image-position.absolutePosition')}
                        <InputNumber
                            disabled={props.disabled}
                            className="univer-h-12 univer-w-full"
                            inputClassName="[&_input]:!univer-h-12 [&_input]:!univer-text-base"
                            controls={false}
                            min={props.minOffset}
                            max={props.maxOffset}
                            precision={1}
                            value={axis.position.posOffset ?? 0}
                            onChange={(value) => {
                                if (value != null) {
                                    axis.onOffsetChange(value);
                                }
                            }}
                        />
                    </label>
                    <div className="univer-grid univer-grid-cols-2 univer-gap-2" role="group" aria-label={localeService.t<LocaleKey>(axis.reference)}>
                        {axis.options.map((option) => (
                            <MobileActionRow
                                key={option.value}
                                title={option.label}
                                variant="subtle"
                                disabled={props.disabled || option.disabled}
                                aria-pressed={String(axis.position.relativeFrom) === option.value}
                                className="
                                  univer-px-3 univer-text-center univer-text-sm
                                  aria-pressed:!univer-bg-primary-50 aria-pressed:!univer-text-primary-600
                                "
                                onClick={() => axis.onReferenceChange(option.value)}
                            />
                        ))}
                    </div>
                </section>
            ))}
            <MobileActionRow
                role="switch"
                title={localeService.t<LocaleKey>('docs-drawing-ui.image-position.moveObjectWithText')}
                variant="subtle"
                aria-checked={props.followTextMove}
                disabled={props.disabled || props.disableFollowTextMove}
                trailing={props.followTextMove ? <CheckMarkIcon className="univer-text-primary-600" /> : undefined}
                onClick={() => props.onFollowTextMoveChange(!props.followTextMove)}
            />
        </div>
    );
}
export function MobileDocDrawingPosition(props: IDocDrawingPositionProps) {
    const renderManagerService = useDependency(IRenderManagerService);
    const drawing = props.drawings[0];
    return drawing && renderManagerService.getRenderUnitById(drawing.unitId)?.scene
        ? <MobileDocDrawingPositionContent {...props} />
        : null;
}
function MobileDocDrawingPositionContent(props: IDocDrawingPositionProps) {
    const { showPanel, disabled, hPosition, vPosition, followTextMove, documentFlavor, HORIZONTAL_RELATIVE_FROM, VERTICAL_RELATIVE_FROM, handlePositionChange, handleHorizontalRelativeFromChange, handleVerticalRelativeFromChange, handleFollowTextMoveCheck, MIN_OFFSET, MAX_OFFSET } = useDocDrawingPosition(props);
    return showPanel
        ? (
            <MobileDocDrawingPositionControls
                disabled={disabled}
                followTextMove={followTextMove}
                disableFollowTextMove={documentFlavor === DocumentFlavor.MODERN}
                hPosition={hPosition}
                vPosition={vPosition}
                horizontalOptions={HORIZONTAL_RELATIVE_FROM}
                verticalOptions={VERTICAL_RELATIVE_FROM}
                minOffset={MIN_OFFSET}
                maxOffset={MAX_OFFSET}
                onHorizontalOffsetChange={(posOffset) => handlePositionChange('positionH', { ...hPosition, posOffset })}
                onVerticalOffsetChange={(posOffset) => handlePositionChange('positionV', { ...vPosition, posOffset })}
                onHorizontalReferenceChange={handleHorizontalRelativeFromChange}
                onVerticalReferenceChange={handleVerticalRelativeFromChange}
                onFollowTextMoveChange={handleFollowTextMoveCheck}
            />
        )
        : null;
}
