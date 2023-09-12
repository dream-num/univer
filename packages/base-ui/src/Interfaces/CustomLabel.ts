import { BaseSelectChildrenProps } from '../Components/Select/Select';

export interface ICustomLabelProps {
    prefix?: string[] | string;
    suffix?: string[] | string;
    options?: BaseSelectChildrenProps[];
    label?: string;
    children?: ICustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

// TODO move to right menu
export interface ICustomLabelType {
    name: string;
    props?: ICustomLabelProps;
}
