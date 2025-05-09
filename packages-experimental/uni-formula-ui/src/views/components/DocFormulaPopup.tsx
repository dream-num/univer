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

import type { IDocumentData, Nullable } from '@univerjs/core';
import type { IUniFormulaPopupInfo } from '../../services/formula-popup.service';

import {
    BooleanNumber,
    createInternalEditorID,
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    DocumentFlavor,
    HorizontalAlign,
    ICommandService,
    LocaleService,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { CheckMarkSingle, CloseSingle } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CloseFormulaPopupOperation, ConfirmFormulaPopupCommand } from '../../commands/operations/operation';
import { DOC_FORMULA_POPUP_KEY, UniFormulaPopupService } from '../../services/formula-popup.service';

export const UNI_FORMULA_EDITOR_ID = createInternalEditorID('UNI_FORMULA');

function makeSnapshot(f: string): IDocumentData {
    return {
        id: UNI_FORMULA_EDITOR_ID,
        body: {
            dataStream: `${f}${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [],
            paragraphs: [
                {
                    startIndex: 0,
                },
            ],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            marginTop: 5,
            marginBottom: 5,
            marginRight: 0,
            marginLeft: 0,
            paragraphLineGapDefault: 0,
            pageSize: {
                width: Number.POSITIVE_INFINITY,
                height: Number.POSITIVE_INFINITY,
            },
            renderConfig: {
                horizontalAlign: HorizontalAlign.UNSPECIFIED,
                verticalAlign: VerticalAlign.TOP,
                centerAngle: 0,
                vertexAngle: 0,
                wrapStrategy: WrapStrategy.OVERFLOW,
                isRenderStyle: BooleanNumber.FALSE,
            },
        },
    };
}

export function UniFormulaPopup() {
    const docFormulaPopupService = useDependency(UniFormulaPopupService);
    const popupInfo = useObservable(docFormulaPopupService.popupInfo$);

    if (!popupInfo) {
        return null;
    }

    return <DocFormula popupInfo={popupInfo} />;
}

UniFormulaPopup.componentKey = DOC_FORMULA_POPUP_KEY;

function DocFormula(props: { popupInfo: IUniFormulaPopupInfo }) {
    const { popupInfo } = props;
    const { f } = popupInfo;

    const localeService = useDependency(LocaleService);
    const formulaPopupService = useDependency(UniFormulaPopupService);
    const commandService = useDependency(ICommandService);

    const [formulaString, setFormulaString] = useState<Nullable<string>>(f);
    const snapshotRef = useRef(makeSnapshot(f ?? ''));

    const [focused, setFocused] = useState(false);

    const onFormulaStringChange = useCallback((formulaString: string) => {
        setFormulaString(formulaString);
        formulaPopupService.cacheFormulaString(formulaString);
    }, [formulaPopupService]);

    const onConfirm = useCallback(() => {
        // TODO: call operation instead
        commandService.executeCommand(ConfirmFormulaPopupCommand.id);
    }, [commandService]);

    const onHovered = useCallback((hovered: boolean) => {
        formulaPopupService.hoverPopup(hovered);
    }, [formulaPopupService]);

    const onCancel = useCallback(() => {
        commandService.executeCommand(CloseFormulaPopupOperation.id);
    }, [commandService]);

    const handleEscKey = useCallback((event: { key: string }) => {
        if (event.key === 'Escape') {
            onCancel();
        }
    }, [onCancel]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [handleEscKey]);

    return (
        <div
            className={clsx(`
              univer-box-border univer-flex univer-h-12 univer-w-[482px] univer-items-center univer-gap-x-2
              univer-overflow-hidden univer-rounded-lg u univer-border-gray-200 univer-bg-white univer-p-2
              univer-shadow-lg
              dark:univer-bg-gray-900
            `, borderClassName)}
            onMouseEnter={() => onHovered(true)}
            onMouseLeave={() => onHovered(false)}
        >
            {/* TODO@wzhudev: fix DocFormulaFloat */}
            {/* <TextEditor
                id={UNI_FORMULA_EDITOR_ID}
                className={clsx(styles.docUiFormulaPopupEditor, focused && styles.docUiFormulaPopupEditorActivated)}
                placeholder={localeService.t('uni-formula.popup.placeholder')}
                snapshot={snapshotRef.current}
                cancelDefaultResizeListener
                value={f ?? ''}
                isSingle
                isFormulaEditor
                onChange={(str) => onFormulaStringChange(str ?? '')}
                onFocus={() => {
                    formulaPopupService.lockPopup();
                    setFocused(true);
                }}
                onBlur={() => setFocused(false)}
            /> */}
            <div className="univer-flex">
                <span
                    className="univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-p-1"
                    onClick={onCancel}
                >
                    <CloseSingle />
                </span>
                <span
                    className="univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-p-1"
                    onClick={onConfirm}
                >
                    <CheckMarkSingle />
                </span>
            </div>
        </div>
    );
}
