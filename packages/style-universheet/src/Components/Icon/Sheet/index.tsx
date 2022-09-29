import { BaseIconProps, FunctionComponent, IconComponent } from '@univer/base-component';
import { Icon } from '../AddIcon';

const CommentIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7705" width="1em" height="1em" fill="currentColor">
            <path d="M352 490.666667a32 32 0 1 0 64 0 32 32 0 0 0-64 0z m128 0a32 32 0 1 0 64 0 32 32 0 0 0-64 0z m128 0a32 32 0 1 0 64 0 32 32 0 0 0-64 0z" p-id="7706"></path>
            <path
                d="M768 298.666667H256c-23.466667 0-42.666667 19.2-42.666667 42.666666v298.666667c0 23.466667 19.2 42.666667 42.666667 42.666667h106.666667v128l128-128H768c23.466667 0 42.666667-19.2 42.666667-42.666667V341.333333c0-23.466667-19.2-42.666667-42.666667-42.666666z m0 320c0 12.8-8.533333 21.333333-21.333333 21.333333H469.333333l-64 64V640h-128c-12.8 0-21.333333-8.533333-21.333333-21.333333v-256c0-12.8 8.533333-21.333333 21.333333-21.333334h469.333334c12.8 0 21.333333 8.533333 21.333333 21.333334v256z"
                p-id="7707"
            ></path>
        </svg>
    </Icon>
);

export class UniverCommentIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return CommentIcon;
    }
}

const FreezeIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5448" width="1em" height="1em">
            <path d="M256.426667 256.426667h255.317333v553.130666H256.426667z" fill="#B5B8BD" p-id="5449"></path>
            <path
                d="M809.557333 213.930667v595.626666H213.930667V213.930667h595.626666z m-42.538666 42.538666H256.426667v510.549334h510.549333V256.426667z"
                fill="#444D5A"
                p-id="5450"
            ></path>
            <path d="M490.453333 256.426667h42.538667v510.592h-42.538667z" fill="#444D5A" p-id="5451"></path>
            <path d="M256.426667 532.992v-42.538667h510.592v42.538667z" fill="#444D5A" p-id="5452"></path>
            <path
                d="M256.384 226.261333l264.192 264.192-30.122667 30.08-264.192-264.192 30.122667-30.08z m-30.122667 317.184l30.122667-30.122666 264.192 264.192-30.122667 30.08-264.192-264.149334z"
                fill="#444D5A"
                p-id="5453"
            ></path>
        </svg>
    </Icon>
);
export class UniverFreezeIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return FreezeIcon;
    }
}

const conditionalFormatIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6039" width="1em" height="1em" fill="currentColor">
            <path
                d="M810.666667 213.333333v597.333334H213.333333V213.333333h597.333334z m-42.666667 320h-106.666667V768H768v-234.666667z m-405.376 0h-106.666667V768h106.666667v-234.666667z m256.042667 86.784L445.482667 768H618.666667v-147.882667z m0-162.346666l-213.376 179.968v108.885333l213.376-179.072v-109.781333z m0-163.669334l-213.333334 179.029334v108.885333l213.333334-179.072V294.101333zM768 256h-103.936l-2.730667 2.304V490.666667H768V256zM362.666667 256H256v234.666667h106.666667V256z m235.008 0H405.333333v161.408L597.674667 256z"
                p-id="6040"
            ></path>
        </svg>
    </Icon>
);
export class UniverConditionalFormatIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return conditionalFormatIcon;
    }
}

const DivideIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5501" width="1em" height="1em" fill="currentColor">
            <path
                d="M544.896 389.717333h110.762667v46.933334c6.698667 6.613333 15.658667 6.613333 22.357333 0l84.949333-55.125334c6.698667-4.437333 6.698667-13.226667 0-19.84l-84.906666-57.386666c-6.741333-6.613333-15.701333-6.613333-22.4 0v41.258666h-133.12l-89.429334 154.453334H343.722667v0.128h-22.698667c-11.178667 0-22.357333 11.050667-22.357333 22.058666 0 11.050667 11.178667 22.058667 22.357333 22.058667h134.101333l-0.085333-0.128h0.426667l89.386666-154.453333h0.042667z m133.12 198.954667a15.061333 15.061333 0 0 0-22.314667 0v43.690667h-66.133333l-67.029333-110.293334-22.357334 44.117334s62.592 103.68 67.072 110.293333h88.448V721.066667a15.061333 15.061333 0 0 0 22.314667 0l84.949333-55.168c6.698667-4.437333 6.698667-13.226667 0-19.84l-84.906666-57.386667h-0.042667z"
                p-id="5502"
            ></path>
        </svg>
    </Icon>
);

export class UniverDivideIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return DivideIcon;
    }
}

const ReplaceIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4859" width="1em" height="1em" fill="currentColor">
            <path
                d="M768 430.933333H280.405333l-4.394666-0.554666c-5.461333-0.853333-6.570667-1.749333-12.885334-6.528l-2.986666-5.376c-6.4-11.946667-5.376-13.738667 2.986666-28.885334L440.618667 213.333333l34.218666 34.048-136.362666 135.424H768v48.170667z m-7.594667 163.242667L585.472 768l-34.261333-34.048 136.362666-135.424H258.048v-48.170667h484.096c10.453333 0 19.882667 6.272 23.893333 15.872a25.6 25.6 0 0 1-5.632 27.989334z"
                p-id="4860"
            ></path>
        </svg>
    </Icon>
);
export class UniverReplaceIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return ReplaceIcon;
    }
}

const SearchIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4732" width="1em" height="1em" fill="currentColor">
            <path
                d="M664.832 634.624l128.554667 128.597333a21.333333 21.333333 0 1 1-30.165334 30.165334l-128.597333-128.597334a256 256 0 1 1 30.165333-30.165333zM469.333333 682.666667a213.333333 213.333333 0 1 0 0-426.666667 213.333333 213.333333 0 0 0 0 426.666667z"
                p-id="4733"
            ></path>
        </svg>
    </Icon>
);
export class UniverSearchIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return SearchIcon;
    }
}

const LockIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4605" width="1em" height="1em" fill="currentColor">
            <path
                d="M810.666667 213.333333v597.333334H213.333333V213.333333h597.333334zM341.333333 383.872H256V768h85.333333V383.872z m426.666667 0H383.872V768H768V383.872z m-149.333333 21.461333a64 64 0 0 1 63.701333 57.856L682.666667 469.333333v64h42.666666v213.333334h-298.666666v-213.333334h42.666666V469.333333a64 64 0 0 1 57.856-63.701333L533.333333 405.333333h85.333334z m64 170.666667h-213.333334v128h213.333334v-128z m-106.666667 21.333333a21.333333 21.333333 0 0 1 21.333333 21.333334v42.666666a21.333333 21.333333 0 1 1-42.666666 0v-42.666666a21.333333 21.333333 0 0 1 21.333333-21.333334z m42.666667-149.333333h-85.333334a21.333333 21.333333 0 0 0-20.992 17.493333L512 469.333333v64h128V469.333333a21.333333 21.333333 0 0 0-13.909333-20.010666l-3.584-0.981334-3.84-0.341333zM768 256H383.872v85.290667L768 341.333333V256zM341.333333 256H256v85.333333l85.333333-0.042666V256z"
                p-id="4606"
            ></path>
        </svg>
    </Icon>
);

export class UniverLockIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return LockIcon;
    }
}

const LocationIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5579" width="1em" height="1em" fill="currentColor">
            <path
                d="M618.666667 723.584V661.333333a21.333333 21.333333 0 1 1 42.666666 0v62.250667a128.128 128.128 0 0 0 104.917334-104.917333H704a21.333333 21.333333 0 1 1 0-42.666667h62.250667a128.128 128.128 0 0 0-104.917334-104.874667V533.333333a21.333333 21.333333 0 1 1-42.666666 0v-62.208a128.085333 128.085333 0 0 0-104.874667 104.874667H576a21.333333 21.333333 0 0 1 0 42.666667h-62.208a128.128 128.128 0 0 0 104.874667 104.917333z m149.333333-296.96a213.12 213.12 0 0 0-42.666667-24.874667V277.333333a21.333333 21.333333 0 0 0-21.333333-21.333333h-426.666667a21.333333 21.333333 0 0 0-21.333333 21.333333v341.333334a21.333333 21.333333 0 0 0 21.333333 21.333333h153.6c2.986667 14.848 7.594667 29.098667 13.482667 42.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v170.666667zM640 768a170.666667 170.666667 0 1 1 0-341.333333 170.666667 170.666667 0 0 1 0 341.333333z"
                p-id="5580"
            ></path>
        </svg>
    </Icon>
);
export class UniverLocationIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return LocationIcon;
    }
}

const PageIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5318" width="1em" height="1em">
            <path d="M810.666667 213.333333v597.333334H213.333333V213.333333h597.333334z m-42.666667 42.666667H256v512h512V256z" p-id="5319"></path>
            <path d="M256 512h256v42.666667H256zM554.666667 256v298.666667h-42.666667V256z" p-id="5320"></path>
            <path d="M405.333333 256v298.666667h-42.666666V256z" p-id="5321"></path>
        </svg>
    </Icon>
);

export class UniverPageIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return PageIcon;
    }
}

const RegularIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5447" width="1em" height="1em" fill="currentColor">
            <path d="M256 256h554.666667v42.666667H256z" p-id="5448"></path>
            <path
                d="M298.666667 256v554.666667H256V256zM810.666667 256v554.666667h-42.666667V256zM469.333333 256v554.666667h-42.666666V256zM640 256v554.666667h-42.666667V256z"
                p-id="5449"
            ></path>
            <path d="M256 426.666667h554.666667v42.666666H256zM256 597.333333h554.666667v42.666667H256zM256 768h554.666667v42.666667H256z" p-id="5450"></path>
        </svg>
    </Icon>
);

