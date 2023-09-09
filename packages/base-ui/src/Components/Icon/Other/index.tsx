import { BaseIconProps } from '../../../Interfaces';
import { Icon } from '../AddIcon';

export const Close = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="logo" style={props.style}>
        <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4224" width="1em" height="1em" fill="currentColor">
            <path d="M119.808 180.053333l60.330667-60.245333 724.053333 724.053333-60.330667 60.330667z" p-id="4225"></path>
            <path d="M843.946667 119.808l60.245333 60.330667-724.053333 724.053333-60.330667-60.330667z" p-id="4226"></path>
        </svg>
    </Icon>
);
export const DropDownIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="dropdown" style={props.style}>
        <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4519" width="1em" height="1em">
            <path d="M149.930667 444.330667l60.330666-60.330667 362.069334 362.069333L512 806.4z" fill="#B5B8BD" p-id="4520"></path>
            <path d="M813.738667 384l60.330666 60.330667L512 806.4l-60.330667-60.330667z" fill="#B5B8BD" p-id="4521"></path>
        </svg>
    </Icon>
);

export default { Close, DropDownIcon };
