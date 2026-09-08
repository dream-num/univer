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

import type { ComponentType, ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import { HorizontalAlign, LocaleService } from '@univerjs/core';
import { borderClassName, Button, clsx, InputNumber, Select, Tooltip } from '@univerjs/design';
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
import { getLineSpacingInputConfig, LINE_SPACING_RULE_OPTIONS } from './line-spacing';

const ALIGNMENT_OPTIONS = [
    { label: 'docs-ui.toolbar.alignLeft', value: String(HorizontalAlign.LEFT), icon: <LeftJustifyingIcon /> },
    { label: 'docs-ui.toolbar.alignCenter', value: String(HorizontalAlign.CENTER), icon: <HorizontallyIcon /> },
    { label: 'docs-ui.toolbar.alignRight', value: String(HorizontalAlign.RIGHT), icon: <RightJustifyingIcon /> },
    { label: 'docs-ui.toolbar.alignJustify', value: String(HorizontalAlign.JUSTIFIED), icon: <AlignTextBothIcon /> },
] satisfies Array<{ label: LocaleKey; value: string; icon: ReactNode }>;

const ParagraphSettingSection = (props: {
    title: string;
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
    label: string;
    unit?: string;
    children: ReactNode;
}) => {
    const { label, unit, children } = props;

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
                {unit}
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
    precision?: number;
}) => {
    const { value, onChange, className = '', min = 0, max = 100, step = 0.1, precision = 1 } = props;
    const ref = useRef<HTMLInputElement>(null);
    return (
        <InputNumber
            step={step}
            precision={precision}
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
            className={clsx('univer-w-full', className)}
        />
    );
};
export interface IParagraphSettingProps {
    RowComponent?: typeof ParagraphSettingRow;
    NumberComponent?: typeof AutoFocusInputNumber;
    SelectComponent?: typeof Select;
    AlignmentButtonComponent?: ComponentType<IParagraphAlignmentButtonProps>;
}

export interface IParagraphAlignmentButtonProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    children: ReactNode;
}

function ParagraphAlignmentButton({ label, selected, onClick, children }: IParagraphAlignmentButtonProps) {
    return (
        <Tooltip title={label} placement="bottom">
            <Button
                type="button"
                variant="text"
                aria-label={label}
                className={clsx({ '!univer-bg-gray-200 dark:!univer-bg-gray-700': selected })}
                onClick={onClick}
            >
                <span className="univer-flex univer-size-5 univer-items-center univer-justify-center univer-text-lg">
                    {children}
                </span>
            </Button>
        </Tooltip>
    );
}

export function ParagraphSetting({
    RowComponent = ParagraphSettingRow,
    NumberComponent = AutoFocusInputNumber,
    SelectComponent = Select,
    AlignmentButtonComponent = ParagraphAlignmentButton,
}: IParagraphSettingProps) {
    const localeService = useDependency(LocaleService);

    const currentParagraph = useCurrentParagraph();
    const [horizontalAlignValue, setHorizontalAlign] = useFirstParagraphHorizontalAlign(currentParagraph, ALIGNMENT_OPTIONS[0].value);

    const [indentStart, setIndentStart] = useFirstParagraphIndentStart(currentParagraph);
    const [indentEnd, setIndentEnd] = useFirstParagraphIndentEnd(currentParagraph);
    const [indentFirstLine, setIndentFirstLine] = useFirstParagraphIndentFirstLine(currentParagraph);

    const [hanging, setHanging] = useFirstParagraphIndentHanging(currentParagraph);

    const [spaceAbove, setSpaceAbove] = useFirstParagraphIndentSpaceAbove(currentParagraph);
    const [spaceBelow, setSpaceBelow] = useFirstParagraphSpaceBelow(currentParagraph);
    const { lineSpacing: [lineSpacing, setLineSpacing], spacingRule: [spacingRule, setSpacingRule] } = useFirstParagraphLineSpacing(currentParagraph);

    const lineSpaceConfig = useMemo(() => getLineSpacingInputConfig(spacingRule), [spacingRule]);
    const lineSpacingOptions = LINE_SPACING_RULE_OPTIONS.map((option) => ({ ...option, label: localeService.t(option.label) }));

    return (
        <div className="univer-box-border univer-w-full">
            <ParagraphSettingSection title={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.alignment')} first>
                <div
                    className={clsx(`
                      univer-flex univer-grid-cols-4 univer-items-center univer-justify-around univer-gap-2
                      univer-rounded-lg univer-bg-gray-0 univer-p-1
                      dark:!univer-bg-gray-900
                    `, borderClassName)}
                >
                    {ALIGNMENT_OPTIONS.map((item) => {
                        return (
                            <span
                                key={item.value}
                                className="univer-flex univer-w-full univer-items-center univer-justify-center"
                            >
                                <AlignmentButtonComponent
                                    label={localeService.t(item.label)}
                                    selected={horizontalAlignValue === item.value}
                                    onClick={() => setHorizontalAlign(item.value)}
                                >
                                    {item.icon}
                                </AlignmentButtonComponent>
                            </span>
                        );
                    })}
                </div>
            </ParagraphSettingSection>

            <ParagraphSettingSection title={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.indentation')}>
                <div className="univer-grid univer-gap-3">
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.left')} unit="(px)">
                        <NumberComponent value={indentStart} onChange={(v) => setIndentStart(v ?? 0)} />
                    </RowComponent>
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.right')} unit="(px)">
                        <NumberComponent value={indentEnd} onChange={(v) => setIndentEnd(v ?? 0)} />
                    </RowComponent>
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.firstLine')} unit="(px)">
                        <NumberComponent value={indentFirstLine} onChange={(v) => setIndentFirstLine(v ?? 0)} />
                    </RowComponent>
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.hanging')} unit="(px)">
                        <NumberComponent value={hanging} onChange={(v) => setHanging(v ?? 0)} />
                    </RowComponent>
                </div>
            </ParagraphSettingSection>

            <ParagraphSettingSection title={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.spacing')}>
                <div className="univer-grid univer-gap-3">
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.before')} unit="(px)">
                        <NumberComponent value={spaceAbove} onChange={(v) => setSpaceAbove(v ?? 0)} />
                    </RowComponent>
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.after')} unit="(px)">
                        <NumberComponent value={spaceBelow} onChange={(v) => setSpaceBelow(v ?? 0)} />
                    </RowComponent>
                    <RowComponent label={localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.lineSpace')}>
                        <div className="univer-flex univer-w-full univer-flex-col univer-gap-2">
                            <SelectComponent
                                className="univer-w-full"
                                value={`${spacingRule}`}
                                options={lineSpacingOptions}
                                onChange={(v) => setSpacingRule(Number(v))}
                            />
                            <NumberComponent
                                {...lineSpaceConfig}
                                value={lineSpacing}
                                onChange={(v) => setLineSpacing(v ?? 0)}
                            />
                        </div>
                    </RowComponent>
                </div>
            </ParagraphSettingSection>
        </div>
    );
}
