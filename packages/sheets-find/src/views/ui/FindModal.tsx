import type { ICheckboxGroupProps } from '@univerjs/design';
import type { BaseComponentProps } from '@univerjs/ui';
import React, { Component } from 'react';

interface searchResult {
    count: number;
    current: number;
    replaceCount: number;
}

// Types for props
export interface IProps extends BaseComponentProps {
    findNext: (value: string) => searchResult;
    replaceText: (value: string) => searchResult;
    replaceAll: (value: string) => searchResult;
    findPrevious: (value: string) => searchResult;
    matchCase: (matchCase: boolean) => void;
    matchEntireCell: (matchEntire: boolean) => void;
}

// Types for state
interface IState {
    show: boolean;
    hideAdvanced: boolean;
    showRange: boolean;
    current: number;
    count: number;
    replaceCount: number;
    value: string;
}

export enum SelectSearch {
    CurrentSheet,
    AllSheets,
    Range,
}

export class FindModal extends Component<IProps, IState> {
    private _matchGroup: ICheckboxGroupProps[] = [];

    private _select: any[] = [];

    constructor(props: IProps) {
        super(props);
        this.state = {
            show: false,
            hideAdvanced: true,
            showRange: false,
            current: 0,
            count: 0,
            replaceCount: 0,
            value: '',
        };

        // this._matchGroup = [
        //     {
        //         name: '',
        //         label: 'find.matchCase',
        //         value: '1',
        //     },
        //     {
        //         name: '',
        //         label: 'find.matchAll',
        //         value: '2',
        //     },
        //     {
        //         name: '',
        //         label: 'find.matchInFormula',
        //         value: '3',
        //     },
        // ];

        this._select = [
            {
                label: 'find.searchTargetSheet',
                value: SelectSearch.CurrentSheet,
            },
            {
                label: 'find.searchAll',
                value: SelectSearch.AllSheets,
            },
            {
                label: 'find.specific',
                value: SelectSearch.Range,
            },
        ];
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    showFindModal(show: boolean) {
        this.setState({
            show,
        });
    }

    // 国际化checkbox
    getMatchGroup() {
        const arr: ICheckboxGroupProps[] = JSON.parse(JSON.stringify(this._matchGroup));
        // arr.forEach((element: ICheckboxGroupProps) => {
        //     element.label = <CustomLabel label={element.label} />;
        // });
        return arr;
    }

    // 国际化Select
    getSelect() {
        const arr: any[] = JSON.parse(JSON.stringify(this._select));
        // arr.forEach((element: ICheckboxGroupProps) => {
        //     element.label = <CustomLabel label={element.label} />;
        // });
        return arr;
    }

    handleChange(value: string[]) {
        this.props.matchCase(!!value.includes('1'));
        this.props.matchEntireCell(!!value.includes('2'));
    }

    handleHideAdvanced(hide: boolean) {
        this.setState({
            hideAdvanced: hide,
        });
    }

    selectSearch(value: number) {
        if (value === SelectSearch.Range) {
            this.setState({
                showRange: true,
            });
            return;
        }
        this.setState({
            showRange: false,
        });
    }

    findNext() {
        const value = this.state.value;
        if (!value) return;
        const { count, current } = this.props.findNext(value);
        this.setState({
            count,
            current,
        });
    }

    findPrevious() {
        const value = this.state.value;
        if (!value) return;
        const { count, current } = this.props.findPrevious(value);
        this.setState({
            count,
            current,
        });
    }

    replaceText() {
        const value = this.state.value;
        if (!value) return;
        const replaceCount = this.props.replaceText(value);
        this.setState({
            ...replaceCount,
        });
    }

    replaceAll() {
        const value = this.state.value;
        if (!value) return;
        const replaceCount = this.props.replaceAll(value);
        this.setState({
            ...replaceCount,
        });
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        this.setState({
            value,
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    override render() {
        const { show, hideAdvanced, showRange, current, count } = this.state;
        // Set Provider for entire Container
        return (
            // <Modal
            //     onCancel={() => this.handleHideAdvanced(true)}
            //     className={styles.findModal}
            //     isDrag
            //     footer={false}
            //     mask={false}
            //     title={<CustomLabel label={hideAdvanced ? 'find.find' : 'find.findLabel'} />}
            //     visible={show}
            // >
            //     <div className={styles.box}>
            //         {hideAdvanced ? null : (
            //             <span>
            //                 <CustomLabel label="find.find" />
            //             </span>
            //         )}
            //         <Input onValueChange={this.findNext.bind(this)} onChange={(e) => this.onChange(e)}></Input>
            //         {count ? (
            //             <div className={styles.count}>
            //                 <span onClick={this.findPrevious.bind(this)}>
            //                     {/* <Icon.Format.NextIcon rotate={90}></Icon.Format.NextIcon> */}
            //                 </span>
            //                 {current}/{count}
            //                 <span onClick={this.findNext.bind(this)}>
            //                     {/* <Icon.Format.NextIcon rotate={-90}></Icon.Format.NextIcon> */}
            //                 </span>
            //             </div>
            //         ) : null}
            //     </div>
            //     {hideAdvanced ? (
            //         <p
            //             style={{ display: hideAdvanced ? 'block' : 'none' }}
            //             onClick={() => this.handleHideAdvanced(false)}
            //         >
            //             <CustomLabel label="find.replace" />/<CustomLabel label="find.advanced" />
            //             {/* <Icon.Format.NextIcon /> */}
            //         </p>
            //     ) : (
            //         <>
            //             <div className={styles.box}>
            //                 <span>
            //                     <CustomLabel label="find.replaceWith" />
            //                 </span>
            //                 <Input></Input>
            //             </div>
            //             <div className={styles.box}>
            //                 <span>
            //                     <CustomLabel label="find.search" />
            //                 </span>
            //                 <Select onClick={this.selectSearch.bind(this)} children={this.getSelect()}></Select>
            //                 {showRange ? <CellRange onClick={() => {}} /> : null}
            //             </div>
            //             <div className={styles.box}>
            //                 <span></span>
            //                 {/* <CheckboxGroup
            //                     options={this.getMatchGroup()}
            //                     onChange={this.handleChange.bind(this)}
            //                 ></CheckboxGroup> */}
            //             </div>
            //             <div className={styles.buttonGroup}>
            //                 <Button type="primary">
            //                     <CustomLabel label="button.cancel" />
            //                 </Button>
            //                 <Button onClick={this.replaceAll.bind(this)}>
            //                     <CustomLabel label="find.allReplaceBtn" />
            //                 </Button>
            //                 <Button onClick={this.replaceText.bind(this)}>
            //                     <CustomLabel label="find.replace" />
            //                 </Button>
            //                 <Button onClick={this.findNext.bind(this)}>
            //                     <CustomLabel label="find.find" />
            //                 </Button>
            //             </div>
            //         </>
            //     )}
            // </Modal>
            <></>
        );
    }
}
