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

const PARAGRAPH_SETTING_CONTROL_CLASS = 'univer-w-full';

const ParagraphSettingSection = (props: {
    title: ReactNode;
    children: ReactNode;
    first?: boolean;
}) => {
    const { title, children, first = false } = props;

    return (
        <section className={clsx(!first && 'univer-mt-5')}>
            <div className="univer-text-sm univer-font-medium univer-leading-5">{title}</div>
            <div className="univer-mt-3">{children}</div>
        </section>
    );
};

const ParagraphSettingRow = (props: {
    label: ReactNode;
    children: ReactNode;
}) => {
    const { label, children } = props;

    return (
        <div
            className="univer-grid univer-min-h-8 univer-items-center univer-gap-3"
            style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(160px, 180px)' }}
        >
            <div
                className="
                  univer-min-w-0 univer-text-xs univer-leading-5 univer-text-gray-900
                  dark:!univer-text-gray-100
                "
            >
                {label}
            </div>
            <div className="univer-w-full univer-min-w-0">
                {children}
            </div>
        </div>
    );
};

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
            className={clsx(PARAGRAPH_SETTING_CONTROL_CLASS, className)}
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
        <div className="univer-box-border univer-w-full">
            <ParagraphSettingSection title={localeService.t('docs-ui.doc.paragraphSetting.alignment')} first>
                <div
                    className={clsx('univer-grid univer-grid-cols-4 univer-gap-1 univer-rounded-lg univer-p-1', borderClassName)}
                >
                    {alignmentOptions.map((item) => {
                        return (
                            <Tooltip title={item.label} key={item.value} placement="bottom">
                                <button
                                    type="button"
                                    className={clsx(`
                                      univer-flex univer-h-8 univer-cursor-pointer univer-items-center
                                      univer-justify-center univer-rounded-md univer-border-none univer-bg-transparent
                                      univer-p-0
                                      hover:univer-bg-gray-100
                                      dark:hover:!univer-bg-gray-600
                                    `, {
                                        'univer-bg-gray-200 dark:!univer-bg-gray-500': horizontalAlignValue === item.value,
                                    })}
                                    onClick={() => setHorizontalAlign(item.value)}
                                >
                                    {item.icon}
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>
            </ParagraphSettingSection>

            <ParagraphSettingSection title={localeService.t('docs-ui.doc.paragraphSetting.indentation')}>
                <div className="univer-grid univer-gap-3">
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.left')}(px)`}>
                        <AutoFocusInputNumber value={indentStart} onChange={(v) => setIndentStart(v ?? 0)} />
                    </ParagraphSettingRow>
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.right')}(px)`}>
                        <AutoFocusInputNumber value={indentEnd} onChange={(v) => setIndentEnd(v ?? 0)} />
                    </ParagraphSettingRow>
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.firstLine')}(px)`}>
                        <AutoFocusInputNumber value={indentFirstLine} onChange={(v) => setIndentFirstLine(v ?? 0)} />
                    </ParagraphSettingRow>
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.hanging')}(px)`}>
                        <AutoFocusInputNumber value={hanging} onChange={(v) => setHanging(v ?? 0)} />
                    </ParagraphSettingRow>
                </div>
            </ParagraphSettingSection>

            <ParagraphSettingSection title={localeService.t('docs-ui.doc.paragraphSetting.spacing')}>
                <div className="univer-grid univer-gap-3">
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.before')}(px)`}>
                        <AutoFocusInputNumber value={spaceAbove} onChange={(v) => setSpaceAbove(v ?? 0)} />
                    </ParagraphSettingRow>
                    <ParagraphSettingRow label={`${localeService.t('docs-ui.doc.paragraphSetting.after')}(px)`}>
                        <AutoFocusInputNumber value={spaceBelow} onChange={(v) => setSpaceBelow(v ?? 0)} />
                    </ParagraphSettingRow>
                    <ParagraphSettingRow label={localeService.t('docs-ui.doc.paragraphSetting.lineSpace')}>
                        <div className="univer-flex univer-w-full univer-flex-col univer-gap-2">
                            <Select
                                className={PARAGRAPH_SETTING_CONTROL_CLASS}
                                value={`${spacingRule}`}
                                options={[
                                    { label: localeService.t('docs-ui.doc.paragraphSetting.multiSpace'), value: `${SpacingRule.AUTO}` },
                                    { label: localeService.t('docs-ui.doc.paragraphSetting.fixedValue'), value: `${SpacingRule.AT_LEAST}` },
                                ]}
                                onChange={(v) => setSpacingRule(Number(v))}
                            />
                            <AutoFocusInputNumber
                                {...lineSpaceConfig}
                                value={lineSpacing}
                                onChange={(v) => setLineSpacing(v ?? 0)}
                            />
                        </div>
                    </ParagraphSettingRow>
                </div>
            </ParagraphSettingSection>
        </div>
    );
}
