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

import type { IDisposable, IUnitRangeName } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { Editor } from '@univerjs/docs-ui';
import type { ReactNode } from 'react';
import type { IRefSelection } from './hooks/useHighlight';
import { BuildTextUtils, createInternalEditorID, generateRandomId, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency, useObservable } from '@univerjs/core';
import { Button, Dialog, Input, Tooltip } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { DocBackScrollRenderController, IEditorService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, LexerTreeBuilder, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CloseSingle, DeleteSingle, IncreaseSingle, SelectRangeSingle } from '@univerjs/icons';

import { IDescriptionService } from '@univerjs/sheets-formula';
import { RANGE_SELECTOR_SYMBOLS, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { useEvent } from '@univerjs/ui';
import cl from 'clsx';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { noop, throttleTime } from 'rxjs';
import { RefSelectionsRenderService } from '../../services/render-services/ref-selections.render-service';
import { useEditorInput } from './hooks/useEditorInput';
import { useFirstHighlightDoc } from './hooks/useFirstHighlightDoc';
import { useFocus } from './hooks/useFocus';
import { useFormulaToken } from './hooks/useFormulaToken';
import { buildTextRuns, useColor, useDocHight, useSheetHighlight } from './hooks/useHighlight';
import { useLeftAndRightArrow } from './hooks/useLeftAndRightArrow';
import { useOnlyOneRange } from './hooks/useOnlyOneRange';
import { useRefactorEffect } from './hooks/useRefactorEffect';
import { useRefocus } from './hooks/useRefocus';
import { useResetSelection } from './hooks/useResetSelection';
import { useResize } from './hooks/useResize';
import { useSheetSelectionChange } from './hooks/useSheetSelectionChange';
import { useSwitchSheet } from './hooks/useSwitchSheet';
import { useVerify } from './hooks/useVerify';
import styles from './index.module.less';
import { rangePreProcess } from './utils/rangePreProcess';
import { sequenceNodeToText } from './utils/sequenceNodeToText';
import { unitRangesToText } from './utils/unitRangesToText';
import { verifyRange } from './utils/verifyRange';

export interface IRangeSelectorProps {
    initValue: string | IUnitRangeName[];
    onChange: (result: string) => void;
    unitId: string;
    subUnitId: string;
    errorText?: string | ReactNode;
    onVerify?: (res: boolean, result: string) => void;
    placeholder?: string;
    isFocus?: boolean;
    onBlur?: () => void;

    onFocus?: () => void;

    actions?: {
        handleOutClick?: (e: MouseEvent, cb: () => void) => void;
    };

    /**
     * 是否只允许最多一个 range 区域,默认为 false。
     * @type {boolean}
     */
    isOnlyOneRange?: boolean;

    /**
     * 是否支持跨表选择选区.
     * 如果不支持,那么会舍弃所有的 sheetName 信息
     * @type {boolean}
     * @memberof IRangeSelectorProps
     */
    isSupportAcrossSheet?: boolean;

    onRangeSelectorDialogVisibleChange?: (visible: boolean) => void;
};

const noopFunction = () => { };
export function RangeSelector(props: IRangeSelectorProps) {
    const {
        initValue,
        unitId,
        subUnitId,
        errorText,
        placeholder,
        actions,
        onChange: propOnChange = noopFunction,
        onVerify = noopFunction,
        onRangeSelectorDialogVisibleChange = noopFunction,
        onBlur = noopFunction,
        onFocus = noopFunction,
        isFocus: _isFocus = true,
        isOnlyOneRange = false,
        isSupportAcrossSheet = false,
    } = props;
    const onChange = useEvent(propOnChange);
    const editorService = useDependency(IEditorService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const rangeSelectorWrapRef = useRef<HTMLDivElement>(null);
    const [rangeDialogVisible, rangeDialogVisibleSet] = useState(false);
    const [isFocus, isFocusSet] = useState(_isFocus);
    const editorId = useMemo(() => createInternalEditorID(`${RANGE_SELECTOR_SYMBOLS}-${generateRandomId(4)}`), []);
    const editorRef = useRef<Editor>();
    const editor = editorRef.current;
    const containerRef = useRef<HTMLDivElement>(null);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const isNeed = useMemo(() => !rangeDialogVisible && isFocus, [rangeDialogVisible, isFocus]);
    const [rangeString, rangeStringSet] = useState(() => {
        if (typeof initValue === 'string') {
            return initValue;
        } else {
            return unitRangesToText(initValue, isSupportAcrossSheet).join(matchToken.COMMA);
        }
    });
    const currentDoc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC), [univerInstanceService]);
    const currentDoc = useObservable(currentDoc$);
    const docFocusing = currentDoc?.getUnitId() === editorId;
    const refSelections = useRef<IRefSelection[]>([]);

    const clickOutside = useEvent((e: MouseEvent, cb: () => void) => {
        if (rangeSelectorWrapRef.current && !rangeDialogVisible) {
            const isContain = rangeSelectorWrapRef.current.contains(e.target as Node);
            !isContain && cb();
        }
    });

    // init actions
    if (actions) {
        actions.handleOutClick = clickOutside;
    }

    const ranges = useMemo(() => {
        return rangeString.split(matchToken.COMMA).filter((e) => !!e).map((text) => deserializeRangeWithSheet(text));
    }, [rangeString]);

    const isError = useMemo(() => errorText !== undefined, [errorText]);

    const resetSelection = useResetSelection(!rangeDialogVisible && isFocus, unitId, subUnitId);

    const handleInput = useMemo(() => (text: string) => {
        const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
        if (nodes) {
            const verify = verifyRange(nodes);
            if (verify) {
                const preNodes = nodes.map((node) => {
                    if (typeof node === 'string') {
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        // The 'sequenceNodesBuilder' will cache the results.
                        // You Can't modify the reference here. This will cause a cache error
                        const cloneNode = { ...node };
                        const unitRange = deserializeRangeWithSheet(node.token);
                        unitRange.range = rangePreProcess(unitRange.range);
                        if (!isSupportAcrossSheet) {
                            unitRange.sheetName = '';
                            unitRange.unitId = '';
                        }
                        cloneNode.token = unitRangesToText([unitRange], isSupportAcrossSheet)[0];
                        return cloneNode;
                    }
                    return node;
                });
                const result = sequenceNodeToText(preNodes);
                onChange(result);
            }
        } else {
            rangeStringSet('');
        }
    }, [isSupportAcrossSheet]);

    const focus = useFocus(editor);

    const { checkScrollBar } = useResize(editor, true, true);
    const getFormulaToken = useFormulaToken();
    const sequenceNodes = useMemo(() => getFormulaToken(rangeString), [rangeString]);

    const highlightDoc = useDocHight();
    const highlightSheet = useSheetHighlight(unitId, subUnitId);
    const highligh = useEvent((text: string, isNeedResetSelection: boolean = true, showSelection = true) => {
        if (!editorRef.current) {
            return;
        }
        const sequenceNodes = getFormulaToken(text);
        const ranges = highlightDoc(editorRef.current, sequenceNodes, isNeedResetSelection);
        refSelections.current = ranges;
        if (showSelection) {
            highlightSheet(ranges, editorRef.current);
        }
    });

    useEffect(() => {
        const sub = commandService.onCommandExecuted((info) => {
            if (info.id === RichTextEditingMutation.id) {
                const params = info.params as IRichTextEditingMutationParams;
                const { unitId } = params;
                if (unitId === editorId) {
                    onChange(BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? ''));
                }
            }
        });
        return () => sub.dispose();
    }, [commandService, editor, editorId, onChange]);

    const handleSheetSelectionChange = useEvent((text: string, offset: number, isEnd: boolean) => {
        highligh(text);
        rangeStringSet(text);
        if (isEnd) {
            focus();
            if (offset !== -1) {
                    // 在渲染结束之后再设置选区
                setTimeout(() => {
                    const range = { startOffset: offset, endOffset: offset };
                    editor?.setSelectionRanges([range]);
                    const docBackScrollRenderController = editor?.render.with(DocBackScrollRenderController);
                    docBackScrollRenderController?.scrollToRange({ ...range, collapsed: true });
                }, 50);
            }
            checkScrollBar();
        }
    });

    useSheetSelectionChange(isNeed, unitId, subUnitId, sequenceNodes, isSupportAcrossSheet, isOnlyOneRange, handleSheetSelectionChange);

    useRefactorEffect(isNeed, isNeed && docFocusing, unitId);

    useOnlyOneRange(unitId, isOnlyOneRange);

    useEditorInput(unitId, rangeString, editor);

    useVerify(isNeed, onVerify, sequenceNodes);

    useLeftAndRightArrow(isNeed, 0, editor);

    useRefocus();

    useSwitchSheet(isNeed, unitId, isSupportAcrossSheet, isFocusSet, onBlur, () => {
        if (isNeed) {
            highligh(rangeString);
        }
    });

    useEffect(() => {
        if (editor) {
            const dispose = editor.input$.pipe(throttleTime(100)).subscribe((e) => {
                const text = (e.data.body?.dataStream ?? '').replaceAll(/\n|\r/g, '').replaceAll(/,{2,}/g, ',').replaceAll(/(^,)/g, '');
                highligh(text, false);
                rangeStringSet(text);
            });
            return () => {
                dispose.unsubscribe();
            };
        }
    }, [editor]);

    useEffect(() => {
        const d = commandService.onCommandExecuted((info) => {
            if (info.id === SetCellEditVisibleOperation.id) {
                rangeDialogVisibleSet(false);
                onRangeSelectorDialogVisibleChange(false);
                isFocusSet(false);
                onBlur();
            }
        });
        return () => {
            d.dispose();
        };
    }, [isSupportAcrossSheet]);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (containerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
                initialSnapshot: {
                    id: editorId,
                    body: { dataStream: `${rangeString}\r\n`, textRuns: [] },
                    documentStyle: {},
                },
            }, containerRef.current);
            const editor = editorService.getEditor(editorId)! as Editor;
            editorRef.current = editor;
            highligh(rangeString, false, false);
        }
        return () => {
            dispose?.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (_isFocus) {
            isFocusSet(_isFocus);
            focus();
        } else {
            editor?.blur();
            resetSelection();
            isFocusSet(_isFocus);
        }
    }, [_isFocus, focus]);

    useFirstHighlightDoc(rangeString, '', isFocus, highlightDoc, highlightSheet, editor);

    const handleClick = () => {
        onFocus();
        focus();
        isFocusSet(true);
    };

    const handleConfirm = (ranges: IUnitRangeName[]) => {
        const text = unitRangesToText(ranges, isSupportAcrossSheet).join(matchToken.COMMA);
        if (!text) {
            editor?.setDocumentData({ ...editor.getDocumentData(), body: { dataStream: '\r\n', textRuns: [] } });
        }
        highligh(text);
        rangeStringSet(text);
        rangeDialogVisibleSet(false);
        onRangeSelectorDialogVisibleChange(false);
        setTimeout(() => {
            isFocusSet(true);
            editor?.setSelectionRanges([{ startOffset: text.length, endOffset: text.length }]);
            focus();
            checkScrollBar();
        }, 30);
    };

    const handleClose = () => {
        rangeDialogVisibleSet(false);
        onRangeSelectorDialogVisibleChange(false);
        setTimeout(() => {
            isFocusSet(true);
            focus();
        }, 30);
    };

    const handleOpenModal = () => {
        if (!isError) {
            focus();
            // 从另一个 editor 直接打开的时候,调整下事件监听顺序,确保打开面板的逻辑在 editor 切换之后
            setTimeout(() => {
                rangeDialogVisibleSet(true);
                onRangeSelectorDialogVisibleChange(true);
                isFocusSet(false);
            }, 30);
        }
    };

    return (
        <div className={styles.sheetRangeSelector} ref={rangeSelectorWrapRef}>
            <div className={cl(styles.sheetRangeSelectorTextWrap, {
                [styles.sheetRangeSelectorActive]: isFocus && !isError,
                [styles.sheetRangeSelectorError]: isError,
            })}
            >
                <div className={styles.sheetRangeSelectorText} ref={containerRef} onMouseUp={handleClick}>
                </div>
                <Tooltip title={localeService.t('rangeSelector.buttonTooltip')} placement="bottom">
                    <SelectRangeSingle className={styles.sheetRangeSelectorIcon} onClick={handleOpenModal} />
                </Tooltip>
                {errorText !== undefined ? <div className={styles.sheetRangeSelectorErrorWrap}>{errorText}</div> : null}
                {(placeholder !== undefined && !rangeString) ? <div className={styles.sheetRangeSelectorPlaceholder}>{placeholder}</div> : null}
            </div>

            {rangeDialogVisible && (
                <RangeSelectorDialog
                    editorId={editorId}
                    handleConfirm={handleConfirm}
                    handleClose={handleClose}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    initValue={ranges}
                    visible={rangeDialogVisible}
                    isOnlyOneRange={isOnlyOneRange}
                    isSupportAcrossSheet={isSupportAcrossSheet}
                >
                </RangeSelectorDialog>
            )}
        </div>
    );
}

