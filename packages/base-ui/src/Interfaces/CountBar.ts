import { BaseComponentProps } from '../BaseComponent';

// TODO remove to component file
export interface BaseCountBarProps extends BaseComponentProps {
    changeRatio: (ratio: string) => void;
}
