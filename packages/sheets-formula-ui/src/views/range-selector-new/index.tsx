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

import type { IUnitRangeName, Nullable } from '@univerjs/core';
import type { Editor, IRichTextEditorProps } from '@univerjs/docs-ui';
import type { ReactNode } from 'react';
import { LocaleService, RichTextBuilder } from '@univerjs/core';
import { Button, Dialog, Input, Tooltip } from '@univerjs/design';
import { IEditorService, RichTextEditor } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, LexerTreeBuilder, matchToken, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { CloseSingle, DeleteSingle, IncreaseSingle, SelectRangeSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { rangePreProcess } from '../range-selector/utils/range-pre-process';
import { useRangesHighlight } from './hooks/use-ranges-highlight';
import { useRangeSelectorSelectionChange } from './hooks/use-selection-change';
import styles from './index.module.less';

export interface IRangeSelectorProps extends IRichTextEditorProps {
    unitId: string;
    subUnitId: string;
    onVerify?: (result: string) => Nullable<ReactNode>;
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
};

export interface IRangeSelectorDialogProps {
    visible: boolean;
    initialValue: IUnitRangeName[];
    unitId: string;
    subUnitId: string;
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
    onConfirm: (ranges: IUnitRangeName[]) => void;
    onClose: () => void;
    onShowBySelection?: () => void;
}

export function RangeSelectorPopup(props: IRangeSelectorDialogProps) {
    const { visible, initialValue, unitId, subUnitId, maxRangeCount = Infinity, supportAcrossSheet, onConfirm, onClose, onShowBySelection } = props;
    const localeService = useDependency(LocaleService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const [ranges, setRanges] = useState<string[]>([]);
    const [focusIndex, setFocusIndex] = useState(0);

    useEffect(() => {
        if (visible && initialValue.length) {
            setRanges(initialValue.map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range)));
        } else {
            setRanges(['']);
        }
    }, [visible]);

    const handleRangeInput = (index: number, value: string) => {
        const newRanges = [...ranges];
        newRanges[index] = value;
        setRanges(newRanges);
    };
    const handleRangeAdd = () => {
        setRanges([...ranges, '']);
        setFocusIndex(ranges.length);
    };

    const handleRangeRemove = (index: number) => {
        ranges.splice(index, 1);
        setRanges([...ranges]);
    };

    useRangeSelectorSelectionChange({
        unitId,
        subUnitId,
        supportAcrossSheet,
        onChange: (range) => {
            if (!visible) {
                if (onShowBySelection?.()) {
                    return;
                }
            }

            const newRanges = [...ranges];
            newRanges[focusIndex] = !range.sheetName ? serializeRange(range.range) : serializeRangeWithSheet(range.sheetName, range.range);
            setRanges(newRanges);
        },
    });

    return (
        <Dialog
            width="328px"
            visible={visible}
            title={localeService.t('rangeSelector.title')}
            draggable
            closeIcon={<CloseSingle />}
            footer={(
                <footer>
                    <Button onClick={onClose}>{localeService.t('rangeSelector.cancel')}</Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                            onConfirm(
                                ranges
                                    .filter((text) => {
                                        const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
                                        return nodes && nodes.length === 1 && typeof nodes[0] !== 'string' && nodes[0].nodeType === sequenceNodeType.REFERENCE;
                                    })
                                    .map((text) => deserializeRangeWithSheet(text)).map((unitRange) => ({ ...unitRange, range: rangePreProcess(unitRange.range) }))
                            );
                        }}
                        type="primary"
                    >
                        {localeService.t('rangeSelector.confirm')}
                    </Button>
                </footer>
            )}
            onClose={onClose}
        >
            <div className={styles.sheetRangeSelectorDialog}>
                {ranges.map((text, index) => (
                    <div key={index} className={styles.sheetRangeSelectorDialogItem}>
                        <Input
                            affixWrapperStyle={{ width: '100%' }}
                            placeholder={localeService.t('rangeSelector.placeHolder')}
                            onFocus={() => setFocusIndex(index)}
                            value={text}
                            onChange={(value) => handleRangeInput(index, value)}
                            style={{ borderColor: focusIndex === index ? 'rgb(var(--primary-color))' : undefined }}
                        />
                        {ranges.length > 1 && <DeleteSingle className={styles.sheetRangeSelectorDialogItemDelete} onClick={() => handleRangeRemove(index)} />}
                    </div>
                ))}
                {ranges.length < maxRangeCount && (
                    <div>
                        <Button type="link" size="small" onClick={handleRangeAdd}>
                            <IncreaseSingle />
                            <span>{localeService.t('rangeSelector.addAnotherRange')}</span>
                        </Button>
                    </div>
                )}
            </div>
        </Dialog>
    );
}

export function parseRanges(rangeString: string) {
    return rangeString.split(matchToken.COMMA).filter((e) => !!e).map((text) => deserializeRangeWithSheet(text));
}

export function stringifyRanges(ranges: IUnitRangeName[]) {
    return ranges
        .map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range))
        .join(matchToken.COMMA);
}

export function RangeSelectorNew(props: IRangeSelectorProps) {
    const editorRef = useRef<Editor>(null);
    const { unitId, subUnitId, onVerify, maxRangeCount, supportAcrossSheet, autoFocus, onChange } = props;
    const [focusing, setFocusing] = useState(autoFocus ?? false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [rangeSelectorRanges, setRangeSelectorRanges] = useState<IUnitRangeName[]>([]);
    const localeService = useDependency(LocaleService);
    const editorService = useDependency(IEditorService);

    useRangesHighlight(editorRef.current, focusing);

    const blurEditor = () => {
        editorRef.current?.setSelectionRanges([]);
        editorRef.current?.blur();
        editorService.blur();
    };

    const handleOpenModal = () => {
        blurEditor();
        setRangeSelectorRanges(parseRanges(editorRef.current?.getDocumentDataModel().getPlainText() ?? ''));
        setPopupVisible(true);
    };

    return (
        <>
            <RichTextEditor
                isSingle
                {...props}
                onFocusChange={(focusing) => {
                    setFocusing(focusing);
                    props.onFocusChange?.(focusing);
                }}
                editorRef={editorRef}
                onClickOutside={() => {
                    if (!focusing) return;
                    setFocusing(false);
                    props.onClickOutside?.();
                    blurEditor();
                }}
                icon={(
                    <Tooltip title={localeService.t('rangeSelector.buttonTooltip')} placement="bottom">
                        <SelectRangeSingle className={styles.sheetRangeSelectorIcon} onClick={handleOpenModal} />
                    </Tooltip>
                )}
            />
            <RangeSelectorPopup
                initialValue={rangeSelectorRanges}
                unitId={unitId}
                subUnitId={subUnitId}
                visible={popupVisible}
                maxRangeCount={maxRangeCount}
                onConfirm={(ranges) => {
                    const resultStr = stringifyRanges(ranges);
                    const empty = RichTextBuilder.newEmptyData();
                    empty.body!.dataStream = resultStr;
                    editorRef.current?.replaceText(resultStr, []);
                    onChange?.(empty, resultStr);
                    setPopupVisible(false);
                    setRangeSelectorRanges([]);
                    requestAnimationFrame(() => {
                        blurEditor();
                    });
                }}
                onClose={() => {
                    setPopupVisible(false);
                    setRangeSelectorRanges([]);
                }}
                supportAcrossSheet={supportAcrossSheet}
                onShowBySelection={() => {
                    if (focusing) {
                        setPopupVisible(true);
                    } else {
                        return true;
                    }
                }}
            />
        </>
    );
}