export class UniverRegularIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return RegularIcon;
    }
}

const LayoutIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5576" width="1em" height="1em" fill="currentColor">
            <path
                d="M810.666667 213.333333v42.666667h-170.709334L640 768h170.666667v42.666667h-213.333334V213.333333h213.333334z m-384 0l-0.042667 554.666667H426.666667v42.666667H213.333333v-42.666667h170.624L384 256H213.333333V213.333333h213.333334z m106.666666 512v85.333334h-42.666666v-85.333334h42.666666z m0-170.666666v85.333333h-42.666666v-85.333333h42.666666z m0-170.666667v85.333333h-42.666666V384h42.666666z m0-170.666667v85.333334h-42.666666V213.333333h42.666666z"
                p-id="5577"
            ></path>
        </svg>
    </Icon>
);

export class UniverLayoutIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return LayoutIcon;
    }
}

const TableIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="foward" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6094" width="1em" height="1em" fill="currentColor">
            <path
                d="M913.988 173.68H110.05c-25.671 0-46.676 21.007-46.676 46.679v665.897c0 25.651 20.987 46.638 46.637 46.638H913.95c25.671 0 46.676-21.004 46.676-46.676V220.32c0-25.651-20.988-46.64-46.638-46.64zM339.796 896.142c0 12.016-9.34 21.353-21.305 21.353H104.864c-11.965 0-21.303-9.337-21.303-21.353V768.023c0-12.014 9.338-21.353 21.303-21.353h213.627c11.965 0 21.305 9.34 21.305 21.353v128.118z m0-224.995c0 12.015-9.34 21.353-21.305 21.353H104.864c-11.965 0-21.303-9.338-21.303-21.353V543.029c0-12.013 9.338-21.354 21.303-21.354h213.627c11.965 0 21.305 9.34 21.305 21.354v128.117z m0-223.432c0 12.016-9.34 21.353-21.305 21.353H104.864c-11.965 0-21.303-9.337-21.303-21.353V319.596c0-12.013 9.338-21.353 21.303-21.353h213.627c11.965 0 21.305 9.34 21.305 21.353v128.118zM639.269 896.14c0 12.016-9.34 21.353-21.306 21.353H404.337c-11.966 0-21.305-9.337-21.305-21.353V768.023c0-12.014 9.34-21.353 21.305-21.353h213.626c11.966 0 21.306 9.34 21.306 21.353v128.118z m0-224.995c0 12.015-9.34 21.353-21.306 21.353H404.337c-11.966 0-21.305-9.338-21.305-21.353V543.029c0-12.013 9.34-21.354 21.305-21.354h213.626c11.966 0 21.306 9.34 21.306 21.354v128.117z m0-223.432c0 12.016-9.34 21.353-21.306 21.353H404.337c-11.966 0-21.305-9.337-21.305-21.353V319.596c0-12.013 9.34-21.353 21.305-21.353h213.626c11.966 0 21.306 9.34 21.306 21.353v128.118zM941.864 896.14c0 12.016-9.34 21.353-21.304 21.353H706.933c-11.966 0-21.304-9.337-21.304-21.353V768.023c0-12.014 9.338-21.353 21.304-21.353h213.626c11.966 0 21.304 9.34 21.304 21.353v128.118z m0-224.995c0 12.015-9.34 21.353-21.304 21.353H706.933c-11.966 0-21.304-9.338-21.304-21.353V543.029c0-12.013 9.338-21.354 21.304-21.354h213.626c11.966 0 21.304 9.34 21.304 21.354v128.117z m0-223.432c0 12.016-9.34 21.353-21.304 21.353H706.933c-11.966 0-21.304-9.337-21.304-21.353V319.596c0-12.013 9.338-21.353 21.304-21.353h213.626c11.966 0 21.304 9.34 21.304 21.353v128.118z"
                p-id="6095"
            ></path>
        </svg>
    </Icon>
);

export class UniverTableIcon implements IconComponent {
    render(): FunctionComponent<BaseIconProps> {
        return TableIcon;
    }
}

// export interface SheetCompomentUI extends BaseIconProps {
//     CommentIcon: FunctionComponent;
// }

// export class UniverIcon implements IconComponent<SheetCompomentUI> {
//     render(): JSXComponent<SheetCompomentUI> {
//         return {
//             CommentIcon,
//         };
//     }
// }

export default {
    CommentIcon,
    FreezeIcon,
    conditionalFormatIcon,
    DivideIcon,
    ReplaceIcon,
    SearchIcon,
    LockIcon,
    LocationIcon,
    PageIcon,
    RegularIcon,
    LayoutIcon,
    TableIcon,
};
