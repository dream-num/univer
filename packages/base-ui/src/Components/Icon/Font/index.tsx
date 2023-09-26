import { BaseIconProps, Icon } from '../AddIcon';

export const BoldIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5565"
            width="1em"
            height="1em"
            fill="currentColor"
        >
            <path
                d="M298.666667 213.333333h224a174.208 174.208 0 0 1 141.952 275.242667A174.208 174.208 0 0 1 572.458667 810.666667H298.666667V213.333333z m273.792 348.458667l-174.250667-0.042667v149.333334h174.250667a74.666667 74.666667 0 0 0 6.101333-149.077334l-6.101333-0.213333zM398.208 312.874667v149.333333h124.458667a74.666667 74.666667 0 0 0 6.144-149.077333l-6.144-0.256H398.208z"
                p-id="5566"
            ></path>
        </svg>
    </Icon>
);

export const ItalicIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5692"
            width="1em"
            height="1em"
            fill="currentColor"
        >
            <path d="M469.333333 256h170.666667v42.666667h-170.666667z" p-id="5693"></path>
            <path d="M573.738667 284.586667l-81.493334 462.208-41.984-7.381334 81.493334-462.208z" p-id="5694"></path>
            <path d="M384 725.333333h170.666667v42.666667H384z" p-id="5695"></path>
        </svg>
    </Icon>
);

export const DeleteLineIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5311"
            width="1em"
            height="1em"
            fill="currentColor"
        >
            <path d="M298.666667 256h426.666666v42.666667H298.666667z" p-id="5312"></path>
            <path
                d="M533.290667 554.666667l0.042666 192h-42.666666l-0.042667-192h42.666667z m0.042666-277.333334l-0.042666 234.666667h-42.666667l0.042667-234.666667h42.666666zM320 256v85.333333h-42.666667V256zM746.666667 256v85.333333h-42.666667V256z"
                p-id="5313"
            ></path>
            <path
                d="M256 469.333333h512v42.666667H256zM426.666667 725.333333h170.666666v42.666667h-170.666666z"
                p-id="5314"
            ></path>
        </svg>
    </Icon>
);

export const UnderLineIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5318"
            width="1em"
            height="1em"
            fill="currentColor"
        >
            <path
                d="M362.666667 256v298.666667a149.333333 149.333333 0 0 0 298.453333 8.192L661.333333 554.666667V256h42.666667v298.666667a192 192 0 0 1-383.786667 9.045333L320 554.666667V256h42.666667z"
                p-id="5319"
            ></path>
            <path
                d="M256 768m21.333333 0l469.333334 0q21.333333 0 21.333333 21.333333l0 0q0 21.333333-21.333333 21.333334l-469.333334 0q-21.333333 0-21.333333-21.333334l0 0q0-21.333333 21.333333-21.333333Z"
                p-id="5320"
            ></path>
            <path
                d="M256 256m21.333333 0l128 0q21.333333 0 21.333334 21.333333l0 0q0 21.333333-21.333334 21.333334l-128 0q-21.333333 0-21.333333-21.333334l0 0q0-21.333333 21.333333-21.333333Z"
                p-id="5321"
            ></path>
            <path
                d="M597.333333 256m21.333334 0l128 0q21.333333 0 21.333333 21.333333l0 0q0 21.333333-21.333333 21.333334l-128 0q-21.333333 0-21.333334-21.333334l0 0q0-21.333333 21.333334-21.333333Z"
                p-id="5322"
            ></path>
        </svg>
    </Icon>
);

export const TextColorIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5440"
            width="1em"
            height="1em"
            fill="currentColor"
        >
            <path
                d="M549.546667 256l194.133333 533.333333h-45.354667l-77.653333-213.333333H421.632l-77.653333 213.333333H298.666667L492.757333 256h56.789334z m-28.416 46.634667L437.162667 533.333333h167.978666l-84.010666-230.698666z"
                p-id="5441"
            ></path>
        </svg>
    </Icon>
);

export default {
    BoldIcon,
    ItalicIcon,
    DeleteLineIcon,
    UnderLineIcon,
    TextColorIcon,
};
