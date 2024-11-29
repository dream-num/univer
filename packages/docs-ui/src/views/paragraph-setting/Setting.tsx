/**
 * Copyright 2023-present DreamNum Inc.
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

import { HorizontalAlign, LocaleService, SpacingRule, useDependency } from '@univerjs/core';
import { InputNumber, Select, Tooltip } from '@univerjs/design';
import { AlignTextBothSingle, HorizontallySingle, LeftJustifyingSingle, RightJustifyingSingle } from '@univerjs/icons';
import clsx from 'clsx';
import * as React from 'react';
import { useMemo } from 'react';
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
import styles from './index.module.less';

const AutoFocusInputNumber = (props: {
    value: number; onChange: (v: number) => Promise<unknown>; className?: string; min?: number; max?: number; step?: number;
}) => {
    const { value, onChange, className = '', min = 0, max = 100, step = 1 } = props;
    const ref = React.useRef<HTMLInputElement>(null);
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
        >
        </InputNumber>
    );
};
export function ParagraphSetting() {
    const localeService = useDependency(LocaleService);

    const alignmentOptions = useMemo(() => [
        { label: localeService.t('toolbar.alignLeft'), value: String(HorizontalAlign.LEFT), icon: <LeftJustifyingSingle /> },
        { label: localeService.t('toolbar.alignCenter'), value: String(HorizontalAlign.CENTER), icon: <HorizontallySingle /> },
        { label: localeService.t('toolbar.alignRight'), value: String(HorizontalAlign.RIGHT), icon: <RightJustifyingSingle /> },
        { label: localeService.t('toolbar.alignJustify'), value: String(HorizontalAlign.JUSTIFIED), icon: <AlignTextBothSingle /> }],
    []);

    const currentParagraph = useCurrentParagraph();
    const [horizontalAlignValue, horizontalAlignSet] = useFirstParagraphHorizontalAlign(currentParagraph, alignmentOptions[0].value);

    const [indentStart, indentStartSet] = useFirstParagraphIndentStart(currentParagraph);
    const [indentEnd, indentEndSet] = useFirstParagraphIndentEnd(currentParagraph);
    const [indentFirstLine, indentFirstLineSet] = useFirstParagraphIndentFirstLine(currentParagraph);

    const [hanging, hangingSet] = useFirstParagraphIndentHanging(currentParagraph);

    const [spaceAbove, spaceAboveSet] = useFirstParagraphIndentSpaceAbove(currentParagraph);
    const [spaceBelow, spaceBelowSet] = useFirstParagraphSpaceBelow(currentParagraph);
    const { lineSpacing: [lineSpacing, lineSpacingSet], spacingRule: [spacingRule, spacingRuleSet] } = useFirstParagraphLineSpacing(currentParagraph);

    const lineSpaceConfig = useMemo(() => {
        if (spacingRule === SpacingRule.AUTO) {
            return { min: 1, max: 5, step: lineSpacing < 2 ? 0.5 : 1 };
        }
        return { min: 1, max: 100 };
    }, [spacingRule, lineSpacing]);

    return (
        <div className={styles.paragraphSetting}>
            <div className={styles.paragraphSettingTitle}>{localeService.t('doc.paragraphSetting.alignment')}</div>
            <div className={`
              ${styles.paragraphSettingIconList}
              ${styles.paragraphSettingMtBase}
            `}
            >
                {alignmentOptions.map((item) => {
                    return (
                        <Tooltip title={item.label} key={item.value} placement="bottom">
                            <span
                                className={clsx(styles.paragraphSettingIconListItem,
                                    { [styles.paragraphSettingIconListActive]: horizontalAlignValue === item.value })}

                                onClick={() => horizontalAlignSet(item.value)}
                            >
                                {item.icon}
                            </span>
                        </Tooltip>

                    );
                })}
            </div>
            <div className={styles.paragraphSettingTitle}>{localeService.t('doc.paragraphSetting.indentation')}</div>
            <div>
                <div className={styles.paragraphSettingFlexCol}>
                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.left')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={indentStart} onChange={(v) => indentStartSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
                <div className={styles.paragraphSettingFlexCol}>

                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.right')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={indentEnd} onChange={(v) => indentEndSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
                <div className={styles.paragraphSettingFlexCol}>

                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.firstLine')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={indentFirstLine} onChange={(v) => indentFirstLineSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
                <div className={styles.paragraphSettingFlexCol}>

                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.hanging')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={hanging} onChange={(v) => hangingSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
            </div>
            <div className={styles.paragraphSettingTitle}>{localeService.t('doc.paragraphSetting.spacing')}</div>
            <div>
                <div className={styles.paragraphSettingFlexCol}>

                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.before')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={spaceAbove} onChange={(v) => spaceAboveSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
                <div className={styles.paragraphSettingFlexCol}>

                    <div className={styles.paragraphSettingLabel}>
                        {localeService.t('doc.paragraphSetting.after')}
                        (px)
                    </div>
                    <AutoFocusInputNumber className={styles.paragraphSettingMtBase} value={spaceBelow} onChange={(v) => spaceBelowSet(v ?? 0)}></AutoFocusInputNumber>
                </div>
                <div className={styles.paragraphSettingFlexCol}>
                    <div className={styles.paragraphSettingLabel}>{localeService.t('doc.paragraphSetting.lineSpace')}</div>
                    <div
                        className={`
                          ${styles.paragraphSettingMtBase}
                          ${styles.paragraphSettingSpaceLine}
                        `}
                        style={{ width: 162 }}
                    >
                        <Select
                            value={`${spacingRule}`}
                            options={[
                                { label: localeService.t('doc.paragraphSetting.multiSpace'), value: `${SpacingRule.AUTO}` },
                                { label: localeService.t('doc.paragraphSetting.fixedValue'), value: `${SpacingRule.AT_LEAST}` },
                            ]}
                            onChange={(v) => spacingRuleSet(Number(v))}
                        >
                        </Select>
                        <AutoFocusInputNumber
                            {...lineSpaceConfig}
                            value={lineSpacing}
                            onChange={(v) => lineSpacingSet(v ?? 0)}
                        >
                        </AutoFocusInputNumber>
                    </div>

                </div>
            </div>
        </div>
    );
}
