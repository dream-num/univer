import { IFunctionParam } from '@univerjs/base-formula-engine';
import React from 'react';

interface IFunctionHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
}

export function FunctionHelp(props: IFunctionHelpProps) {
    const { prefix, value } = props;
    return (
        <div>
            <span>{prefix}(</span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    <span key={i}>
                        <span>{item.repeat ? `[${item.name},...]` : item.name}</span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            )
        </div>
    );
}
