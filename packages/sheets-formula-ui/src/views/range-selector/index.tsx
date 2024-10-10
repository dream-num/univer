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
import type { Editor } from '@univerjs/docs-ui';
import type { ReactNode } from 'react';
import { createInternalEditorID, debounce, generateRandomId, ICommandService, IUniverInstanceService, LocaleService, useDependency } from '@univerjs/core';
import { Button, Dialog, Input, Tooltip } from '@univerjs/design';
import { DocBackScrollRenderController, IEditorService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, LexerTreeBuilder, matchToken, sequenceNodeType } from '@univerjs/engine-formula';
import { CloseSingle, DeleteSingle, IncreaseSingle, SelectRangeSingle } from '@univerjs/icons';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { RANGE_SELECTOR_SYMBOLS, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';

import cl from 'clsx';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFormulaToken } from './hooks/useFormulaToken';
import { buildTextRuns, useColor, useDocHight, useSheetHighlight } from './hooks/useHighlight';
import { useRefactorEffect } from './hooks/useRefactorEffect';

import { useResize } from './hooks/useResize';
import { useSheetSelectionChange } from './hooks/useSheetSelectionChange';
import styles from './index.module.less';
import { rangePreProcess } from './utils/rangePreProcess';
import { sequenceNodeToText } from './utils/sequenceNodeToText';
import { unitRangesToText } from './utils/unitRangesToText';
import { verifyRange } from './utils/verifyRange';

interface IRangeSelectorProps {
    initValue: string | IUnitRangeName[];
    onChange: (result: string) => void;
    unitId: string;
    subUnitId: string;
    errorText?: string | ReactNode;
    onVerify?: (res: boolean, result: string) => void;
    placeholder?: string;
    isFocus?: boolean;
    actions?: {
        handleOutClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb: (v: boolean) => void) => void;
    };
};

export function RangeSelector(props: IRangeSelectorProps) {
    const { initValue, unitId, subUnitId, onChange, onVerify, errorText, placeholder, isFocus: _isFocus = true, actions } = props;

    const editorService = useDependency(IEditorService);
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const rangeSelectorWrapRef = useRef<HTMLDivElement>(null);
    const [rangeDialogVisible, rangeDialogVisibleSet] = useState(false);
    const [isFocus, isFocusSet] = useState(_isFocus);
    const editorId = useMemo(() => createInternalEditorID(`${RANGE_SELECTOR_SYMBOLS}-${generateRandomId(4)}`), []);
    const [editor, editorSet] = useState<Editor>();
    const containerRef = useRef<HTMLDivElement>(null);

    const [rangeString, rangeStringSet] = useState(() => {
        if (typeof initValue === 'string') {
            return initValue;
        } else {
            return unitRangesToText(initValue, unitId, subUnitId, univerInstanceService).join(matchToken.COMMA);
        }
    });

    // init actions
    if (actions) {
        actions.handleOutClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb: (v: boolean) => void) => {
            if (rangeSelectorWrapRef.current) {
                const isContain = rangeSelectorWrapRef.current.contains(e.target as Node);
                cb(isContain);
            }
        };
    }

    const ranges = useMemo(() => {
        return rangeString.split(matchToken.COMMA).filter((e) => !!e).map((text) => deserializeRangeWithSheet(text));
    }, [rangeString]);

    const isError = useMemo(() => errorText !== undefined, [errorText]);

    const handleInputDebounce = useMemo(() => debounce((text: string) => {
        const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
        if (nodes) {
            const verify = verifyRange(nodes);
            if (verify) {
                const preNodes = nodes.map((node) => {
                    if (typeof node === 'string') {
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        const unitRange = deserializeRangeWithSheet(node.token);
                        unitRange.range = rangePreProcess(unitRange.range);
                        node.token = unitRangesToText([unitRange], unitId, subUnitId, univerInstanceService)[0];
                    }
                    return node;
                });
                const result = sequenceNodeToText(preNodes);
                onChange(result);
            }
        } else {
            rangeStringSet('');
        }
    }, 30), []);

    const handleConfirm = (ranges: IUnitRangeName[]) => {
        const text = unitRangesToText(ranges, unitId, subUnitId, univerInstanceService).join(matchToken.COMMA);
        rangeStringSet(text);
        onChange(text);
        rangeDialogVisibleSet(false);
    };

    const handleClose = () => {
        rangeDialogVisibleSet(false);
    };

    const handleOpenModal = () => {
        if (!isError) {
            rangeDialogVisibleSet(true);
        }
    };

    const focus = useMemo(() => {
        let time: NodeJS.Timeout = 0 as any;
        return () => {
            clearTimeout(time);
            if (editor) {
                time = setTimeout(() => {
                    editor.focus();
                }, 30);
            }
        };
    }, [editor]);

    const { checkScrollBar } = useResize(editor);

    const handleSheetSelectionChange = useMemo(() => {
        return (text: string, offset: number) => {
            rangeStringSet(text);
            onChange(text);
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
        };
    }, [editor]);

    const { sequenceNodes, sequenceNodesSet } = useFormulaToken(rangeString);
    const sheetHighlightRanges = useDocHight(editorId, sequenceNodes);
    useSheetHighlight(!rangeDialogVisible && isFocus, unitId, subUnitId, sheetHighlightRanges);

    useSheetSelectionChange(!rangeDialogVisible && isFocus, unitId, subUnitId, sequenceNodes, handleSheetSelectionChange);

    useRefactorEffect(!rangeDialogVisible && isFocus, unitId);

    useEffect(() => {
        if (onVerify) {
            const result = verifyRange(sequenceNodes);
            onVerify(result, sequenceNodeToText(sequenceNodes));
        }
    }, [sequenceNodes, onVerify]);

    useEffect(() => {
        if (editor) {
            const dispose = editor.input$.subscribe((e) => {
                const text = (e.data.body?.dataStream ?? '').replaceAll(/\n|\r/g, '');
                rangeStringSet(text);
                handleInputDebounce(text);
            });
            return () => {
                dispose.unsubscribe();
            };
        }
    }, [editor]);

    useEffect(() => {
        const d1 = commandService.beforeCommandExecuted((info) => {
            if (info.id === SetWorksheetActiveOperation.id) {
                isFocusSet(false);
                // Refresh the component
                sequenceNodesSet((pre) => [...pre]);
            }
        });
        const d2 = commandService.onCommandExecuted((info) => {
            if (info.id === SetCellEditVisibleOperation.id) {
                rangeDialogVisibleSet(false);
                isFocusSet(false);
            }
        });
        return () => {
            d1.dispose();
            d2.dispose();
        };
    }, []);

    useEffect(() => {
        isFocusSet(_isFocus);
    }, [_isFocus]);

    useEffect(() => {
        if (editor && rangeDialogVisible) {
            editor.blur();
            const d = editor.focus$.subscribe(() => {
                editor.blur();
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor, rangeDialogVisible]);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (containerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
                isSingle: true,
                initialSnapshot: {
                    id: editorId,
                    body: { dataStream: '\r\n' },
                    documentStyle: {},
                },
            }, containerRef.current);
            const editor = editorService.getEditor(editorId)! as Editor;
            editorSet(editor);
        }
        return () => {
            dispose?.dispose();
        };
    }, [containerRef.current]);

    return (
        <div className={styles.sheetRangeSelector} ref={rangeSelectorWrapRef}>
            <div className={cl(styles.sheetRangeSelectorTextWrap, {
                [styles.sheetRangeSelectorActive]: isFocus && !isError,
                [styles.sheetRangeSelectorError]: isError,
            })}
            >
                <div className={styles.sheetRangeSelectorText} ref={containerRef}>
                </div>
                <Tooltip title={localeService.t('rangeSelector.buttonTooltip')} placement="bottom">
                    <SelectRangeSingle className={styles.sheetRangeSelectorIcon} onClick={handleOpenModal} />
                </Tooltip>
                {errorText !== undefined ? <div className={styles.sheetRangeSelectorErrorWrap}>{errorText}</div> : null}
                {(placeholder !== undefined && !rangeString) ? <div className={styles.sheetRangeSelectorPlaceholder}>{placeholder}</div> : null}
            </div>

            {rangeDialogVisible && (
                <RangeSelectorDialog
                    handleConfirm={handleConfirm}
                    handleClose={handleClose}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    initValue={ranges}
                    visible={rangeDialogVisible}
                >
                </RangeSelectorDialog>
            )}
        </div>
    );
}

