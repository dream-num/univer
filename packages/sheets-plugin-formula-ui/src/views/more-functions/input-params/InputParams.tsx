import { IFunctionInfo, IFunctionParam } from '@univerjs/base-formula-engine';
import { RangeSelector } from '@univerjs/base-ui';

import styles from './index.module.less';

export interface IInputParamsProps {
    functionInfo: IFunctionInfo | null;
}

export function InputParams(props: IInputParamsProps) {
    const { functionInfo } = props;
    return (
        <div className={styles.formulaInputParams}>
            {functionInfo &&
                functionInfo.functionParameter &&
                functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                    <div key={i}>
                        {item.name}
                        <RangeSelector />
                    </div>
                ))}
        </div>
    );
}
