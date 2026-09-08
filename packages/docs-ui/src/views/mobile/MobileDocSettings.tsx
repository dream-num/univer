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

import type { IConfirmChildrenProps } from '@univerjs/ui';
import type { ComponentProps, ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import type { IParagraphAlignmentButtonProps, IParagraphSettingProps } from '../paragraph-setting/Setting';
import { BooleanNumber, LocaleService } from '@univerjs/core';
import { Button, Checkbox, clsx, InputNumber, MobileSelect } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { forwardRef } from 'react';
import { DocHeaderFooterPanel } from '../header-footer/panel/DocHeaderFooterPanel';
import { useHeaderFooterOptions } from '../header-footer/panel/use-header-footer-options';
import { PageSettings } from '../PageSettings';
import { ParagraphSettingIndex } from '../paragraph-setting/index';
import { SectionSettingIndex } from '../section-setting/index';

function MobileSettingRow({ label, unit, children }: { label: ReactNode; unit?: string; children: ReactNode }) {
    return (
        <div className="univer-flex univer-min-h-12 univer-flex-col univer-gap-2">
            <div
                className="
                  univer-text-sm univer-text-gray-900
                  dark:!univer-text-gray-100
                "
            >
                {label}
                {unit}
            </div>
            <div className="univer-w-full univer-min-w-0">{children}</div>
        </div>
    );
}

const MobileSettingNumber = forwardRef<HTMLInputElement, ComponentProps<typeof InputNumber>>((props, ref) => (
    <InputNumber
        {...props}
        ref={ref}
        className={clsx(props.className, 'univer-h-12 univer-w-full')}
        inputClassName={clsx(props.inputClassName, 'univer-text-base')}
    />
));

function MobileSettingSelect(props: ComponentProps<typeof MobileSelect>) {
    return <MobileSelect {...props} className={clsx(props.className, 'univer-h-12 univer-w-full')} />;
}

function MobileParagraphNumber({ min = 0, max = 100, step = 0.1, precision = 1, onChange, ...props }: ComponentProps<NonNullable<IParagraphSettingProps['NumberComponent']>>) {
    return <MobileSettingNumber {...props} min={min} max={max} step={step} precision={precision} onChange={(value) => onChange(value ?? 0)} />;
}

function MobileParagraphAlignmentButton({ label, selected, onClick, children }: IParagraphAlignmentButtonProps) {
    return (
        <Button
            type="button"
            variant="text"
            aria-label={label}
            aria-pressed={selected}
            className={clsx('univer-h-12 univer-w-full', { '!univer-bg-gray-200 dark:!univer-bg-gray-700': selected })}
            onClick={onClick}
        >
            <span className="univer-flex univer-size-5 univer-items-center univer-justify-center univer-text-lg">
                {children}
            </span>
        </Button>
    );
}

export function MobilePageSettings(props: IConfirmChildrenProps) {
    return <PageSettings {...props} InputNumberComponent={MobileSettingNumber} SelectComponent={MobileSettingSelect} />;
}

export function MobileParagraphSettings() {
    return (
        <ParagraphSettingIndex
            RowComponent={MobileSettingRow}
            NumberComponent={MobileParagraphNumber}
            SelectComponent={MobileSettingSelect}
            AlignmentButtonComponent={MobileParagraphAlignmentButton}
        />
    );
}

export function MobileSectionSettings() {
    return <SectionSettingIndex RowComponent={MobileSettingRow} InputNumberComponent={MobileSettingNumber} SelectComponent={MobileSettingSelect} />;
}

export function MobileHeaderFooterPanel() {
    return <DocHeaderFooterPanel ContentComponent={MobileHeaderFooterOptions} />;
}

function MobileHeaderFooterOptions({ unitId }: { unitId: string }) {
    const localeService = useDependency(LocaleService);
    const { canLinkToPrevious, linkedToPrevious, options, handleLinkToPreviousChange, handleCheckboxChange, handleMarginChange, closeHeaderFooter } = useHeaderFooterOptions(unitId);
    return (
        <div className="univer-grid univer-gap-4">
            {canLinkToPrevious && (
                <div className="univer-flex univer-min-h-12 univer-items-center">
                    <Checkbox checked={linkedToPrevious} onChange={(val) => { handleLinkToPreviousChange(Boolean(val)); }}>
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.linkToPrevious')}
                    </Checkbox>
                </div>
            )}
            <div className="univer-grid univer-gap-2">
                <div className="univer-flex univer-min-h-12 univer-items-center">
                    <Checkbox
                        checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(Boolean(val), 'useFirstPageHeaderFooter'); }}
                    >
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.firstPageCheckBox')}
                    </Checkbox>
                </div>
                <div className="univer-flex univer-min-h-12 univer-items-center">
                    <Checkbox
                        checked={options.evenAndOddHeaders === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(Boolean(val), 'evenAndOddHeaders'); }}
                    >
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.oddEvenCheckBox')}
                    </Checkbox>
                </div>
            </div>

            <div className="univer-mb-1 univer-flex univer-flex-col univer-gap-3">
                <div className="univer-flex univer-flex-col univer-gap-2">
                    <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.headerTopMargin')}</span>
                    <MobileSettingNumber
                        className="univer-h-12 univer-w-full"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginHeader}
                        onChange={(val) => { handleMarginChange(val ?? 0, 'marginHeader'); }}
                    />
                </div>
                <div className="univer-flex univer-flex-col univer-gap-2">
                    <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.footerBottomMargin')}</span>
                    <MobileSettingNumber
                        className="univer-h-12 univer-w-full"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginFooter}
                        onChange={(val) => { handleMarginChange(val ?? 0, 'marginFooter'); }}
                    />
                </div>
            </div>

            <div className="univer-flex">
                <Button className="univer-h-12 univer-w-full" onClick={closeHeaderFooter}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.closeHeaderFooter')}
                </Button>
            </div>
        </div>
    );
}
