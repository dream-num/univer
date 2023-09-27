import { Color, Nullable } from '@univerjs/core';

import { Input } from '../../Input';

interface IProps {
    color: Nullable<string>;
    onChange: (value: string) => void;
}

export function RgbaColorInput(props: IProps) {
    let { color } = props;
    if (!color) return null;
    let rgba;
    if (color.indexOf('#') > -1) {
        color = Color.hexToRgbString(color);
        if (!color) return null;
        rgba = color.replace('rgba(', '').replace(')', '').split(',');
    } else if (color.indexOf('rgba') > -1) {
        rgba = color.replace('rgba(', '').replace(')', '').split(',');
    } else {
        rgba = color.replace('rgb(', '').replace(')', '').split(',');
        rgba.push('1');
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = (e.target as HTMLInputElement).value;
        props.onChange(value);
    };

    return <Input type="text" value={`rgba(${rgba})`} onChange={onChange} />;
}
