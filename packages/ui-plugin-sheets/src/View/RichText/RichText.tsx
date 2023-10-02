// import { CellInputHandler } from '@univerjs/sheets-plugin-formula/src/Controller/CellInputHandler';
import { BaseComponentProps, xssDeal } from '@univerjs/base-ui';
import { Component, createRef, KeyboardEvent, MouseEventHandler } from 'react';

import { CellTextStyle } from './CellTextStyle';
import styles from './index.module.less';
// interface IProps {
//     style?: {};
//     className?: string;
//     onClick?: (e: MouseEvent) => void;
//     text?: string;
// }

export interface IRichTextState {}

export interface BaseRichTextProps extends BaseComponentProps {
    style?: {};
    className?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    text?: string;
}

/**
 *
 * 现在已支持 =A2+B3 公式高亮
 * 设置字体大小
 * TODO:
 * 1. rich text editor 丰富，其他样式
 * 2. 单元格编辑框编辑，实时复制到公式栏
 * 3. 公式栏编辑，实时复制到单元格编辑框
 * 4. 单元格编辑后敲击ENTER，获取刚刚输入的最新内容更新单元格数据（用到2.x updateFormatCell）
 * 5. 单元格编辑框输入公式，实时高亮单元格（下一步：支持高亮范围拖拽）
 * 6. 单元格编辑框输入公式，实时提示公式推荐框
 * 7. 单元格编辑框 其他快捷键支持 ESC、TAB、F4、UP、DOWN、LEFT、RIGHT等
 *
 * Rich Text Cell Editor Component
 */
export class RichText extends Component<BaseRichTextProps, IRichTextState> {
    container = createRef<HTMLDivElement>();

    ref = createRef<HTMLDivElement>();

    cellTextStyle?: CellTextStyle;

    hooks = new Map<string, (args: any) => void>();

    constructor(props: BaseRichTextProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: BaseRichTextProps) {}

    setValue(value: string) {
        if (this.ref.current) {
            this.ref.current.innerHTML = xssDeal(value);
        }
    }

    getValue(): string {
        return this.ref.current?.innerHTML || '';
    }

    show() {
        this.container.current!.style.display = 'block';
    }

    hide() {
        this.container.current!.style.display = 'none';
    }

    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        // let ctrlKey = event.ctrlKey;
        // let altKey = event.altKey;
        // let shiftKey = event.shiftKey;
        // let kcode = event.keyCode;

        // execute hooks
        const onKeyDown = this.hooks.get('onKeyDown');
        onKeyDown && onKeyDown(event);

        // stop edit
        if (event.key === 'Enter') {
            event.preventDefault();
        }

        // let $inputbox = $('#universheet-input-box');
        // if (kcode === keycode.ESC && parseInt($('#universheet-input-box').css('top')) > 0) {
        //     formula.dontupdate();
        //     universheetMoveHighlightCell('down', 0, 'rangeOfSelect');
        //     event.preventDefault();
        // } else if (kcode === keycode.ENTER && parseInt($inputbox.css('top')) > 0) {
        //     if ($('#universheet-formula-search-c').is(':visible') && formula.searchFunctionCell !== null) {
        //         formula.searchFunctionEnter($('#universheet-formula-search-c').find('.universheet-formula-search-item-active'));
        //         event.preventDefault();
        //     }
        // }
        // else if(kcode === keycode.TAB && parseInt($inputbox.css("top")) > 0){
        //     if ($("#universheet-formula-search-c").is(":visible") && formula.searchFunctionCell !== null) {
        //         formula.searchFunctionEnter($("#universheet-formula-search-c").find(".universheet-formula-search-item-active"));
        //     }
        //     else{
        //         formula.updatecell(Store.universheetCellUpdate[0], Store.universheetCellUpdate[1]);
        //         universheetMoveHighlightCell("right", 1, "rangeOfSelect");
        //     }

        //     event.preventDefault();
        // }
        // else if (kcode === keycode.F4 && parseInt($inputbox.css("top")) > 0) {
        //     formula.setfreezonFuc(event);
        //     event.preventDefault();
        // }
        // else if (kcode === keycode.UP && parseInt($inputbox.css("top")) > 0) {
        //     formulaMoveEvent("up", ctrlKey, shiftKey,event);
        // }
        // else if (kcode === keycode.DOWN && parseInt($inputbox.css("top")) > 0) {
        //     formulaMoveEvent("down", ctrlKey, shiftKey,event);
        // }
        // else if (kcode === keycode.LEFT && parseInt($inputbox.css("top")) > 0) {
        //     formulaMoveEvent("left", ctrlKey, shiftKey,event);
        // }
        // else if (kcode === keycode.RIGHT && parseInt($inputbox.css("top")) > 0) {
        //     formulaMoveEvent("right", ctrlKey, shiftKey,event);
        // }

        // if (kcode === KeyCode.UP) {
        //     let index = this.state.funIndex;
        //     if (index !== 0) index--;
        //     this.setState({
        //         funIndex: index,
        //     });
        // } else if (kcode === KeyCode.DOWN) {
        //     let index = this.state.funIndex;
        //     if (index !== 10) index++;
        //     this.setState({
        //         funIndex: index,
        //     });
        // }
    }

    onKeyUp(event: KeyboardEvent<HTMLDivElement>) {
        const onKeyUp = this.hooks.get('onKeyUp');
        onKeyUp && onKeyUp(event);

        // stop edit
        if (event.key === 'Enter') {
            event.preventDefault();
        }
        // if (kcode === KeyCode.DOWN) {
        //     this.cellTextStyle.convertSpanToShareString(this.ref.current);
        // }
    }

    /**
     * init
     */
    override UNSAFE_componentWillMount() {}

    override componentDidMount() {
        this.props.getComponent?.(this);
        this.cellTextStyle = new CellTextStyle(this.ref.current!);
    }

    override render() {
        const { style, className = '', onClick, text } = this.props;
        return (
            <div className={`${styles.richTextEditorContainer} ${className}`} style={style} ref={this.container}>
                <div
                    ref={this.ref}
                    className={styles.richTextEditor}
                    onClick={onClick}
                    onKeyDown={(event) => this.onKeyDown(event)}
                    onKeyUp={(event) => this.onKeyUp(event)}
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                    contentEditable
                ></div>
            </div>
        );
    }
}
