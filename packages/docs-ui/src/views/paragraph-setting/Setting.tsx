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

import { HorizontalAlign, LocaleService, SpacingRule } from '@univerjs/core';
import { borderClassName, clsx, InputNumber, Select, Tooltip } from '@univerjs/design';
import { AlignTextBothIcon, HorizontallyIcon, LeftJustifyingIcon, RightJustifyingIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useMemo, useRef } from 'react';
import {
    useCurrentParagraph,
    useFirstParagraphHorizontalAlign,
    useFirstParagraphIndentEnd,
    useFirstParagraphIndentFirstLine,
    useFirstParagraphIndentHanging,
    useFirstParagraphIndentSpaceAbove,
    useFirstParagraphIndentStart,
    useFirstParagraphLineSpacing,
    useFirstParagraphSpaceBelow,
} from './hook/utils';

const AutoFocusInputNumber = (props: {
    value: number;
    onChange: (v: number) => Promise<unknown>;
    className?: string;
    min?: number;
    max?: number;
    step?: number;
}) => {
    const { value, onChange, className = '', min = 0, max = 100, step = 1 } = props;
    const ref = useRef<HTMLInputElement>(null);
    return (
        <InputNumber
            step={step}
            ref={ref}
            min={min}
            max={max}
            value={value}
            onChange={(v) => {
                onChange(v ?? 0).finally(() => {
                    //  TODO@gggpound: Give up using setTimeout and explicitly get the hook after the selection is reset.
                    // packages/engine-render/src/viewport.ts:1347, _emitScrollEnd$
                    // To re-focus after the scroll ends, you need to ensure that the re-focusing takes place after the scrolling process.
                    setTimeout(() => {
                        ref.current?.focus();
                    }, 30);
                });
            }}
            className={className}
        />
    );
};
export function ParagraphSetting() {
    const localeService = useDependency(LocaleService);

    const alignmentOptions = useMemo(() => [
        { label: localeService.t('toolbar.alignLeft'), value: String(HorizontalAlign.LEFT), icon: <LeftJustifyingIcon /> },
        { label: localeService.t('toolbar.alignCenter'), value: String(HorizontalAlign.CENTER), icon: <HorizontallyIcon /> },
        { label: localeService.t('toolbar.alignRight'), value: String(HorizontalAlign.RIGHT), icon: <RightJustifyingIcon /> },
        { label: localeService.t('toolbar.alignJustify'), value: String(HorizontalAlign.JUSTIFIED), icon: <AlignTextBothIcon /> },
    ], []);

    const currentParagraph = useCurrentParagraph();
    const [horizontalAlignValue, setHorizontalAlign] = useFirstParagraphHorizontalAlign(currentParagraph, alignmentOptions[0].value);

    const [indentStart, setIndentStart] = useFirstParagraphIndentStart(currentParagraph);
    const [indentEnd, setIndentEnd] = useFirstParagraphIndentEnd(currentParagraph);
    const [indentFirstLine, setIndentFirstLine] = useFirstParagraphIndentFirstLine(currentParagraph);

    const [hanging, setHanging] = useFirstParagraphIndentHanging(currentParagraph);

    const [spaceAbove, setSpaceAbove] = useFirstParagraphIndentSpaceAbove(currentParagraph);
    const [spaceBelow, setSpaceBelow] = useFirstParagraphSpaceBelow(currentParagraph);
    const { lineSpacing: [lineSpacing, setLineSpacing], spacingRule: [spacingRule, setSpacingRule] } = useFirstParagraphLineSpacing(currentParagraph);

    const lineSpaceConfig = useMemo(() => {
        if (spacingRule === SpacingRule.AUTO) {
            return { min: 1, max: 5, step: lineSpacing < 2 ? 0.5 : 1 };
        }
        return { min: 1, max: 100 };
    }, [spacingRule, lineSpacing]);

    return (
        <div>
            <div className="univer-t-4 univer-text-sm univer-font-medium">{localeService.t('doc.paragraphSetting.alignment')}</div>
            <div
                className={clsx(`
                  univer-mt-4 univer-box-border univer-flex univer-w-full univer-items-center univer-justify-between
                  univer-gap-1 univer-rounded-md univer-p-1
                `, borderClassName)}
            >
                {alignmentOptions.map((item) => {
                    return (
                        <Tooltip title={item.label} key={item.value} placement="bottom">
                            <span
                                className={clsx(`
                                  hover:univer-bg-black/60
                                  univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                                  univer-rounded univer-bg-none univer-px-3 univer-py-1
                                `, {
                                    'univer-bg-blend-color-dodge/90': horizontalAlignValue === item.value,
                                })}
                                onClick={() => setHorizontalAlign(item.value)}
                            >
                                {item.icon}
                            </span>
                        </Tooltip>

                    );
                })}
            </div>
            <div className="univer-t-4 univer-text-sm univer-font-medium">{localeService.t('doc.paragraphSetting.indentation')}</div>
            <div>
                <div className="univer-item-center univer-flex univer-justify-between">
                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.left')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={indentStart} onChange={(v) => setIndentStart(v ?? 0)} />
                </div>
                <div className="univer-item-center univer-flex univer-justify-between">

                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.right')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={indentEnd} onChange={(v) => setIndentEnd(v ?? 0)} />
                </div>
                <div className="univer-item-center univer-flex univer-justify-between">

                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.firstLine')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={indentFirstLine} onChange={(v) => setIndentFirstLine(v ?? 0)} />
                </div>
                <div className="univer-item-center univer-flex univer-justify-between">

                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.hanging')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={hanging} onChange={(v) => setHanging(v ?? 0)} />
                </div>
            </div>
            <div className="univer-t-4 univer-text-sm univer-font-medium">{localeService.t('doc.paragraphSetting.spacing')}</div>
            <div>
                <div className="univer-justify-betweenuniver-item-center univer-flex">

                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.before')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={spaceAbove} onChange={(v) => setSpaceAbove(v ?? 0)} />
                </div>
                <div className="univer-item-center univer-flex univer-justify-between">

                    <div className="univer-mt-3 univer-text-xs">
                        {localeService.t('doc.paragraphSetting.after')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className="univer-mt-4" value={spaceBelow} onChange={(v) => setSpaceBelow(v ?? 0)} />
                </div>
                <div className="item-center univer-flex univer-justify-between">
                    <div className="univer-mt-3 univer-text-xs">{localeService.t('doc.paragraphSetting.lineSpace')}</div>
                    <div
                        className="univer-mt-4 univer-flex univer-w-[162px] univer-flex-col univer-gap-1.5"
                    >
                        <Select
                            value={`${spacingRule}`}
                            options={[
                                { label: localeService.t('doc.paragraphSetting.multiSpace'), value: `${SpacingRule.AUTO}` },
                                { label: localeService.t('doc.paragraphSetting.fixedValue'), value: `${SpacingRule.AT_LEAST}` },
                            ]}
                            onChange={(v) => setSpacingRule(Number(v))}
                        />
                        <AutoFocusInputNumber
                            {...lineSpaceConfig}
                            value={lineSpacing}
                            onChange={(v) => setLineSpacing(v ?? 0)}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
