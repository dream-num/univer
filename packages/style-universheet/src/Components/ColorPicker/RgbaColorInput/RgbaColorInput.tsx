import { Color, Nullable } from '@univer/core';
import { useRef } from 'preact/hooks';
import { Input } from '../../Input';

interface IProps {
    color: Nullable<string>;
    onChange: (...arg: any) => void;
}

export const RgbaColorInput = (props: IProps) => {
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

    let inputRef = useRef<HTMLInputElement>(null);
    const onChange = () => {
        props.onChange((inputRef.current! as any).base.value);
    };

    return <Input ref={inputRef} type="text" value={`rgba(${rgba})`} onChange={onChange} />;
};
