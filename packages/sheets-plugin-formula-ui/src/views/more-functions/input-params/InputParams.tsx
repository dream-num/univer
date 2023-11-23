import { IFunctionInfo, IFunctionParam } from '@univerjs/base-formula-engine';
import { RangeSelector } from '@univerjs/ui-plugin-sheets';
import React, { useState } from 'react';

import { FunctionParams } from '../function-params/FunctionParams';
import styles from './index.module.less';

export interface IInputParamsProps {
    functionInfo: IFunctionInfo | null;
    onChange: (params: string[]) => void;
}

export function InputParams(props: IInputParamsProps) {
    const { functionInfo, onChange } = props;
    const [params, setParams] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    function handleRangeChange(range: string, paramIndex: number) {
        const newParams = [...params];
        newParams[paramIndex] = range;
        setParams(newParams);
        onChange(newParams);
    }

    return (
        <div className={styles.formulaInputParams}>
            <div className={styles.formulaInputParamsList}>
                {functionInfo &&
                    functionInfo.functionParameter &&
                    functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                        <div key={i}>
                            <div className={styles.formulaInputParamsListItemName}>{item.name}</div>

                            <div className={styles.formulaInputParamsListItemSelector}>
                                <RangeSelector
                                    onChange={(range: string) => handleRangeChange(range, i)}
                                    onActive={() => setActiveIndex(i)}
                                />
                            </div>
                        </div>
                    ))}
            </div>

            <div className={styles.formulaInputParamsInfo}>
                <FunctionParams
                    title={functionInfo?.functionParameter[activeIndex].name}
                    value={functionInfo?.functionParameter[activeIndex].detail}
                />
            </div>
        </div>
    );
}
