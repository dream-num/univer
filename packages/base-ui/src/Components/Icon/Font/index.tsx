import { Strikethrough24, TextBold24, TextColor24, TextItalic24, Underline24 } from '@univerjs/icons';

import { BaseIconProps } from '../AddIcon';

// TODO The toolbar should use the icon directly
export const BoldIcon = (props: BaseIconProps) => <TextBold24 />;
export const ItalicIcon = (props: BaseIconProps) => <TextItalic24 />;
export const DeleteLineIcon = (props: BaseIconProps) => <Strikethrough24 style={props.style} />;
export const UnderLineIcon = (props: BaseIconProps) => <Underline24 />;

export const TextColorIcon = (props: BaseIconProps) => (
    <TextColor24 style={{ color: props.color }} extend={props.extend} />
);

export default {
    BoldIcon,
    ItalicIcon,
    DeleteLineIcon,
    UnderLineIcon,
    TextColorIcon,
};
