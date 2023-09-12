import { BaseComponentProps } from '../BaseComponent';

export interface List {
    content: React.ReactNode;
    onClick?: () => void;
    vertical?: boolean;
    type?: string;
    children?: List[];
}

// TODO remove to component file
export interface BaseRightMenuProps extends BaseComponentProps {
    onClick?: () => void;
    style?: {};
}
