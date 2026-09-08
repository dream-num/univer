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

import type { MobileDrawerSnap } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import type { IRangeSelectorDialogProps } from './index';
import { LocaleService } from '@univerjs/core';
import { Button, clsx, ConfigContext, Input, MobileActionRowGroup, scrollbarClassName } from '@univerjs/design';
import {
    deserializeRangeWithSheet,
    LexerTreeBuilder,
    sequenceNodeType,
    serializeRange,
    serializeRangeWithSheet,
} from '@univerjs/engine-formula';
import { DeleteIcon, IncreaseIcon } from '@univerjs/icons';
import { MobileDrawer, useDependency } from '@univerjs/ui';
import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRangeSelectorSelectionChange } from './hooks/use-selection-change';
import { rangePreProcess } from './utils/range-pre-process';

export function MobileRangeSelectorDialog(props: IRangeSelectorDialogProps) {
    const {
        visible,
        initialValue,
        unitId,
        subUnitId,
        maxRangeCount = Infinity,
        supportAcrossSheet,
        keepSheetReference,
        onConfirm,
        onClose,
        onShowBySelection,
    } = props;
    const localeService = useDependency(LocaleService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const [ranges, setRanges] = useState<string[]>([]);
    const [focusIndex, setFocusIndex] = useState(0);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const layerRef = useRef<HTMLDivElement>(null);
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const maxHeight = globalThis.CSS?.supports('height', '1dvh') ? '22dvh' : '22vh';
    const { direction, mountContainer } = useContext(ConfigContext);

    useEffect(() => {
        if (visible && initialValue.length) {
            const newRanges = initialValue.map((range) => range.sheetName
                ? serializeRangeWithSheet(range.sheetName, range.range)
                : serializeRange(range.range));
            setRanges(newRanges);
            setFocusIndex(newRanges.length - 1);
        } else {
            setRanges(['']);
            setFocusIndex(0);
        }
    }, [initialValue, visible]);

    useRangeSelectorSelectionChange({
        unitId,
        subUnitId,
        supportAcrossSheet,
        keepSheetReference,
        onChange: (selections, isStart) => {
            if (!visible && onShowBySelection?.(selections)) {
                return;
            }

            const current = new Set(ranges);
            const selectionRanges = selections.map((range) => range.sheetName
                ? serializeRangeWithSheet(range.sheetName, range.range)
                : serializeRange(range.range));
            const addedRanges = selectionRanges.filter((item) => !current.has(item));
            if (!addedRanges.length) {
                return;
            }

            const newRanges = [...ranges];
            if (selectionRanges.length > 1) {
                if (!isStart) {
                    newRanges.splice(focusIndex, 1);
                }
                newRanges.push(...addedRanges);
                const finalRanges = newRanges.slice(0, maxRangeCount);
                setRanges(finalRanges);
                setFocusIndex(finalRanges.length - 1);
                requestAnimationFrame(() => {
                    scrollbarRef.current?.scrollTo({ top: scrollbarRef.current.scrollHeight });
                });
            } else {
                newRanges.splice(focusIndex, 1, ...addedRanges);
                const finalRanges = newRanges.slice(0, maxRangeCount);
                setRanges(finalRanges);
                setFocusIndex(focusIndex + addedRanges.length - 1);
            }
        },
    });

    if (!visible || !mountContainer) {
        return null;
    }

    function confirmRanges() {
        onConfirm(
            ranges
                .filter((text) => {
                    const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
                    return nodes && nodes.length === 1 && typeof nodes[0] !== 'string' && nodes[0].nodeType === sequenceNodeType.REFERENCE;
                })
                .map((text) => deserializeRangeWithSheet(text))
                .map((unitRange) => ({ ...unitRange, range: rangePreProcess(unitRange.range) }))
        );
    }

    function handleRangeInput(index: number, value: string) {
        const newRanges = [...ranges];
        newRanges[index] = value;
        setRanges(newRanges);
    }

    function handleRangeRemove(index: number) {
        setRanges(ranges.filter((_, rangeIndex) => rangeIndex !== index));
    }

    function renderRangeInput(text: string, index: number) {
        return (
            <div key={index} className="univer-mb-2 univer-flex univer-items-center univer-gap-2">
                <Input
                    className={clsx('univer-box-border univer-h-10 univer-w-full', {
                        'univer-border-primary-600': focusIndex === index,
                    })}
                    placeholder={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.placeHolder')}
                    onFocus={() => setFocusIndex(index)}
                    value={text}
                    onChange={(value) => handleRangeInput(index, value)}
                />
                {ranges.length > 1 && (
                    <button
                        type="button"
                        className="
                          univer-flex univer-size-10 univer-shrink-0 univer-items-center univer-justify-center
                          univer-rounded-lg univer-border-0 univer-bg-transparent univer-text-gray-600
                          active:univer-bg-gray-100
                          dark:!univer-text-gray-300
                          dark:active:!univer-bg-gray-700
                        "
                        onClick={() => handleRangeRemove(index)}
                    >
                        <DeleteIcon className="univer-cursor-pointer" />
                    </button>
                )}
            </div>
        );
    }

    const title = localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.title');

    return createPortal(
        <div
            ref={layerRef}
            dir={direction}
            className="univer-pointer-events-none univer-visible univer-fixed univer-inset-0 univer-z-[1300]"
        >
            <MobileDrawer
                layerRef={layerRef}
                componentName="mobile-range-selector-drawer"
                openMode="push"
                snap={drawerSnap}
                expandLabel={title}
                collapseLabel={title}
                onSnapChange={setDrawerSnap}
                onClose={onClose}
                role="dialog"
                ariaLabel={title}
                panelClassName="
                  univer-pointer-events-auto univer-bg-gray-0 univer-text-gray-900
                  dark:!univer-bg-gray-900 dark:!univer-text-gray-0
                "
                contentClassName="univer-min-h-0 univer-px-4"
                header={(
                    <header
                        className="
                          univer-flex univer-h-12 univer-flex-1 univer-items-center univer-px-4 univer-text-base
                          univer-font-semibold
                        "
                    >
                        {title}
                    </header>
                )}
                footer={(
                    <footer className="univer-box-border univer-shrink-0 univer-p-4">
                        <MobileActionRowGroup>
                            <Button onClick={onClose}>
                                {localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.cancel')}
                            </Button>
                            <Button variant="primary" onClick={confirmRanges}>
                                {localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.confirm')}
                            </Button>
                        </MobileActionRowGroup>
                    </footer>
                )}
            >
                <div
                    ref={scrollbarRef}
                    className={clsx('univer-overflow-y-auto', scrollbarClassName)}
                    style={{ maxHeight }}
                >
                    {ranges.map(renderRangeInput)}
                    {ranges.length < maxRangeCount && (
                        <Button
                            className="univer-h-10 univer-w-full"
                            variant="link"
                            onClick={() => {
                                setRanges([...ranges, '']);
                                setFocusIndex(ranges.length);
                            }}
                        >
                            <IncreaseIcon />
                            <span>{localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.addAnotherRange')}</span>
                        </Button>
                    )}
                </div>
            </MobileDrawer>
        </div>,
        mountContainer
    );
}
