/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// export class SearchContentController {
//     private _searchData;

//     private _plugin: FindPlugin;

//     private _searchContent: SearchContent;

//     private _searchText: string;

//     private _matchList: string[];

//     constructor(plugin: FindPlugin) {
//         this._plugin = plugin;

//         this._searchData = {
//             tab: [
//                 {
//                     locale: 'find.find',
//                     key: 'find',
//                 },
//                 {
//                     locale: 'find.replace',
//                     key: 'replace',
//                 },
//             ],
//             content: [
//                 {
//                     locale: 'find.findTextbox',
//                 },
//                 {
//                     locale: 'find.replaceTextbox',
//                 },
//             ],
//             buttons: [
//                 {
//                     locale: 'find.allFindBtn',
//                     key: 'find',
//                     // onClick: () => this.findText(true),
//                 },
//                 {
//                     locale: 'find.findBtn',
//                     key: 'find',
//                     // onClick: () => this.findText(),
//                 },
//                 {
//                     locale: 'find.allReplaceBtn',
//                     key: 'replace',
//                 },
//                 {
//                     locale: 'find.replaceBtn',
//                     key: 'replace',
//                 },
//             ],
//             match: [
//                 {
//                     locale: 'find.regexTextbox',
//                     value: 'regex',
//                 },
//                 {
//                     locale: 'find.wholeTextbox',
//                     value: 'whole',
//                 },
//                 {
//                     locale: 'find.distinguishTextbox',
//                     value: 'capsLock',
//                 },
//             ],
//             changeSearchText: this.changeSearchText,
//             getMatch: this.getMatch,
//         };

//         this.init();
//     }

//     init() {
//         const plugin = this._plugin.getContext().getPluginManager().getPluginByName<FindPlugin>(FIND_PLUGIN_NAME)!;

//         plugin.getObserver('onSearchContentDidMountObservable')!.add((component) => {
//             this._searchContent = component;

//             this.resetSearchData();
//         });
//     }

//     resetSearchData() {
//         const locale = this._plugin.getContext().getLocale();

//         for (const k in this._searchData) {
//             if (this._searchData[k] instanceof Array) {
//                 for (let i = 0; i < this._searchData[k].length; i++) {
//                     this._searchData[k][i].label = locale.get(this._searchData[k][i].locale);
//                 }
//             }
//         }

//         this._searchContent.setSearchData(this._searchData);
//     }

//     findText(isFull?: boolean) {
//         // @ts-ignore
//         // TODO ...
//         // BUG
//         // let textFinder = this._context.getPluginManager().getPluginByName<FindPlugin>('pluginFind')!.createTextFinder('A1:B10', this._searchText);
//         // if (this._matchList.includes('capslock')) textFinder = textFinder.matchCase(true);
//         // if (this._matchList.includes('whole')) textFinder = textFinder.matchEntireCell(true);
//         // if (isFull) {
//         //     textFinder.findAll();
//         // } else {
//         //     textFinder.findNext();
//         // }
//     }

//     // get search text
//     changeSearchText(e: Event) {
//         const target = e.target as HTMLInputElement;
//         this._searchText = target.value;
//     }

//     // get match condition
//     getMatch = (value: string[]) => {
//         this._matchList = value;
//     };
// }
