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

import type { IFunctionInfo, IFunctionParam } from '@univerjs/engine-formula';
import type { IHelpFunctionOperationParams } from '../../../services/prompt.service';
import { IUniverInstanceService, LocaleService, useDependency, useInjector } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { CloseSingle, DetailsSingle, MoreSingle } from '@univerjs/icons';

import { ILayoutService, ISidebarService } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { throttleTime } from 'rxjs';
import { IFormulaPromptService } from '../../../services/prompt.service';
import { generateParam } from '../../../services/utils';
import { useResizeScrollObserver } from '../resize-scroll-observer';
import styles from './index.module.less';

export function HelpFunction() {
    const [visible, setVisible] = useState(false);
    const [contentVisible, setContentVisible] = useState(true);
    const [helpVisible, setHelpVisible] = useState(true);
    const [paramIndex, setParamIndex] = useState(0);
    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const [decoratorPosition, setDecoratorPosition] = useState({ left: 0, top: 0 });
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const promptService = useDependency(IFormulaPromptService);
    const localeService = useDependency(LocaleService);
    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');

    const univerInstanceService = useDependency(IUniverInstanceService);
    const editorService = useDependency(IEditorService);
    const sidebarService = useDependency(ISidebarService);
    const injector = useInjector();

    // window resize/scroll, update HelpFunction position
    useResizeScrollObserver(updatePosition);

    useEffect(() => {
        const subscription = promptService.help$.subscribe((params: IHelpFunctionOperationParams) => {
            const { visible, paramIndex, functionInfo } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            const position = getPosition();

            if (position == null) {
                return;
            }

            const { left, top, height } = position;

            if (functionInfo.description === '' && functionInfo.functionParameter.length === 0) {
                return;
            }

            setOffset([left, top + height]);
            setParamIndex(paramIndex);
            setFunctionInfo(functionInfo);
            setDecoratorPosition({ left, top });
            setVisible(visible);
        });

        const sidebarSubscription = sidebarService.scrollEvent$.pipe(throttleTime(100)).subscribe(updatePosition);

        return () => {
            subscription?.unsubscribe();
            sidebarSubscription.unsubscribe();
        };
    }, []);

    function updatePosition() {
        if (!helpVisible) {
            return;
        }

        const position = getPosition();

        if (position == null) {
            return;
        }

        const { left, top, height } = position;
        setOffset([left, top + height]);
    }

    function getPosition() {
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!documentDataModel) {
            return;
        }
        const editorUnitId = documentDataModel.getUnitId();

        if (!editorService.isEditor(editorUnitId)) {
            return;
        }

        const editor = editorService.getEditor(editorUnitId);
        return editor?.getBoundingClientRect();
    }

    function handleSwitchActive(paramIndex: number) {
        setParamIndex(paramIndex);
    }

    function handleClose() {
        setHelpVisible(!helpVisible);

        // focus editor
        // FIXME: @Jocs, still need re focus?
        const layoutService = injector.get(ILayoutService);
        layoutService.focus();
    }

    return (
        <>
            {helpVisible
                ? (
                    <Popup visible={visible} offset={offset}>
                        {functionInfo
                            ? (
                                <div className={styles.formulaHelpFunction}>
                                    <div className={styles.formulaHelpFunctionTitle}>
                                        <Help
                                            prefix={functionInfo.functionName}
                                            value={functionInfo.functionParameter}
                                            active={paramIndex}
                                            onClick={handleSwitchActive}
                                        />
                                        <div className={styles.formulaHelpFunctionTitleIcons}>
                                            <div
                                                className={styles.formulaHelpFunctionTitleIcon}
                                                style={{ transform: contentVisible ? 'rotateZ(-90deg)' : 'rotateZ(90deg)' }}
                                                onClick={() => setContentVisible(!contentVisible)}
                                            >
                                                <MoreSingle />
                                            </div>
                                            <div
                                                className={styles.formulaHelpFunctionTitleIcon}
                                                onClick={handleClose}
                                            >
                                                <CloseSingle />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={styles.formulaHelpFunctionContent}
                                        style={{
                                            height: contentVisible ? 'unset' : 0,
                                            padding: contentVisible ? 'revert-layer' : 0,
                                        }}
                                    >
                                        <div className={styles.formulaHelpFunctionContentInner}>
                                            <Params
                                                title={localeService.t('formula.prompt.helpExample')}
                                                value={`${functionInfo.functionName}(${functionInfo.functionParameter
                                                    .map((item) => item.example)
                                                    .join(',')})`}
                                            />
                                            <Params
                                                title={localeService.t('formula.prompt.helpAbstract')}
                                                value={functionInfo.description}
                                            />
                                            {functionInfo &&
                                        functionInfo.functionParameter &&
                                        functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                                            <Params
                                                key={i}
                                                className={paramIndex === i ? styles.formulaHelpFunctionActive : ''}
                                                title={item.name}
                                                value={`${item.require ? required : optional} ${item.detail}`}
                                            />
                                        ))}
                                        </div>
                                    </div>
                                </div>
                            )
                            : (
                                <></>
                            )}
                    </Popup>
                )
                : visible
                    ? (
                        <div
                            className={styles.formulaHelpDecorator}
                            onClick={() => setHelpVisible(!helpVisible)}
                            style={{ left: decoratorPosition.left - 24, top: decoratorPosition.top }}
                        >
                            <DetailsSingle />
                        </div>
                    )
                    : (
                        <></>
                    )}
        </>
    );
}

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
}

const Params = (props: IParamsProps) => (
    <div className={styles.formulaHelpFunctionContentParams}>
        <div className={`
          ${styles.formulaHelpFunctionContentParamsTitle}
          ${props.className}
        `}
        >
            {props.title}
        </div>
        <div className={styles.formulaHelpFunctionContentParamsDetail}>{props.value}</div>
    </div>
);

interface IHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
    active: number;
    onClick: (paramIndex: number) => void;
}

const Help = (props: IHelpProps) => {
    const { prefix, value, active, onClick } = props;
    return (
        <div className={styles.formulaHelpParam}>
            <span className={styles.formulaHelpParamPrefix}>
                {prefix}
                (
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    // TODO@Dushusir: more params needs to be active
                    <span key={i} className={styles.formulaHelpParamItem}>
                        <span
                            className={active === i ? styles.formulaHelpFunctionActive : styles.formulaHelpParamActive}
                            onClick={() => onClick(i)}
                        >
                            {generateParam(item)}
                        </span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            )
        </div>
    );
};
