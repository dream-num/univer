// import * as all from 'numfmt';
import { FC, useEffect } from 'react';

import { BusinessComponentProps } from '../../base/types';

export const isGeneralPanel = (pattern: string) => !pattern;

export const GeneralPanel: FC<BusinessComponentProps> = (props) => {
    useEffect(() => {
        props.onChange('');
    }, []);
    return (
        <div>
            <div className="m-t-16 label">示例</div>
            <div className="m-t-8 preview"> {props.defaultValue} </div>
            <div className="describe m-t-14">常规格式不包含任何特定的数字格式。</div>
        </div>
    );
};
