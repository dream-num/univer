import { BaseRichTextProps, Component, createRef, JSXComponent, RichTextComponent } from '@univer/base-component';
import { KeyCode } from '@univer/core';
import { CellInputHandler } from './CellInputHandler';
import { CellTextStyle } from './CellTextStyle';
import { HelpFunction, SearchFunction } from './FormulaPrompt';
import styles from './index.module.less';
// interface IProps {
//     style?: {};
//     className?: string;
//     onClick?: (e: MouseEvent) => void;
//     text?: string;
// }

interface IState {
    // value: string;
    helpFormulaActive: boolean;
    formulaName: string;
    funIndex: number;
    paramIndex: number;
    searchActive: boolean;
    formula: any[];
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
export class RichText extends Component<BaseRichTextProps, IState> {
    // private _fontFamilyObserv: Nullable<WorkBookObserver<string>>;

    // private _fontSizeObserv: Nullable<WorkBookObserver<number>>;

    ref = createRef<HTMLDivElement>();

    cellTextStyle: CellTextStyle;

    cellInputHandler: CellInputHandler;

    hooks = new Map<string, (args: any) => void>();

    initialize(props: BaseRichTextProps) {
        // super(props);
        this.state = {
            searchActive: false,
            formula: [],
            funIndex: 0, // 公式下标
            helpFormulaActive: false,
            formulaName: '', // 公式名
            paramIndex: 0, // 公式提示 参数下标
        };
    }

    setValue(value: string) {
        this.cellInputHandler.setInputValue(value);
    }

    getValue(): string {
        return this.cellInputHandler.getInputValue();
    }

    // TODO 键盘事件
    onKeyDown(event: KeyboardEvent) {
        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;

        // execute hooks
        const onKeyDown = this.hooks.get('onKeyDown');
        onKeyDown && onKeyDown(event);

        // stop edit
        if (kcode === KeyCode.ENTER) {
            this.ref.current?.blur();
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
        // else
        if (
            !(
                (kcode >= 112 && kcode <= 123) ||
                kcode <= 46 ||
                kcode === 144 ||
                kcode === 108 ||
                event.ctrlKey ||
                event.altKey ||
                (event.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40 || kcode === KeyCode.WIN || kcode === KeyCode.WIN_R || kcode === KeyCode.MENU))
            ) ||
            kcode === 8 ||
            kcode === 32 ||
            kcode === 46 ||
            (event.ctrlKey && kcode === 86)
        ) {
            // if(event.target.id!=="universheet-input-box" && event.target.id!=="universheet-rich-text-editor"){
            const container = this.ref.current as HTMLDivElement;
            // handle input
            // const handler = new CellInputHandler();
            this.cellInputHandler.functionInputHandler(container, kcode);
            // setCenterInputPosition(Store.universheetCellUpdate[0], Store.universheetCellUpdate[1], Store.flowdata);
            // }
        } else {
            // event.preventDefault();
            // event.stopPropagation();
        }

        if (kcode === KeyCode.UP) {
            let index = this.state.funIndex;
            if (index !== 0) index--;
            this.setState({
                funIndex: index,
            });
        } else if (kcode === KeyCode.DOWN) {
            let index = this.state.funIndex;
            if (index !== 10) index++;
            this.setState({
                funIndex: index,
            });
        }
    }

    onKeyUp(event: KeyboardEvent) {
        let kcode = event.keyCode;
        if (
            !(
                (kcode >= 112 && kcode <= 123) ||
                kcode <= 46 ||
                kcode === 144 ||
                kcode === 108 ||
                event.ctrlKey ||
                event.altKey ||
                (event.shiftKey && (kcode === 37 || kcode === 38 || kcode === 39 || kcode === 40 || kcode === KeyCode.WIN || kcode === KeyCode.WIN_R || kcode === KeyCode.MENU))
            ) ||
            kcode === 8 ||
            kcode === 32 ||
            kcode === 46 ||
            (event.ctrlKey && kcode === 86)
        ) {
            this.cellInputHandler.searchFunction(this.ref.current!);

            const formula = this.cellInputHandler.getFormula();
            let helpFormula = this.cellInputHandler.getHelpFormula();

            if (formula[0]) {
                this.setState({
                    formula,
                    searchActive: true,
                    helpFormulaActive: false,
                });
            } else if (helpFormula[0]) {
                this.setState({
                    formulaName: (helpFormula[0] as string).toUpperCase(),
                    paramIndex: helpFormula[1] as number,
                    helpFormulaActive: true,
                    searchActive: false,
                });
            } else {
                this.setState({
                    formula,
                    searchActive: false,
                    helpFormulaActive: false,
                });
            }
        }
        const value = this.cellInputHandler.getInputValue();
        if (value.length > 0 && value.substr(0, 1) === '=' && (kcode !== 229 || value.length === 1)) {
            if (kcode === 13) {
                event.preventDefault();
                event.stopPropagation();

                // 搜索公式框打开时选择公式，关闭时执行公式
                if (this.state.searchActive) {
                    this.cellInputHandler.searchFunctionEnter(this.state.formula[this.state.funIndex].n);
                    this.setState({
                        formulaName: this.state.formula[this.state.funIndex].n,
                        paramIndex: 0,
                        helpFormulaActive: true,
                        searchActive: false,
                    });
                }
            }
        }
        // if (kcode === KeyCode.DOWN) {
        //     this.cellTextStyle.convertSpanToShareString(this.ref.current);
        // }
    }

    /**
     * init
     */
    componentWillMount() {}

    componentDidMount() {
        this.cellTextStyle = new CellTextStyle(this.ref.current!);
        this.cellInputHandler = new CellInputHandler(this.ref.current!);
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    render(props: BaseRichTextProps, state: IState) {
        const { style, className, onClick, text } = props;
        return (
            <div className={`${styles.richTextEditorContainer} ${className}`} style={style}>
                <div
                    ref={this.ref}
                    className={styles.richTextEditor}
                    onClick={onClick}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onKeyUp={this.onKeyUp.bind(this)}
                    dangerouslySetInnerHTML={{ __html: text || '' }}
                    contentEditable
                ></div>
                {this.state.searchActive && !this.state.helpFormulaActive ? <SearchFunction value={this.state.formula} active={this.state.funIndex} /> : null}
                {!this.state.searchActive && this.state.helpFormulaActive ? <HelpFunction funName={this.state.formulaName} paramIndex={this.state.paramIndex} /> : null}
                {/* <HelpFunction funName={this.state.formulaName} paramIndex={this.state.paramIndex} /> */}
            </div>
        );
    }
}

export class UniverRichText implements RichTextComponent {
    render(): JSXComponent<BaseRichTextProps> {
        return RichText;
    }
}