function RangeSelectorDialog(props: {
    editorId: string;
    handleConfirm: (ranges: IUnitRangeName[]) => void;
    handleClose: () => void;
    visible: boolean;
    initValue: IUnitRangeName[];
    unitId: string;
    subUnitId: string;
    isOnlyOneRange: boolean;
    isSupportAcrossSheet: boolean;
}) {
    const { handleConfirm, handleClose: _handleClose, visible, initValue, unitId, subUnitId, isOnlyOneRange, isSupportAcrossSheet } = props;
    const localeService = useDependency(LocaleService);
    const descriptionService = useDependency(IDescriptionService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    const [ranges, rangesSet] = useState(() => {
        if (isOnlyOneRange) {
            const firstRange = initValue[0];
            if (firstRange) {
                return unitRangesToText([firstRange], isSupportAcrossSheet);
            } else {
                return [''];
            }
        }
        return unitRangesToText(initValue, isSupportAcrossSheet);
    });

    const [focusIndex, focusIndexSet] = useState(() => ranges.length - 1);

    const colorMap = useColor();

    const rangeText = useMemo(() => ranges.join(matchToken.COMMA), [ranges]);
    const getFormulaToken = useFormulaToken();
    const sequenceNodes = useMemo(() => getFormulaToken(rangeText), [rangeText]);

    const refSelections = useMemo(() => buildTextRuns(descriptionService, colorMap, sequenceNodes).refSelections, [sequenceNodes]);

    const handleClose = () => {
        rangesSet([]);
        setTimeout(() => {
            _handleClose();
        }, 30);
    };
    const handleRangeInput = (index: number, value: string) => {
        if (!value) {
            refSelectionsRenderService?.setSkipLastEnabled(true);
        } else {
            refSelectionsRenderService?.setSkipLastEnabled(false);
        }
        rangesSet((v) => {
            const result = [...v];
            result[index] = value;
            return result;
        });
    };

    const handleRangeRemove = (index: number) => {
        refSelectionsRenderService?.setSkipLastEnabled(false);
        rangesSet((v) => {
            if (v.length === 1) {
                return v;
            }
            const result: string[] = [];
            v.forEach((r, i) => {
                if (index !== i) {
                    result.push(r);
                }
            });
            return result;
        });
    };

    const handleRangeAdd = () => {
        refSelectionsRenderService?.setSkipLastEnabled(true);
        rangesSet((v) => {
            v.push('');
            focusIndexSet(v.length - 1);
            return [...v];
        });
    };

    const handleSheetSelectionChange = useEvent((rangeText: string) => {
        refSelectionsRenderService?.setSkipLastEnabled(false);
        const ranges = rangeText.split(matchToken.COMMA).filter((e) => !!e);
        if (isOnlyOneRange) {
            rangesSet([ranges[0] ?? '']);
        } else {
            rangesSet(ranges);
        }
    });

    const highlightSheet = useSheetHighlight(unitId, subUnitId);
    useSheetSelectionChange(focusIndex >= 0, unitId, subUnitId, sequenceNodes, isSupportAcrossSheet, isOnlyOneRange, handleSheetSelectionChange);
    useRefactorEffect(focusIndex >= 0, focusIndex >= 0, unitId);
    useOnlyOneRange(unitId, isOnlyOneRange);
    useSwitchSheet(focusIndex >= 0, unitId, isSupportAcrossSheet, noop, noop, () => highlightSheet(refSelections));

    useEffect(() => {
        highlightSheet(refSelections);
    }, [refSelections]);

    // 如果只有一个空 range,那么默认自动添加 range
    useEffect(() => {
        if (ranges.length === 0 || (ranges.length === 1 && !ranges[0])) {
            refSelectionsRenderService?.setSkipLastEnabled(true);
        }
    }, [ranges]);

    return (
        <Dialog
            width="328px"
            visible={visible}
            title={localeService.t('rangeSelector.title')}
            draggable
            closeIcon={<CloseSingle />}
            footer={(
                <footer>
                    <Button onClick={handleClose}>{localeService.t('rangeSelector.cancel')}</Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        onClick={() => handleConfirm(ranges.filter((text) => {
                            const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
                            return nodes && nodes.length === 1 && typeof nodes[0] !== 'string' && nodes[0].nodeType === sequenceNodeType.REFERENCE;
                        }).map((text) => deserializeRangeWithSheet(text)).map((unitRange) => ({ ...unitRange, range: rangePreProcess(unitRange.range) })))}
                        type="primary"
                    >
                        {localeService.t('rangeSelector.confirm')}
                    </Button>
                </footer>
            )}
            onClose={handleClose}
        >
            <div className={styles.sheetRangeSelectorDialog}>
                {ranges.map((text, index) => (
                    <div key={`${text}_${index}`} className={styles.sheetRangeSelectorDialogItem}>
                        <Input
                            affixWrapperStyle={{ width: '100%' }}
                            placeholder={localeService.t('rangeSelector.placeHolder')}
                            key={`input_${index}`}
                            onFocus={() => focusIndexSet(index)}
                            value={text}
                            onChange={(value) => handleRangeInput(index, value)}
                        />
                        {ranges.length > 1 && !isOnlyOneRange && <DeleteSingle className={styles.sheetRangeSelectorDialogItemDelete} onClick={() => handleRangeRemove(index)} />}

                    </div>
                ))}

                {!isOnlyOneRange && (
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
