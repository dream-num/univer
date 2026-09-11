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

import type { IDocDrawingBase } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import type { IDocDrawingTextWrapProps } from './DocDrawingTextWrap';
import { LocaleService, WrapTextType } from '@univerjs/core';
import { InputNumber, MobileActionRow } from '@univerjs/design';
import { TextWrappingStyle } from '@univerjs/docs-drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useDocDrawingTextWrap } from './use-doc-drawing-text-wrap';

const styles: { value: TextWrappingStyle; label: LocaleKey }[] = [
    { value: TextWrappingStyle.INLINE, label: 'docs-drawing-ui.image-text-wrap.inline' },
    { value: TextWrappingStyle.WRAP_SQUARE, label: 'docs-drawing-ui.image-text-wrap.square' },
    { value: TextWrappingStyle.WRAP_TOP_AND_BOTTOM, label: 'docs-drawing-ui.image-text-wrap.topAndBottom' },
    { value: TextWrappingStyle.BEHIND_TEXT, label: 'docs-drawing-ui.image-text-wrap.behindText' },
    { value: TextWrappingStyle.IN_FRONT_OF_TEXT, label: 'docs-drawing-ui.image-text-wrap.inFrontText' },
];
const sides: { value: WrapTextType; label: LocaleKey }[] = [
    { value: WrapTextType.BOTH_SIDES, label: 'docs-drawing-ui.image-text-wrap.bothSide' },
    { value: WrapTextType.LEFT, label: 'docs-drawing-ui.image-text-wrap.leftOnly' },
    { value: WrapTextType.RIGHT, label: 'docs-drawing-ui.image-text-wrap.rightOnly' },
];
type DistanceKey = 'distT' | 'distB' | 'distL' | 'distR';
const distances: { key: DistanceKey; label: LocaleKey }[] = [
    { key: 'distT', label: 'docs-drawing-ui.image-text-wrap.top' },
    { key: 'distB', label: 'docs-drawing-ui.image-text-wrap.bottom' },
    { key: 'distL', label: 'docs-drawing-ui.image-text-wrap.left' },
    { key: 'distR', label: 'docs-drawing-ui.image-text-wrap.right' },
];

interface IMobileDocDrawingTextWrapProps {
    wrappingStyle: TextWrappingStyle;
    wrapText: WrapTextType;
    distToText: Pick<IDocDrawingBase, DistanceKey>;
    minMargin: number;
    maxMargin: number;
    disableWrapText: boolean;
    disableDistTB: boolean;
    disableDistLR: boolean;
    onStyleChange: (value: TextWrappingStyle) => void;
    onWrapTextChange: (value: WrapTextType) => void;
    onDistanceChange: (value: number | null, direction: DistanceKey) => void;
}

function MobileDocDrawingTextWrapControls(props: IMobileDocDrawingTextWrapProps) {
    const localeService = useDependency(LocaleService);

    return (
        <div className="univer-flex univer-flex-col univer-gap-5">
            <div
                role="group"
                aria-label={localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.wrappingStyle')}
                className="univer-grid univer-gap-2"
            >
                {styles.map((option) => (
                    <MobileActionRow
                        key={option.value}
                        title={localeService.t<LocaleKey>(option.label)}
                        variant="subtle"
                        aria-pressed={props.wrappingStyle === option.value}
                        className="aria-pressed:!univer-bg-primary-50 aria-pressed:!univer-text-primary-600"
                        trailing={props.wrappingStyle === option.value ? <CheckMarkIcon /> : undefined}
                        onClick={() => props.onStyleChange(option.value)}
                    />
                ))}
            </div>
            {!props.disableWrapText && (
                <section className="univer-grid univer-gap-2">
                    <h3 className="univer-m-0 univer-text-sm univer-font-medium">{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.wrapText')}</h3>
                    <div className="univer-grid univer-grid-cols-3 univer-gap-2">
                        {sides.map((option) => (
                            <MobileActionRow
                                key={option.value}
                                title={localeService.t<LocaleKey>(option.label)}
                                variant="subtle"
                                aria-pressed={props.wrapText === option.value}
                                className="
                                  univer-px-2 univer-text-center univer-text-sm
                                  aria-pressed:!univer-bg-primary-50 aria-pressed:!univer-text-primary-600
                                "
                                onClick={() => props.onWrapTextChange(option.value)}
                            />
                        ))}
                    </div>
                </section>
            )}
            {(!props.disableDistTB || !props.disableDistLR) && (
                <section className="univer-grid univer-gap-3">
                    <h3 className="univer-m-0 univer-text-sm univer-font-medium">{localeService.t<LocaleKey>('docs-drawing-ui.image-text-wrap.distanceFromText')}</h3>
                    <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                        {distances.filter(({ key }) => (key === 'distT' || key === 'distB') ? !props.disableDistTB : !props.disableDistLR).map(({ key, label }) => (
                            <label key={key} className="univer-grid univer-gap-2 univer-text-sm">
                                {localeService.t<LocaleKey>(label)}
                                <InputNumber
                                    className="univer-h-12 univer-w-full"
                                    inputClassName="[&_input]:!univer-h-12 [&_input]:!univer-text-base"
                                    controls={false}
                                    min={props.minMargin}
                                    max={props.maxMargin}
                                    precision={1}
                                    value={props.distToText[key] ?? 0}
                                    onChange={(value) => props.onDistanceChange(value, key)}
                                />
                            </label>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
export function MobileDocDrawingTextWrap(props: IDocDrawingTextWrapProps) {
    const renderManagerService = useDependency(IRenderManagerService);
    const drawing = props.drawings[0];
    return drawing && renderManagerService.getRenderUnitById(drawing.unitId)?.scene
        ? <MobileDocDrawingTextWrapContent {...props} />
        : null;
}
function MobileDocDrawingTextWrapContent(props: IDocDrawingTextWrapProps) {
    const { showPanel, wrappingStyle, wrapText, distToText, disableWrapText, disableDistTB, disableDistLR, handleWrappingStyleChange, handleWrapTextChange, handleDistToTextChange, MIN_MARGIN, MAX_MARGIN } = useDocDrawingTextWrap(props);
    return showPanel
        ? (
            <MobileDocDrawingTextWrapControls
                wrappingStyle={wrappingStyle}
                wrapText={wrapText}
                distToText={distToText}
                minMargin={MIN_MARGIN}
                maxMargin={MAX_MARGIN}
                disableWrapText={disableWrapText}
                disableDistTB={disableDistTB}
                disableDistLR={disableDistLR}
                onStyleChange={handleWrappingStyleChange}
                onWrapTextChange={handleWrapTextChange}
                onDistanceChange={handleDistToTextChange}
            />
        )
        : null;
}
