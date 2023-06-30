// import { Component } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import CFcolorGradation from '../Assets/CFcolorGradation.png';
// import CFdataBar from '../Assets/CFdataBar.png';
// import styles from './index.module.less';

// type ImageListProps = {
//     config?: any;
//     type: string;
// };
// type ImageListState = {
//     dataList: LabelProps[];
//     colorList: LabelProps[];
//     list: LabelProps[];
//     url: string;
// };
// type LabelProps = {
//     title: Record<string, string>;
//     style: string;
// };

// export class ImageList extends Component<ImageListProps, ImageListState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     state = {
//         dataList: [
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_1',
//                 },
//                 style: '0 0',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_2',
//                 },
//                 style: '-38px 0',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_3',
//                 },
//                 style: '-76px 0',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_4',
//                 },
//                 style: '0 -36px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_5',
//                 },
//                 style: '-38px -36px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_6',
//                 },
//                 style: '-75px -36px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_7',
//                 },
//                 style: '0 -72px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_8',
//                 },
//                 style: '-38px -72px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_9',
//                 },
//                 style: '-76px -72px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_10',
//                 },
//                 style: '0 -108px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_11',
//                 },
//                 style: '-38px -108px',
//             },
//             {
//                 title: {
//                     name: 'conditionalformat.gradientDataBar_12',
//                 },
//                 style: '-76px -108px',
//             },
//         ],
//         colorList: [
//             {
//                 title: {
//                     name: 'colorGradation_1',
//                 },
//                 style: '0 0',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_2',
//                 },
//                 style: '-38px 0',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_3',
//                 },
//                 style: '-76px 0',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_4',
//                 },
//                 style: '-114px 0',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_5',
//                 },
//                 style: '0 -36px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_6',
//                 },
//                 style: '-38px -36px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_7',
//                 },
//                 style: '-76px -36px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_8',
//                 },
//                 style: '-114px -36px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_9',
//                 },
//                 style: '0 -72px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_10',
//                 },
//                 style: '-38px -72px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_11',
//                 },
//                 style: '-76px -72px',
//             },
//             {
//                 title: {
//                     name: 'colorGradation_12',
//                 },
//                 style: '-114px -72px',
//             },
//         ],
//         list: [],
//         url: '',
//     };

//     setLocale() {
//         // setLocale for diffrent type of modal
//         const locale = this._context.getLocale();

//         this.setState((prevState) => {
//             let { dataList, colorList, list, url } = prevState;
//             const { type } = this.props;
//             dataList.forEach((item) => {
//                 item.title.label = locale.get(item.title.name);
//             });
//             colorList.forEach((item) => {
//                 item.title.label = locale.get(item.title.name);
//             });

//             if (type === 'data') {
//                 list = dataList;
//                 url = CFdataBar;
//             } else {
//                 list = colorList;
//                 url = CFcolorGradation;
//             }

//             return { list, url };
//         });
//     }

//     componentWillMount() {
//         this.setLocale();

//         // subscribe Locale change event
//         this._localeObserver = this._context
//             .getObserverManager()
//             .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
//             ?.add(() => {
//                 this.setLocale();
//             });
//     }

//     componentWillUnmount() {
//         // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
//     }

//     render(props: ImageListProps, state: ImageListState) {
//         const { list, url } = state;
//         return (
//             <div className={styles.imageContent}>
//                 {list.map((item) => (
//                     <div>
//                         <div title={item.title.label} style={{ backgroundImage: `url(${url})`, backgroundPosition: item.style }}></div>
//                     </div>
//                 ))}
//             </div>
//         );
//     }
// }
