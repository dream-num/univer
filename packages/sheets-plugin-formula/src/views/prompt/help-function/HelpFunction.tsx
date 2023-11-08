import { LocaleService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { CloseSingle, DetailsSingle, MoreSingle } from '@univerjs/icons';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { FUNCTION_LIST, IFunctionInfo, IFunctionParam } from '../../../services/function-list';
import { IFormulaPromptService, IHelpFunctionCommandParams } from '../../../services/prompt.service';
import styles from './index.module.less';

export function HelpFunction() {
    const [visible, setVisible] = useState(false);
    const [contentVisible, setContentVisible] = useState(true);
    const [helpVisible, setHelpVisible] = useState(true);
    const [paramIndex, setParamIndex] = useState(0);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const [decoratorPosition, setDecoratorPosition] = useState({ left: 0, top: 0 });
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        const subscription = promptService.help$.subscribe((params: IHelpFunctionCommandParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { visible, functionName, paramIndex } = params;
            const info = FUNCTION_LIST.find((item) => item.n === functionName);
            if (!info) return;

            const localeInfo: IFunctionInfo = {
                n: info.n as string,
                t: info.t,
                d: localeService.t(info.d) as string,
                a: localeService.t(info.a) as string,
                m: info.m,
                p: info.p.map((item) => ({
                    name: localeService.t(item.name) as string,
                    detail: localeService.t(item.detail) as string,
                    example: item.example,
                    require: item.require,
                    repeat: item.repeat,
                    type: item.type,
                })),
            };
            const { startX = 0, startY = 0, endY = 0 } = selection;
            setOffset([startX, endY]);
            setParamIndex(paramIndex);
            setFunctionInfo(localeInfo);
            setVisible(visible);
            setDecoratorPosition({ left: startX, top: startY });
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleSwitchActive = (paramIndex: number) => {
        setParamIndex(paramIndex);
    };

    return (
        <>
            {helpVisible ? (
                <Dropdown
                    visible={visible}
                    align={{ offset }}
                    overlay={
                        functionInfo ? (
                            <div className={styles.formulaHelpFunction}>
                                <div className={styles.formulaHelpFunctionTitle}>
                                    <Help
                                        title={functionInfo.n}
                                        value={functionInfo.p}
                                        type="name"
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
                                            onClick={() => setHelpVisible(!helpVisible)}
                                        >
                                            <CloseSingle />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={styles.formulaHelpFunctionContent}
                                    style={{ height: contentVisible ? 'unset' : 0 }}
                                >
                                    <div className={styles.formulaHelpFunctionContentInner}>
                                        <Params
                                            title={localeService.t('formula.formulaMore.helpExample') as string}
                                            value={`${functionInfo.n}(${functionInfo.p
                                                .map((item) => item.example)
                                                .join(',')})`}
                                        />
                                        <Params
                                            title={localeService.t('formula.formulaMore.helpAbstract') as string}
                                            value={functionInfo.d}
                                        />
                                        {functionInfo &&
                                            functionInfo.p &&
                                            functionInfo.p.map((item: IFunctionParam, i: number) => (
                                                <Params
                                                    key={i}
                                                    className={paramIndex === i ? styles.formulaHelpFunctionActive : ''}
                                                    title={item.name}
                                                    value={item.detail}
                                                    active={paramIndex}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )
                    }
                >
                    <span></span>
                </Dropdown>
            ) : (
                <div
                    className={styles.formulaHelpDecorator}
                    onClick={() => setHelpVisible(!helpVisible)}
                    style={{ left: decoratorPosition.left - 24, top: decoratorPosition.top }}
                >
                    <DetailsSingle />
                </div>
            )}
        </>
    );
}

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
    active?: number;
}

const Params = (props: IParamsProps) => (
    <div className={styles.formulaHelpFunctionContentParams}>
        <div className={`${styles.formulaHelpFunctionContentParamsTitle} ${props.className}`}>{props.title}</div>
        <div className={styles.formulaHelpFunctionContentParamsDetail}>{props.value}</div>
    </div>
);

interface IHelpProps {
    title?: string;
    value?: IFunctionParam[];
    type: string;
    active: number;
    onClick: (paramIndex: number) => void;
}

const Help = (props: IHelpProps) => {
    const { title, value, type, active, onClick } = props;
    return (
        <div>
            <span>
                {title}
                {'('}
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    // TODO@Dushusir: more params needs to be active
                    <span key={i}>
                        <span
                            className={active === i ? styles.formulaHelpFunctionActive : ''}
                            onClick={() => onClick(i)}
                        >
                            {(item as any)[`${type}`]}
                        </span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            <span>{')'}</span>
        </div>
    );
};