function RangeSelectorDialog(props: {
    handleConfirm: (ranges: IUnitRangeName[]) => void;
    handleClose: () => void;
    visible: boolean;
    initValue: IUnitRangeName[];
    unitId: string;
    subUnitId: string;
}) {
    const { handleConfirm, handleClose: _handleClose, visible, initValue, unitId, subUnitId } = props;

    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const descriptionService = useDependency(IDescriptionService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const [ranges, rangesSet] = useState(() => unitRangesToText(initValue, unitId, subUnitId, univerInstanceService));

    const [focusIndex, focusIndexSet] = useState(() => ranges.length - 1);

    const colorMap = useColor();

    const rangeText = useMemo(() => ranges.join(matchToken.COMMA), [ranges]);
    const { sequenceNodes, sequenceNodesSet } = useFormulaToken(rangeText);

    const refSelections = useMemo(() => buildTextRuns(descriptionService, colorMap, sequenceNodes).refSelections, [sequenceNodes]);
    useSheetHighlight(visible, unitId, subUnitId, refSelections);

    const handleClose = () => {
        // remove
        sequenceNodesSet([]);
        setTimeout(() => {
            _handleClose();
        }, 30);
    };
    const handleRangeInput = (index: number, value: string) => {
        rangesSet((v) => {
            const result = [...v];
            result[index] = value;
            return result;
        });
    };

    const handleRangeRemove = (index: number) => {
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
        rangesSet((v) => {
            v.push('A1');
            focusIndexSet(v.length - 1);
            return [...v];
        });
    };

    const handleSheetSelectionChange = useCallback((rangeText: string) => {
        rangesSet(rangeText.split(matchToken.COMMA).filter((e) => !!e));
    }, [focusIndex]);

    useSheetSelectionChange(focusIndex >= 0, unitId, subUnitId, sequenceNodes, handleSheetSelectionChange);
    useRefactorEffect(focusIndex >= 0, unitId);
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
                    <div key={index} className={styles.sheetRangeSelectorDialogItem}>
                        <Input
                            affixWrapperStyle={{ width: '100%' }}
                            placeholder={localeService.t('rangeSelector.placeHolder')}
                            key={`input_${index}`}
                            onFocus={() => focusIndexSet(index)}
                            value={text}
                            onChange={(value) => handleRangeInput(index, value)}
                        />
                        {ranges.length > 1 && <DeleteSingle className={styles.sheetRangeSelectorDialogItemDelete} onClick={() => handleRangeRemove(index)} />}

                    </div>
                ))}

                <div>
                    <Button type="link" size="small" onClick={handleRangeAdd}>
                        <IncreaseSingle />
                        <span>{localeService.t('rangeSelector.addAnotherRange')}</span>
                    </Button>
                </div>
            </div>

        </Dialog>
    );
}
