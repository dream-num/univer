# Changelog

## [0.5.4](https://github.com/dream-num/univer/compare/v0.5.3...v0.5.4) (2025-01-13)


### Bug Fixes

* better facade comment ([#4402](https://github.com/dream-num/univer/issues/4402)) ([59a1774](https://github.com/dream-num/univer/commit/59a1774a6f763009715efc70b7ae932c0f6399d8))
* **design:** ensure colorpicker trigger onChanged callback on mouseup event ([#4443](https://github.com/dream-num/univer/issues/4443)) ([32f1d30](https://github.com/dream-num/univer/commit/32f1d309e9fae825ed32ebf8cf93f2cfc2c7dd32))
* **design:** ensure colorpicker triggers value change after color selection ([#4441](https://github.com/dream-num/univer/issues/4441)) ([c4d8a1b](https://github.com/dream-num/univer/commit/c4d8a1b44456a24bc96ddb34cca1e396c9cba0d5))
* **design:** improve styling of Tooltip ([#4463](https://github.com/dream-num/univer/issues/4463)) ([fcf5bbf](https://github.com/dream-num/univer/commit/fcf5bbf2015df053203fa2cefee56f612a54490d))
* **facade:** insert empty text error ([#4465](https://github.com/dream-num/univer/issues/4465)) ([88a0c86](https://github.com/dream-num/univer/commit/88a0c8630046e04b301995d982f5e6e3d05ed5d2))
* font interceptor ([#4453](https://github.com/dream-num/univer/issues/4453)) ([48080f6](https://github.com/dream-num/univer/commit/48080f662fd30b676110122910f0afe904fd1e7d))
* **formula:** clear ast cache ([#4439](https://github.com/dream-num/univer/issues/4439)) ([c504fcb](https://github.com/dream-num/univer/commit/c504fcb1b06673ac8c96edbbcfed5756e0867a0d))
* **formula:** fix formula facade import ([#4438](https://github.com/dream-num/univer/issues/4438)) ([b1e4ae8](https://github.com/dream-num/univer/commit/b1e4ae80c4356e1f648b80bd36aeb0a93d1eaa0e))
* **formula:** node maker handle blank ([#4347](https://github.com/dream-num/univer/issues/4347)) ([2fbe824](https://github.com/dream-num/univer/commit/2fbe8246035a77c4e8e3c03ee78c01f95fd72563))
* paste border should cover origin border ([#4321](https://github.com/dream-num/univer/issues/4321)) ([7cdd2e6](https://github.com/dream-num/univer/commit/7cdd2e624fe414d99f3c13a7547cb8dd361acae4))
* pointer event ([#4456](https://github.com/dream-num/univer/issues/4456)) ([58d8551](https://github.com/dream-num/univer/commit/58d8551bd82e427edcc1a1cc59181c7f49c96f6b))
* ref selection clear ([#4387](https://github.com/dream-num/univer/issues/4387)) ([c2d126e](https://github.com/dream-num/univer/commit/c2d126e1cf6f0aebdd7b93612a46338464447095))
* **sheet:** sheet name quote ([#4198](https://github.com/dream-num/univer/issues/4198)) ([f42c01a](https://github.com/dream-num/univer/commit/f42c01a2ed9f6a30b64ceb37d15bffe9ea31991a))
* sidebar visible shoule be false when close ([#4343](https://github.com/dream-num/univer/issues/4343)) ([c8f2171](https://github.com/dream-num/univer/commit/c8f2171f959e5b908c8462be81eb5ff7438cfbbf))
* **ui:** improve the style of Ribbon ([#4448](https://github.com/dream-num/univer/issues/4448)) ([4be0fb9](https://github.com/dream-num/univer/commit/4be0fb99744631d003491879079c8338c8d3cb42))


### Features

* add find replace facade api ([#4430](https://github.com/dream-num/univer/issues/4430)) ([e34c664](https://github.com/dream-num/univer/commit/e34c6642135d98ac08efdecb011e19250db2df9e))
* add paste options ([#4393](https://github.com/dream-num/univer/issues/4393)) ([d758b21](https://github.com/dream-num/univer/commit/d758b217ec4f590a44e7db25eeefff413fed2d89))
* **facade:** add comment & rich-text & data-validation & edit API ([#4423](https://github.com/dream-num/univer/issues/4423)) ([cff224f](https://github.com/dream-num/univer/commit/cff224fb24a244a55b8386ed1fb35cdd8e5f7a73))
* **facade:** add formula facade ([#4348](https://github.com/dream-num/univer/issues/4348)) ([de097d8](https://github.com/dream-num/univer/commit/de097d886ec229bdb829d17b975356ddacd10464))
* **facade:** add lexer-tree-builder ([#4444](https://github.com/dream-num/univer/issues/4444)) ([a36c4f3](https://github.com/dream-num/univer/commit/a36c4f3d6fbf0c410b99e040bad4746c636406c2))
* **facade:** add ui facade ([#4452](https://github.com/dream-num/univer/issues/4452)) ([6b723c9](https://github.com/dream-num/univer/commit/6b723c9db0f8a10f5e4f6f5a61e263c654bdce40))
* **facade:** univer-sheet change to workbook ([#4460](https://github.com/dream-num/univer/issues/4460)) ([c4e9c3a](https://github.com/dream-num/univer/commit/c4e9c3aa45561a1483c453fe795df3abd8ac96f0))
* **formula:** support lambda in function register ([#4298](https://github.com/dream-num/univer/issues/4298)) ([a1b7a16](https://github.com/dream-num/univer/commit/a1b7a1685b052dc438e75356bd940089ccb930e3))
* **image:** add event and enum ([#4429](https://github.com/dream-num/univer/issues/4429)) ([b413d68](https://github.com/dream-num/univer/commit/b413d6809ede2382839b660319a6ec9482cea89b))

## [0.5.3](https://github.com/dream-num/univer/compare/v0.5.2...v0.5.3) (2025-01-04)


### Bug Fixes

* canvas crash when draw broken image ([#4388](https://github.com/dream-num/univer/issues/4388)) ([09fd432](https://github.com/dream-num/univer/commit/09fd43220cd746e152fbf3157d077ba44fec3e3d))
* **design:** fix dropdown on nested situation ([#4416](https://github.com/dream-num/univer/issues/4416)) ([05896c0](https://github.com/dream-num/univer/commit/05896c0a39974e5c498f83020e86fa276e637448))
* extend feventname ([#4426](https://github.com/dream-num/univer/issues/4426)) ([86e4e8e](https://github.com/dream-num/univer/commit/86e4e8e23e732fe7f2c3cd4b6eeaa036fe8cb572))
* **facade:** f-event & f-enum extend error ([#4424](https://github.com/dream-num/univer/issues/4424)) ([be77c47](https://github.com/dream-num/univer/commit/be77c479ebc9363cde6610f369ed512eb5c3cb94))
* **filter:** fix event API export ([#4422](https://github.com/dream-num/univer/issues/4422)) ([5738128](https://github.com/dream-num/univer/commit/57381280398a813ba3eab2e9bcb72f952b798749))
* fix snapshot after cut & paste ([#4405](https://github.com/dream-num/univer/issues/4405)) ([52990cc](https://github.com/dream-num/univer/commit/52990cc049f536ce58146ab5bbd3901e07ce94b0))
* **formula:** use different isNullCell for formula modules ([#4395](https://github.com/dream-num/univer/issues/4395)) ([72e8192](https://github.com/dream-num/univer/commit/72e81922a0ec41d5d7a123d8c9afbb788dbab757))
* **range-selector:** remove dataStream ([#4191](https://github.com/dream-num/univer/issues/4191)) ([a90779e](https://github.com/dream-num/univer/commit/a90779efbf26fdec934c4884967bc5f59c859c01))
* **sheet:** fix spell error ([#4425](https://github.com/dream-num/univer/issues/4425)) ([430f338](https://github.com/dream-num/univer/commit/430f338d3209b15e156c849f4272c61d61250496))
* **ui:** update animation class condition to improve Ribbon styling ([#4392](https://github.com/dream-num/univer/issues/4392)) ([0124730](https://github.com/dream-num/univer/commit/0124730e028149e5326337d95d5133e8aa53888d))
* vp start sheet view column ([#4396](https://github.com/dream-num/univer/issues/4396)) ([868e4b2](https://github.com/dream-num/univer/commit/868e4b2a81fae12e5a522c85b95b6e6d4690d2c4))
* **watermark:** fix invalid plugin configuration ([#4389](https://github.com/dream-num/univer/issues/4389)) ([e3930bb](https://github.com/dream-num/univer/commit/e3930bbdea12de3e222879e2dad0ecc2d43a64b9))


### Features

* add api for ui and f-enum ([#4406](https://github.com/dream-num/univer/issues/4406)) ([51ed14e](https://github.com/dream-num/univer/commit/51ed14e80c22cfe9fe8b08dc8e7e2f53ee74f8ad))
* **facade:** facade-namespace & global addEvent ([#4346](https://github.com/dream-num/univer/issues/4346)) ([612c981](https://github.com/dream-num/univer/commit/612c981b2fd403bf0ebce316e4b3f9fed5d59d68))
* **facade:** make facade api sync and chainable ([#4329](https://github.com/dream-num/univer/issues/4329)) ([c5fcf3e](https://github.com/dream-num/univer/commit/c5fcf3eccd1632bce2396238fa3bdebb87d214ff))
* fetchThroughInterceptors support filter function ([#4385](https://github.com/dream-num/univer/issues/4385)) ([e909093](https://github.com/dream-num/univer/commit/e90909302d857d19bfc0b3df2f95092ef287ba3e))
* **filter:** update filter facade to add events and enums ([#4403](https://github.com/dream-num/univer/issues/4403)) ([9ad9d48](https://github.com/dream-num/univer/commit/9ad9d4851039d98070e177695a466e7fb76089f5))
* **formula:** add register async function ([#4399](https://github.com/dream-num/univer/issues/4399)) ([c8d287b](https://github.com/dream-num/univer/commit/c8d287b2a49447e7f68b9b233663d826976258a7))
* **sheet:** support range theme template ([#4369](https://github.com/dream-num/univer/issues/4369)) ([28ff41a](https://github.com/dream-num/univer/commit/28ff41a3a2db56d19854efcfadd1494e2812ab59))


### Reverts

* get fontExtension from cache,  revert to worksheet.getCell ([#4417](https://github.com/dream-num/univer/issues/4417)) ([5c03dff](https://github.com/dream-num/univer/commit/5c03dff81221fe4933cb33ffb83b650ddef8b91a))

## [0.5.2](https://github.com/dream-num/univer/compare/v0.5.1...v0.5.2) (2024-12-28)


### Bug Fixes

*  better disable selection ---> transparent selection ([#4372](https://github.com/dream-num/univer/issues/4372)) ([46b403c](https://github.com/dream-num/univer/commit/46b403cd0d9f31b2df7cfcbcda088f208aa3d2d4))
* border stylecache in sheet skeleton ([#4276](https://github.com/dream-num/univer/issues/4276)) ([af3eece](https://github.com/dream-num/univer/commit/af3eecefb46049c92763803b0c65fda4b72f3c6a))
* cell link postion should clear primary ([#4241](https://github.com/dream-num/univer/issues/4241)) ([7fe6a76](https://github.com/dream-num/univer/commit/7fe6a768fe7b73e6e1865b5ea40115b10b8ad1ba))
* **cell:** fix cell format of rich text ([#4261](https://github.com/dream-num/univer/issues/4261)) ([91c201a](https://github.com/dream-num/univer/commit/91c201aa0aaeb9f8018b306fb0c67452bb9a213e))
* **chart:** fix delete drawing not dispose popup ([#4194](https://github.com/dream-num/univer/issues/4194)) ([b653da5](https://github.com/dream-num/univer/commit/b653da51d286ae4de7946591f262182b2aa24930))
* **conditional-formatting:** add onlyLocal to formula mutations ([#4323](https://github.com/dream-num/univer/issues/4323)) ([80e6f37](https://github.com/dream-num/univer/commit/80e6f374f0b4eced0a22fbcc7eaa5e829f76359a))
* **conditional-formatting:** memory leak ([#4212](https://github.com/dream-num/univer/issues/4212)) ([1de083c](https://github.com/dream-num/univer/commit/1de083c588cdeae7d244a4d03df3358e2aac05f7))
* copy cell should generate html & plain ([#4366](https://github.com/dream-num/univer/issues/4366)) ([e2edd07](https://github.com/dream-num/univer/commit/e2edd0782a713de7c6cce4454a906b4d030b25b4))
* copy plain should get cell value ([#4344](https://github.com/dream-num/univer/issues/4344)) ([7e36387](https://github.com/dream-num/univer/commit/7e36387d775941eb6dcab2e5cbba48fac207881a))
* **core:** url regexper ([#4237](https://github.com/dream-num/univer/issues/4237)) ([182f7c5](https://github.com/dream-num/univer/commit/182f7c5320512ba60a051ec638f8a5208e8f0c2c))
* cross selection failed ([#4226](https://github.com/dream-num/univer/issues/4226)) ([cbc58ea](https://github.com/dream-num/univer/commit/cbc58ea94a58e6a7cca769cef093792fba9fadc6))
* **definedName:** set current sheet name ([#4204](https://github.com/dream-num/univer/issues/4204)) ([456c4a2](https://github.com/dream-num/univer/commit/456c4a2a50151ce4ff69c3db481145b0bf83c148))
* **drawing:** chart can custom backgroud ([#4251](https://github.com/dream-num/univer/issues/4251)) ([1be91c8](https://github.com/dream-num/univer/commit/1be91c8b1433ab82d5cbe39e214424bad29708f6))
* **dv:** detail panel not diposing correctly ([#4308](https://github.com/dream-num/univer/issues/4308)) ([0a0e723](https://github.com/dream-num/univer/commit/0a0e723a96604338e3287f20f26bfdf29953bdcc))
* **examples:** fix external worker not terminated on Univer disposing ([#4218](https://github.com/dream-num/univer/issues/4218)) ([1cce071](https://github.com/dream-num/univer/commit/1cce07112d4a4ce40cad92a5ced1bbb99f49f366))
* **facade:** calculate the correct number of displayable sheet ([#4335](https://github.com/dream-num/univer/issues/4335)) ([7fcb50a](https://github.com/dream-num/univer/commit/7fcb50ad4d6a6af69ee20e9845ee0ffb350df2b6))
* **facade:** fix hyperlink update and remove command ([#4287](https://github.com/dream-num/univer/issues/4287)) ([e60e45f](https://github.com/dream-num/univer/commit/e60e45fa6e53c36726eb3131005e63efd00dc793))
* **facade:** fix setNumberFormat facade ([#4202](https://github.com/dream-num/univer/issues/4202)) ([9fcbea8](https://github.com/dream-num/univer/commit/9fcbea8472f762c1b1a9349626a6f61cf99e6628))
* fix become rich text when end edit ([#4309](https://github.com/dream-num/univer/issues/4309)) ([d57f88b](https://github.com/dream-num/univer/commit/d57f88b9dad20fd19aa5dafc71f0c82cf71a3ecb))
* fix clipboard when dispose ([#4253](https://github.com/dream-num/univer/issues/4253)) ([f06ab86](https://github.com/dream-num/univer/commit/f06ab868f05b8977368e1ba527df6514484291f1))
* fix facade API not implemented ([#4259](https://github.com/dream-num/univer/issues/4259)) ([d0d264f](https://github.com/dream-num/univer/commit/d0d264fa8ca44ebf4c4f4aeec53ec287963a4ab9))
* fix facade not exported ([#4285](https://github.com/dream-num/univer/issues/4285)) ([ac3cc27](https://github.com/dream-num/univer/commit/ac3cc27e156ccd6d2730fca8c4a0a48a07bc20e0))
* fix last memory leak and make memory CI more strict ([#4229](https://github.com/dream-num/univer/issues/4229)) ([1e0d548](https://github.com/dream-num/univer/commit/1e0d5487445b4557d661dd754fae9bb27ba2ca3d))
* fix merge with move bad case ([#4274](https://github.com/dream-num/univer/issues/4274)) ([e9de991](https://github.com/dream-num/univer/commit/e9de991def633ab2d75a16aa2f02e768aed6004b))
* fix paste besides border should keep rich text ([#4316](https://github.com/dream-num/univer/issues/4316)) ([2763f02](https://github.com/dream-num/univer/commit/2763f02ca57b71da3526e3960026e3748459e7e9))
* **formula:** fix compare of range and criteria in related formulas ([#4216](https://github.com/dream-num/univer/issues/4216)) ([ebf12d6](https://github.com/dream-num/univer/commit/ebf12d67b7c1d6aa5d33495ced2e68e86e238117))
* **formula:** fix product formula ([#4273](https://github.com/dream-num/univer/issues/4273)) ([a9ea9e1](https://github.com/dream-num/univer/commit/a9ea9e14287144d06a78940707912d6b586a487d))
* **formula:** fix xlookup formula ([#4263](https://github.com/dream-num/univer/issues/4263)) ([ae576a7](https://github.com/dream-num/univer/commit/ae576a7703df7c9a0700d42d5f40acc0b88e2c77))
* **formula:** formula auto fill up ([#4227](https://github.com/dream-num/univer/issues/4227)) ([e7126ae](https://github.com/dream-num/univer/commit/e7126ae1ffd896d34977eeee56775e90cc8b2b23))
* **formula:** formula dependency ([#4224](https://github.com/dream-num/univer/issues/4224)) ([6dd4b16](https://github.com/dream-num/univer/commit/6dd4b16642ac52486c8180fb41c9620a86369314))
* **formula:** indirect dependency ([#4245](https://github.com/dream-num/univer/issues/4245)) ([ebda4c3](https://github.com/dream-num/univer/commit/ebda4c37453ac71f3d968fff7c8adeefcd3f2fac))
* **formula:** some formulas need to be tested in dev ([#4116](https://github.com/dream-num/univer/issues/4116)) ([4ff30b1](https://github.com/dream-num/univer/commit/4ff30b1bb95f79727abd05e3ad9e9b6861be611a))
* merge default plugin configuration with existing config in multiple plugins ([#4370](https://github.com/dream-num/univer/issues/4370)) ([4900e66](https://github.com/dream-num/univer/commit/4900e664a526f79bd8f0ca1c39975099baedd6b1))
* mult rows need to be pasted into multiple cells ([#4319](https://github.com/dream-num/univer/issues/4319)) ([17a92a8](https://github.com/dream-num/univer/commit/17a92a865f7fad273731787f6294d32fb2fa431c))
* **network:** work in ancestor env ([#4296](https://github.com/dream-num/univer/issues/4296)) ([2502caf](https://github.com/dream-num/univer/commit/2502caf05a03b441e11ac1add99955e6c90cc01c))
* only change the style when have ts ([#4365](https://github.com/dream-num/univer/issues/4365)) ([57467da](https://github.com/dream-num/univer/commit/57467da8774b42cedc8e88f9a78296d98487ff06))
* paste should clear target cell value ([#4268](https://github.com/dream-num/univer/issues/4268)) ([3babc2f](https://github.com/dream-num/univer/commit/3babc2fd0c0ea936b5a24cec5d4d9eec37f14ce4))
* **permission:** range selector blur ([#4310](https://github.com/dream-num/univer/issues/4310)) ([92c7577](https://github.com/dream-num/univer/commit/92c757742e267b73f0da9ab9ac26d01b2756c754))
* replace deprecated deepMerge method with merge from @univerjs/core ([#4374](https://github.com/dream-num/univer/issues/4374)) ([a5949ae](https://github.com/dream-num/univer/commit/a5949aecfbc5891b09a4fa6d644bec7e59e4d9ab))
* row col selection for merged cell ([#4345](https://github.com/dream-num/univer/issues/4345)) ([b724a46](https://github.com/dream-num/univer/commit/b724a46f1f32b80a4a2ef39b9a01b18cf72a9fc3))
* rpc support multiple params ([#4271](https://github.com/dream-num/univer/issues/4271)) ([1dae650](https://github.com/dream-num/univer/commit/1dae650da82e50282bdc7757c1e211e539caab46))
* selection expand with shift  ([#4166](https://github.com/dream-num/univer/issues/4166)) ([22facae](https://github.com/dream-num/univer/commit/22facae1557f421703bd818c893c8d5417e9b26f))
* **selection:** fix multiple selection use tab not right issue ([#4288](https://github.com/dream-num/univer/issues/4288)) ([2a01076](https://github.com/dream-num/univer/commit/2a010766baef35bcbb08bf2419469950d7446f4b))
* sheet e2e too long ([#4267](https://github.com/dream-num/univer/issues/4267)) ([c9c1e5d](https://github.com/dream-num/univer/commit/c9c1e5dd72fd32958d38ae7f0f13c658c9803718))
* **sheet:** resizeObserver disconnect when unmount in sheetBarTabs ([#4228](https://github.com/dream-num/univer/issues/4228)) ([2df1862](https://github.com/dream-num/univer/commit/2df18629415efdfd287d725f2d1c7346474ebdb4))
* **sheets-data-validation:** data-validation range set error ([#4378](https://github.com/dream-num/univer/issues/4378)) ([6ed7d84](https://github.com/dream-num/univer/commit/6ed7d8406bb1fcc377cc08eb3d08523814df6f15))
* **sheets-data-validation:** error relayout on ref-range change ([#4376](https://github.com/dream-num/univer/issues/4376)) ([70f82d0](https://github.com/dream-num/univer/commit/70f82d02ab749d44668b7e493e10422863f18844))
* **sheets-drawing-ui:** add missing `DocsDrawingController` dependency ([#4203](https://github.com/dream-num/univer/issues/4203)) ([5a13fd1](https://github.com/dream-num/univer/commit/5a13fd1e0b68256b5c6c6aec13d22c60238687d2))
* **sheets-hyper-link-ui:** number link popup hover position error ([#4223](https://github.com/dream-num/univer/issues/4223)) ([3d051ad](https://github.com/dream-num/univer/commit/3d051ade7086f3aac1e06dd9804c66b380354f63))
* **sheets-hyper-link:** hyper-link-facade ([#4337](https://github.com/dream-num/univer/issues/4337)) ([eb530d8](https://github.com/dream-num/univer/commit/eb530d8549192ab05026b7c86f8a4a18b653d6f3))
* **sheets-ui:** hover-manager-service memory leak ([#4213](https://github.com/dream-num/univer/issues/4213)) ([3ce3b27](https://github.com/dream-num/univer/commit/3ce3b275c160b92cb5b98c42f52fb4745008df7f))
* **sheets-ui:** resolve issue where text color could not be reset ([#4234](https://github.com/dream-num/univer/issues/4234)) ([39c7d0e](https://github.com/dream-num/univer/commit/39c7d0ece7a94abb11d105cd10f424e98ae17c0c))
* **sheets-ui:** types field not specificed ([#4301](https://github.com/dream-num/univer/issues/4301)) ([f6c7811](https://github.com/dream-num/univer/commit/f6c7811d33f9732858bc2fb889ac7f899369f0b9))
* some bugs on clipboard facade API ([#4332](https://github.com/dream-num/univer/issues/4332)) ([4b51483](https://github.com/dream-num/univer/commit/4b51483509cd3a6fdd20cbb048d5e8bbfd4c42a8))
* some rendering issues in doc ([#4219](https://github.com/dream-num/univer/issues/4219)) ([0dd4f3d](https://github.com/dream-num/univer/commit/0dd4f3de3a85735562e49fb30f038c9a0f938e8b))
* toolbar width ([#4053](https://github.com/dream-num/univer/issues/4053)) ([#4208](https://github.com/dream-num/univer/issues/4208)) ([f23a024](https://github.com/dream-num/univer/commit/f23a0246007bb93b486aac78ae5833448e933c9b))
* **ui:** if two messages share the same key, the later should replace the earlier ([#4293](https://github.com/dream-num/univer/issues/4293)) ([dc60cb3](https://github.com/dream-num/univer/commit/dc60cb373cba8fdc3f5b265e01daeb954765b5cc))
* update merge logic to create new objects instead of mutating existing ones ([#4375](https://github.com/dream-num/univer/issues/4375)) ([d40873d](https://github.com/dream-num/univer/commit/d40873dde210d4cdec782c63807af19767474279))
* use drawing range not visible range ([#4341](https://github.com/dream-num/univer/issues/4341)) ([1f2a84b](https://github.com/dream-num/univer/commit/1f2a84b0afc8caee20326dcd6698fa8fdc68595e))


### Features

* add methods to telemetry service ([#4289](https://github.com/dream-num/univer/issues/4289)) ([8619410](https://github.com/dream-num/univer/commit/861941046801970778a54916ac81e510f0ca209c))
* add set scrolling & get scrollInfo & better freeze API for facade ([#4290](https://github.com/dream-num/univer/issues/4290)) ([1bd1325](https://github.com/dream-num/univer/commit/1bd1325ce32b3c24992f5c2b29f448c579c56077))
* add sort facade API ([#4312](https://github.com/dream-num/univer/issues/4312)) ([38be2cf](https://github.com/dream-num/univer/commit/38be2cf6a3e525c2f465d88688f17448bc3b1596))
* **conditional-formatting:** add test and jsdoc ([#4303](https://github.com/dream-num/univer/issues/4303)) ([7abd39d](https://github.com/dream-num/univer/commit/7abd39d5c7bd577537bcd6a942a511b754333cd8))
* **conditional-formatting:** support facade api ([#4300](https://github.com/dream-num/univer/issues/4300)) ([baa5201](https://github.com/dream-num/univer/commit/baa5201da1595adca2b4aef2aebb4e04ceafb7bc))
* **facade:** add facade comments ([#4264](https://github.com/dream-num/univer/issues/4264)) ([b808f98](https://github.com/dream-num/univer/commit/b808f9830ad50697c1c487ead47008670b531633))
* **facade:** add range to-string api & fix data-validation api ([#4325](https://github.com/dream-num/univer/issues/4325)) ([47773f8](https://github.com/dream-num/univer/commit/47773f8d997375540241c24cbe5ad4c08718c467))
* **facade:** update data validation facade ([#4275](https://github.com/dream-num/univer/issues/4275)) ([ff8be23](https://github.com/dream-num/univer/commit/ff8be23c168ee1d871cff4ef87525507c1d21fd6))
* **image:** facade api ([#4322](https://github.com/dream-num/univer/issues/4322)) ([b41e499](https://github.com/dream-num/univer/commit/b41e499057d4d63c1fb952310a1d4d8a1034ade1))
* **network:** add network FacadeAPI ([#4294](https://github.com/dream-num/univer/issues/4294)) ([0509114](https://github.com/dream-num/univer/commit/0509114aa87499fd275b33ed1091bfbdff36a5d7))
* **sheet:** add defined name api ([#4282](https://github.com/dream-num/univer/issues/4282)) ([fb9bfcd](https://github.com/dream-num/univer/commit/fb9bfcda25d3ba150b9109bc7cb918b1e1173bdc))
* **sheet:** add facade api ([#4279](https://github.com/dream-num/univer/issues/4279)) ([50db7a3](https://github.com/dream-num/univer/commit/50db7a3e1f234c8670653f3f044830fbe2d92a01))
* **sheet:** add user header part ([#4333](https://github.com/dream-num/univer/issues/4333)) ([35c55d3](https://github.com/dream-num/univer/commit/35c55d3e92304804db18e0e8aec24a995b5c2c51))
* **sparkline:** add render extension ([#4233](https://github.com/dream-num/univer/issues/4233)) ([96efb3d](https://github.com/dream-num/univer/commit/96efb3d361e27d4a78fed1aae7e526851dbcc251))
* **textsplit:** support text split util function ([#4302](https://github.com/dream-num/univer/issues/4302)) ([f5d1c79](https://github.com/dream-num/univer/commit/f5d1c794e478ba4dc68ae1d721c11b6611d23711))
* **ui:** add more facade ([#4291](https://github.com/dream-num/univer/issues/4291)) ([3254073](https://github.com/dream-num/univer/commit/3254073688bd66629fcb58bd9fc08e732829bdb2))
* **ui:** add URL facade ([#4305](https://github.com/dream-num/univer/issues/4305)) ([a1da277](https://github.com/dream-num/univer/commit/a1da277021ca786684771d97020bd86346ec5b14))
* **ui:** export shortcut facade API ([#4324](https://github.com/dream-num/univer/issues/4324)) ([ceff4eb](https://github.com/dream-num/univer/commit/ceff4eb3050001f72a92f2ebc3c3dff0982965b6))
* **ui:** support no icon toolbar button ([#4328](https://github.com/dream-num/univer/issues/4328)) ([2a9bdd3](https://github.com/dream-num/univer/commit/2a9bdd3ad9a7530545625dd748183157c55ae0e8))
* **ui:** support ui menu facade ([#4304](https://github.com/dream-num/univer/issues/4304)) ([34fc17d](https://github.com/dream-num/univer/commit/34fc17d5d51dea73d14ebef45240899a84f78796))
* user facade api & onCommented  & cellPointerdown & hide selection ([#4342](https://github.com/dream-num/univer/issues/4342)) ([f13e573](https://github.com/dream-num/univer/commit/f13e573aa7eca371baaa4646d14538e3958b41c1))

## [0.5.1](https://github.com/dream-num/univer/compare/v0.5.0...v0.5.1) (2024-11-30)


### Bug Fixes

* auto fill should delete dv rules ([#4075](https://github.com/dream-num/univer/issues/4075)) ([b9439c5](https://github.com/dream-num/univer/commit/b9439c533ea84ab048cfe41680c08734fa6e5f99))
* clipboard deps ([#4115](https://github.com/dream-num/univer/issues/4115)) ([57c595e](https://github.com/dream-num/univer/commit/57c595e209cc2b0de07d7f459514d79f0b065fdf))
* **conditional-formatting:** fix type ([#4181](https://github.com/dream-num/univer/issues/4181)) ([9db1edf](https://github.com/dream-num/univer/commit/9db1edf033904e109d364a7a13dd20252c8dd225))
* **conditional-formatting:** the style that involves conditional formatting does not fall ([#4195](https://github.com/dream-num/univer/issues/4195)) ([d7f5f72](https://github.com/dream-num/univer/commit/d7f5f726af75835885413be7b84042209be37525))
* cursor blink lags when pointer down at text range ([#4180](https://github.com/dream-num/univer/issues/4180)) ([de4d70b](https://github.com/dream-num/univer/commit/de4d70bb4204d18a97f0e7c881b209278e661300))
* **docs-ui:** cursor valished at paragraph beginning ([#4147](https://github.com/dream-num/univer/issues/4147)) ([ae027eb](https://github.com/dream-num/univer/commit/ae027eb98f490594bbba7d5fd988ae3ee926cad7))
* **docs-ui:** double paste issue ([#4168](https://github.com/dream-num/univer/issues/4168)) ([f0e8c92](https://github.com/dream-num/univer/commit/f0e8c92999fb376a5a5e2027a69320b5bc305509))
* dup list glyph type name ([#4169](https://github.com/dream-num/univer/issues/4169)) ([6b68364](https://github.com/dream-num/univer/commit/6b6836491b0d989c657237831e53d8d688818ba4))
* fix client may miss the INITIALIZE event ([#4158](https://github.com/dream-num/univer/issues/4158)) ([f0234bb](https://github.com/dream-num/univer/commit/f0234bbbed4b9ddab0f630cde5ee8966ebdf2363))
* **formula:** fix iferror ([#4163](https://github.com/dream-num/univer/issues/4163)) ([1a9f83d](https://github.com/dream-num/univer/commit/1a9f83d88aec3d8225ffc54c47283bd42f855149))
* **formula:** fix networkdays.intl ([#4152](https://github.com/dream-num/univer/issues/4152)) ([d1d4bbe](https://github.com/dream-num/univer/commit/d1d4bbe830a77c2e36cced0fc7d5ee9fa13f8c4e))
* **formula:** update formula data model ([#4159](https://github.com/dream-num/univer/issues/4159)) ([243acdb](https://github.com/dream-num/univer/commit/243acdb35ec2198cf53abbea4ac1dfcdebffb7ed))
* optimization of create empty doc ([#4149](https://github.com/dream-num/univer/issues/4149)) ([c88e709](https://github.com/dream-num/univer/commit/c88e70980974a562bb24046a0a4b6af819ee5f93))
* ref selection change by arrow key ([#4135](https://github.com/dream-num/univer/issues/4135)) ([444c065](https://github.com/dream-num/univer/commit/444c06594dd105569df4435e3fa91c91e08853a5))
* selection should stop response after a popup shown ([#4156](https://github.com/dream-num/univer/issues/4156)) ([a4b38af](https://github.com/dream-num/univer/commit/a4b38af4cdb434c0987f444e7d8a7625a59ad36c))
* **sheet:** parseValue handle number ([#4049](https://github.com/dream-num/univer/issues/4049)) ([59b95fa](https://github.com/dream-num/univer/commit/59b95fa23f43620eb303dbfd0a539a7c14beb122))
* **sheets-filter-ui:** fix the react compatibility issue with sheets filter ([#4189](https://github.com/dream-num/univer/issues/4189)) ([61e8ebf](https://github.com/dream-num/univer/commit/61e8ebf907c9a9f894caad45300dfe079349c5ae))
* **sheet:** sheet name normalize string ([#4172](https://github.com/dream-num/univer/issues/4172)) ([d9b1149](https://github.com/dream-num/univer/commit/d9b1149ffcdb4ab8b7380344c1746028b0496fb8))
* **ui:** progress bar animation ([#4136](https://github.com/dream-num/univer/issues/4136)) ([f578296](https://github.com/dream-num/univer/commit/f578296f9e6ad9cebbd1aacd8b1a727c5f4e631e))


### Features

* **i18n:** add `fr-FR` locale ([#3564](https://github.com/dream-num/univer/issues/3564)) ([9b7da8d](https://github.com/dream-num/univer/commit/9b7da8df11570b07b97e1b70fa989d223d5b22bb))
* remove zen-zone sidebar ([#4193](https://github.com/dream-num/univer/issues/4193)) ([0f651d6](https://github.com/dream-num/univer/commit/0f651d60c3ac1c115c35bbcb64a9bf32844aa1aa))
* **render-engine:** support repeat table header ([#4139](https://github.com/dream-num/univer/issues/4139)) ([c26f9b0](https://github.com/dream-num/univer/commit/c26f9b04300c4ab443514ddf1811b7e937db136b))
* **sheets-drawing-ui:** support sheet cell image ([#4036](https://github.com/dream-num/univer/issues/4036)) ([244511d](https://github.com/dream-num/univer/commit/244511d6163ad677f1df657075dcb7deacea77ca))

# [0.5.0](https://github.com/dream-num/univer/compare/v0.5.0-beta.1...v0.5.0) (2024-11-23)


### Bug Fixes

* bugs in cut-paste undo scenario ([#4095](https://github.com/dream-num/univer/issues/4095)) ([afc72cf](https://github.com/dream-num/univer/commit/afc72cf5dc0f5341377bc77768045ba48a4b3b7b))
* cal page size in modern mode ([#4128](https://github.com/dream-num/univer/issues/4128)) ([a58350b](https://github.com/dream-num/univer/commit/a58350be8900b192af1a7b1df668912ee82bbe2d))
* doc text selection begin from list marker ([#4132](https://github.com/dream-num/univer/issues/4132)) ([798e1fd](https://github.com/dream-num/univer/commit/798e1fd066890ce5ba26cdb581533f187fee6b58))
* **doc:** bad image path when parsing clipboard HTML ([#4119](https://github.com/dream-num/univer/issues/4119)) ([adfaf14](https://github.com/dream-num/univer/commit/adfaf14580574f7a94c047e3987c886bc9659433))
* **doc:** failed to process image upload ([#4120](https://github.com/dream-num/univer/issues/4120)) ([2547183](https://github.com/dream-num/univer/commit/2547183f56533d5cb728ef05661e6678a3b3f79d))
* **docs-ui:** menu align when select table cells ([#4127](https://github.com/dream-num/univer/issues/4127)) ([e1d7713](https://github.com/dream-num/univer/commit/e1d7713393c279a4dc51589b17e6b20cb986f481))
* **drawing:** set drawing bounding in left/top to A1 cell ([#4096](https://github.com/dream-num/univer/issues/4096)) ([e695309](https://github.com/dream-num/univer/commit/e695309ecc62a49c21d90db1f29eac5b5b4d7202))
* **formula:** init trigger calculation controller on rendered ([#4118](https://github.com/dream-num/univer/issues/4118)) ([9e7b9fb](https://github.com/dream-num/univer/commit/9e7b9fb890722cdaf42dee2b6c20373d5960fa4a))
* **formula:** update formula string in other sheet ([#4107](https://github.com/dream-num/univer/issues/4107)) ([3cf0e3b](https://github.com/dream-num/univer/commit/3cf0e3b2b41681f85c3ffd45b31f8ca8f91b6817))
* selection before table ([#4134](https://github.com/dream-num/univer/issues/4134)) ([744a203](https://github.com/dream-num/univer/commit/744a203f977b57294953771399154bd77540270f))
* set pointer caputure when pointer out  ([#4099](https://github.com/dream-num/univer/issues/4099)) ([e194a1e](https://github.com/dream-num/univer/commit/e194a1ebc4857e78abd3fc9904962360d8e460fd))
* **sheet:** cell related facade api ([#4032](https://github.com/dream-num/univer/issues/4032)) ([545dc82](https://github.com/dream-num/univer/commit/545dc8261a0f4123f2cb39277d34fb7f5b89f7d9))
* **sheet:** maximum call stack ([#4088](https://github.com/dream-num/univer/issues/4088)) ([d6d2e3f](https://github.com/dream-num/univer/commit/d6d2e3fc409b0b3550867177e6e11d2bbfae35e4))
* **sheets-hyper-link-ui:** link ref -range ([#4131](https://github.com/dream-num/univer/issues/4131)) ([924ad5e](https://github.com/dream-num/univer/commit/924ad5eb92cb819fb6b1d00b7347d4caee88f6c5))
* **sheets-ui:** gridlines permission ([#4091](https://github.com/dream-num/univer/issues/4091)) ([9630498](https://github.com/dream-num/univer/commit/96304984adb510802a8e2c8b82a72dae38f6a32a))


### Features

* **docs-link:** support acrossing-paragraph add link ([#4104](https://github.com/dream-num/univer/issues/4104)) ([cea9cb8](https://github.com/dream-num/univer/commit/cea9cb892c0d8a6e483cd8214b13cce8c5396259))
* **docs-mention-ui:** support doc mention ([#4093](https://github.com/dream-num/univer/issues/4093)) ([5b80481](https://github.com/dream-num/univer/commit/5b8048158d396ba6ab1772827d8c7320b6737cfd))
* **docs:** pictures support writing to the clipboard ([#4086](https://github.com/dream-num/univer/issues/4086)) ([bf8329f](https://github.com/dream-num/univer/commit/bf8329f01581a48657a04a1f99a82e725940bef0))
* **drawing:** drawing popup support custom menu ([#4113](https://github.com/dream-num/univer/issues/4113)) ([1ec6dbe](https://github.com/dream-num/univer/commit/1ec6dbe62a1379aa34a3ded90cb63b12a2e458e3))
* export types for facade api ([#4126](https://github.com/dream-num/univer/issues/4126)) ([0d07c86](https://github.com/dream-num/univer/commit/0d07c86d7daf5343c809539cc7ccea1456cadb28))
* **facade:** add api for cell editing ([#4124](https://github.com/dream-num/univer/issues/4124)) ([19808d0](https://github.com/dream-num/univer/commit/19808d01d27a6e74278cc6097450545e73721c07))
* **facade:** add component api ([#4125](https://github.com/dream-num/univer/issues/4125)) ([e0025ab](https://github.com/dream-num/univer/commit/e0025ab11b4a0f00a7d9e2d5dae20c68b1770b15))
* **facade:** export syncExecuteCommand ([#4102](https://github.com/dream-num/univer/issues/4102)) ([d882624](https://github.com/dream-num/univer/commit/d88262466c3f370e1c3534f98d444871f4d2ae64))
* **formula:** supplement ARRAY_CONSTRAIN/FLATTEN formula ([#3922](https://github.com/dream-num/univer/issues/3922)) ([20c81f3](https://github.com/dream-num/univer/commit/20c81f305e8c0ab85739082d09f4e76aa23e16e4))
* **formula:** supplement EPOCHTODATE/TO_DATE/ISDATE formula ([#3979](https://github.com/dream-num/univer/issues/3979)) ([0656167](https://github.com/dream-num/univer/commit/0656167e7a9f39b43b6c27e69964b611d59b5b37))
* **formula:** supplement IMCOTH/IMLOG/IMTANH formula ([#3909](https://github.com/dream-num/univer/issues/3909)) ([77e7c67](https://github.com/dream-num/univer/commit/77e7c678ea800fd0e39cf0d1ea2743dc89ca3908))
* **formula:** supplement ISBETWEEN/AVERAGE.WEIGHTED/MARGINOFERROR formula ([#3998](https://github.com/dream-num/univer/issues/3998)) ([0dc0027](https://github.com/dream-num/univer/commit/0dc0027c32316f8df7e9682a0c17d8974b8f732e))
* **formula:** supplement ISEMAIL/ISURL/ENCODEURL formula ([#3990](https://github.com/dream-num/univer/issues/3990)) ([224e88c](https://github.com/dream-num/univer/commit/224e88c4d93c8f8c61b686bd6976333b016e546f))
* **formula:** supplement LINEST/LOGEST/TREND formula ([#3965](https://github.com/dream-num/univer/issues/3965)) ([ff20170](https://github.com/dream-num/univer/commit/ff2017042b473595135fa3d18c27aa1a5334875b))
* **formula:** supplement ROUNDBANK formula ([#4013](https://github.com/dream-num/univer/issues/4013)) ([7c3807f](https://github.com/dream-num/univer/commit/7c3807fc75912b106bba05e3d4820c060ade83e7))
* **render-engine:** split table row ([#4054](https://github.com/dream-num/univer/issues/4054)) ([379221e](https://github.com/dream-num/univer/commit/379221e514d2e016bef8fbec8a65268e408d2ab8))
* **sheets-data-validation:** optimize data validation memory usage ([#4129](https://github.com/dream-num/univer/issues/4129)) ([814bc84](https://github.com/dream-num/univer/commit/814bc84b83953ff6703f7f74186cc43d57501eb9))
* **sheets-ui:** add hover facade api ([#4092](https://github.com/dream-num/univer/issues/4092)) ([a23f2fb](https://github.com/dream-num/univer/commit/a23f2fbed49e51df3099b7f0de8ba959de5aaa6e))

# [0.5.0-beta.1](https://github.com/dream-num/univer/compare/v0.5.0-beta.0...v0.5.0-beta.1) (2024-11-16)

# [0.5.0-beta.0](https://github.com/dream-num/univer/compare/v0.5.0-alpha.0...v0.5.0-beta.0) (2024-11-16)


### Bug Fixes

* **core:** add missing localizedFormat plugin support for dayjs ([#4079](https://github.com/dream-num/univer/issues/4079)) ([629db60](https://github.com/dream-num/univer/commit/629db60b2fee5fe469584c83a4deb770c5ca68d3))
* delete apply ([#4062](https://github.com/dream-num/univer/issues/4062)) ([820653c](https://github.com/dream-num/univer/commit/820653c34158161d48c3b27de9002f755b06f3da))
* **doc-mention:** doc mention error ([#4077](https://github.com/dream-num/univer/issues/4077)) ([d3085e2](https://github.com/dream-num/univer/commit/d3085e284850f5bedcdce90e43421d2de9dfdc90))
* **docs-ui:** cache menu style ([#3939](https://github.com/dream-num/univer/issues/3939)) ([3be0982](https://github.com/dream-num/univer/commit/3be0982def095c9ec2c80fd8107e1da0efd1a863))
* **docs-ui:** load lang error ([#4060](https://github.com/dream-num/univer/issues/4060)) ([278f728](https://github.com/dream-num/univer/commit/278f7284e360d1374cddf22aef7d29b0953fceeb))
* **docs:** inline format in table ([#4089](https://github.com/dream-num/univer/issues/4089)) ([bf33540](https://github.com/dream-num/univer/commit/bf33540e94d3c391430710b014d7a163150af6a9))
* **docs:** invert action issue ([#4083](https://github.com/dream-num/univer/issues/4083)) ([3f78902](https://github.com/dream-num/univer/commit/3f78902157a44bd4e6540439de0f77c77da2be37))
* **drawing:** float dom event error ([#4035](https://github.com/dream-num/univer/issues/4035)) ([ee8b93d](https://github.com/dream-num/univer/commit/ee8b93dafe92784ff41d162f530cdf4e478d9cb4))
* **formula:** fix formula rows and columns limit ([#4052](https://github.com/dream-num/univer/issues/4052)) ([9a78db0](https://github.com/dream-num/univer/commit/9a78db0c47715a687c0832edfda48879c27b1d4d))
* **formula:** fix formula update operation ([#4026](https://github.com/dream-num/univer/issues/4026)) ([54599ce](https://github.com/dream-num/univer/commit/54599ce86c0f0f62247ca3aa78b5972a377fb06d))
* mixed policy in rendering cells in bg extension ([#4048](https://github.com/dream-num/univer/issues/4048)) ([2cdea37](https://github.com/dream-num/univer/commit/2cdea3725dfa37b8ee647746d57debdcda642f94))
* move range selection not showing when dragging a selection ([#4082](https://github.com/dream-num/univer/issues/4082)) ([9310099](https://github.com/dream-num/univer/commit/9310099cc4c8a7a0df88d9a1bf7ada1f758bb5e4))
* **range-selector:** focus after confirm ([#4029](https://github.com/dream-num/univer/issues/4029)) ([0e5bd85](https://github.com/dream-num/univer/commit/0e5bd855f301e3be33ede4426a313c9a703af82e))
* selection highlight ([#3919](https://github.com/dream-num/univer/issues/3919)) ([83c8d47](https://github.com/dream-num/univer/commit/83c8d47c92b8b7695ab0b02d22196ba5281978a4))
* **sheet:** covert number when edit number with point ([#3948](https://github.com/dream-num/univer/issues/3948)) ([9040e5f](https://github.com/dream-num/univer/commit/9040e5f997d5a0d680d0634a56ee25facdcf7284))
* **sheets-data-validation:** data-validation ref-range behavior ([#4015](https://github.com/dream-num/univer/issues/4015)) ([fded2e8](https://github.com/dream-num/univer/commit/fded2e80aa7ecf3265bf0a476e3be8201b88f49e))
* **sheets-drawing-ui:** fix `drawing-move-right` translation in zh-CN & zh-TW ([#4046](https://github.com/dream-num/univer/issues/4046)) ([ad2c96d](https://github.com/dream-num/univer/commit/ad2c96ddd863680891d63613c6eb31f86ae27ea1))
* **sheets-drawing-ui:** sheet-drawing memory leak ([#4067](https://github.com/dream-num/univer/issues/4067)) ([4e64ebb](https://github.com/dream-num/univer/commit/4e64ebbdf75f29d0ee86a581e660a68622a0d32e))
* **sheets-formula:** other formula register ([#4073](https://github.com/dream-num/univer/issues/4073)) ([403381b](https://github.com/dream-num/univer/commit/403381bd5a54085aa59f6c419a9f49362c08e532))
* **sheets-formula:** should register other formula on steady ([#4069](https://github.com/dream-num/univer/issues/4069)) ([74b6e2b](https://github.com/dream-num/univer/commit/74b6e2b4a392922651a1ed8a31ec3d70047caebc))
* **sheets-hyper-link:** sheet link popup should attach to cell editor ([#4063](https://github.com/dream-num/univer/issues/4063)) ([7550f1c](https://github.com/dream-num/univer/commit/7550f1cef8c7ff17caecba7ac3305dd56b30b62e))
* **sheets-hyper-link:** update hyper link fail ([#4057](https://github.com/dream-num/univer/issues/4057)) ([6423ff8](https://github.com/dream-num/univer/commit/6423ff8ede75ae7b2e003fff99fd9866aa18f1dd))
* **sheets-thread-comment:** thread-comment resource save error ([#4050](https://github.com/dream-num/univer/issues/4050)) ([ffd426a](https://github.com/dream-num/univer/commit/ffd426a8e146df0ae0149852f8259c2cb806faac))
* **uni:** add set-editor-resize-operation ([#4043](https://github.com/dream-num/univer/issues/4043)) ([8b6ef1d](https://github.com/dream-num/univer/commit/8b6ef1dc18f460e41fe8dd90e00fb96b7e6c9c33))
* **uni:** uni toolbar init ([#3973](https://github.com/dream-num/univer/issues/3973)) ([8cf801a](https://github.com/dream-num/univer/commit/8cf801a2a03ae941c50dd70387f984a6f876e904))


### Features

* **docs-thread-comment:** disable undo redo on docs comment ([#4047](https://github.com/dream-num/univer/issues/4047)) ([a7a5201](https://github.com/dream-num/univer/commit/a7a520109eecdfc39dd81130b11d58d89e1cb414))
* reangeSelector supports className ([#3901](https://github.com/dream-num/univer/issues/3901)) ([6db18f3](https://github.com/dream-num/univer/commit/6db18f39996e8fa283d9479e0557409b35754403))
* **render-engine:** table wrap layout type ([#4021](https://github.com/dream-num/univer/issues/4021)) ([1762023](https://github.com/dream-num/univer/commit/1762023238290ec7344cedf8914c687589a6c393))
* **sheets-data-validation:** data validation hover optimize ([#4051](https://github.com/dream-num/univer/issues/4051)) ([17bbe40](https://github.com/dream-num/univer/commit/17bbe40a6a414a69cfd02e7cd70af039dad586d1))
* **sheets-data-validation:** optimize data-validation error msg ([#4044](https://github.com/dream-num/univer/issues/4044)) ([b4d4cfa](https://github.com/dream-num/univer/commit/b4d4cfa063c9e6d5a82d1fc6b05edc206a415252))
* **ui:** support onFocus event in InputNumber ([#4085](https://github.com/dream-num/univer/issues/4085)) ([8597d44](https://github.com/dream-num/univer/commit/8597d44857ce2ee083a518985c14c8f6208af92f))

# [0.5.0-alpha.0](https://github.com/dream-num/univer/compare/v0.4.2...v0.5.0-alpha.0) (2024-11-09)


### Bug Fixes

* change mode set cursor ([#3915](https://github.com/dream-num/univer/issues/3915)) ([be77b78](https://github.com/dream-num/univer/commit/be77b78c9183e2df03d74a3bb10b2ca271a6b206))
* **chart:** add chart wrapper border radius ([#3962](https://github.com/dream-num/univer/issues/3962)) ([3d38af5](https://github.com/dream-num/univer/commit/3d38af56966f388f0e04a388d3666de2eba9b6cc))
* **conditional-formatting:** the data bar is rendered with a color po… ([#3934](https://github.com/dream-num/univer/issues/3934)) ([626c9b8](https://github.com/dream-num/univer/commit/626c9b8be1d8839e1244a7dc45129dc5594e1dd6))
* cutting to the target range does not require filtering merge cells of the same size ([#3976](https://github.com/dream-num/univer/issues/3976)) ([a2c292e](https://github.com/dream-num/univer/commit/a2c292efed4e641ce26279ebc16055e480d95461))
* **design:** add blur to input number ([#3971](https://github.com/dream-num/univer/issues/3971)) ([2272eae](https://github.com/dream-num/univer/commit/2272eaece600dbbf7073621a2eb73f72aa518b05))
* destructuring assignment does not take effect for null ([#3955](https://github.com/dream-num/univer/issues/3955)) ([74de2cc](https://github.com/dream-num/univer/commit/74de2ccea633e47331d85c6c229c3c424e7c3f1a))
* **docs-ui:** hide header footer menu when modern mode ([#3953](https://github.com/dream-num/univer/issues/3953)) ([88ff166](https://github.com/dream-num/univer/commit/88ff166c8e78a499c0c3c1c74861be708cbb23ea))
* **docs-ui:** init table style by the cutsor position ([#3936](https://github.com/dream-num/univer/issues/3936)) ([1615bd2](https://github.com/dream-num/univer/commit/1615bd23b9630d9b1421a6e585103239a39027d6))
* **docs-ui:** select all and delete then enter bug ([#3932](https://github.com/dream-num/univer/issues/3932)) ([e419e1b](https://github.com/dream-num/univer/commit/e419e1b650ee2fdf585e98efe912cdaadc9195fb))
* **docs-ui:** selection in table when across two pages ([#4006](https://github.com/dream-num/univer/issues/4006)) ([fe6c0b2](https://github.com/dream-num/univer/commit/fe6c0b2592944ce6603fab9bd0fdbe8ae128c814))
* **docs-ui:** set table cell style ([#3937](https://github.com/dream-num/univer/issues/3937)) ([4e5323b](https://github.com/dream-num/univer/commit/4e5323b37db4c000d09baa5b7cc53105a087dd8b))
* **docs-ui:** wrong font size in menu show ([#3938](https://github.com/dream-num/univer/issues/3938)) ([e9e7820](https://github.com/dream-num/univer/commit/e9e78203aa852995ed8eac5ea48ddf6aee3acc42))
* **docs:** default text style in doc ([#3906](https://github.com/dream-num/univer/issues/3906)) ([b7937cd](https://github.com/dream-num/univer/commit/b7937cdd93eec09474b1425f16215f7b93a28369))
* **docs:** doc select all content and remove when has tables ([#3800](https://github.com/dream-num/univer/issues/3800)) ([2ad811d](https://github.com/dream-num/univer/commit/2ad811d324d94c48c6ccc31ae6c66505abf9a6ef))
* **docs:** header footer render after switch from modern mode to traditional model ([#3995](https://github.com/dream-num/univer/issues/3995)) ([fd07903](https://github.com/dream-num/univer/commit/fd079031bb3ac99530609baaa4290afd2dd2db8d))
* **docs:** modify link ([#3946](https://github.com/dream-num/univer/issues/3946)) ([fc9439e](https://github.com/dream-num/univer/commit/fc9439e76350aafc5a0732fab9927d59b11498f4))
* **docs:** reserve empty textRuns when transform ([#3949](https://github.com/dream-num/univer/issues/3949)) ([39d0d46](https://github.com/dream-num/univer/commit/39d0d46b2cc4f1e1b3044e51f2a59ba2f7138194))
* **docs:** table context menu disable status ([#3921](https://github.com/dream-num/univer/issues/3921)) ([05339d2](https://github.com/dream-num/univer/commit/05339d206cebe8fe1a5696d91d7d6fa17f66a86e))
* **doc:** the paragraph panel is not updated in real time ([#3952](https://github.com/dream-num/univer/issues/3952)) ([2bea457](https://github.com/dream-num/univer/commit/2bea4578263a98bc6b27abe1a75207f9fa244579))
* **editor:** formula ref selection moving not work ([#3920](https://github.com/dream-num/univer/issues/3920)) ([9efc7eb](https://github.com/dream-num/univer/commit/9efc7eb29c71750603179289a40039eb2c576028))
* **editor:** the cursor position is not correct after pasting ([#3960](https://github.com/dream-num/univer/issues/3960)) ([71c7cf4](https://github.com/dream-num/univer/commit/71c7cf410cda2bdc7a331a25dfd7243102e93d19))
* **editor:** the rendering is not consistent with the result ([#3966](https://github.com/dream-num/univer/issues/3966)) ([125cfa9](https://github.com/dream-num/univer/commit/125cfa950b1befab64ee6033bb7c8272227ae2aa))
* empty strings should be treated as having no value when merge ([#3963](https://github.com/dream-num/univer/issues/3963)) ([238eef1](https://github.com/dream-num/univer/commit/238eef1f5b8b660d97cd5c43acc7302ee0604a53))
* filter rollback in another worksheet ([#3896](https://github.com/dream-num/univer/issues/3896)) ([e16aa90](https://github.com/dream-num/univer/commit/e16aa902c0c0bbbc441bd3fde0bfc4bdb7d58ce5))
* find the first possible cursor position ([#3913](https://github.com/dream-num/univer/issues/3913)) ([5db9233](https://github.com/dream-num/univer/commit/5db92337a9543ec356c35634845b45f8d1a30c73))
* fix auto size when no content in first col ([#3903](https://github.com/dream-num/univer/issues/3903)) ([e801701](https://github.com/dream-num/univer/commit/e80170170dddff6450196c5af92c2e39b6263a35))
* **formula-bar:** an additional selection is inserted when you click … ([#3964](https://github.com/dream-num/univer/issues/3964)) ([8cda704](https://github.com/dream-num/univer/commit/8cda70485f61c2425c580d38b7bf38cd18ffb098))
* **formula:** base type for formula dependency ([#4008](https://github.com/dream-num/univer/issues/4008)) ([0bd9c14](https://github.com/dream-num/univer/commit/0bd9c14a1f4652a7a074ef6dc05e0941323a5a80))
* **formula:** calculate after renderer ([#4024](https://github.com/dream-num/univer/issues/4024)) ([0afcc5d](https://github.com/dream-num/univer/commit/0afcc5de5fa6f1dadb71cce80631c95f801c8126))
* **formula:** fix inverted-index-cache bug ([#4020](https://github.com/dream-num/univer/issues/4020)) ([e194b97](https://github.com/dream-num/univer/commit/e194b97c1838f212e7613b1f0237989646d23776))
* hide align menus in zen mode ([#3904](https://github.com/dream-num/univer/issues/3904)) ([56eeb04](https://github.com/dream-num/univer/commit/56eeb044f945f5de380dbc51d6d49a17b9af3f35))
* hide table and header footer menu in ZEN mode ([#3961](https://github.com/dream-num/univer/issues/3961)) ([e588fab](https://github.com/dream-num/univer/commit/e588fabfe06aedf38f89dfb581f4fd75e24ac9c2))
* links pasted into cells require paragraph attributes ([#3980](https://github.com/dream-num/univer/issues/3980)) ([69a65e8](https://github.com/dream-num/univer/commit/69a65e88b4446910c53b5d4438dbf8e26fd2a2d1))
* parsing of number formats should be done in plugins ([#3959](https://github.com/dream-num/univer/issues/3959)) ([fe60a29](https://github.com/dream-num/univer/commit/fe60a2901ec0cd0c93173175ef432dd5835a8de4))
* **range-selector:** illusion of movement ([#4011](https://github.com/dream-num/univer/issues/4011)) ([02b335c](https://github.com/dream-num/univer/commit/02b335c939c3ae3955c2fdc3473b24edfb30caa6))
* **render-engine:** paragraph horizontal align ([#4010](https://github.com/dream-num/univer/issues/4010)) ([045eef3](https://github.com/dream-num/univer/commit/045eef36fd0e16132dec69d969db0a08b73f0dc3))
* searcharray ([#3883](https://github.com/dream-num/univer/issues/3883)) ([602f44a](https://github.com/dream-num/univer/commit/602f44abf1cba58c7ea230c5915cb1c448ab40dd))
* **sheet:** fix default style cmd not register ([#4014](https://github.com/dream-num/univer/issues/4014)) ([432091b](https://github.com/dream-num/univer/commit/432091b62d2fcd5e98228f982f158bf00d216b1b))
* **sheets-data-validation-ui:** data validation style ([#4000](https://github.com/dream-num/univer/issues/4000)) ([d793188](https://github.com/dream-num/univer/commit/d79318851c8a384c870e572572f16659bc3ee92b))
* **sheets-hyper-link-ui:** show popup on rotate cell ([#3943](https://github.com/dream-num/univer/issues/3943)) ([ce16b41](https://github.com/dream-num/univer/commit/ce16b4103efdc86225d38a282da8cc9af17d5ea9))
* some case rich text style should convert to cell style ([#3975](https://github.com/dream-num/univer/issues/3975)) ([47cae07](https://github.com/dream-num/univer/commit/47cae07809d9085cb179d1d7e96341445d274752))
* **uni:** fix formula editor ([#3912](https://github.com/dream-num/univer/issues/3912)) ([71eca33](https://github.com/dream-num/univer/commit/71eca338e5703b88282097e44110ba1ae5127013))


### Features

* add async interceptor ([#3894](https://github.com/dream-num/univer/issues/3894)) ([f007660](https://github.com/dream-num/univer/commit/f007660944ffe6c08d89a5f2355444c88d277057))
* add focusing-editor context value for chart panel ([#3996](https://github.com/dream-num/univer/issues/3996)) ([80167a1](https://github.com/dream-num/univer/commit/80167a1f7a1c313711db29061b976bf54f70ec6f))
* add zero width paragraph break implementation ([#3958](https://github.com/dream-num/univer/issues/3958)) ([6142b07](https://github.com/dream-num/univer/commit/6142b07115266b354fc09b28b70fee218c8d8e78))
* add zeroWidthParagraphBreak config ([#3954](https://github.com/dream-num/univer/issues/3954)) ([aafe8ab](https://github.com/dream-num/univer/commit/aafe8ab80b5520fad06d9c2e47cf6986b08c8139))
* **drawing:** add optional param to contrl popup ([#3935](https://github.com/dream-num/univer/issues/3935)) ([95bee3e](https://github.com/dream-num/univer/commit/95bee3e6c89c7b4cf563ccca2826211a8360308e))
* filter date group ([#3881](https://github.com/dream-num/univer/issues/3881)) ([35f4567](https://github.com/dream-num/univer/commit/35f45678868b16e73985775546dafe922e126fe8))
* **formua-editor:** support cross sheet references ([#3933](https://github.com/dream-num/univer/issues/3933)) ([068f512](https://github.com/dream-num/univer/commit/068f5123c84f7d2dca609eb5c76838502924e84e))
* **formula:** add some statistical formulas ([#3684](https://github.com/dream-num/univer/issues/3684)) ([51f1616](https://github.com/dream-num/univer/commit/51f16168141d6c2fc0c585144238cf7e9577eee1))
* **formula:** supplement FORMULATEXT formula ([#3968](https://github.com/dream-num/univer/issues/3968)) ([fc0b1fa](https://github.com/dream-num/univer/commit/fc0b1fa1e318480f873ae9e037977d4aa9a64f14))
* **formula:** supplement text formulas ([#3842](https://github.com/dream-num/univer/issues/3842)) ([114f6dc](https://github.com/dream-num/univer/commit/114f6dc102d402e2fb00da161b61063201317205))
* sheet drawing commands support intercepting mutations ([#3885](https://github.com/dream-num/univer/issues/3885)) ([7f1cf91](https://github.com/dream-num/univer/commit/7f1cf918cf3591237e8cb00269e0db4550c70c23))


### Performance Improvements

* **formula:** dependency optimization ([#3969](https://github.com/dream-num/univer/issues/3969)) ([196d0d8](https://github.com/dream-num/univer/commit/196d0d8e9b27c4d03c48f57c749db616e0962a02))

## [0.4.2](https://github.com/dream-num/univer/compare/v0.4.1...v0.4.2) (2024-10-29)


### Bug Fixes

* add comments for set frozen cmd params ([#3743](https://github.com/dream-num/univer/issues/3743)) ([ebcf3e0](https://github.com/dream-num/univer/commit/ebcf3e07bd5fe43a176f13071f28a419fa495708))
* **cell:** fix cell string type ([#3872](https://github.com/dream-num/univer/issues/3872)) ([bc65876](https://github.com/dream-num/univer/commit/bc658763044785ccbdf3dfb1240a5c68cb42647b))
* **demo:** types ([#3794](https://github.com/dream-num/univer/issues/3794)) ([0d313f2](https://github.com/dream-num/univer/commit/0d313f2b5f72e11061bffc95bb34bbf2b45fca07))
* **docs-link:** error display url link when add link ([#3822](https://github.com/dream-num/univer/issues/3822)) ([f6cd524](https://github.com/dream-num/univer/commit/f6cd524f66a8bd2c3938a2c7ee14c6b3248f8bcb))
* **docs-thread-comment-ui:** doc comment ot ([#3832](https://github.com/dream-num/univer/issues/3832)) ([1fd499a](https://github.com/dream-num/univer/commit/1fd499a370acb84efc03409227ff1a9efc56b173))
* **docs:** close header and footer when switch doc mode ([#3869](https://github.com/dream-num/univer/issues/3869)) ([888c15c](https://github.com/dream-num/univer/commit/888c15cf97344eefcf96a192c5ed5ade4fe41ce5))
* **docs:** line break in collaboration ([#3863](https://github.com/dream-num/univer/issues/3863)) ([e95449e](https://github.com/dream-num/univer/commit/e95449edcebe0cc9169497ae440b84e30c1066ff))
* **docs:** merge two paragraphs ([#3871](https://github.com/dream-num/univer/issues/3871)) ([cf12b98](https://github.com/dream-num/univer/commit/cf12b986608075b2a4fee78c97b0c3203f0bdb32))
* **docs:** the apply result should be consistent ([#3806](https://github.com/dream-num/univer/issues/3806)) ([d0054f3](https://github.com/dream-num/univer/commit/d0054f3e690d9d3cf9715b59a97a8cb95f65a6c8))
* **docs:** transform in bullet list ([#3830](https://github.com/dream-num/univer/issues/3830)) ([7451d2d](https://github.com/dream-num/univer/commit/7451d2d491ad3b10cbfd042412b357d57f7fa921))
* **docs:** undefined error when call permission query ([#3841](https://github.com/dream-num/univer/issues/3841)) ([d642327](https://github.com/dream-num/univer/commit/d642327d5585a72dd25fad930a107a87b391a0cb))
* **doc:** transform with REPLACE type ([#3827](https://github.com/dream-num/univer/issues/3827)) ([42e26e1](https://github.com/dream-num/univer/commit/42e26e10d738d8c1339c65ff745035c0895eb193))
* **drawing:** fix inner dom position ([#3864](https://github.com/dream-num/univer/issues/3864)) ([c37f24c](https://github.com/dream-num/univer/commit/c37f24c91ba82ae58773a1b34aa53030c494d95e))
* **drawing:** fix remove drawing elements the control when not remove… ([#3873](https://github.com/dream-num/univer/issues/3873)) ([448d32c](https://github.com/dream-num/univer/commit/448d32ca2a1774fe19464cbb0fd87b714050ab22))
* fix type-check ([#3796](https://github.com/dream-num/univer/issues/3796)) ([cc822fa](https://github.com/dream-num/univer/commit/cc822fa7b9e8462e276c09a64ba401aa9f1d6d1d))
* **formula:** dependency for vlookup ([#3817](https://github.com/dream-num/univer/issues/3817)) ([3a77cb2](https://github.com/dream-num/univer/commit/3a77cb2aace5e03b5835441c79d5329b706550ba))
* **formula:** fix CELL_INVERTED_INDEX_CACHE range set ([#3807](https://github.com/dream-num/univer/issues/3807)) ([1092fcb](https://github.com/dream-num/univer/commit/1092fcb0ccedb9ecee48ee4de4744749d7ee9b43))
* **formula:** fix lookup related bugs ([#3847](https://github.com/dream-num/univer/issues/3847)) ([ff9cf49](https://github.com/dream-num/univer/commit/ff9cf49e465d7be001a44d9f98e17b6d2e73a24d))
* **formula:** fix progress bar not loaded ([#3790](https://github.com/dream-num/univer/issues/3790)) ([065dadc](https://github.com/dream-num/univer/commit/065dadc400e22bc819694d23fd9f7685ebdcef74))
* **formula:** fix sumif formula range and sumRange different dimensions ([#3853](https://github.com/dream-num/univer/issues/3853)) ([faf7936](https://github.com/dream-num/univer/commit/faf7936059f58eca1bc3fd26d01292aa2749aa28))
* getScale is not correct after ctx.rotate ([#3792](https://github.com/dream-num/univer/issues/3792)) ([b0c5f13](https://github.com/dream-num/univer/commit/b0c5f133e075e8ad58bd15ec83727fc856470694))
* **sheets-data-validation:** can't copy checkbox with right checked status ([#3818](https://github.com/dream-num/univer/issues/3818)) ([6da0f1e](https://github.com/dream-num/univer/commit/6da0f1efd1e4eda0792eb6f267b200920a5afc96))
* **sheets-drawing-ui:** float dom scroll not update on drag range ([#3840](https://github.com/dream-num/univer/issues/3840)) ([575a604](https://github.com/dream-num/univer/commit/575a6043f2a7ac61179af0ff3a464ff0ef3eba0c))
* **sheets-hyper-link-ui:** sheet link menu display wrong in cell editing ([#3825](https://github.com/dream-num/univer/issues/3825)) ([dbcdcba](https://github.com/dream-num/univer/commit/dbcdcba9a42c32689e84574dfd766e8959090077))
* **sheets-hyper-link:** link ref range behavior error ([#3862](https://github.com/dream-num/univer/issues/3862)) ([3126112](https://github.com/dream-num/univer/commit/312611262b30a848d7a6a7fa929f7ba113d94a06))
* **sheets-ui:** can't quit editor after enter '=' ([#3861](https://github.com/dream-num/univer/issues/3861)) ([5343f2c](https://github.com/dream-num/univer/commit/5343f2c41e1dedfb6938ce78e00e18219136fc71))
* **sheets-ui:** lag when editing ([#3837](https://github.com/dream-num/univer/issues/3837)) ([251186e](https://github.com/dream-num/univer/commit/251186ec0a1e58d73f12098ea56d07dd7eb80298))
* **sheets-ui:** should disable sheet menus on cell editing ([#3809](https://github.com/dream-num/univer/issues/3809)) ([e758013](https://github.com/dream-num/univer/commit/e75801346f1c101dffb2a9f25ef0c518b2cd8fab))
* **thread-comment:** comment datasource ([#3787](https://github.com/dream-num/univer/issues/3787)) ([8978364](https://github.com/dream-num/univer/commit/8978364fbffcdd5153e148f1fd57e80cf30f29e3))
* **thread-comment:** thread-comment build types ([#3802](https://github.com/dream-num/univer/issues/3802)) ([417fdee](https://github.com/dream-num/univer/commit/417fdee72933b31f58ad0c96a9118d2477b26d72))
* trigger selectionMoveEnd$ when using keyboard to change selections. ([#3731](https://github.com/dream-num/univer/issues/3731)) ([7b67be2](https://github.com/dream-num/univer/commit/7b67be215cd391928f6a63800ed3b5ac980a7fc6))
* **ui:** improve layout and overflow handling in sheet bar menu ([#3823](https://github.com/dream-num/univer/issues/3823)) ([acb4a45](https://github.com/dream-num/univer/commit/acb4a45456d20ea95db3627e3281f684876e7440))
* unitId for canvas ([#3804](https://github.com/dream-num/univer/issues/3804)) ([7107be6](https://github.com/dream-num/univer/commit/7107be695a4ffd1881c27244cffca002cfe251ee))


### Features

* add network plugin ([#3782](https://github.com/dream-num/univer/issues/3782)) ([3e3e795](https://github.com/dream-num/univer/commit/3e3e7958f925d836fb0fb588f4e50c6ee37cc0ad))
* auto col ([#3798](https://github.com/dream-num/univer/issues/3798)) ([c66cff0](https://github.com/dream-num/univer/commit/c66cff0e815d57a290eea4466f610378252e2f8a))
* **design:** component style optimize ([#3860](https://github.com/dream-num/univer/issues/3860)) ([1ab5eff](https://github.com/dream-num/univer/commit/1ab5effd9cd9d6c1e74824954c92807ce818e655))
* **doc:** add more apply test case ([#3865](https://github.com/dream-num/univer/issues/3865)) ([e7b2f78](https://github.com/dream-num/univer/commit/e7b2f7857739bfcdd0f31ab4d89a1920369fa8f9))
* **doc:** handle custom range transform ([#3836](https://github.com/dream-num/univer/issues/3836)) ([89d6441](https://github.com/dream-num/univer/commit/89d644165e732ccb8f7d659f308fd20d21172229))
* **docs:** set inline style at cursor ([#3846](https://github.com/dream-num/univer/issues/3846)) ([caed6de](https://github.com/dream-num/univer/commit/caed6de4b430a32be8234492e8900d63f3020265))
* **docs:** support modern mode ([#3706](https://github.com/dream-num/univer/issues/3706)) ([bea0e78](https://github.com/dream-num/univer/commit/bea0e7805d43424a3f5f69790a25b77248b5230c))
* **floatdom:** add some hookes ([#3854](https://github.com/dream-num/univer/issues/3854)) ([3747cd4](https://github.com/dream-num/univer/commit/3747cd44a01093e8f976750e372ee07b6fc3a671))
* **formula:** add some text formulas ([#3546](https://github.com/dream-num/univer/issues/3546)) ([4094288](https://github.com/dream-num/univer/commit/4094288c6e6f734b6b62f852959431e3f3aba967))
* **formula:** supplement sheet and sheets formula ([#3859](https://github.com/dream-num/univer/issues/3859)) ([5fcd97a](https://github.com/dream-num/univer/commit/5fcd97aadf28720d80f0ef33a08d4c370177992e))
* **formula:** support database-related formulas ([#3749](https://github.com/dream-num/univer/issues/3749)) ([3b8af5a](https://github.com/dream-num/univer/commit/3b8af5a75fb6cd932f6e06fdee3951fa69829189))
* func addFloatDomToPosition may not execute command ([#3855](https://github.com/dream-num/univer/issues/3855)) ([e99aec1](https://github.com/dream-num/univer/commit/e99aec17661b7b1fb17b01d9d568fdaf207a64c7))
* **network:** network plugin support overrides ([#3870](https://github.com/dream-num/univer/issues/3870)) ([cbabe12](https://github.com/dream-num/univer/commit/cbabe12a1a446bb95c1b91b4f8cd7591d582a9ad))
* **permission:** change permission point logic ([#3826](https://github.com/dream-num/univer/issues/3826)) ([7e49171](https://github.com/dream-num/univer/commit/7e491718cd7a2918f64b49ee696b031c243373ec))
* **sheet:** add custom for row and column ([#3693](https://github.com/dream-num/univer/issues/3693)) ([4e31b24](https://github.com/dream-num/univer/commit/4e31b24e697761b1f8bf3f322f8e211ff9bfb4da))
* **sheets-data-validation:** add data validation any-validator and allowBlank options ([#3845](https://github.com/dream-num/univer/issues/3845)) ([b415476](https://github.com/dream-num/univer/commit/b415476e9d30c2a3af92ec5eda4d071e20075d52))
* **sheets:** toggle gridlines ([#3805](https://github.com/dream-num/univer/issues/3805)) ([c3a7ddf](https://github.com/dream-num/univer/commit/c3a7ddfeaa01d419d27c71be63ea66b9135e6004))
* **sheet:** styles on rows and columns ([#3816](https://github.com/dream-num/univer/issues/3816)) ([8a27b31](https://github.com/dream-num/univer/commit/8a27b3119d4f977d5967dd799a4cd61a4d18df0c))
* **thread-comment:** didn't show tips on merge-cell comment ([#3819](https://github.com/dream-num/univer/issues/3819)) ([65cb1c5](https://github.com/dream-num/univer/commit/65cb1c5a8b36051b5aab3538ca78fb16921e4e40))
* **thread-comment:** sync comment after rendered ([#3810](https://github.com/dream-num/univer/issues/3810)) ([0fec7a9](https://github.com/dream-num/univer/commit/0fec7a9fa4f8952e9f133d7c905ac2481556c639))
* watermark ([#3751](https://github.com/dream-num/univer/issues/3751)) ([9630e31](https://github.com/dream-num/univer/commit/9630e31248636b0e0f3b2fdc1eca0b53dc2fabce))


### Performance Improvements

* **sheets-drawing-ui:** float dom scroll performance optimize ([#3838](https://github.com/dream-num/univer/issues/3838)) ([b4b8810](https://github.com/dream-num/univer/commit/b4b8810afdbe2583f8b8e67a130895bdf6eb37f5))

## [0.4.1](https://github.com/dream-num/univer/compare/v0.4.0...v0.4.1) (2024-10-18)


### Bug Fixes

* **sheets-ui:** can't edit after dispose ([#3788](https://github.com/dream-num/univer/issues/3788)) ([77b39cd](https://github.com/dream-num/univer/commit/77b39cda6286a30fc639ea59ef9c6f4352882d85))


### Performance Improvements

* **formula:** calculation speed up ([#3738](https://github.com/dream-num/univer/issues/3738)) ([cea4571](https://github.com/dream-num/univer/commit/cea4571fc0bae64cb0f826ec81cc22761c4af222))

# [0.4.0](https://github.com/dream-num/univer/compare/v0.4.0-alpha.2...v0.4.0) (2024-10-17)


### Bug Fixes

* **docs-ui:** don't refresh-selection after set list ([#3780](https://github.com/dream-num/univer/issues/3780)) ([924dee7](https://github.com/dream-num/univer/commit/924dee7c98ed372f9638ea5ff3aa9427b26c11f6))
* **docs-ui:** formula-editor should not render paragraph style ([#3783](https://github.com/dream-num/univer/issues/3783)) ([b7301af](https://github.com/dream-num/univer/commit/b7301afd70f5542943c58f207beb03fe043bbd72))
* **docs:** header footer setting not focus ([#3698](https://github.com/dream-num/univer/issues/3698)) ([2db351b](https://github.com/dream-num/univer/commit/2db351b7fae5f723c963460419e602c386e67806))
* **docs:** no need to cache font style when has no text run ([#3779](https://github.com/dream-num/univer/issues/3779)) ([8a48479](https://github.com/dream-num/univer/commit/8a48479355231d7ad96809bb3d1f342961773f32))
* **engine-render:** check box render ([#3776](https://github.com/dream-num/univer/issues/3776)) ([83e0897](https://github.com/dream-num/univer/commit/83e08975e008e7dc937d0ad96c94deec4f693f23))
* fix permission rangeSelector & insert menu ([#3757](https://github.com/dream-num/univer/issues/3757)) ([1f43484](https://github.com/dream-num/univer/commit/1f43484f4d9294e9fe8eae17f6266b142274e59b))
* font render bounds ([#3754](https://github.com/dream-num/univer/issues/3754)) ([4ecd764](https://github.com/dream-num/univer/commit/4ecd764ee0ef11e4894abb59fbd2d328dd10e2b7))
* **formula:** fix some bug ([#3774](https://github.com/dream-num/univer/issues/3774)) ([4c4efe4](https://github.com/dream-num/univer/commit/4c4efe4a8b66f007e90c16135781e8b7d73c4958))
* **sheets-ui:** can't save first edit cell ([#3781](https://github.com/dream-num/univer/issues/3781)) ([d29da2f](https://github.com/dream-num/univer/commit/d29da2f2762ca66bcbf3c9c97ca6e5351ba457e6))


### Features

* **facade:** add `setOptions` on f-data-validation-builder ([#3773](https://github.com/dream-num/univer/issues/3773)) ([4008c86](https://github.com/dream-num/univer/commit/4008c8605ba1083432835e103a1ec761fed0ff3b))

# [0.4.0-alpha.2](https://github.com/dream-num/univer/compare/v0.4.0-alpha.1...v0.4.0-alpha.2) (2024-10-16)


### Bug Fixes

* cell style in collaboration ([#3748](https://github.com/dream-num/univer/issues/3748)) ([e138b95](https://github.com/dream-num/univer/commit/e138b95ac6c83277963e14cf039f185f35bb9e7c))
* **condition-formatting:** date calculation error ([#3733](https://github.com/dream-num/univer/issues/3733)) ([30da399](https://github.com/dream-num/univer/commit/30da399b0bda565b3e3b6f1d4c2e08e12f969694))
* **conditional-formatting:** reduce icon map size ([#3769](https://github.com/dream-num/univer/issues/3769)) ([0f19fc0](https://github.com/dream-num/univer/commit/0f19fc0972c81767fd3a63deb148d6f93b801fc2))
* **docs-ui:** doc list render error after operation like break-line ([#3766](https://github.com/dream-num/univer/issues/3766)) ([8c95a53](https://github.com/dream-num/univer/commit/8c95a5329db3b4d4a2913fc9d87594a909d1bde2))
* flickering when init page ([#3762](https://github.com/dream-num/univer/issues/3762)) ([fe3ff31](https://github.com/dream-num/univer/commit/fe3ff311b73ba07ced2943b6c4a8cb8c9bf94f7a))
* **formula:** fix ArrayValueObject compare cache bug ([#3764](https://github.com/dream-num/univer/issues/3764)) ([424bb02](https://github.com/dream-num/univer/commit/424bb026adb37d9d98594c1b282e6009420b9ede))
* **formula:** fix datedif bug ([#3747](https://github.com/dream-num/univer/issues/3747)) ([f9f4973](https://github.com/dream-num/univer/commit/f9f497302d12b4de0683b974b52df973f476b2b9))
* refresh selection when collapsed ([#3761](https://github.com/dream-num/univer/issues/3761)) ([a92a389](https://github.com/dream-num/univer/commit/a92a389a7108aec2b3dc54c626aab2ff5009e458))
* **sheet:** fix can not delete when there are exclusive range ([#3729](https://github.com/dream-num/univer/issues/3729)) ([d6db560](https://github.com/dream-num/univer/commit/d6db560610f958bf682909433d2a2874914c8eb9))
* **sheets-data-validation:** data validation validator status render error ([#3752](https://github.com/dream-num/univer/issues/3752)) ([555e9d5](https://github.com/dream-num/univer/commit/555e9d5a7cd17e25bf4758570e8f1e993e90e52c))
* snapshot area ([#3715](https://github.com/dream-num/univer/issues/3715)) ([5957a04](https://github.com/dream-num/univer/commit/5957a04f2da88eafe68e8dc7b558f33a881ffe5a))
* **ui:** fix missing context menu items ([#3758](https://github.com/dream-num/univer/issues/3758)) ([421d009](https://github.com/dream-num/univer/commit/421d0097fdb14293ab1e82d0da2eb668bfdbc946))
* **ui:** ribbon others tab flickering resolved ([#3745](https://github.com/dream-num/univer/issues/3745)) ([bc8bfb6](https://github.com/dream-num/univer/commit/bc8bfb6339a4a713c52d181e676fc7af83d93697))


### Features

* **drawing:** add optional property to control rotate handle of drawing element ([#3750](https://github.com/dream-num/univer/issues/3750)) ([71ffde4](https://github.com/dream-num/univer/commit/71ffde4bdf3b81f40836fe4d8e554500eb4c2ba0))
* **facade:** change data-validation facade api into sync ([#3736](https://github.com/dream-num/univer/issues/3736)) ([cbae4c9](https://github.com/dream-num/univer/commit/cbae4c9582be8e6f45030f9d149823cda0a729f1))
* record & replay commands with multi-mode ([#3734](https://github.com/dream-num/univer/issues/3734)) ([047c9f2](https://github.com/dream-num/univer/commit/047c9f2dfc8742d2b3ef1aa1231841761f3a7d16))

# [0.4.0-alpha.1](https://github.com/dream-num/univer/compare/v0.4.0-alpha.0...v0.4.0-alpha.1) (2024-10-12)


### Bug Fixes

* **docs:** can not paste content when have both text range and rect range ([#3720](https://github.com/dream-num/univer/issues/3720)) ([3cfcf7e](https://github.com/dream-num/univer/commit/3cfcf7ec5e21583294e5c5ab9289f4761065f476))
* **docs:** insert image after table ([#3719](https://github.com/dream-num/univer/issues/3719)) ([942dc4e](https://github.com/dream-num/univer/commit/942dc4e466faa6668c3821db83f1df26966e6766))
* **docs:** selection offset is wrong when refresh ([#3724](https://github.com/dream-num/univer/issues/3724)) ([0babbab](https://github.com/dream-num/univer/commit/0babbabccd04ae65d1a6e23e21634b2ff2bb27da))
* **formula:** fix some formula bugs ([#3722](https://github.com/dream-num/univer/issues/3722)) ([559825a](https://github.com/dream-num/univer/commit/559825aa850fb7544d7aeb50def690efa090bdb1))
* **sheets-ui:** set focus editing mode when dbclick & error resize when change sub sheet ([#3725](https://github.com/dream-num/univer/issues/3725)) ([84ac33f](https://github.com/dream-num/univer/commit/84ac33f9a58ed2d1173b06fc811b54ead76653ca))

# [0.4.0-alpha.0](https://github.com/dream-num/univer/compare/v0.3.0...v0.4.0-alpha.0) (2024-10-12)


### Bug Fixes

* add remove sheet intercept ([#3622](https://github.com/dream-num/univer/issues/3622)) ([1f7fedb](https://github.com/dream-num/univer/commit/1f7fedbe2716de384a2aa1552571f3e58b068b2c))
* after modifying the value, the filter hidden state needs to be r… ([#3601](https://github.com/dream-num/univer/issues/3601)) ([dc963b0](https://github.com/dream-num/univer/commit/dc963b0a894e5698c314f6c69258974d4347119a))
* array formula border deps ([#3654](https://github.com/dream-num/univer/issues/3654)) ([8d9b1aa](https://github.com/dream-num/univer/commit/8d9b1aa31490604e1b3fec5b3a33e959a94694e9))
* **conditional-formatting:** ranking error ([#3589](https://github.com/dream-num/univer/issues/3589)) ([f0252ca](https://github.com/dream-num/univer/commit/f0252ca6e914484504fd5d43f6948e605a65b7df))
* **core:** fix plugin holder of univer type not set ([#3702](https://github.com/dream-num/univer/issues/3702)) ([851b1ce](https://github.com/dream-num/univer/commit/851b1ce5f4cdf0b8e60f0c4970e649fb19904307))
* dispose and createUnit cause viewport height collapse ([#3598](https://github.com/dream-num/univer/issues/3598)) ([36b676f](https://github.com/dream-num/univer/commit/36b676f44f40b445b181e7e8fee1f552525f09c2))
* **docs:** arrow in table when table across two pages ([#3692](https://github.com/dream-num/univer/issues/3692)) ([9e98122](https://github.com/dream-num/univer/commit/9e98122aa13ba4f89d284ec7841e9d32dd3532be))
* **docs:** copy table in univer ([#3625](https://github.com/dream-num/univer/issues/3625)) ([8fb395f](https://github.com/dream-num/univer/commit/8fb395fed7d5e82d76cf84772732566b0116076e))
* **docs:** editing drawing is not working ([#3718](https://github.com/dream-num/univer/issues/3718)) ([b253b32](https://github.com/dream-num/univer/commit/b253b322264fe113a514307408e3672a1a1bccd7))
* **docs:** no need to add cursor when select multi text ranges ([#3691](https://github.com/dream-num/univer/issues/3691)) ([f2aab59](https://github.com/dream-num/univer/commit/f2aab59388449764af5a58b4f6f73cce46279064))
* **docs:** optimization of text selection ([#3660](https://github.com/dream-num/univer/issues/3660)) ([a2f2215](https://github.com/dream-num/univer/commit/a2f22158ff858a3bbd274748ba3b9308285123ce))
* **docs:** wrong header footer icon ([#3689](https://github.com/dream-num/univer/issues/3689)) ([0cfeece](https://github.com/dream-num/univer/commit/0cfeecee96033d9619f84fe4fba59742d46c6f7f))
* fix error display not shown ([433da50](https://github.com/dream-num/univer/commit/433da50c7465141bcc48b46f42b57227912758f8))
* fix permission init should build cache ([#3651](https://github.com/dream-num/univer/issues/3651)) ([6dac0d0](https://github.com/dream-num/univer/commit/6dac0d03e05c9e9cfb06b14bbea890935bdf3a2c))
* formula show editor selection when using filter ([#3621](https://github.com/dream-num/univer/issues/3621)) ([1149cff](https://github.com/dream-num/univer/commit/1149cff68ea5ac747767ab441ee5901d9472a99b))
* **formula:** add r_tree for dependency and fix bug ([#3647](https://github.com/dream-num/univer/issues/3647)) ([f5140c0](https://github.com/dream-num/univer/commit/f5140c0f30d5542340debe835d350940eaf5a0de))
* **formula:** array formula spill error ([#3673](https://github.com/dream-num/univer/issues/3673)) ([e8ffd23](https://github.com/dream-num/univer/commit/e8ffd23bdad2511253eb56b0e1f688dc6995dbcb))
* merged cell bg not fully ender ([#3671](https://github.com/dream-num/univer/issues/3671)) ([5bbbec3](https://github.com/dream-num/univer/commit/5bbbec339a4a1ccdac3ad0dc2b4c2a2dc0bebcfd))
* **sheets-hyper-link:** hyper-link operator issues ([#3628](https://github.com/dream-num/univer/issues/3628)) ([e27bf5e](https://github.com/dream-num/univer/commit/e27bf5e6631a3af13eeb887631b7c9ed7a5971f6))
* **sheets-ui:** editor state not correctly reset when active ([#3668](https://github.com/dream-num/univer/issues/3668)) ([16a08bf](https://github.com/dream-num/univer/commit/16a08bf4cd4071789865e6f37610ce5b58fe0632))
* **sheets-ui:** error quit edit when set-range-values was called ([#3697](https://github.com/dream-num/univer/issues/3697)) ([0c29785](https://github.com/dream-num/univer/commit/0c29785334b44f9d65a7acc8faabf412eb5e40d8))
* **sheets-ui:** remove useless mark dirty on data-validation & thread-comment ([#3639](https://github.com/dream-num/univer/issues/3639)) ([6b48993](https://github.com/dream-num/univer/commit/6b489937cde472382d29e3cfdf1d5b1bc367f417))
* **sheets:** correct subUnitId usage in SetStyleCommand ([#3586](https://github.com/dream-num/univer/issues/3586)) ([b03711d](https://github.com/dream-num/univer/commit/b03711d294fb45c6a9e51b8643fdffeec975aa90))
* **ui:** resolve issue preventing custom context menus from displaying ([#3688](https://github.com/dream-num/univer/issues/3688)) ([b3a3cbc](https://github.com/dream-num/univer/commit/b3a3cbc259252eed7da519160029fb4b3be3408e))
* underline was hidden by background in next line ([#3638](https://github.com/dream-num/univer/issues/3638)) ([71229b3](https://github.com/dream-num/univer/commit/71229b38356b4aa40620a2dddbc4a696d2034df0))
* **zen:** fix zen editor cannot be opened ([#3699](https://github.com/dream-num/univer/issues/3699)) ([405a715](https://github.com/dream-num/univer/commit/405a7157dc8074c92460bf92eb4961f2b5cb1d51))


### Features

* add replay-only mode to actionRecordPlugin ([#3695](https://github.com/dream-num/univer/issues/3695)) ([a3cb5c4](https://github.com/dream-num/univer/commit/a3cb5c47aee14cba4664000bd12426c0282a86fd))
* **facade:** add lifecycle and cellChange event api ([#3626](https://github.com/dream-num/univer/issues/3626)) ([5fad25f](https://github.com/dream-num/univer/commit/5fad25f6f390ab47c944280f5e69d3723d90f980))
* **formula:** regexextract/regexmatch/regexreplace ([#3282](https://github.com/dream-num/univer/issues/3282)) ([7ce334f](https://github.com/dream-num/univer/commit/7ce334f0b8dda1faaae55fdcb82eaee8a11ca500))
* **sheets-ui:** add `formulaBar` option ([#3632](https://github.com/dream-num/univer/issues/3632)) ([d0a9f24](https://github.com/dream-num/univer/commit/d0a9f2423478aa9df7220d1e810a4acc9c887e19))
* support for rtl and farsi i18n ([#3558](https://github.com/dream-num/univer/issues/3558)) ([b13168d](https://github.com/dream-num/univer/commit/b13168d5b4ab85b9ef471cb4051d9172672f0856))


### Performance Improvements

* **permission:** add row and column cache to optimize performance ([#3634](https://github.com/dream-num/univer/issues/3634)) ([27eb2a3](https://github.com/dream-num/univer/commit/27eb2a36f5e07d3fe3161e2856824cc907df5e5c))
* render in viewrange not all model  ([#3637](https://github.com/dream-num/univer/issues/3637)) ([7b1462b](https://github.com/dream-num/univer/commit/7b1462bacc67c67cc2dafe79cc8356c348bb07ff))

# [0.3.0](https://github.com/dream-num/univer/compare/v0.3.0-alpha.1...v0.3.0) (2024-09-29)


### Features

* **sheet:** add flag to get better performance ([#3631](https://github.com/dream-num/univer/issues/3631)) ([7f0d181](https://github.com/dream-num/univer/commit/7f0d181588ca03c8872693ec600e5e2bc5b809b9))

# [0.3.0-alpha.1](https://github.com/dream-num/univer/compare/v0.3.0-alpha.0...v0.3.0-alpha.1) (2024-09-29)


### Bug Fixes

* bg border return before  getCell ([#3623](https://github.com/dream-num/univer/issues/3623)) ([2e7b201](https://github.com/dream-num/univer/commit/2e7b201ab8a6183242619dfc908ba3a9326ef01c))
* **data-validation:** remove useless interceptor mutations ([#3630](https://github.com/dream-num/univer/issues/3630)) ([fd48e15](https://github.com/dream-num/univer/commit/fd48e15e22ebf32c4cc5384cfea0f1735ff7d0b4))

# [0.3.0-alpha.0](https://github.com/dream-num/univer/compare/v0.2.15...v0.3.0-alpha.0) (2024-09-28)


### Bug Fixes

* auto focus after select menu item ([#3507](https://github.com/dream-num/univer/issues/3507)) ([a02e78b](https://github.com/dream-num/univer/commit/a02e78bd1ff5835cc84bcd8b1054d8a191667d28))
* **auto-fill:** merge-cell bugs in auto-fill ([#3606](https://github.com/dream-num/univer/issues/3606)) ([bf21d58](https://github.com/dream-num/univer/commit/bf21d5876979a165208bf1b15d799236d2ccd892))
* border for merged cell ([#3506](https://github.com/dream-num/univer/issues/3506)) ([1c4c237](https://github.com/dream-num/univer/commit/1c4c237ced3ddf93cc8a20b8f3d4751f9984bf1c))
* cell margin bottom should over 1 ([#3595](https://github.com/dream-num/univer/issues/3595)) ([65ee6b2](https://github.com/dream-num/univer/commit/65ee6b2a188ccc64741ec4077933969b29269413))
* **conditional-formatting:** data bar render error ([#3535](https://github.com/dream-num/univer/issues/3535)) ([f11c87f](https://github.com/dream-num/univer/commit/f11c87fc8e36dc8dc29403c9da40cb31c0a58da1))
* copy sheet should copy filter ([#3592](https://github.com/dream-num/univer/issues/3592)) ([e3620ce](https://github.com/dream-num/univer/commit/e3620cef0f3e011b846a07b1d8043857bceb8a86))
* **design:** improve empty options styling and messaging for Select ([#3569](https://github.com/dream-num/univer/issues/3569)) ([3762706](https://github.com/dream-num/univer/commit/37627064d19a8ce14239d7935e0130eafd1bcd85))
* **docs-link-ui:** link text error ([#3620](https://github.com/dream-num/univer/issues/3620)) ([1e1522c](https://github.com/dream-num/univer/commit/1e1522c08a07b17defc3bfb47dbc50fd36ab429b))
* **docs-ui:** formula-editor can't scroll & edit link on cell editor ([#3530](https://github.com/dream-num/univer/issues/3530)) ([6c4b96c](https://github.com/dream-num/univer/commit/6c4b96cf54f2a02aa3b595ee023f70c7197b65ab))
* **docs-ui:** paste link on link ([#3518](https://github.com/dream-num/univer/issues/3518)) ([9fcd45b](https://github.com/dream-num/univer/commit/9fcd45b728dfb1926e3fa348940255f70e399c50))
* **docs:** doc selection refresh ([#3585](https://github.com/dream-num/univer/issues/3585)) ([3687fff](https://github.com/dream-num/univer/commit/3687fff9efe2ca88de81c3b95f531001b3c65fcc))
* **docs:** flickering issues when first visit into the page ([#3578](https://github.com/dream-num/univer/issues/3578)) ([b0afd99](https://github.com/dream-num/univer/commit/b0afd99f4a82881d2a317b815359717370b8dfe6))
* **docs:** support special emoticons ([#3512](https://github.com/dream-num/univer/issues/3512)) ([61ee1cd](https://github.com/dream-num/univer/commit/61ee1cdcef8cbfd3623eceea1706cedb690a3ebe))
* e2e scrolling & add missing interface for sheet skeleton ([#3584](https://github.com/dream-num/univer/issues/3584)) ([25609a0](https://github.com/dream-num/univer/commit/25609a0e4820938c1aca8bfc6b9264e9020151bf))
* fix dv custom cell permission ([#3559](https://github.com/dream-num/univer/issues/3559)) ([d1964fc](https://github.com/dream-num/univer/commit/d1964fc8c4738918e09e2b6f049226a476be28e7))
* fix horizontal merge wrong value ([#3545](https://github.com/dream-num/univer/issues/3545)) ([b1ea6c3](https://github.com/dream-num/univer/commit/b1ea6c3c98c94b69dc93ab74b78beae383539938))
* fix reduce function type error ([#3563](https://github.com/dream-num/univer/issues/3563)) ([2506c3a](https://github.com/dream-num/univer/commit/2506c3ab07f2377c1a1e94b5d0678f8c51134220))
* **formula:** fix bycol/byrow/map ([#3568](https://github.com/dream-num/univer/issues/3568)) ([5473a11](https://github.com/dream-num/univer/commit/5473a11cb3a97bcecbde564cd026ea16b36e7f4b))
* mark selection should remove after some commands execute ([#3467](https://github.com/dream-num/univer/issues/3467)) ([1e9cc47](https://github.com/dream-num/univer/commit/1e9cc47306edd3966d0c2a7ed2951c5088226932))
* perf improving in set style cache ([#3471](https://github.com/dream-num/univer/issues/3471)) ([03acbbb](https://github.com/dream-num/univer/commit/03acbbb347bdc3cafc4f39897f086881611132ae))
* permission check use compose points ([#3540](https://github.com/dream-num/univer/issues/3540)) ([7ef5059](https://github.com/dream-num/univer/commit/7ef50593c989138c39ba4764d7ed7518d27ad742))
* **protect:** fix protect performance ([#3520](https://github.com/dream-num/univer/issues/3520)) ([d8b9271](https://github.com/dream-num/univer/commit/d8b92711919b9c1b59cca18978c61b1bfd163829))
* scrollbar offset when moving by mouse ([#3556](https://github.com/dream-num/univer/issues/3556)) ([5ebbc02](https://github.com/dream-num/univer/commit/5ebbc0216b4adf2542143c81af1c0d74525da33a))
* **sheet:** fix span cache not right issue ([#3541](https://github.com/dream-num/univer/issues/3541)) ([543ade1](https://github.com/dream-num/univer/commit/543ade197563ba79b80078deb6cf465a559a92aa))
* **sheet:** fix summary performance ([#3517](https://github.com/dream-num/univer/issues/3517)) ([0ab07d9](https://github.com/dream-num/univer/commit/0ab07d946f04977c6cec0c32dcd4f58f17cf5a16))
* **sheets-data-validation:** data validation perf issue on getCell ([#3619](https://github.com/dream-num/univer/issues/3619)) ([4f3cd5c](https://github.com/dream-num/univer/commit/4f3cd5c50998816a587576c2e7ce9fe510fb9004))
* **sheets-data-validation:** ref-range ([#3533](https://github.com/dream-num/univer/issues/3533)) ([f7f8269](https://github.com/dream-num/univer/commit/f7f8269acb8153c72b04907cbceecc6fd450f166))
* **sheets-drawing-ui:** float-dom error on scale ([#3612](https://github.com/dream-num/univer/issues/3612)) ([5621216](https://github.com/dream-num/univer/commit/56212166b1f7e22ec555fabd070b869a2f16720b))
* **sheets-hyper-link-ui:** link & doc markSelection error on merged cell ([#3615](https://github.com/dream-num/univer/issues/3615)) ([21853cc](https://github.com/dream-num/univer/commit/21853cc2bf85af482b7550c523a145d98a21b7d1))
* **sheets-thread-comment:** comment export ([#3543](https://github.com/dream-num/univer/issues/3543)) ([33f4592](https://github.com/dream-num/univer/commit/33f4592a8bbc03261cf6bf0227ae28a1517cc0d1))
* **sheets-ui:** fix issue causing a blank screen when clicking on the border panel ([#3531](https://github.com/dream-num/univer/issues/3531)) ([99dd398](https://github.com/dream-num/univer/commit/99dd3986d28ce46ac7cad0162b12e6c239cf7014))
* **sheets-ui:** formula across subsheet ([#3583](https://github.com/dream-num/univer/issues/3583)) ([69d513e](https://github.com/dream-num/univer/commit/69d513eb3849f1de809a8c7160e1ed4954ce0519))
* **sheets:** disbale zoom ration on cell editing ([#3596](https://github.com/dream-num/univer/issues/3596)) ([051094e](https://github.com/dream-num/univer/commit/051094efe5bc5d9c7f3d0d97e4229e44d8921641))
* **sheets:** fix insert row col range type ([#3602](https://github.com/dream-num/univer/issues/3602)) ([8262f7f](https://github.com/dream-num/univer/commit/8262f7fbafe4968c391c9fb934760b2f4b032fa9))
* should scroll to changed position on set range values ([bb4f035](https://github.com/dream-num/univer/commit/bb4f0352f0fd10f8bf37fe40231f7d8851206beb))
* **ui:** fix display values for certain menu items ([#3522](https://github.com/dream-num/univer/issues/3522)) ([3035e39](https://github.com/dream-num/univer/commit/3035e39ebc4c12a3fac6521bceb51a3d25e9df43))
* **ui:** improve handling of `CustomLabel` default values ([#3536](https://github.com/dream-num/univer/issues/3536)) ([fde58d7](https://github.com/dream-num/univer/commit/fde58d71d2fb21614c2f69f0f554778d0afe0537))
* **ui:** optimize Menu component rendering and filtering logic ([#3552](https://github.com/dream-num/univer/issues/3552)) ([6338846](https://github.com/dream-num/univer/commit/633884605fb698df23ea3e59fb113f11d84337ad))
* **ui:** revert column width input to initial value on menu close ([#3562](https://github.com/dream-num/univer/issues/3562)) ([3cc2392](https://github.com/dream-num/univer/commit/3cc239252c24eff3a40a11374abe897ee4123b80))
* use tab to insert new row ([#3524](https://github.com/dream-num/univer/issues/3524)) ([1c34bd0](https://github.com/dream-num/univer/commit/1c34bd02321dade2dc01b5d30ad6a48130f45d5e))


### Features

* add before render hook ([#3576](https://github.com/dream-num/univer/issues/3576)) ([e8f113e](https://github.com/dream-num/univer/commit/e8f113ef0dc5eea7d904aca04d9e3ce4ad015f73))
* add scrolling fps e2e test ([#3532](https://github.com/dream-num/univer/issues/3532)) ([741665c](https://github.com/dream-num/univer/commit/741665cd279b36c57d46d37a80c0d55b32e7cfc0))
* **core:** optimize split into grid function ([#3565](https://github.com/dream-num/univer/issues/3565)) ([4e8d9a5](https://github.com/dream-num/univer/commit/4e8d9a59c01077e425f258ab38c4ad69437619e5))
* **docs:** add gray background color to docs ([#3525](https://github.com/dream-num/univer/issues/3525)) ([edb3719](https://github.com/dream-num/univer/commit/edb371918893028b912d79edab8fe25de17c0785))
* **facade:** add facade for freeze and getCellData ([#3561](https://github.com/dream-num/univer/issues/3561)) ([983ad9f](https://github.com/dream-num/univer/commit/983ad9f48c2e2a6233b08b4283e10170ddeefdf7))
* **formula:** add some statistical formulas  ([#3463](https://github.com/dream-num/univer/issues/3463)) ([0a7658a](https://github.com/dream-num/univer/commit/0a7658aebe92e3ba3e7a4076f76f89ed1b1cd912))
* set document ([#3521](https://github.com/dream-num/univer/issues/3521)) ([5489ce8](https://github.com/dream-num/univer/commit/5489ce8cda2d906026e45b6232ece607a6a75f3a))
* **sheet:** group sheet get cell intercptor to performance well ([#3534](https://github.com/dream-num/univer/issues/3534)) ([ab97ea1](https://github.com/dream-num/univer/commit/ab97ea11c225ada078709c92584609116a8070c6))
* **sheets-data-validation:** support hide edit button on dropdown ([#3574](https://github.com/dream-num/univer/issues/3574)) ([f2224c3](https://github.com/dream-num/univer/commit/f2224c3331a8816766c9feb2cf33a218f9486747))
* **sheet:** support fork file ([#3549](https://github.com/dream-num/univer/issues/3549)) ([6a475a7](https://github.com/dream-num/univer/commit/6a475a73d8f3154d3d4f4ffba2a2ebf9864013cc))


### Performance Improvements

* fix permission perf ([#3618](https://github.com/dream-num/univer/issues/3618)) ([56f248c](https://github.com/dream-num/univer/commit/56f248cc69e2fca76a4a23715dc1eeb0a0374a24))

## [0.2.15](https://github.com/dream-num/univer/compare/v0.2.14...v0.2.15) (2024-09-21)


### Bug Fixes

* add filter with one cell should adjust expend range permission ([#3469](https://github.com/dream-num/univer/issues/3469)) ([b4b0763](https://github.com/dream-num/univer/commit/b4b076328a85e9ebc507a6880433aded1d55c638))
* **clipboard:** fix paste col width ([#3450](https://github.com/dream-num/univer/issues/3450)) ([2175c49](https://github.com/dream-num/univer/commit/2175c49cd2dfd9495c09c7818d1598a7913262f1))
* **design:** prevent suffix showing with `allowClear` is `false` ([#3449](https://github.com/dream-num/univer/issues/3449)) ([32b2cac](https://github.com/dream-num/univer/commit/32b2cac2875a1d5af80e68a78511d9c4e2bdfb89))
* **docs-ui:** doc list can't toggle ([#3473](https://github.com/dream-num/univer/issues/3473)) ([3dc6d95](https://github.com/dream-num/univer/commit/3dc6d955ceee7bcf4b21e29dcfe562515d36449e))
* **docs:** scroll to selection ([#3458](https://github.com/dream-num/univer/issues/3458)) ([3cf7b46](https://github.com/dream-num/univer/commit/3cf7b461dca0d53f0cd71dcf305ffc1adf37ba9e))
* **docs:** wrong ime position after scroll ([#3457](https://github.com/dream-num/univer/issues/3457)) ([6e6b0b2](https://github.com/dream-num/univer/commit/6e6b0b22294feac948a7b49ac199840c96f44d09))
* fix edit cell with remove sheet ([#3474](https://github.com/dream-num/univer/issues/3474)) ([38b03fb](https://github.com/dream-num/univer/commit/38b03fb0f9f1f5cd4d58c027f490bbaf7be57328))
* fix pasting twice in formula editor ([#3481](https://github.com/dream-num/univer/issues/3481)) ([13cf373](https://github.com/dream-num/univer/commit/13cf373d08e552d83f501656412e162349efd91a))
* **formula:** binary search supports match type ([#3402](https://github.com/dream-num/univer/issues/3402)) ([6db4cf8](https://github.com/dream-num/univer/commit/6db4cf8ed5c04f6b8e2d031191c17c4f9bf7ee3e))
* **formula:** fix some bugs ([#3470](https://github.com/dream-num/univer/issues/3470)) ([7c66482](https://github.com/dream-num/univer/commit/7c66482f69b3dd2fcce5e6643be69e2d587209df))
* hide sheet should operation right sheet ([#3468](https://github.com/dream-num/univer/issues/3468)) ([a4bfe0d](https://github.com/dream-num/univer/commit/a4bfe0d8126fb3c83b869f44f6aabdd0cd4eaca1))
* **menu:** sort menu should be hide ([#3505](https://github.com/dream-num/univer/issues/3505)) ([9530fe4](https://github.com/dream-num/univer/commit/9530fe490e00b71d0e9752e09b06db9c15aa90b1))
* **numfmt:** do  not block when syntax is not supported ([#3491](https://github.com/dream-num/univer/issues/3491)) ([b8c9256](https://github.com/dream-num/univer/commit/b8c9256bc481e42859aa888674c1bd0a4e3edea0))
* scroll cmd for pointer down at scrolltrack ([#3429](https://github.com/dream-num/univer/issues/3429)) ([8e9f513](https://github.com/dream-num/univer/commit/8e9f513a8a63fba3c3b610effae5c83a13b81d76))
* **sheet:** getDiscreteRanges filter empty cell ([#3437](https://github.com/dream-num/univer/issues/3437)) ([92a063a](https://github.com/dream-num/univer/commit/92a063a3ddc021d93a82d41157407fbd4a911cdd))
* **sheets-data-validation:** data validation event trigger before data applied ([#3498](https://github.com/dream-num/univer/issues/3498)) ([c4601a0](https://github.com/dream-num/univer/commit/c4601a05beaba3da46d629b3b2d93f2c863a4d7f))
* **sheets-data-validation:** data-validation oom on extreme-big-range ([#3494](https://github.com/dream-num/univer/issues/3494)) ([86c2dd9](https://github.com/dream-num/univer/commit/86c2dd94e94f1cc1f7d8de612204f832ea62942f))
* **sheets-data-validation:** large data validation oom ([#3492](https://github.com/dream-num/univer/issues/3492)) ([42ce257](https://github.com/dream-num/univer/commit/42ce257272931379d13fcf38aefba6c9b461f80d))
* **sheets-hyper-link-ui:** input link error ([#3513](https://github.com/dream-num/univer/issues/3513)) ([b4fcb4a](https://github.com/dream-num/univer/commit/b4fcb4ad1b3443240222e1167596c9f92a919fe0))
* **sheets-hyper-link-ui:** link redo undo ([#3465](https://github.com/dream-num/univer/issues/3465)) ([9ddcaf5](https://github.com/dream-num/univer/commit/9ddcaf5021802f6fa3df3848c7c330db8501a08a))
* **sheets-hyper-link:** build url ([#3503](https://github.com/dream-num/univer/issues/3503)) ([25b7b66](https://github.com/dream-num/univer/commit/25b7b662c133a2f87fc21053755c34bec6120d50))
* **sheets-thread-comment-ui:** delete comment error ([#3476](https://github.com/dream-num/univer/issues/3476)) ([01a78da](https://github.com/dream-num/univer/commit/01a78da4e747045cb1e36c43378af1746d7eb006))
* **sheets-thread-comment:** comment ui issues ([#3510](https://github.com/dream-num/univer/issues/3510)) ([05616d4](https://github.com/dream-num/univer/commit/05616d4a9e4bcacc996c338cb529c57148af584f))
* **sheet:** set selection should ensure the selection is not null ([#3497](https://github.com/dream-num/univer/issues/3497)) ([7b89f27](https://github.com/dream-num/univer/commit/7b89f270d5151e497a5adb4b231a5439fb8b8075))
* **span:** fix editor position not right issue ([#3443](https://github.com/dream-num/univer/issues/3443)) ([4b86a65](https://github.com/dream-num/univer/commit/4b86a659e1ec79b03f1f6425094cddaa444fc962))
* type errors ([20d35a3](https://github.com/dream-num/univer/commit/20d35a35a17f6cc3e8702b91f49191065c14fb32))
* **ui:** hide column header arrow when `contextMenu` is `false` ([#3444](https://github.com/dream-num/univer/issues/3444)) ([1355807](https://github.com/dream-num/univer/commit/1355807d681398c3aae40164b10cbe1156dfa326))


### Features

* **core:** unify the handler of get plain text from rich-text model ([#3421](https://github.com/dream-num/univer/issues/3421)) ([e9395d2](https://github.com/dream-num/univer/commit/e9395d2843c913eff14a881cf6ec39bdc6c9778b))
* **demo:** add support for dynamic imports ([#3433](https://github.com/dream-num/univer/issues/3433)) ([33571b6](https://github.com/dream-num/univer/commit/33571b6efbc961755ba02c3a3464d3591d9e1089))
* **facade:** add FWorksheet.getRange(a1Notation) ([#3504](https://github.com/dream-num/univer/issues/3504)) ([a697a49](https://github.com/dream-num/univer/commit/a697a49175e05bfb0934ba3bd07384ba6c59ea43))
* **formula:** add function leftb ([#3418](https://github.com/dream-num/univer/issues/3418)) ([b66e8ce](https://github.com/dream-num/univer/commit/b66e8ce2e632fb2c53378909207c8c7b18e00875))
* **formula:** add function mid ([#3417](https://github.com/dream-num/univer/issues/3417)) ([32fb95e](https://github.com/dream-num/univer/commit/32fb95e5cded8e9caf0e813af49fa25baada6b82))
* **sheets-data-validation:** data validation optimize ([#3422](https://github.com/dream-num/univer/issues/3422)) ([93c3659](https://github.com/dream-num/univer/commit/93c3659490c61d19f3da5875e8c7be669a4bb43e))
* **sheets-ui:** undo set cols visible should scroll to cols ([#3355](https://github.com/dream-num/univer/issues/3355)) ([ed6d783](https://github.com/dream-num/univer/commit/ed6d7835ace6e85cfafd23875d136e129957a774))


### Performance Improvements

* refactor local file service ([#3479](https://github.com/dream-num/univer/issues/3479)) ([23e47c2](https://github.com/dream-num/univer/commit/23e47c2a683910bc189f286f92761115c8709894))
* **sheet:** add span model ([#3403](https://github.com/dream-num/univer/issues/3403)) ([c357724](https://github.com/dream-num/univer/commit/c357724305ef5d61acacccd4fd68559a54b62dd5))

## [0.2.14](https://github.com/dream-num/univer/compare/v0.2.13...v0.2.14) (2024-09-13)


### Bug Fixes

* **sheet:** custom will overwrite the original value ([#3431](https://github.com/dream-num/univer/issues/3431)) ([e1042d4](https://github.com/dream-num/univer/commit/e1042d449c64e13448bb1bace80ed3cfab2467dd))
* **sheets-ui:** formula error when cross sub-sheet ([#3436](https://github.com/dream-num/univer/issues/3436)) ([97ae314](https://github.com/dream-num/univer/commit/97ae314008745a3e641ff5aaf6c659556306fc4f))


### Features

* **sheets-ui:** optimize shortcut for comment & hyperlink editor ([#3434](https://github.com/dream-num/univer/issues/3434)) ([9604020](https://github.com/dream-num/univer/commit/9604020c333981a29d72ed62b0bf1241fa77d2bf))

## [0.2.13](https://github.com/dream-num/univer/compare/v0.2.12...v0.2.13) (2024-09-13)


### Bug Fixes

* border auxiliary is unexpectedly cleared after the merge cell is hidden ([#3358](https://github.com/dream-num/univer/issues/3358)) ([c11c324](https://github.com/dream-num/univer/commit/c11c324bfb7455727828316a692cc29d0b8be7d5))
* cell margin top is not right ([#3382](https://github.com/dream-num/univer/issues/3382)) ([8b4027e](https://github.com/dream-num/univer/commit/8b4027efecc9814334961b89e276f1acaa862b64))
* cell value should adjust rich text & function ([#3385](https://github.com/dream-num/univer/issues/3385)) ([ca628e1](https://github.com/dream-num/univer/commit/ca628e1f2b34d33240229d8f084c9f01d8f8cef1))
* **docs-drawing:** drawing resource ([#3410](https://github.com/dream-num/univer/issues/3410)) ([4f2b148](https://github.com/dream-num/univer/commit/4f2b1480d03eb44247658343e9bbfe29beeacdb3))
* **docs-ui:** editor focusing conflict when update content ([#3423](https://github.com/dream-num/univer/issues/3423)) ([f2deabc](https://github.com/dream-num/univer/commit/f2deabc1eaf8b5c6b1646a83672bb7764f218a4c))
* **formular:** fix sheet maximum ([#3384](https://github.com/dream-num/univer/issues/3384)) ([41affb7](https://github.com/dream-num/univer/commit/41affb74573b69ad1731916e2b5a2017b0c6a2fa))
* **formula:** update formula id ([#3339](https://github.com/dream-num/univer/issues/3339)) ([1434966](https://github.com/dream-num/univer/commit/1434966620e4f4e0e5523eb7f5449d4a9ccde3ae))
* incorrectly quit autofill mode ([#3390](https://github.com/dream-num/univer/issues/3390)) ([f0fc942](https://github.com/dream-num/univer/commit/f0fc942c571560828b4e9a2462cb84e0ed812d35))
* **render:** fix the issue loop span many times ([#3394](https://github.com/dream-num/univer/issues/3394)) ([f3d55f7](https://github.com/dream-num/univer/commit/f3d55f78983e202220124d90fa72f43187ca5662))
* sheet getRowVisible lags after filter ([#3396](https://github.com/dream-num/univer/issues/3396)) ([cb2cf7e](https://github.com/dream-num/univer/commit/cb2cf7ef2e96087b990f5beca6df272103b3c242))
* **sheet:** adjust move range old mutation not has fromRange property ([#3361](https://github.com/dream-num/univer/issues/3361)) ([11748a5](https://github.com/dream-num/univer/commit/11748a53eacc62992f2dc00b4af3a5e2a2e9e869))
* **sheet:** fix type error ([#3401](https://github.com/dream-num/univer/issues/3401)) ([7ce40a5](https://github.com/dream-num/univer/commit/7ce40a58df0525b23ada41ae53c4835eab090a71))
* **sheet:** merge cell custom property ([#3365](https://github.com/dream-num/univer/issues/3365)) ([880ef44](https://github.com/dream-num/univer/commit/880ef4433464a75d2be9975ef653a920e80e7fa8))
* **sheets-ui:** recover float-dom delete menu & focusing when zen-editor mount ([#3426](https://github.com/dream-num/univer/issues/3426)) ([2bf1177](https://github.com/dream-num/univer/commit/2bf1177ac967989939bd5d1096f72641503ab0d6))
* **sheet:** the first style of span is not set is merge to true ([#3398](https://github.com/dream-num/univer/issues/3398)) ([6def773](https://github.com/dream-num/univer/commit/6def773da061af84166d525c021bd63c9a341b2f))
* **sort:** i18n error in sheet sort ([#3419](https://github.com/dream-num/univer/issues/3419)) ([771eeb6](https://github.com/dream-num/univer/commit/771eeb64a5c10a53de9e39fb36ec32df0df0e8f4))
* the viewport size is too big after cancel filter rule, then viewport main is blank because graphic mem is full. ([#3415](https://github.com/dream-num/univer/issues/3415)) ([f31cefd](https://github.com/dream-num/univer/commit/f31cefd6de79187c48ad94da2435bf048779b518))
* **ui:** prevent dropdown usage when menu bar is disabled ([#3400](https://github.com/dream-num/univer/issues/3400)) ([5f2e9fa](https://github.com/dream-num/univer/commit/5f2e9fa12aa3ed1683aaa0e5f76bd609baa4f386))


### Features

* **action-recorder:** add experimental action recorder plugin ([#3386](https://github.com/dream-num/univer/issues/3386)) ([83238fa](https://github.com/dream-num/univer/commit/83238fa2be5742a4b815ee0f5443ee889e142637))
* **conditional-formatting:** support formatting painter ([#3420](https://github.com/dream-num/univer/issues/3420)) ([2b121d7](https://github.com/dream-num/univer/commit/2b121d7e368e89737f90ac401768fa4748de133d))
* **doc-hyper-link:** polyfill history data for doc hyper link ([#3406](https://github.com/dream-num/univer/issues/3406)) ([5f2c2fe](https://github.com/dream-num/univer/commit/5f2c2fe217aae389b6426951fb3b872b62ee42b5))
* **formula:** add some lookup formulas ([#3352](https://github.com/dream-num/univer/issues/3352)) ([5ab9c7d](https://github.com/dream-num/univer/commit/5ab9c7d109cb65abb9d9f8f5489a0e05f8ea1143))
* **formula:** add some math formulas ([#3381](https://github.com/dream-num/univer/issues/3381)) ([e736b8a](https://github.com/dream-num/univer/commit/e736b8ad9d2cf351c624c8bc0cf70dc78a5e8dd6))
* **formula:** bycol/byrow/map/reduce/scan ([#3320](https://github.com/dream-num/univer/issues/3320)) ([85b9d90](https://github.com/dream-num/univer/commit/85b9d90d48417d5e971ac579674d2286f4c0164f))
* **sheets-hyper-link-ui:** sheet link support rich-text mode ([#3322](https://github.com/dream-num/univer/issues/3322)) ([d19d224](https://github.com/dream-num/univer/commit/d19d224a4260f1e1632989f70baae227c86bdfb8))

## [0.2.12](https://github.com/dream-num/univer/compare/v0.2.11...v0.2.12) (2024-09-07)


### Bug Fixes

* **auto-fill:** change apply type will undo last commands ([#3311](https://github.com/dream-num/univer/issues/3311)) ([391c523](https://github.com/dream-num/univer/commit/391c52389e39c7dd533ec863b7818855356fee81))
* **clipboard:** copy will not use filtered-out rows content ([#3292](https://github.com/dream-num/univer/issues/3292)) ([ec601c3](https://github.com/dream-num/univer/commit/ec601c33545efb82c9a506e05db21fd53b736281))
* **conditional-formatting:** init view model ([#3349](https://github.com/dream-num/univer/issues/3349)) ([ad145f2](https://github.com/dream-num/univer/commit/ad145f21da5acdd94a6677b90bfe9771b4ab8c34))
* **conditional-formatting:** render cache error ([#3345](https://github.com/dream-num/univer/issues/3345)) ([e812441](https://github.com/dream-num/univer/commit/e812441c616ee2f25940372a6a3a740e10c9ca60))
* **conditional-formatting:** the maximum and minimum values are corre… ([#3270](https://github.com/dream-num/univer/issues/3270)) ([5d41a9b](https://github.com/dream-num/univer/commit/5d41a9bba15cce4d2fec746d7a20711683e4c617))
* **crosshair:** fix no plugin name for the plugin ([19564c7](https://github.com/dream-num/univer/commit/19564c7630f780d81a94abfea5b891ee41262069))
* **design:** popup style ([#3325](https://github.com/dream-num/univer/issues/3325)) ([675933c](https://github.com/dream-num/univer/commit/675933c2c715d9e832b08cabc9abf794efa159a0))
* detect row/col index in selection ([#3348](https://github.com/dream-num/univer/issues/3348)) ([c9fef1b](https://github.com/dream-num/univer/commit/c9fef1be0b0d244ca2783ab6dccdb3ff4e754360))
* **docs:** link break in link ([#3254](https://github.com/dream-num/univer/issues/3254)) ([ff17894](https://github.com/dream-num/univer/commit/ff178948759e2cb57557ce51c9e81ac11ff22999))
* drawing issues ([#3245](https://github.com/dream-num/univer/issues/3245)) ([d848d33](https://github.com/dream-num/univer/commit/d848d33a692a405f16802a941617a214e1fcec30))
* **filter:** filter range change error when remove rows/cols ([#3324](https://github.com/dream-num/univer/issues/3324)) ([a70ef37](https://github.com/dream-num/univer/commit/a70ef37bbd46d3fdc3120728d7020f448f445f60))
* **filter:** filter render controller should dispose its vars when unit disposed ([#3340](https://github.com/dream-num/univer/issues/3340)) ([be7da80](https://github.com/dream-num/univer/commit/be7da806b958f5baaf201b7752954e4630b7b70d))
* fix dependencies of telemetry ([#3280](https://github.com/dream-num/univer/issues/3280)) ([965064e](https://github.com/dream-num/univer/commit/965064ec39f94ec833dc14b4ac9b39434d24e49c))
* fix the sorting menu item display position ([#3314](https://github.com/dream-num/univer/issues/3314)) ([3f18a4f](https://github.com/dream-num/univer/commit/3f18a4f61c021e839a2036e7881ea713bb916618))
* fix threshold error handling ([#3261](https://github.com/dream-num/univer/issues/3261)) ([1e1dde5](https://github.com/dream-num/univer/commit/1e1dde55437bb7bf9bb02d83c2edf1d3f84c44ad))
* fix uni menu ([#3338](https://github.com/dream-num/univer/issues/3338)) ([af63f7d](https://github.com/dream-num/univer/commit/af63f7dda4e26dbc9cac0eeecf0127764119ac35))
* font rendering diffrange condition fix ([#3264](https://github.com/dream-num/univer/issues/3264)) ([c920d53](https://github.com/dream-num/univer/commit/c920d53137b3891464a050ca0b72f22e175b5704))
* **formula:** bracket has more blank ([#3331](https://github.com/dream-num/univer/issues/3331)) ([4900a3c](https://github.com/dream-num/univer/commit/4900a3c0330c1899b364faa73ce923b68d67ce62))
* **formula:** fix formula paste ([#3257](https://github.com/dream-num/univer/issues/3257)) ([771f191](https://github.com/dream-num/univer/commit/771f191678af8ab1a1e1f893b6f2cdec093fb6c7))
* **formular:** fix dependency performance issue ([#3359](https://github.com/dream-num/univer/issues/3359)) ([f2f7f5b](https://github.com/dream-num/univer/commit/f2f7f5bb50357824e7094852580286c216f06700))
* mobile selection did not drawing ([#3312](https://github.com/dream-num/univer/issues/3312)) ([d1773ed](https://github.com/dream-num/univer/commit/d1773ede7979ba6e6ad5ee4da80ed55c10e20912))
* **permission:** fix permission render bugs ([#3300](https://github.com/dream-num/univer/issues/3300)) ([9751c0a](https://github.com/dream-num/univer/commit/9751c0a815299f8bea3864eff6dfac3153111d05))
* selection type did not update when set type to normal(0) ([#3317](https://github.com/dream-num/univer/issues/3317)) ([2909cf8](https://github.com/dream-num/univer/commit/2909cf80a7e686dc629a24feea020e96817d6397))
* **sheet-data-validation:** auto-format data validation  non-standard date string & data-validation auto-fill ([#3336](https://github.com/dream-num/univer/issues/3336)) ([fc3dc44](https://github.com/dream-num/univer/commit/fc3dc4486b7f3c864f1e2a7ccdbe4c6d4705511c))
* **sheets-drawing-ui:** sheet-drawing error receive data from doc ([#3337](https://github.com/dream-num/univer/issues/3337)) ([b8e6e42](https://github.com/dream-num/univer/commit/b8e6e42c161769f203d2a7d6e57b8ade6311e821))
* **sheets-drawing-ui:** sheet-drawing-import ([#3277](https://github.com/dream-num/univer/issues/3277)) ([183b3e0](https://github.com/dream-num/univer/commit/183b3e0526c63064cba2ee9ac1ae6c648719ff01))
* **sheets-formula:** fix the issue of missing formula description list ([#3323](https://github.com/dream-num/univer/issues/3323)) ([9d314ce](https://github.com/dream-num/univer/commit/9d314ce88f4c73f4563ae90ee66410c14ffdb879))
* **sheets-ui:** auto-fill will copy auto-height strategy from origin region ([#3287](https://github.com/dream-num/univer/issues/3287)) ([04f156e](https://github.com/dream-num/univer/commit/04f156e8975401c7d38b5703fbfbac8968e0d740))
* **sheets:** skip remove-sheet on watch range if skipIntersects was set ([#3356](https://github.com/dream-num/univer/issues/3356)) ([2ee440a](https://github.com/dream-num/univer/commit/2ee440aa6ef90937d0c796f3368f54f35a46fbae))
* **sheets:** undo set col width should set to the original value ([#3353](https://github.com/dream-num/univer/issues/3353)) ([c5ebb79](https://github.com/dream-num/univer/commit/c5ebb79c9dddc3bd6fb228a082364636b0f50f06))
* **sheet:** unhide row button will update when skeleton change & auto-fill will check empty ([4598c91](https://github.com/dream-num/univer/commit/4598c91f249730d335e9f24d90f17e0bce7107ad))
* skip invisible row in filtered state for performance ([#3319](https://github.com/dream-num/univer/issues/3319)) ([5ada754](https://github.com/dream-num/univer/commit/5ada754e2d37d2a20e95bc0e0950c755e2f9cdeb))
* **slide:** 2024 width ([#3156](https://github.com/dream-num/univer/issues/3156)) ([1bddcb8](https://github.com/dream-num/univer/commit/1bddcb8935ca54d81e886bba4c21b944ccffadee))
* sync mutation will not quit auto-fill mode ([#3351](https://github.com/dream-num/univer/issues/3351)) ([8a7545a](https://github.com/dream-num/univer/commit/8a7545a7fa691d1834f3126657ba736edff5652a))
* unexpected cross viewport selection because it counts rowheader ([#3296](https://github.com/dream-num/univer/issues/3296)) ([ebde3da](https://github.com/dream-num/univer/commit/ebde3da36225147596e34e5af4899176edd41277))
* **uni-formula-ui:** uni formula deps error ([#3302](https://github.com/dream-num/univer/issues/3302)) ([5ab492f](https://github.com/dream-num/univer/commit/5ab492fd78f5e09188ff4f03456c4ce5d8ed15d1))
* **uni:** fix missing undo & redo menu item ([#3343](https://github.com/dream-num/univer/issues/3343)) ([15f18c8](https://github.com/dream-num/univer/commit/15f18c80c2aed0d75b6ebf7b3fba8a27dd8e77f8))


### Features

* **auto-fill:** edit operation will quit auto-fill mode ([#3333](https://github.com/dream-num/univer/issues/3333)) ([9478a90](https://github.com/dream-num/univer/commit/9478a901300bd44d3f5d5c1c150f302f5e7991b3))
* **docs-hyper-link:** hyper link refactor ([#3148](https://github.com/dream-num/univer/issues/3148)) ([f21ce50](https://github.com/dream-num/univer/commit/f21ce5066295fc719e52278d227d3d127341cc48))
* **docs:** support change space rule type ([#3176](https://github.com/dream-num/univer/issues/3176)) ([4936567](https://github.com/dream-num/univer/commit/4936567b3311a515b3b6ead9a3e2938be8a714a5))
* **facade:** add clipboard hooks and selection api ([#3216](https://github.com/dream-num/univer/issues/3216)) ([e2fbf0e](https://github.com/dream-num/univer/commit/e2fbf0e4bd01b9279a1692f830a90c1ee6812b17))
* **facade:** add FRange.getValues api ([#3344](https://github.com/dream-num/univer/issues/3344)) ([1021e30](https://github.com/dream-num/univer/commit/1021e300b6b74a216c0e4d7625db411377fa3bfb))
* **facade:** add merge facade api ([#3289](https://github.com/dream-num/univer/issues/3289)) ([acd03e4](https://github.com/dream-num/univer/commit/acd03e447d1eaecb37c3820ada25431a1c882637))
* **format-painter:** format pianter to single-cell will copy whole range formats ([#3326](https://github.com/dream-num/univer/issues/3326)) ([923b5dc](https://github.com/dream-num/univer/commit/923b5dc4ed309b48c57eb6bec2a42566f94d5844))
* **formula:**  isformula/n/na ([#3304](https://github.com/dream-num/univer/issues/3304)) ([ccc4276](https://github.com/dream-num/univer/commit/ccc427654e96b90fac3a954b7311dc4b743527f3))
* **sheet:** exclusive range serivce ([#3278](https://github.com/dream-num/univer/issues/3278)) ([093ee31](https://github.com/dream-num/univer/commit/093ee318884df61cfe0838b74ece6b0ff244f449))
* **sheets-drawing-ui:** support disable transform on float dom ([#3342](https://github.com/dream-num/univer/issues/3342)) ([9fe9468](https://github.com/dream-num/univer/commit/9fe9468990f360d124096eea5ffa7f32f3a2dd25))
* telemetry interface for track function cost time ([#3288](https://github.com/dream-num/univer/issues/3288)) ([01e35e2](https://github.com/dream-num/univer/commit/01e35e2422e3b868226ae62ad0c7c3ca11e40969))
* telemetry.merge ([#3251](https://github.com/dream-num/univer/issues/3251)) ([8f01cf3](https://github.com/dream-num/univer/commit/8f01cf3a96d70169299f2e483b1e6bf95898cad1))

## [0.2.11](https://github.com/dream-num/univer/compare/v0.2.10...v0.2.11) (2024-08-31)


### Bug Fixes

* **sheet:** render after every mutation executed ([#3258](https://github.com/dream-num/univer/issues/3258)) ([91217dc](https://github.com/dream-num/univer/commit/91217dc661a5dfd2573497d43dc508cfc76121ed))
* **sheets-data-validation:** cant resume data-validation on undo remove-sheet ([#3260](https://github.com/dream-num/univer/issues/3260)) ([7e9e69f](https://github.com/dream-num/univer/commit/7e9e69f986947281906b2ae71a47a9c2661be1fd))

## [0.2.10](https://github.com/dream-num/univer/compare/v0.2.9...v0.2.10) (2024-08-30)


### Bug Fixes

*  some operations can be performed when have view permission ([#3180](https://github.com/dream-num/univer/issues/3180)) ([8664a75](https://github.com/dream-num/univer/commit/8664a751711682d65dd2804b499592909feadd2c))
* add missing exports ([c6ee109](https://github.com/dream-num/univer/commit/c6ee109396e5d10b3f5f7b300c239a7dda20f612))
* add rows by paste should support undo ([#3208](https://github.com/dream-num/univer/issues/3208)) ([9ee12c2](https://github.com/dream-num/univer/commit/9ee12c29a731c556b9a839f46d78fa7c5528f0f7))
* **conditional-formatting:** hidden values do not take effect when us… ([#3228](https://github.com/dream-num/univer/issues/3228)) ([4e888d0](https://github.com/dream-num/univer/commit/4e888d0a968f9d5879247955a29d6ae2f304ab45))
* **conditional-formatting:** setting highlight error can not be confi… ([#3229](https://github.com/dream-num/univer/issues/3229)) ([5c16e04](https://github.com/dream-num/univer/commit/5c16e04520970029e801932c1bbf9e876acc5cbe))
* copy paste between sheet and doc ([#2993](https://github.com/dream-num/univer/issues/2993)) ([617986d](https://github.com/dream-num/univer/commit/617986df9e462127c6c7920dcefc2a8cbedefd08))
* **docs:** copy paste image form univer doc to univer doc ([#3227](https://github.com/dream-num/univer/issues/3227)) ([c2f417c](https://github.com/dream-num/univer/commit/c2f417c6fea0ad124f64d7f8234e9294dd42485c))
* **docs:** copy table only has one row and col ([#3234](https://github.com/dream-num/univer/issues/3234)) ([08034d0](https://github.com/dream-num/univer/commit/08034d096a0996c759e3fc1980a88e5d2cb34e75))
* **docs:** find cursor by cood ([#3105](https://github.com/dream-num/univer/issues/3105)) ([5d80b5b](https://github.com/dream-num/univer/commit/5d80b5b4485dffc87781bb89b0825c89c719b7be))
* **docs:** no need to scroll when enter zen mode ([#3222](https://github.com/dream-num/univer/issues/3222)) ([1ebbe27](https://github.com/dream-num/univer/commit/1ebbe272775a331e67c756a6de782c0a17cefefd))
* **docs:** paste content to univer ([#3071](https://github.com/dream-num/univer/issues/3071)) ([97e19b3](https://github.com/dream-num/univer/commit/97e19b3a083ab4cd619eefafecadba415e38a77b))
* **docs:** paste table after table ([#3214](https://github.com/dream-num/univer/issues/3214)) ([1899d34](https://github.com/dream-num/univer/commit/1899d34c00fa8db9223f136ede8c58fa98e34a59))
* **docs:** remove content and insert drawing ([#3198](https://github.com/dream-num/univer/issues/3198)) ([f68e8eb](https://github.com/dream-num/univer/commit/f68e8ebe85db46801dd579e2f2d772c8ab9d18fc))
* **docs:** reserve the first remove text run ([#3225](https://github.com/dream-num/univer/issues/3225)) ([01fdcca](https://github.com/dream-num/univer/commit/01fdccad608c2b057d4ec60d0369f08256c6936c))
* **docs:** selection error in table and paragraph ([#3170](https://github.com/dream-num/univer/issues/3170)) ([c6f2eb7](https://github.com/dream-num/univer/commit/c6f2eb721e167ca9e4c97988645720857cbb8fe9))
* **docs:** show font family after copy from header ([#3233](https://github.com/dream-num/univer/issues/3233)) ([480e9f1](https://github.com/dream-num/univer/commit/480e9f1a29cc6344663166411417f18680905b71))
* **docs:** wrong font family in menu ([#3232](https://github.com/dream-num/univer/issues/3232)) ([f896261](https://github.com/dream-num/univer/commit/f8962619949aacc0a041775bf578edb94d027dab))
* **editor:** boolean values do not need to be processed ([#3204](https://github.com/dream-num/univer/issues/3204)) ([f060863](https://github.com/dream-num/univer/commit/f06086388cc112d9204acff10d145add09cfc550))
* fix the judgment logic of editor returning empty textRun ([#3211](https://github.com/dream-num/univer/issues/3211)) ([9a57c5d](https://github.com/dream-num/univer/commit/9a57c5d56de219f8f4d8f3a7adce09f14efa39a6))
* **formula:** fix operation accuracy ([#3244](https://github.com/dream-num/univer/issues/3244)) ([20b4dd5](https://github.com/dream-num/univer/commit/20b4dd569b2fd87435fac23ddc26edb4b3c2c834))
* **formula:** parser error ([#3174](https://github.com/dream-num/univer/issues/3174)) ([6e2db5a](https://github.com/dream-num/univer/commit/6e2db5a346a64bb716eb0ea3dbbc647c617f2337))
* modify the rich text judgment logic ([#3178](https://github.com/dream-num/univer/issues/3178)) ([0431c1f](https://github.com/dream-num/univer/commit/0431c1f3964b251377ab584011d4c1c5610e5d82))
* multi normal selections did not refresh when changing sheets. ([#3166](https://github.com/dream-num/univer/issues/3166)) ([1314465](https://github.com/dream-num/univer/commit/1314465ba48f3c6b5d98518307d283c4c9079ec3))
* **numfmt:** add or substract decimal inheritance ([#3195](https://github.com/dream-num/univer/issues/3195)) ([67f25c8](https://github.com/dream-num/univer/commit/67f25c8278434bb6b04d67986929dac814ff43c2))
* **numfmt:** menu circular dependencies ([#3248](https://github.com/dream-num/univer/issues/3248)) ([5087f29](https://github.com/dream-num/univer/commit/5087f2976b09bab1e4542ecb24ffabe868e09f14))
* **numfmt:** numfmt skip null or undefined ([#3188](https://github.com/dream-num/univer/issues/3188)) ([a923a93](https://github.com/dream-num/univer/commit/a923a9313011532aeada385127b62909f31fcc3d))
* **numfmt:** support edit percent with numfmt ([#3190](https://github.com/dream-num/univer/issues/3190)) ([d8ca9f6](https://github.com/dream-num/univer/commit/d8ca9f6043c78df0c42b1464a9ec2e83caa324f7))
* paste col should keep wider column width ([#3185](https://github.com/dream-num/univer/issues/3185)) ([e1f4f46](https://github.com/dream-num/univer/commit/e1f4f46945d9fa92e38acf93ef079035ca4792a1))
* paste should clear style when paste to editor in sheet ([#3215](https://github.com/dream-num/univer/issues/3215)) ([781c72e](https://github.com/dream-num/univer/commit/781c72e8b374939ba8e4469ecebce348a279d7ec))
* retry interceptor params ([#3220](https://github.com/dream-num/univer/issues/3220)) ([2e2044a](https://github.com/dream-num/univer/commit/2e2044a16e6a7cee13a0f803471db827a1d6c5b7))
* sheet dispose cause scroll update scene size failed. ([#3205](https://github.com/dream-num/univer/issues/3205)) ([6e1a234](https://github.com/dream-num/univer/commit/6e1a234ef6c78b65afc3ea8eccd302929eeb2e05))
* sheet text ([#3189](https://github.com/dream-num/univer/issues/3189)) ([5fd5350](https://github.com/dream-num/univer/commit/5fd53500de3cf22369d1c7ff6db552ec2ec444e3))
* **sheet:** insert wrong columns  when shift right ([#3193](https://github.com/dream-num/univer/issues/3193)) ([ebe1dda](https://github.com/dream-num/univer/commit/ebe1ddafbb7ea38b24600e1dcfb85fbe616995c1))
* **sheet:** make dirty when only local false ([#3247](https://github.com/dream-num/univer/issues/3247)) ([5b31804](https://github.com/dream-num/univer/commit/5b3180464e97e9cc3b895011558bf9308c285233))
* **sheets-data-validation:** data validation auto height ([#3175](https://github.com/dream-num/univer/issues/3175)) ([9e53c79](https://github.com/dream-num/univer/commit/9e53c79701145c68a5088a66047bf9cabbba5f4a))
* **sheets-data-validation:** date picker can't input by type when errorStyle is STOP ([#3237](https://github.com/dream-num/univer/issues/3237)) ([99cfb4b](https://github.com/dream-num/univer/commit/99cfb4be73e72bff305548be84940d507999d55e))
* **sheets-drawing:** drawing snapshot error ([#3230](https://github.com/dream-num/univer/issues/3230)) ([f5f52bf](https://github.com/dream-num/univer/commit/f5f52bf767e9378dc2b0d94e210b3805e1efc9f9))
* **sheets-filter:** some filter bugs ([#3199](https://github.com/dream-num/univer/issues/3199)) ([ec69831](https://github.com/dream-num/univer/commit/ec698319f27b1f32af934a7a2969acd9efb31a4d))
* **sheets-sort:** wrong order colIndex ([#3196](https://github.com/dream-num/univer/issues/3196)) ([33fdbde](https://github.com/dream-num/univer/commit/33fdbde98964b51831438a796395d5ef0d445451))
* **sheets-ui:** popup can't show ([#3252](https://github.com/dream-num/univer/issues/3252)) ([f1a45fd](https://github.com/dream-num/univer/commit/f1a45fd07feaf2823407e5240b7956d26f69b219))
* **sheets:** do not copy cell bg color to rich text bg ([#3207](https://github.com/dream-num/univer/issues/3207)) ([e293aca](https://github.com/dream-num/univer/commit/e293aca27fec8f6bbc0f3e882c925b7a6661be0d))
* **sheets:** no style in blank cell ([#3231](https://github.com/dream-num/univer/issues/3231)) ([e9360c4](https://github.com/dream-num/univer/commit/e9360c4eddb8ba31e7e68b7e228233e69d9f5257))
* **sheets:** ref-range watch-range on insert-move-down & insert-move-right ([#3218](https://github.com/dream-num/univer/issues/3218)) ([ca0f47a](https://github.com/dream-num/univer/commit/ca0f47a8f24dce3992d70a2d2634d6c4c0fc75b7))
* underline not work when align bottom & moving clipboard controller from steady to render ([#3139](https://github.com/dream-num/univer/issues/3139)) ([10484d8](https://github.com/dream-num/univer/commit/10484d8a5c57b709904c91f456e67d8aa80b6868))


### Features

* export facade api ([1d4b185](https://github.com/dream-num/univer/commit/1d4b185f35a48c8a854b1ddd47de9aaaddb7aaa2))
* **facade:** add facade api for sheets-thread-comment & float-dom & optmize data-validation facade api ([#3200](https://github.com/dream-num/univer/issues/3200)) ([5aa3342](https://github.com/dream-num/univer/commit/5aa3342980b80c23def393f7c9b5efa5192a41f0))
* **facade:** add Facade Worksheet row column API ([#3163](https://github.com/dream-num/univer/issues/3163)) ([7d903d7](https://github.com/dream-num/univer/commit/7d903d71439ff4350d6e4f08266ac1651b824aa8))
* **facade:** add redo undo facade hooks ([#3217](https://github.com/dream-num/univer/issues/3217)) ([a2be933](https://github.com/dream-num/univer/commit/a2be9332565acf7a2c1464afa89c08c61fa63622))
* **formula:** add some engineering functions ([#3070](https://github.com/dream-num/univer/issues/3070)) ([dbe1dab](https://github.com/dream-num/univer/commit/dbe1dab799fbb022796a7e9ea6ec4f1246e1e17c))
* **formula:** add some financial functions ([#3137](https://github.com/dream-num/univer/issues/3137)) ([62bb41b](https://github.com/dream-num/univer/commit/62bb41bf12368b2c909c5850693d47e71cd05082))
* **pivot:** fix scroll height & add hooks to format paint ([#3224](https://github.com/dream-num/univer/issues/3224)) ([84e8c89](https://github.com/dream-num/univer/commit/84e8c89d1793c777e937457f6a129e64ed787150))
* **sheet:** dialog close all ([#3240](https://github.com/dream-num/univer/issues/3240)) ([f06192d](https://github.com/dream-num/univer/commit/f06192df83ed2c72b4e187081d9c6397ced51679))
* **sheet:** performan the expand range ([#3187](https://github.com/dream-num/univer/issues/3187)) ([4a72204](https://github.com/dream-num/univer/commit/4a7220455c470dede9e48bd4862b31014dcf0eb7))

## [0.2.9](https://github.com/dream-num/univer/compare/v0.2.8...v0.2.9) (2024-08-23)


### Bug Fixes

* **conditional-formatting:** initialization timing problem ([#3142](https://github.com/dream-num/univer/issues/3142)) ([7d1c9d6](https://github.com/dream-num/univer/commit/7d1c9d6ff9054ff5fcfa19c204562db7dd99910b))
* **crosshair:** fix rendering controller ([f697951](https://github.com/dream-num/univer/commit/f69795145eba95954927793f3c969874a9b24735))
* debug currentSkeleton$ if param is null ([#3164](https://github.com/dream-num/univer/issues/3164)) ([3283d61](https://github.com/dream-num/univer/commit/3283d61ad06d37d154f36944d1cf6c81987639c1))
* **docs-ui:** limit list maxLevel to 3 when in table & set line-through style on checklist ([#3096](https://github.com/dream-num/univer/issues/3096)) ([9a62d77](https://github.com/dream-num/univer/commit/9a62d774a0ff19f74fbba112923130a591ac0556))
* **docs-ui:** link & checklist can't work on header-footer ([#3107](https://github.com/dream-num/univer/issues/3107)) ([106e7c4](https://github.com/dream-num/univer/commit/106e7c4989bc7c8c8af19428777fcbdf73b1db70))
* **docs:** disable some menu items when no selections ([#3094](https://github.com/dream-num/univer/issues/3094)) ([07a24cb](https://github.com/dream-num/univer/commit/07a24cbd3cd52ea833a379a023e3f570e14f8e08))
* **docs:** find cursor by coods ([#3143](https://github.com/dream-num/univer/issues/3143)) ([9998feb](https://github.com/dream-num/univer/commit/9998febb4d37ad296cc4b547434ff84c19301daa))
* **docs:** line space between image and line ([#3101](https://github.com/dream-num/univer/issues/3101)) ([32915ff](https://github.com/dream-num/univer/commit/32915ff8efc5b48b970f0b3354a6351728698b9f))
* **docs:** no need to scroll to selection when resize page ([#3092](https://github.com/dream-num/univer/issues/3092)) ([9697d87](https://github.com/dream-num/univer/commit/9697d87a01a55fcd69fb4bfcab3cc3d0ec194874))
* fix issue where custom menu items are hidden by default when `hidden$` is not configured ([#3122](https://github.com/dream-num/univer/issues/3122)) ([701131d](https://github.com/dream-num/univer/commit/701131d4e035518c70b90c6c1cc799a9f1587463))
* fix some permission bugs ([#3037](https://github.com/dream-num/univer/issues/3037)) ([eb30bdc](https://github.com/dream-num/univer/commit/eb30bdc00f2effdc0ed4f2e3f89f64c0e67a1a46))
* fix type error ([983a323](https://github.com/dream-num/univer/commit/983a323acde1387315afa426dfac6fb962baab7f))
* **formula:** array input ([#3097](https://github.com/dream-num/univer/issues/3097)) ([774d09c](https://github.com/dream-num/univer/commit/774d09c00d1f918d7abf406a48af2401abf5533c))
* **formula:** skip tree after add to formula run list ([#3114](https://github.com/dream-num/univer/issues/3114)) ([a238ea9](https://github.com/dream-num/univer/commit/a238ea964b969753092fa8eb51531a4282fc442d))
* hyper-link ref-range error on filter ([#3135](https://github.com/dream-num/univer/issues/3135)) ([014dd67](https://github.com/dream-num/univer/commit/014dd6796bce5124df8d15d112de519a6f658e92))
* **permission:** optimize permission calculation logic in dv ([#2811](https://github.com/dream-num/univer/issues/2811)) ([d127e02](https://github.com/dream-num/univer/commit/d127e02881a1ceff7a2b4b571a7394affe6260c1))
* ref selection expand after bottom line is over top line, and ref selection fill area(primary cell) and formula editor should clear when change sheet. ([#3104](https://github.com/dream-num/univer/issues/3104)) ([e73fc3c](https://github.com/dream-num/univer/commit/e73fc3c9699d5457173b6c5ad1880fde0b0d75a3))
* selection render and insert char ([#2982](https://github.com/dream-num/univer/issues/2982)) ([411d328](https://github.com/dream-num/univer/commit/411d32820bdcd7404032c70e20095fd04c27223e))
* **sheet:** defined name panel style ([#2797](https://github.com/dream-num/univer/issues/2797)) ([23a581b](https://github.com/dream-num/univer/commit/23a581b8270a0af6ad2e3437cf35da419ee5ad81))
* **sheet:** mixin should not use class self ([#3130](https://github.com/dream-num/univer/issues/3130)) ([1d7c3ab](https://github.com/dream-num/univer/commit/1d7c3abc6e0b6f53ef3e863c8466fbd340c9b4c8))
* **sheet:** move function to a file and export ([#3125](https://github.com/dream-num/univer/issues/3125)) ([8483725](https://github.com/dream-num/univer/commit/8483725c38dc59c208eba67ba0ff0690bfbe128f))
* **sheets-data-validation:** data-validation absolute offset ([#3091](https://github.com/dream-num/univer/issues/3091)) ([135e5c0](https://github.com/dream-num/univer/commit/135e5c0ef1e18825b57ac11c107b0d350ab85cae))
* **sheets-data-validation:** date validator error when errorStyle=STOP was set ([#3102](https://github.com/dream-num/univer/issues/3102)) ([a5015c8](https://github.com/dream-num/univer/commit/a5015c8f84360132649be75d0c89b80c9a66518b))
* **sheets-drawing-ui:** float-dom-layer position not correct on sheets and uni mode ([#3152](https://github.com/dream-num/univer/issues/3152)) ([4e434b0](https://github.com/dream-num/univer/commit/4e434b0cfb1b206417aa27ff63d09f26e5e2e278))
* **sheets-ui:** data-validation dropdown hidden when selection change ([#3119](https://github.com/dream-num/univer/issues/3119)) ([b8bf3b1](https://github.com/dream-num/univer/commit/b8bf3b150c659febb6b44994e14c48ec9547c297))


### Features

* add crosshair highlight plugin for Univer Sheet ([#3118](https://github.com/dream-num/univer/issues/3118)) ([3e9c34c](https://github.com/dream-num/univer/commit/3e9c34c99ed26c6d1949f78a3e6dba0c5c98c88e))
* **docs:** tab in table ([#3064](https://github.com/dream-num/univer/issues/3064)) ([39ce155](https://github.com/dream-num/univer/commit/39ce1556efe4b42726164cb83585090a485d5f9e))
* **facade:** add FFormula api ([#3144](https://github.com/dream-num/univer/issues/3144)) ([610be1f](https://github.com/dream-num/univer/commit/610be1f39d65430c77d5bb52ff83869da5c7f630))
* **filter:** add facade API and docs ([#3103](https://github.com/dream-num/univer/issues/3103)) ([dc37071](https://github.com/dream-num/univer/commit/dc37071446dd496eaaa8c035564d6a55cd20ba2a))
* **formula:** add rank/rank.avg/rank.eq function ([#3140](https://github.com/dream-num/univer/issues/3140)) ([d2a3ec2](https://github.com/dream-num/univer/commit/d2a3ec2011420bf775ae1135b569c1815cc6a79b))
* **numfmt:** currency shortcuts support internationalization ([#3062](https://github.com/dream-num/univer/issues/3062)) ([736cb9b](https://github.com/dream-num/univer/commit/736cb9b2bfb76621a0061abd16d65d8f1123971a))
* **permission:** add facade api ([#3132](https://github.com/dream-num/univer/issues/3132)) ([ca21fb8](https://github.com/dream-num/univer/commit/ca21fb8489122d79f2d5322fa480c629f777505e))
* **pivot:** add mixin to util ([#3124](https://github.com/dream-num/univer/issues/3124)) ([53f6610](https://github.com/dream-num/univer/commit/53f6610864ddc5f269bc94dafd57aebb870dc9c4))

## [0.2.8](https://github.com/dream-num/univer/compare/v0.2.7...v0.2.8) (2024-08-16)


### Bug Fixes

* add inputFormula$ ([#3013](https://github.com/dream-num/univer/issues/3013)) ([c5ce261](https://github.com/dream-num/univer/commit/c5ce261c5a767ce0fd52c018b0f16aeb06d3ad77))
* doc drawing load error on uni mode ([#3033](https://github.com/dream-num/univer/issues/3033)) ([bd32e08](https://github.com/dream-num/univer/commit/bd32e08d21bc00754d9c45ff35507369ef0337dd))
* **docs-drawing-ui:** doc drawing load error on uni mode ([#3034](https://github.com/dream-num/univer/issues/3034)) ([ba4ce37](https://github.com/dream-num/univer/commit/ba4ce37306d0d5565233874976db6de01091f424))
* **docs:** delete list between tables ([#3041](https://github.com/dream-num/univer/issues/3041)) ([97842a0](https://github.com/dream-num/univer/commit/97842a0fbace4f083011c864a27c26c7ca9a751a))
* **docs:** delete paragraph break in table cell ([#3077](https://github.com/dream-num/univer/issues/3077)) ([dc566fd](https://github.com/dream-num/univer/commit/dc566fdff1ff0b7aaff9957dfaf5feb125afef20))
* **doc:** should not resize all internal editors except zen mode ([#3005](https://github.com/dream-num/univer/issues/3005)) ([0cf5e2d](https://github.com/dream-num/univer/commit/0cf5e2d574df59b77338c4090b6ae46652c22748))
* **docs:** insert footer ([#3058](https://github.com/dream-num/univer/issues/3058)) ([14469e5](https://github.com/dream-num/univer/commit/14469e52c0b6c37181ba4d8a5928468348bacf86))
* **docs:** line space ([#3082](https://github.com/dream-num/univer/issues/3082)) ([f5dcea0](https://github.com/dream-num/univer/commit/f5dcea0f3706caf281654d5dd9abf5b14b3c8b97))
* **editor:** slide editor should use a different id from sheet cell editor ([#3008](https://github.com/dream-num/univer/issues/3008)) ([b95d337](https://github.com/dream-num/univer/commit/b95d337d929e2680bc7b16a85472a196d68a597b))
* export resetCahce from sheet-skeleton ([#3087](https://github.com/dream-num/univer/issues/3087)) ([c400ab1](https://github.com/dream-num/univer/commit/c400ab19a82f614bf64687cf1f8635c08579a534))
* filtered & hidden rows should not be calculated in statusbar ([#3026](https://github.com/dream-num/univer/issues/3026)) ([803ced4](https://github.com/dream-num/univer/commit/803ced46790fafd7b6e1eee8dc36a4206d075bd6))
* fix permission initialization in multi-unit situation ([#3019](https://github.com/dream-num/univer/issues/3019)) ([fd73710](https://github.com/dream-num/univer/commit/fd737100105d75facd2930a70e0a5bd618f72075))
* fix sheet editor life ([fc08d5f](https://github.com/dream-num/univer/commit/fc08d5fd6954a48bbd8a06a5346f052cc8569924))
* **formula:** async formula ([#3025](https://github.com/dream-num/univer/issues/3025)) ([aff2b29](https://github.com/dream-num/univer/commit/aff2b29670c1e3c615f4d9f9afe37b6dd1c3e9bb))
* lint ([#3088](https://github.com/dream-num/univer/issues/3088)) ([397e446](https://github.com/dream-num/univer/commit/397e4463d6376ecd480da64636cbe78bca5e213d))
* **permission:** fix permission bugs 0815 ([#3081](https://github.com/dream-num/univer/issues/3081)) ([870cd22](https://github.com/dream-num/univer/commit/870cd22e5c444f81876f0a8d2d4cd05eafbc34ff))
* **sheet:** add from & to range in moverange & clone the cellvalue ([#3044](https://github.com/dream-num/univer/issues/3044)) ([bd91317](https://github.com/dream-num/univer/commit/bd913173c6c643b0e71e700d934611756865497d))
* **sheet:** pivot data spill ([#3039](https://github.com/dream-num/univer/issues/3039)) ([bf697b6](https://github.com/dream-num/univer/commit/bf697b6f53d75c6bb6ab3077f6f2287a57ed156b))
* **sheets-data-validation:** date data validation format not work & optimize popup-service ([#3018](https://github.com/dream-num/univer/issues/3018)) ([92dedd6](https://github.com/dream-num/univer/commit/92dedd660c4c03493bdb089075634e9cfc3321ad))
* **sheets-data-validation:** date dropdown display error on invalid value ([#3055](https://github.com/dream-num/univer/issues/3055)) ([2e89983](https://github.com/dream-num/univer/commit/2e899831bde8a08376bb2ed6b04390e786ec3135))
* **sheets-drawing-ui:** export SheetsHyperLinkCopyPasteController for usage of pro ([#3052](https://github.com/dream-num/univer/issues/3052)) ([dbf2101](https://github.com/dream-num/univer/commit/dbf21013939ec0369cefb31bbf2ab4bf36d3d8c8))
* **sheets-drawing:** drawing on uni mode ([#3009](https://github.com/dream-num/univer/issues/3009)) ([9644695](https://github.com/dream-num/univer/commit/96446951aa814a2c0aeb8865fe4cd0c4718dec90))
* **sheets-drawing:** sheet-drawing error depend on renderManagerService ([#3030](https://github.com/dream-num/univer/issues/3030)) ([efc1702](https://github.com/dream-num/univer/commit/efc17020fe45867e77dccdc7eb31a49d0e2e2d1d))
* **sheets-ui:** watch-range error on move-range ([#3060](https://github.com/dream-num/univer/issues/3060)) ([7430e84](https://github.com/dream-num/univer/commit/7430e849742cd6766081b4a02cfb9372f8703549))
* slide canvasview to slide render controller ([#3032](https://github.com/dream-num/univer/issues/3032)) ([dbdd85c](https://github.com/dream-num/univer/commit/dbdd85c705c9555b1704f7742a06b3fbaa443da5))
* slide&sheet image component-name duplicated  ([#3012](https://github.com/dream-num/univer/issues/3012)) ([afe89d4](https://github.com/dream-num/univer/commit/afe89d404d91e9587dc9284b29f015a9ece1584a))
* **slide:** init cursor stage change listener really late ([759ba75](https://github.com/dream-num/univer/commit/759ba7560d96de06a5f8fa09ecaf79dada3b3e89))
* some ui problems in uni-mode ([#3029](https://github.com/dream-num/univer/issues/3029)) ([19eb1dc](https://github.com/dream-num/univer/commit/19eb1dc8cc3c42871a416ec2484200d40460d432))
* spread operator with Math.min max cause Maximum call stack size … ([#3059](https://github.com/dream-num/univer/issues/3059)) ([1e52972](https://github.com/dream-num/univer/commit/1e52972969547b6fe3c6803301c5e8acf5c58a80))
* **ui:** move event bubbling prevention from "More" menu to button ([#3031](https://github.com/dream-num/univer/issues/3031)) ([e07e0c8](https://github.com/dream-num/univer/commit/e07e0c8c04005ccd682a501e46e401f60ec8bc35))
* **ui:** optimize Menu component rendering and filtering logic ([#3028](https://github.com/dream-num/univer/issues/3028)) ([9a19335](https://github.com/dream-num/univer/commit/9a19335a60607adfb653d49a03725c6e13994af1))
* uni drawing update ([#3016](https://github.com/dream-num/univer/issues/3016)) ([607e400](https://github.com/dream-num/univer/commit/607e4008bb16cefb3ad67ddc23423705f64e9554))
* update drawing panel state at end of changing ([#3069](https://github.com/dream-num/univer/issues/3069)) ([3a5635f](https://github.com/dream-num/univer/commit/3a5635fde53d4dbe8e1dd2e70f5ddca817f37dfd))
* worker not disposed ([#3086](https://github.com/dream-num/univer/issues/3086)) ([3da4e67](https://github.com/dream-num/univer/commit/3da4e67b3d6bf14d4b230a54ae0ea4bda8e5830f))


### Features

* add unit param for slide cmd ([#3038](https://github.com/dream-num/univer/issues/3038)) ([1d1d59c](https://github.com/dream-num/univer/commit/1d1d59c11b7b7d33278c39216fc0d136b504d187))
* **dialog:** add property to control whether click mask to close to … ([#3020](https://github.com/dream-num/univer/issues/3020)) ([8820862](https://github.com/dream-num/univer/commit/882086247352f582b6f9da6fed64f66bc8815839))
* **facade:** add sheet-data-validation facade api ([#3050](https://github.com/dream-num/univer/issues/3050)) ([9ce3f8d](https://github.com/dream-num/univer/commit/9ce3f8d88c7ea1184cc7c58c9e928344ae87421b))
* **formula:** add some engineering function ([#2893](https://github.com/dream-num/univer/issues/2893)) ([9386c6b](https://github.com/dream-num/univer/commit/9386c6bbd09361d1ad49733095e5d1dfb48becbf))
* **formula:** add some financial function ([#2868](https://github.com/dream-num/univer/issues/2868)) ([2e475b3](https://github.com/dream-num/univer/commit/2e475b32767a62c2510d653ed0e27b16c02e9f09))
* **sheet:** matrix test ([#3027](https://github.com/dream-num/univer/issues/3027)) ([8f15ea4](https://github.com/dream-num/univer/commit/8f15ea4f409c710b8d6e5e4ba980a8ad3ee4312c))
* **sheets-data-validation:** support dropdown filter & fix paste error on data-validation cell ([#3057](https://github.com/dream-num/univer/issues/3057)) ([e2e7d2a](https://github.com/dream-num/univer/commit/e2e7d2a0cc35aa13f95904d6d0ef6aeb51460a8a))
* **slides:** add text editing and shapes transform operations ([#3015](https://github.com/dream-num/univer/issues/3015)) ([3284b38](https://github.com/dream-num/univer/commit/3284b38de9a672ad03261d9d58a124ee062aac3e))
* **ui:** add use-virtual-list hooks ([#3084](https://github.com/dream-num/univer/issues/3084)) ([a17d436](https://github.com/dream-num/univer/commit/a17d436c2dc19b24cedcb615bf3175656a6cd467))
* **ui:** support modifying the toolbar items through `setMenuItem` ([#3083](https://github.com/dream-num/univer/issues/3083)) ([ff51551](https://github.com/dream-num/univer/commit/ff5155123cd916da08f317b1e1327348bff58ce8))
* **uni-formula:** support slide ([#3014](https://github.com/dream-num/univer/issues/3014)) ([b6cc556](https://github.com/dream-num/univer/commit/b6cc5562710855af57c9092ab61e7bcf5883ff07))

## [0.2.7](https://github.com/dream-num/univer/compare/v0.2.6...v0.2.7) (2024-08-10)


### Bug Fixes

* add range type when create selection ([#2965](https://github.com/dream-num/univer/issues/2965)) ([ff6a667](https://github.com/dream-num/univer/commit/ff6a6673b3e31fbb8113b34d04616b87926d8a5a))
* add rect ranges to share cursor ([#2942](https://github.com/dream-num/univer/issues/2942)) ([1d5d42f](https://github.com/dream-num/univer/commit/1d5d42face54992f5d566bcb529c690d6dea93d1))
* add table create row col limit to 20 ([#2967](https://github.com/dream-num/univer/issues/2967)) ([04accd2](https://github.com/dream-num/univer/commit/04accd2f994b93fd3b5ed7651bd787885b6ba545))
* adjust toolbar item position in uni-mode ([#2987](https://github.com/dream-num/univer/issues/2987)) ([285cdf5](https://github.com/dream-num/univer/commit/285cdf5fe867c5b727ec5f816025c5a2a2da045c))
* can not edit in footer ([#2956](https://github.com/dream-num/univer/issues/2956)) ([28c951b](https://github.com/dream-num/univer/commit/28c951b51b4f1865922280a507108ca215af8b6e))
* can not insert table in link ([#2960](https://github.com/dream-num/univer/issues/2960)) ([7448724](https://github.com/dream-num/univer/commit/7448724100dcb533b721756e76e1ebb73d298ba3))
* can not select text when the last page ends with table ([#2954](https://github.com/dream-num/univer/issues/2954)) ([d5d3b39](https://github.com/dream-num/univer/commit/d5d3b39b2e585e9a6369f2fe4e42cf3f14a27ef1))
* change element to save editing state & update doc sk after resize ([#2950](https://github.com/dream-num/univer/issues/2950)) ([35b0bac](https://github.com/dream-num/univer/commit/35b0bace8971827493cdc16159c9dea4c2d0b6d3))
* col visible ([#2981](https://github.com/dream-num/univer/issues/2981)) ([184ffdd](https://github.com/dream-num/univer/commit/184ffdd115d3d7da3c4509a3c615c8dde2852f25))
* **conditional-formatting:** can not add custom formula ([#2915](https://github.com/dream-num/univer/issues/2915)) ([e9435ee](https://github.com/dream-num/univer/commit/e9435ee7c52ed914b90ae83db29b7ce3d5540d26))
* **conditional-formatting:** fixed a performance issue during the initialization phase of the conditional format ([#2919](https://github.com/dream-num/univer/issues/2919)) ([8ddc701](https://github.com/dream-num/univer/commit/8ddc701b477a9019448aad66a82c905762a1ae76))
* context menu disable status ([#2943](https://github.com/dream-num/univer/issues/2943)) ([510c178](https://github.com/dream-num/univer/commit/510c1785d56eb23a99840fa13448558edc4141e5))
* context menu should not clear selections ([#2949](https://github.com/dream-num/univer/issues/2949)) ([b5fcb55](https://github.com/dream-num/univer/commit/b5fcb55fdee4fe4dcce3317cb3f410647ab8701e))
* **core:** fix editor set focus element by mistake ([9b0ba21](https://github.com/dream-num/univer/commit/9b0ba2146b09c6037722a22d5f836dfdf55171b0))
* **core:** fix resource loader not work for created units ([#2996](https://github.com/dream-num/univer/issues/2996)) ([9df348d](https://github.com/dream-num/univer/commit/9df348dcf3ba6622fce114cdf292ce0db6c3e4c2))
* **core:** fix resource manager get unrelated data ([#2989](https://github.com/dream-num/univer/issues/2989)) ([b29cf76](https://github.com/dream-num/univer/commit/b29cf767986b228ad6458680c239fc74d6e7cce0))
* data-validation ref-range error init form snapshot & support hyperlink target ([#2975](https://github.com/dream-num/univer/issues/2975)) ([c1a342d](https://github.com/dream-num/univer/commit/c1a342d4bceb5ec0cdce1cecd3d8f193b4deab4e))
* default setting in header and footer ([#2977](https://github.com/dream-num/univer/issues/2977)) ([eeaf78f](https://github.com/dream-num/univer/commit/eeaf78f36c3e00a3cb77274ab194c651ef821e10))
* **design:** add missing css import file ([#2991](https://github.com/dream-num/univer/issues/2991)) ([f007237](https://github.com/dream-num/univer/commit/f0072378ff52042d7046b67b819a3eca54c50209))
* disable image when select table ([#2962](https://github.com/dream-num/univer/issues/2962)) ([770385b](https://github.com/dream-num/univer/commit/770385b0269bc76abf480f9e067828cadad14338))
* **docs-thread-comment-ui:** comment when cross table ([#2939](https://github.com/dream-num/univer/issues/2939)) ([678816c](https://github.com/dream-num/univer/commit/678816cff448368a7864fe4e98a59ee76911a2ba))
* **docs-ui:** doc list indent wrong after remove list & copy paste sheet-link ([#3002](https://github.com/dream-num/univer/issues/3002)) ([94d436c](https://github.com/dream-num/univer/commit/94d436cb1f819f9e9ff7d8869e58872958e3c86b))
* **docs:** change list type error when cross table ([#2963](https://github.com/dream-num/univer/issues/2963)) ([8416e8b](https://github.com/dream-num/univer/commit/8416e8b69c4465bf3024e31d0158e86ed7874c80))
* **docs:** refresh image positions after resize ([#2976](https://github.com/dream-num/univer/issues/2976)) ([a7a3c95](https://github.com/dream-num/univer/commit/a7a3c954f096b277d859edc1519ddd45f434d686))
* export some apis of render engine ([#2941](https://github.com/dream-num/univer/issues/2941)) ([6c1211c](https://github.com/dream-num/univer/commit/6c1211ca383513ffc0426b314694f4b73202ca79))
* filter should not hidden col ([#2980](https://github.com/dream-num/univer/issues/2980)) ([683d251](https://github.com/dream-num/univer/commit/683d25194e7e53e53ad42605d4236fcaaddffeb5))
* fix create lists in table ([#2947](https://github.com/dream-num/univer/issues/2947)) ([6ac854f](https://github.com/dream-num/univer/commit/6ac854f91637c8d33400a032faa03738dff0f1bb))
* fix custom formula service not handle other units ([d4b3767](https://github.com/dream-num/univer/commit/d4b3767b7c78b2e5385e837ef45b682860dde61e))
* fix slide errors ([0145ea5](https://github.com/dream-num/univer/commit/0145ea553aea9662a998d3ca633e09b0ebf507a9))
* fix sort menu hidden$ ([4f61745](https://github.com/dream-num/univer/commit/4f617458ca55bdb287ca785aa92de1b2178dbc68))
* fix type error ([4cda2fb](https://github.com/dream-num/univer/commit/4cda2fb333d2462a848c5be8dabc20e5d7d66fb5))
* fix uni formula collab ([#2951](https://github.com/dream-num/univer/issues/2951)) ([5b75469](https://github.com/dream-num/univer/commit/5b754694b6422f3350b8dcc2ff1d8da23cdfb679))
* fix uni mode errors ([#2959](https://github.com/dream-num/univer/issues/2959)) ([de57b8e](https://github.com/dream-num/univer/commit/de57b8e2f58dc1ce8b62c8b5130cb7b499e31b09))
* fix zen editor id ([c5de1a2](https://github.com/dream-num/univer/commit/c5de1a2bd64367aead5005d4acba4a307950e5b7))
* **formula:** fix formula sheet name uppercase bug ([#2908](https://github.com/dream-num/univer/issues/2908)) ([b4122b1](https://github.com/dream-num/univer/commit/b4122b163557fa30ad39dad537951d2f793278b7))
* **formula:** fix some bugs ([#2920](https://github.com/dream-num/univer/issues/2920)) ([323e085](https://github.com/dream-num/univer/commit/323e085e9f7963aa828403cda1445aea1a08a524))
* highlight not work when select link ([#2978](https://github.com/dream-num/univer/issues/2978)) ([6a97ced](https://github.com/dream-num/univer/commit/6a97ced7e5fe1270ec5ae95027895b262b1954dd))
* image initial render ([#2921](https://github.com/dream-num/univer/issues/2921)) ([c165edc](https://github.com/dream-num/univer/commit/c165edcd9ed3cf89bfa3e313e3f50c4d69c026e8))
* **image:** switch tab error ([#2926](https://github.com/dream-num/univer/issues/2926)) ([2cee8d6](https://github.com/dream-num/univer/commit/2cee8d642bd1c69cf2178997753861e7970078a0))
* insert col right to cursor ([#2964](https://github.com/dream-num/univer/issues/2964)) ([912d666](https://github.com/dream-num/univer/commit/912d666878d6b8dab14519525c6a6abc47d07b20))
* issue [#1791](https://github.com/dream-num/univer/issues/1791) ([#2918](https://github.com/dream-num/univer/issues/2918)) ([4cba768](https://github.com/dream-num/univer/commit/4cba768e77f5e6001d661f81273e6f8e23bf24fb))
* modify the judgment logic of rich text ([#2957](https://github.com/dream-num/univer/issues/2957)) ([041f889](https://github.com/dream-num/univer/commit/041f889509f297ce74ab23077d3ba8bde783f288))
* **paragraph:** when switching from 2 lines to 1 line, the selection … ([#2997](https://github.com/dream-num/univer/issues/2997)) ([21d09eb](https://github.com/dream-num/univer/commit/21d09eb51d1b03a065fec89d190a971610eb0012))
* **permission:** permission validation performance problem ([#2916](https://github.com/dream-num/univer/issues/2916)) ([60ae402](https://github.com/dream-num/univer/commit/60ae4024f1f4d53f67dee35f82878c48d5c65e76))
* selection is wrong when select table ([#2953](https://github.com/dream-num/univer/issues/2953)) ([b15b46b](https://github.com/dream-num/univer/commit/b15b46ba67ad543e8978f54a1a7fb20052790210))
* **sheets-data-validation:** data validation validator empty ranges & comment active issue & sheet-hyper-link autofill ([#3003](https://github.com/dream-num/univer/issues/3003)) ([3271885](https://github.com/dream-num/univer/commit/3271885ad1a4c33a9b7c6e660ba59c98dbfb8879))
* **sheets-ui:** set frozen to max column should limited & doc list-paragraph optimize ([#2983](https://github.com/dream-num/univer/issues/2983)) ([64917c2](https://github.com/dream-num/univer/commit/64917c2ace9988dd5c92be1fdbb53b54f4f5cb46))
* slide editing scale ([#2999](https://github.com/dream-num/univer/issues/2999)) ([8017323](https://github.com/dream-num/univer/commit/8017323e90243c5dbd4cac287b6517adb59a8645))
* slide editor disappear when moving curor by keyboard (arrow key) ([#2972](https://github.com/dream-num/univer/issues/2972)) ([448dcb1](https://github.com/dream-num/univer/commit/448dcb158a760999a67d96ed68c4c14c3e87a2eb))
* snapshot ([#2940](https://github.com/dream-num/univer/issues/2940)) ([47ebfb7](https://github.com/dream-num/univer/commit/47ebfb7da329ece76446035e82d02e4251bfdc6d))
* **uni:** scale uni frame ([#2955](https://github.com/dream-num/univer/issues/2955)) ([ba7902f](https://github.com/dream-num/univer/commit/ba7902f311b3d76a870732b919466ef1e1f530a2))
* **uni:** uni formula service should run on server without formula ([#2946](https://github.com/dream-num/univer/issues/2946)) ([2aa0d84](https://github.com/dream-num/univer/commit/2aa0d840a5dd52db4ff328f13c5c6b8db8093088))
* **uni:** use uni formula controller to regiter commands ([d2ba71e](https://github.com/dream-num/univer/commit/d2ba71e9e9be35ca87eaf1f8edbf2571769e16bf))


### Features

* add custom err to organize command execute ([#2945](https://github.com/dream-num/univer/issues/2945)) ([05ab674](https://github.com/dream-num/univer/commit/05ab674841dc821d5b562123916d51a958304735))
* add pivot table to unitoolbar & ui fix ([#2961](https://github.com/dream-num/univer/issues/2961)) ([234b4bb](https://github.com/dream-num/univer/commit/234b4bb7ba50dd2824ebe761f99cdb108e1cfc5d))
* **bullet:** bullet support paragraph setting ([#2958](https://github.com/dream-num/univer/issues/2958)) ([0eeae77](https://github.com/dream-num/univer/commit/0eeae77b91851743e7032d9eab73eaea173737c4))
* **docs-ui:** doc list optimize ([#2900](https://github.com/dream-num/univer/issues/2900)) ([4085e7f](https://github.com/dream-num/univer/commit/4085e7f9ef08e85ba3cb0c7d240b185a04909644))
* **docs-ui:** optimize quick order-list ([#2938](https://github.com/dream-num/univer/issues/2938)) ([b59624e](https://github.com/dream-num/univer/commit/b59624e569cb4cd5d48515a46a23bcac4b82a79a))
* **docs-ui:** support doc checklist ([#2917](https://github.com/dream-num/univer/issues/2917)) ([4d3c6d3](https://github.com/dream-num/univer/commit/4d3c6d32dbfcf47839e52df2b9a35b3042ca7a9f))
* **docs:** doc support table ([#2814](https://github.com/dream-num/univer/issues/2814)) ([b5efb0d](https://github.com/dream-num/univer/commit/b5efb0deee74ad29188ff1fa3331e06f1ff661d6))
* **docs:** support paragraph pannel setting ([#2867](https://github.com/dream-num/univer/issues/2867)) ([03ea7ca](https://github.com/dream-num/univer/commit/03ea7caa2f16e7b40049409426fc17a5b5db0ca5))
* editing text and save ([#2929](https://github.com/dream-num/univer/issues/2929)) ([09a0832](https://github.com/dream-num/univer/commit/09a0832146edc873e66f2d2a58bd888f13afaeda))
* enable running get filter values in worker ([df35f3e](https://github.com/dream-num/univer/commit/df35f3e9c469d0b386cee7bfd058b940181d3171))
* extraction field ([#2931](https://github.com/dream-num/univer/issues/2931)) ([e206f75](https://github.com/dream-num/univer/commit/e206f75791a164536c94f46dbed159cf9a567180))
* **formula:** add logical functions ([#2644](https://github.com/dream-num/univer/issues/2644)) ([3e3e572](https://github.com/dream-num/univer/commit/3e3e5723a04f71b5fdcd9224a4203f34bbd249a2))
* **formula:** completion formula language package ([#2979](https://github.com/dream-num/univer/issues/2979)) ([a130132](https://github.com/dream-num/univer/commit/a130132b167bede6a32d9404772b121700c11a6c))
* **pivot:** support pivot table in interceptor & formula ([#2923](https://github.com/dream-num/univer/issues/2923)) ([cf8f492](https://github.com/dream-num/univer/commit/cf8f4922fbbc57fb2f86e65b4d48e128680dbeea))
* return unrecognized for non-existing unit ([0c2527a](https://github.com/dream-num/univer/commit/0c2527a6e77cfffd456e162cbda6ecb05416d9cd))
* set min-zoom to 0.1 ([#3001](https://github.com/dream-num/univer/issues/3001)) ([a90f948](https://github.com/dream-num/univer/commit/a90f94812cde059f83e477d2004c078f9a4984ce))
* slide toolbar&sidebar in uni-mode ([#2984](https://github.com/dream-num/univer/issues/2984)) ([3b72764](https://github.com/dream-num/univer/commit/3b7276457f37376679c806f3c943c5c7d4d821f0))
* **slides:** add basic support for editing shapes and images ([#2933](https://github.com/dream-num/univer/issues/2933)) ([a5f23b9](https://github.com/dream-num/univer/commit/a5f23b9751a8bb744592f07c85b46e2b271ba349))
* **slides:** add text editor ([#2925](https://github.com/dream-num/univer/issues/2925)) ([1817267](https://github.com/dream-num/univer/commit/1817267e456a037a27502f90d82bde0baba1966d))
* **slides:** add update element operation ([#3000](https://github.com/dream-num/univer/issues/3000)) ([eb08779](https://github.com/dream-num/univer/commit/eb087796fc70f1688b86ef0af1086bcce9352172))
* uni mode ([#2827](https://github.com/dream-num/univer/issues/2827)) ([36ac2bf](https://github.com/dream-num/univer/commit/36ac2bf2bee028e4e4ca9d59d14d9282ba6d0276))

## [0.2.6](https://github.com/dream-num/univer/compare/v0.2.5...v0.2.6) (2024-08-02)


### Bug Fixes

* **doc:** list update ([#2862](https://github.com/dream-num/univer/issues/2862)) ([b045042](https://github.com/dream-num/univer/commit/b045042001c931d37410bab54acffbde7459237e))
* **docs-drawing:** formula ts error & docs-drawing load error ([#2879](https://github.com/dream-num/univer/issues/2879)) ([1182bee](https://github.com/dream-num/univer/commit/1182bee68dc5005eb18e116f38fa021548544a46))
* **drawing:** update ([#2871](https://github.com/dream-num/univer/issues/2871)) ([1880552](https://github.com/dream-num/univer/commit/1880552c0054d3eff14d7a41966ea0f3f195a2fe))
* **formula:** fix formula parameter assignment ([#2905](https://github.com/dream-num/univer/issues/2905)) ([8fb9655](https://github.com/dream-num/univer/commit/8fb965587023748d35f073d470bcc0b262ff61c1))
* ref selection should call updateSelection after skelenton change ([#2839](https://github.com/dream-num/univer/issues/2839)) ([d37f669](https://github.com/dream-num/univer/commit/d37f6692dbe745426eb77888565ffde3df4e539f))
* **sheet:** fix expand range performance ([#2882](https://github.com/dream-num/univer/issues/2882)) ([0de3488](https://github.com/dream-num/univer/commit/0de3488677144bfbdc4160bea2f38e617a87ed1c))
* **sheet:** parse snapshot string ([#2897](https://github.com/dream-num/univer/issues/2897)) ([f4fe38d](https://github.com/dream-num/univer/commit/f4fe38df536d551064c7b4703c52a2e43e4ee952))
* **ui:** ensure container DOM is removed when destroying Vue 3 components ([#2892](https://github.com/dream-num/univer/issues/2892)) ([5c38528](https://github.com/dream-num/univer/commit/5c385287b20b87720ac4c4761a8c044f80417cbb))
* unitId type error in handle editor invisible ([#2907](https://github.com/dream-num/univer/issues/2907)) ([5e09017](https://github.com/dream-num/univer/commit/5e09017670dc7502ee3687a3b97238318c1ce69c))
* use new selectionData not workbook._worksheetSelections ([#2909](https://github.com/dream-num/univer/issues/2909)) ([b597194](https://github.com/dream-num/univer/commit/b597194250d1615ad9b3052d911af3c2e04397b1))


### Features

* deprecated float-dom.props ([#2864](https://github.com/dream-num/univer/issues/2864)) ([43220a1](https://github.com/dream-num/univer/commit/43220a12aca5dc08f99aedc20fefc7efafe52f20))
* **docs-ui:** debounce doc-hover event ([#2865](https://github.com/dream-num/univer/issues/2865)) ([ce949fd](https://github.com/dream-num/univer/commit/ce949fde72476196ee563ac4b0ed5dd1b9bd598e))
* **docs-ui:** doc daily optimization ([#2869](https://github.com/dream-num/univer/issues/2869)) ([f0b6410](https://github.com/dream-num/univer/commit/f0b6410362e84b3a881204241a9b277c4bb0709c))
* **docs:** doc-rename ([#2891](https://github.com/dream-num/univer/issues/2891)) ([307d1de](https://github.com/dream-num/univer/commit/307d1debbc0dcd661bc529a3b529d0aa38099d34))
* **formula:** add some Text/Math/Lookup formulas ([#2842](https://github.com/dream-num/univer/issues/2842)) ([778e371](https://github.com/dream-num/univer/commit/778e371c53f41c0dbc1b4775e9256267ed275a42))
* **numfmt:** support custom format ([#2888](https://github.com/dream-num/univer/issues/2888)) ([95314eb](https://github.com/dream-num/univer/commit/95314ebe593b5c33f56044d8ccefdd6de6c08bae))
* **sheet-data-valiation:** using cell-raw on data-validation ([#2878](https://github.com/dream-num/univer/issues/2878)) ([935bdba](https://github.com/dream-num/univer/commit/935bdba18926b1905b934cfa790cde92dcd6fd0e))
* **slides:** support partial slides function ([#2890](https://github.com/dream-num/univer/issues/2890)) ([3a90918](https://github.com/dream-num/univer/commit/3a90918b370fc5954e0ce38df4de6df20acc0089))


### Performance Improvements

* skip hidden row & col in sheet's extension drawing process ([#2899](https://github.com/dream-num/univer/issues/2899)) ([5dcfaa3](https://github.com/dream-num/univer/commit/5dcfaa3fa839a0944481113936c1669a721d39ec))

## [0.2.5](https://github.com/dream-num/univer/compare/v0.2.4...v0.2.5) (2024-07-26)


### Bug Fixes

* **conditional-formatting:** close panel when switch subunit ([#2828](https://github.com/dream-num/univer/issues/2828)) ([6e772bc](https://github.com/dream-num/univer/commit/6e772bc9fbc5c2dea88f46e54331e2c6e4f93995))
* doc-resize causing formula error ([#2857](https://github.com/dream-num/univer/issues/2857)) ([8d037a2](https://github.com/dream-num/univer/commit/8d037a264d02c05ca972846a657374ec14bcc108))
* **editor:** paste and selection error ([#2843](https://github.com/dream-num/univer/issues/2843)) ([e6869e4](https://github.com/dream-num/univer/commit/e6869e49fd125a5d38399c7c74fe37aa7df2584b))
* **formula:** array formula clear old value ([#2840](https://github.com/dream-num/univer/issues/2840)) ([efb5ecd](https://github.com/dream-num/univer/commit/efb5ecd45b8c7248d74baf696fcd567661d4b540))
* **formula:** feature calculation update ([#2838](https://github.com/dream-num/univer/issues/2838)) ([f66e5a7](https://github.com/dream-num/univer/commit/f66e5a7485e95b2288676bbf63729e904dd757b6))
* get SheetScrollManagerService from renderManagerSrv ([#2833](https://github.com/dream-num/univer/issues/2833)) ([ce4e7c4](https://github.com/dream-num/univer/commit/ce4e7c40ac886630089fc92d01391b6b62834eee))
* move selection ([#2832](https://github.com/dream-num/univer/issues/2832)) ([b4205ff](https://github.com/dream-num/univer/commit/b4205ff9f865a89c5db41a2bfa7f63170ee6c99c))
* ref selection ([#2770](https://github.com/dream-num/univer/issues/2770)) ([e885f76](https://github.com/dream-num/univer/commit/e885f76e0160fdb575b6ffc8353be7a85f0d0d49))
* **sheet:** blur table name triggers slide ([#2772](https://github.com/dream-num/univer/issues/2772)) ([c328662](https://github.com/dream-num/univer/commit/c32866205df95efdd0a22778297745ac45533673))
* **sheets-drawing-ui:** load float-dom from snapshot & support presist custom data with float dom drawing object ([#2841](https://github.com/dream-num/univer/issues/2841)) ([ca38723](https://github.com/dream-num/univer/commit/ca3872381879c9c0d546d085c38661e6a39b4572))
* **sheets-ui:** formula editor can't exit ([#2858](https://github.com/dream-num/univer/issues/2858)) ([eb3c0dd](https://github.com/dream-num/univer/commit/eb3c0dde7e4ecd3655e1832524a072517945eb0a))
* **sheet:** type import ([#2848](https://github.com/dream-num/univer/issues/2848)) ([ae0b012](https://github.com/dream-num/univer/commit/ae0b012c0bd0aaaa90c45d60883be330de5c03a4))


### Features

* **core:** optimize url validator & popup on selection moving ([#2845](https://github.com/dream-num/univer/issues/2845)) ([c6ab2a7](https://github.com/dream-num/univer/commit/c6ab2a71ad37431e43e1553c11dd0b16a71f1ae6))
* **data-validation:** code optimize for data-validation ([#2815](https://github.com/dream-num/univer/issues/2815)) ([ab242a3](https://github.com/dream-num/univer/commit/ab242a32a1efabe15b6024c2fd45f11166a639a4))
* **docs-thread-comment-ui:** doc datasource ([#2851](https://github.com/dream-num/univer/issues/2851)) ([b3ae99a](https://github.com/dream-num/univer/commit/b3ae99a4d90e82e7cf9b274b5ea79319c0420797))
* **docs-ui:** support docs zoom bar & context menu ([#2830](https://github.com/dream-num/univer/issues/2830)) ([d840cb5](https://github.com/dream-num/univer/commit/d840cb5db042bda8214bc1f2c210ec3f58e10662))
* **docs:** support doc-hover-service ([#2824](https://github.com/dream-num/univer/issues/2824)) ([28dbb78](https://github.com/dream-num/univer/commit/28dbb786a32cb67d38098344578e2525623162f0))
* **formula:** add some information and date function ([#2798](https://github.com/dream-num/univer/issues/2798)) ([6b3413e](https://github.com/dream-num/univer/commit/6b3413e33f2d9756ab3ae0cdf1999abd0ba37d15))
* **formula:** add some math function ([#2761](https://github.com/dream-num/univer/issues/2761)) ([344f4dd](https://github.com/dream-num/univer/commit/344f4dd5f77430b37b2bb6b53319e1107787a694))
* **formula:** get dirty data ([#2837](https://github.com/dream-num/univer/issues/2837)) ([b3ebd79](https://github.com/dream-num/univer/commit/b3ebd7970309afd012fbdea4afaaca847417fe56))

## [0.2.4](https://github.com/dream-num/univer/compare/v0.2.3...v0.2.4) (2024-07-19)


### Bug Fixes

* **conditional-formatting:** adjust the frequency of calculations ([#2804](https://github.com/dream-num/univer/issues/2804)) ([1b65361](https://github.com/dream-num/univer/commit/1b65361aa2ab1da17bd7ac2ac54cf755b4ea2d0c))
* **core:** merge range util error ([#2776](https://github.com/dream-num/univer/issues/2776)) ([7a41b9c](https://github.com/dream-num/univer/commit/7a41b9cd7151cadea767d0187423bc7c8aac6880))
* **design:** add class name as poperty of select list ([#2788](https://github.com/dream-num/univer/issues/2788)) ([f78b538](https://github.com/dream-num/univer/commit/f78b538f0f78094c8909bda1e7f60f9542c638fd))
* **doc:** default line pitch ([#2805](https://github.com/dream-num/univer/issues/2805)) ([ae466b2](https://github.com/dream-num/univer/commit/ae466b2f9ca7f08f8ae71dc1f8bc4fd9b5d94c4a))
* fix invalid color str in paste ([#2783](https://github.com/dream-num/univer/issues/2783)) ([d0ac904](https://github.com/dream-num/univer/commit/d0ac9042f693a64c4d1696d2d176242d2c37d1bb))
* **formula:** formula carries numfmt of ref cell ([#2756](https://github.com/dream-num/univer/issues/2756)) ([30b3b24](https://github.com/dream-num/univer/commit/30b3b24d356e7a986ddc85138c75fd7eacd909a0))
* **formula:** great than equal error ([#2758](https://github.com/dream-num/univer/issues/2758)) ([65e471d](https://github.com/dream-num/univer/commit/65e471dcc2b4a17d0463f26de6e4ee6678624071))
* min cursor height and move cursor ([#2789](https://github.com/dream-num/univer/issues/2789)) ([beb9146](https://github.com/dream-num/univer/commit/beb91465435c9b80e8c69b31e2dbc99ba9b2a98d))
* **permission:** optimize formula bar permission & resize header permission ([#2603](https://github.com/dream-num/univer/issues/2603)) ([de05ff8](https://github.com/dream-num/univer/commit/de05ff8a045c1062f12a3ed2a6325ac58b19c446))
* **permission:** when user exists should not set again ([#2799](https://github.com/dream-num/univer/issues/2799)) ([99a56dc](https://github.com/dream-num/univer/commit/99a56dce8f833c5c2d33e2792ff6f33e28ab2310))
* **selection:** selection error after insert col ([#2786](https://github.com/dream-num/univer/issues/2786)) ([a02b719](https://github.com/dream-num/univer/commit/a02b719d627d40f1b39b06a00b0884e990894848))
* **sheet:** copy&paste clip cell ([#2773](https://github.com/dream-num/univer/issues/2773)) ([af845a2](https://github.com/dream-num/univer/commit/af845a253e0c569b57803ce13417e2362fe961e0))
* **sheet:** range selector and editor ([#2748](https://github.com/dream-num/univer/issues/2748)) ([15b1d8e](https://github.com/dream-num/univer/commit/15b1d8e9fbd0f6a981dca1f812353a8e099c2ed3))
* **sheets-data-validation:** data-validation perf issues ([#2810](https://github.com/dream-num/univer/issues/2810)) ([3a4de22](https://github.com/dream-num/univer/commit/3a4de22ac9787973a337d5b8ada21ee7b857bae8))
* **sheets-drawing-ui:** float-dom deps error ([#2791](https://github.com/dream-num/univer/issues/2791)) ([0a6d4d1](https://github.com/dream-num/univer/commit/0a6d4d19a82ee850a9f2b5a2b1d0f91be3a163e0))
* **sheets-hyper-link:** re-render perf issue ([#2812](https://github.com/dream-num/univer/issues/2812)) ([706aa04](https://github.com/dream-num/univer/commit/706aa04608b4dc7a1905146a1cbf63a67bcd2f57))
* **sheets-ui:** bugfix for data-validation/comments ([#2734](https://github.com/dream-num/univer/issues/2734)) ([75bb1f6](https://github.com/dream-num/univer/commit/75bb1f601f21f5a319894a9968956cb0f7f708d1))
* **ui:** fix focus editor position with padding ([#2819](https://github.com/dream-num/univer/issues/2819)) ([57dd020](https://github.com/dream-num/univer/commit/57dd020eb3c587871d985bc3243897ec15b1c4cb))


### Features

* add method to get message portal container ([#2775](https://github.com/dream-num/univer/issues/2775)) ([603d62e](https://github.com/dream-num/univer/commit/603d62ea2902b69c2c9af081217198584aeafec0))
* **docs-mention-ui:** support docs-mention  ([#2785](https://github.com/dream-num/univer/issues/2785)) ([57232a5](https://github.com/dream-num/univer/commit/57232a50b7e14c6eeea998e1a1e2b93aeacb298d))
* **docs-mention:** add resource-controller ([#2803](https://github.com/dream-num/univer/issues/2803)) ([37a1d58](https://github.com/dream-num/univer/commit/37a1d58add6672711c1dae00fdc52d69fdb10759))
* **docs:** image in header and footer ([#2747](https://github.com/dream-num/univer/issues/2747)) ([0fe6867](https://github.com/dream-num/univer/commit/0fe6867b9c875fd5ec51359ff31696d61527760b))
* **formula:** add some date function ([#2729](https://github.com/dream-num/univer/issues/2729)) ([26af2cc](https://github.com/dream-num/univer/commit/26af2cc0ac6a0cdf178aecd795bc2d945d892645))
* **permission:** initial permission is modified to false for the set… ([#2768](https://github.com/dream-num/univer/issues/2768)) ([c2f3056](https://github.com/dream-num/univer/commit/c2f3056e551957efcf8f73ce6d79902a0535127e))
* **sheet:** init history permission point in sheet ([#2790](https://github.com/dream-num/univer/issues/2790)) ([dc04d7a](https://github.com/dream-num/univer/commit/dc04d7af98c6e491024dee0ef8ba8603ead81b0a))
* **uni:** init uni mode ([#2793](https://github.com/dream-num/univer/issues/2793)) ([8228c5a](https://github.com/dream-num/univer/commit/8228c5a6251621bb0c22a8c8eb0bbd28fd31ffd0))

## [0.2.3](https://github.com/dream-num/univer/compare/v0.2.0...v0.2.3) (2024-07-12)


### Bug Fixes

* backspace in header and footer ([#2704](https://github.com/dream-num/univer/issues/2704)) ([749b407](https://github.com/dream-num/univer/commit/749b407fddbb2b8386924fffe2070f4c68919857))
* **docs-hyper-link:** hyper link resource ([#2732](https://github.com/dream-num/univer/issues/2732)) ([1b17ec5](https://github.com/dream-num/univer/commit/1b17ec5127b97898a8f00b97c0f692fda99fcaf9))
* **docs:** fix blank screen ([#2720](https://github.com/dream-num/univer/issues/2720)) ([fbed267](https://github.com/dream-num/univer/commit/fbed26731a67ca146be9ecf350fa7d8d2b99c8ed))
* failed to get scene in scroll render controller ([#2737](https://github.com/dream-num/univer/issues/2737)) ([987c5d2](https://github.com/dream-num/univer/commit/987c5d267146ab70039eda43c5073a1da9c4d9de))
* fix replace content params options ([c2bbaaf](https://github.com/dream-num/univer/commit/c2bbaaf03618b0193e4ceaf1ba8b416089593e14))
* **formula:** len counts displayed value ([#2702](https://github.com/dream-num/univer/issues/2702)) ([ce887b0](https://github.com/dream-num/univer/commit/ce887b058d8ca26f87ae7bafda9211f0176a1805))
* load resource ([#2752](https://github.com/dream-num/univer/issues/2752)) ([9606194](https://github.com/dream-num/univer/commit/960619473b9786db26aa2e8746c1facbae4dd5cf))
* **sheet:** keep text formatting when setting range value ([#2711](https://github.com/dream-num/univer/issues/2711)) ([a1a3dbc](https://github.com/dream-num/univer/commit/a1a3dbcd829dfb585162945369c6ee51db9c55e1))
* **sheets-hyper-link-ui:** popup observable error on react16 ([#2755](https://github.com/dream-num/univer/issues/2755)) ([f0edc5b](https://github.com/dream-num/univer/commit/f0edc5b0f2a12f8cbb2eebd7591a26a522207617))
* tons of memory leak ([#2754](https://github.com/dream-num/univer/issues/2754)) ([3f3dcff](https://github.com/dream-num/univer/commit/3f3dcff2fd0ead417d2fe522c74c893c23221745))
* **ui:** fix issue where context menu item cannot be selected in React 16 ([#2739](https://github.com/dream-num/univer/issues/2739)) ([d971be9](https://github.com/dream-num/univer/commit/d971be91909bd9d38ded67c367668ccc903e717b))
* **umd:** fix issue with datepicker localization not working in UMD bundle ([#2719](https://github.com/dream-num/univer/issues/2719)) ([962e057](https://github.com/dream-num/univer/commit/962e05778e67f70c7f9bb795a9f9d6a1dd484ddb))


### Features

* **formula:** add more functions ([#2701](https://github.com/dream-num/univer/issues/2701)) ([8598e02](https://github.com/dream-num/univer/commit/8598e028c0ff2129b98a3b0e09428388b9dcb1df))
* **formula:** enable cancellation of ongoing formula calculations ([#2661](https://github.com/dream-num/univer/issues/2661)) ([5d80993](https://github.com/dream-num/univer/commit/5d80993cd76ad9f62748a1bc6451aa85a3b67eb1))
* **i18n:** add `zh-TW`, `vi-VN` language ([#2694](https://github.com/dream-num/univer/issues/2694)) ([2f99d19](https://github.com/dream-num/univer/commit/2f99d19aeacab3f0574df7a1f6e61bad0062f57e))
* **network:** add merge interceptor ([#2749](https://github.com/dream-num/univer/issues/2749)) ([6a0c1b7](https://github.com/dream-num/univer/commit/6a0c1b7e3abca62e284bd82c431b249831f61866))
* optimization of doc image ([#2432](https://github.com/dream-num/univer/issues/2432)) ([3f98681](https://github.com/dream-num/univer/commit/3f98681655478056b27e1ee0f3f2d840d0392d4d))
* **permission:** support refresh ([#2740](https://github.com/dream-num/univer/issues/2740)) ([710e26a](https://github.com/dream-num/univer/commit/710e26afaac3f2c53cf51d1a4097587e2e3e9fb5))
* **sheets-data-validation:** support show-time when set validation at `date` ([#2723](https://github.com/dream-num/univer/issues/2723)) ([737660e](https://github.com/dream-num/univer/commit/737660e5205e60a72762cdc7cce06f8b08c21dab))
* sidebar-service supports scroll-event subscription ([#2724](https://github.com/dream-num/univer/issues/2724)) ([2da550d](https://github.com/dream-num/univer/commit/2da550df5950ae8f0e78d4906818f93bf414fe4c))
* **ui:** change floating position ([#2698](https://github.com/dream-num/univer/issues/2698)) ([f2fbd3b](https://github.com/dream-num/univer/commit/f2fbd3bdf1f2110469179de1afc132cfe1941bf8))


### Reverts

* "chore: image menu show on insert position" ([#2714](https://github.com/dream-num/univer/issues/2714)) ([2965f28](https://github.com/dream-num/univer/commit/2965f28ba729c80800e84150bae87970a41fa2cf))

## [0.2.2](https://github.com/dream-num/univer/compare/v0.2.1...v0.2.2) (2024-07-09)


### Bug Fixes

* **docs:** fix blank screen ([#2720](https://github.com/dream-num/univer/issues/2720)) ([92ee024](https://github.com/dream-num/univer/commit/92ee024cd41681eab2f338f04e04a1ed3eca94ca))

## [0.2.1](https://github.com/dream-num/univer/compare/v0.2.0...v0.2.1) (2024-07-08)


### Reverts

* "chore: image menu show on insert position" ([#2714](https://github.com/dream-num/univer/issues/2714)) ([c077cb3](https://github.com/dream-num/univer/commit/c077cb3f71ab767ad8c3383a41adda4a03850336))

# [0.2.0](https://github.com/dream-num/univer/compare/v0.1.17...v0.2.0) (2024-07-06)


### Bug Fixes

* add correct RU translation in Sort and Hyperlink plugins ([#2685](https://github.com/dream-num/univer/issues/2685)) ([9616c44](https://github.com/dream-num/univer/commit/9616c44f3ec98c64271233a5f43929624f8dd5e1))
* **docs-ui:** disable link & comment on header footer ([#2700](https://github.com/dream-num/univer/issues/2700)) ([f93a229](https://github.com/dream-num/univer/commit/f93a2294eae3fcc31720a4883a1410d7c63cf9b3))
* **docs:** backspace in header ([#2703](https://github.com/dream-num/univer/issues/2703)) ([000e88d](https://github.com/dream-num/univer/commit/000e88d7bd3db3f797797234ce268734b6941743))
* drawing issues ([#2639](https://github.com/dream-num/univer/issues/2639)) ([7d35091](https://github.com/dream-num/univer/commit/7d350912b5dc2a2378bf5dbf99ede3c653f264d0))
* **drawing:** regster by sheet transform ([#2672](https://github.com/dream-num/univer/issues/2672)) ([59a117a](https://github.com/dream-num/univer/commit/59a117ab53b2f4b2f54290e7f978f842bdfbf70e))
* **editor:**  fix the wrong position of validate messages on initialization when the sidebar is open ([#2676](https://github.com/dream-num/univer/issues/2676)) ([749dd74](https://github.com/dream-num/univer/commit/749dd74ba602e5c0ec5db70c218e1cc37fc7e1c6))
* **facade:** fix implementation of `getWrap` and remove redundant `getWraps` method ([#2675](https://github.com/dream-num/univer/issues/2675)) ([6e2ef32](https://github.com/dream-num/univer/commit/6e2ef32809fbb56397dd6c4d7d7fbd0ed7698e39))
* **formula:** ref a1:a gets name error ([#2666](https://github.com/dream-num/univer/issues/2666)) ([692b30c](https://github.com/dream-num/univer/commit/692b30cd6eab3192390dc1e7ccd94bcb25d11379))
* **formula:** row range calculation error ([#2649](https://github.com/dream-num/univer/issues/2649)) ([3dcedc2](https://github.com/dream-num/univer/commit/3dcedc224703f32ce08c8b489e64054a0d1b67ed))
* **formula:** ts error in averageif ([#2656](https://github.com/dream-num/univer/issues/2656)) ([6179726](https://github.com/dream-num/univer/commit/6179726f9206960465bcaf553efb6ccd269e5a39))
* optimize the the menu and prefer apply-type of auto-fill ([#2638](https://github.com/dream-num/univer/issues/2638)) ([b1e1ef4](https://github.com/dream-num/univer/commit/b1e1ef43052f8c50f66c4185c685082c25c4179a))
* **shees-ui:** add missing menu configs ([#2635](https://github.com/dream-num/univer/issues/2635)) ([31c7dbf](https://github.com/dream-num/univer/commit/31c7dbf0ecb961d8dc0c0b86525b28ec44296263))
* **sheet:** dependency error ([#2650](https://github.com/dream-num/univer/issues/2650)) ([4ec356d](https://github.com/dream-num/univer/commit/4ec356d2279549c603475c3a09cd597a137eab1f))
* **sheet:** drawing load ([#2692](https://github.com/dream-num/univer/issues/2692)) ([2c5011e](https://github.com/dream-num/univer/commit/2c5011e17bf92ac707b4ee966b02f1a3b96b0585)), closes [#2683](https://github.com/dream-num/univer/issues/2683) [#2685](https://github.com/dream-num/univer/issues/2685)
* **sheet:** drawing switch tab position error ([#2686](https://github.com/dream-num/univer/issues/2686)) ([bd5293c](https://github.com/dream-num/univer/commit/bd5293c6fd0d0ec6cfa1f9ccaa3a2c5dac5c4436))
* **sheet:** freeze invalid ([#2658](https://github.com/dream-num/univer/issues/2658)) ([03982b7](https://github.com/dream-num/univer/commit/03982b7874dcdd18b5b79890ec3f0533d0d3cbd6))
* **sheet:** line default error ([#2641](https://github.com/dream-num/univer/issues/2641)) ([01c1b32](https://github.com/dream-num/univer/commit/01c1b32439d1082806e36018fd6edb62123589bf))
* **sheet:** pasting plain text with newline and tab characters ([#2678](https://github.com/dream-num/univer/issues/2678)) ([de987cc](https://github.com/dream-num/univer/commit/de987ccd27c61628edb3989c3a3fe99302db2acb))
* **sheets-ui:** ensure context menu does not open on sheets tab when `contextMenu` is set to false ([#2654](https://github.com/dream-num/univer/issues/2654)) ([a5ecccc](https://github.com/dream-num/univer/commit/a5ecccc74f3577bcf2cbe906e9411e1258e93e54))
* **sheets-ui:** fix focusout issue with rename input box in lower version of React ([#2662](https://github.com/dream-num/univer/issues/2662)) ([6f74450](https://github.com/dream-num/univer/commit/6f744508c01b14546aa976aff8986e43f77eb320))
* **sheets-ui:** fix formula editor's position issue in lower version of React ([#2667](https://github.com/dream-num/univer/issues/2667)) ([e5020d7](https://github.com/dream-num/univer/commit/e5020d72c892ce7fe310c7e4da863b6048bfc812))
* **slide:** remove duplicated calls to render.engine.setContainer ([#2688](https://github.com/dream-num/univer/issues/2688)) ([76e93f3](https://github.com/dream-num/univer/commit/76e93f3490c30e70a3946b102f8604be861b1653))


### Features

* doc support header and footer ([#2589](https://github.com/dream-num/univer/issues/2589)) ([9b6cdf6](https://github.com/dream-num/univer/commit/9b6cdf69146ed82c0dd3bfc4cc217f0eaf252e3a))
* **docs-ui:** hyper-link support for doc ([#2681](https://github.com/dream-num/univer/issues/2681)) ([2e80ef0](https://github.com/dream-num/univer/commit/2e80ef018d8b3a84b619bb62950c2ea057802076)), closes [#1267](https://github.com/dream-num/univer/issues/1267) [#1363](https://github.com/dream-num/univer/issues/1363) [#1391](https://github.com/dream-num/univer/issues/1391) [#1407](https://github.com/dream-num/univer/issues/1407) [#2683](https://github.com/dream-num/univer/issues/2683) [#2685](https://github.com/dream-num/univer/issues/2685) [#2686](https://github.com/dream-num/univer/issues/2686) [#2620](https://github.com/dream-num/univer/issues/2620) [#2687](https://github.com/dream-num/univer/issues/2687)
* **formula:** add asin function ([#2620](https://github.com/dream-num/univer/issues/2620)) ([88bde30](https://github.com/dream-num/univer/commit/88bde30526142e0b49e793ee2f7e6779617573be))
* **formula:** add MINIFS,AVERAGEIF,AVERAGEIFS functions ([#2561](https://github.com/dream-num/univer/issues/2561)) ([909f2ee](https://github.com/dream-num/univer/commit/909f2ee1ed620659d7658f65cb7f1b40679e5d0a))
* **formula:** add now,time,datevalue,timevalue function ([#2598](https://github.com/dream-num/univer/issues/2598)) ([fbf4548](https://github.com/dream-num/univer/commit/fbf454851a02ace316d67533912a215642134a45))
* make toolbar configurable ([#2634](https://github.com/dream-num/univer/issues/2634)) ([4852646](https://github.com/dream-num/univer/commit/48526467b6cb455d5d0203be3e7b5e73509fb39b))
* scroll and selection for mobile version ([#2657](https://github.com/dream-num/univer/issues/2657)) ([62e5b64](https://github.com/dream-num/univer/commit/62e5b643b8d6b3a3eae6e936a608ac8966c1a7b8))
* **sheet:** export vars for sort plugin ([#2587](https://github.com/dream-num/univer/issues/2587)) ([4c1c3de](https://github.com/dream-num/univer/commit/4c1c3defe8cf2bc66050132a9a6b8e26cd479bd7))
* **sheet:** restart formula calculation ([#2646](https://github.com/dream-num/univer/issues/2646)) ([b1be75c](https://github.com/dream-num/univer/commit/b1be75c576dce8b34f47e94704b6129badb84978))
* **sheets-data-validation:** daily bugfix for data-validation ([#2637](https://github.com/dream-num/univer/issues/2637)) ([21008f9](https://github.com/dream-num/univer/commit/21008f972400d65bee4f2c49ea4db50badfffee9)), closes [#1267](https://github.com/dream-num/univer/issues/1267) [#1363](https://github.com/dream-num/univer/issues/1363) [#1391](https://github.com/dream-num/univer/issues/1391) [#1407](https://github.com/dream-num/univer/issues/1407)
* **sheet:** sheet name check ([#2660](https://github.com/dream-num/univer/issues/2660)) ([fd8f8ac](https://github.com/dream-num/univer/commit/fd8f8ac5a036e38b52b560fcea1b0e6cb4d65536))
* **slides:** add sidebar highlighting for selected items in slides ([#2691](https://github.com/dream-num/univer/issues/2691)) ([04fbb05](https://github.com/dream-num/univer/commit/04fbb05e95e44103e59ae20bed6f5ab95b974c9d))
* **thread-comment:** support server intercept for comment & docs-comment ([#2619](https://github.com/dream-num/univer/issues/2619)) ([02dff82](https://github.com/dream-num/univer/commit/02dff8212bca66b6d21ca6f0d84341311740e176)), closes [#1267](https://github.com/dream-num/univer/issues/1267) [#1363](https://github.com/dream-num/univer/issues/1363) [#1391](https://github.com/dream-num/univer/issues/1391) [#1407](https://github.com/dream-num/univer/issues/1407)
* **ui:** change floating position ([#2693](https://github.com/dream-num/univer/issues/2693)) ([9c59dee](https://github.com/dream-num/univer/commit/9c59deeb3873c46880124546eb9e5af288f188ad))


### Reverts

* Revert "feat(ui): change floating position (#2693)" (#2696) ([0d17693](https://github.com/dream-num/univer/commit/0d17693b45b2b42da505858cbd7a12fb0a468bf4)), closes [#2693](https://github.com/dream-num/univer/issues/2693) [#2696](https://github.com/dream-num/univer/issues/2696)

## [0.1.17](https://github.com/dream-num/univer/compare/v0.1.16...v0.1.17) (2024-06-28)


### Bug Fixes

* **conditional-formatting:** disable clear cf ([#2601](https://github.com/dream-num/univer/issues/2601)) ([cf60994](https://github.com/dream-num/univer/commit/cf609949ee15c0bf8d5a92576429651fa8729eee))
* **conditional-formatting:** distinguish between settings and purges when padding down ([#2605](https://github.com/dream-num/univer/issues/2605)) ([6dd8bbe](https://github.com/dream-num/univer/commit/6dd8bbee935919d13636cec106ccfe51c24c99d7))
* **conditional-formatting:** reopen panel and update panel ([#2608](https://github.com/dream-num/univer/issues/2608)) ([b4460ca](https://github.com/dream-num/univer/commit/b4460caff3477465747f451fe52fcdaf77d816e5))
* fix some paste bugs ([#2612](https://github.com/dream-num/univer/issues/2612)) ([cfd3227](https://github.com/dream-num/univer/commit/cfd32278fe8ac99e93ba0a43e0b7c64ebda3edcc))
* **formula:** remove non-existent formula ids ([#2531](https://github.com/dream-num/univer/issues/2531)) ([656c337](https://github.com/dream-num/univer/commit/656c3372fd96d7adbbdcf2e2d8ac55032d3b5cfd))
* **formula:** subtotal count ([#2452](https://github.com/dream-num/univer/issues/2452)) ([61de312](https://github.com/dream-num/univer/commit/61de312f8c9a56a3a1360ec583e96e547ac08f6b))
* icon set dropdown style ([#2602](https://github.com/dream-num/univer/issues/2602)) ([c6e23cd](https://github.com/dream-num/univer/commit/c6e23cd6f71cd52451c9d4478478e3bfa1dab949))
* **move-range:** add move range controller ([#2609](https://github.com/dream-num/univer/issues/2609)) ([3950878](https://github.com/dream-num/univer/commit/3950878e2b587ff637f81c4f12f9bd89f8b67d2e))
* **numfmt:** numfmt not render after auto fill ([#2617](https://github.com/dream-num/univer/issues/2617)) ([111bc9f](https://github.com/dream-num/univer/commit/111bc9f4ee61a2659e8d2ac8bed95d2f6f16c4bf))
* **numfmt:** reselect item and throw error ([#2611](https://github.com/dream-num/univer/issues/2611)) ([9902edb](https://github.com/dream-num/univer/commit/9902edb6afeb20f0a6dfcbb4c1b996a5f6976224))
* **range-selector:** placeholder flush ([#2607](https://github.com/dream-num/univer/issues/2607)) ([2dc7ce0](https://github.com/dream-num/univer/commit/2dc7ce04fee41957482b33acbf0dd197fca86e12))
* **sheet:** duplicate sheet name copy ([#2544](https://github.com/dream-num/univer/issues/2544)) ([50f8f4d](https://github.com/dream-num/univer/commit/50f8f4d8b4c349a8c74299269c689f219576b3f9))
* **sheet:** get unhidden sheets ([#2616](https://github.com/dream-num/univer/issues/2616)) ([bcc4034](https://github.com/dream-num/univer/commit/bcc40340853666578ce8ed36cc5a4216d5a9874a))
* **sheets-drawing:** fix crash when editing text after inserting images and opening the sidebar ([#2586](https://github.com/dream-num/univer/issues/2586)) ([5536b05](https://github.com/dream-num/univer/commit/5536b057fe59ad2c449a670544b3fe9de7f1ac22))


### Features

* **conditional-formatting:** add error interceptor ([#2600](https://github.com/dream-num/univer/issues/2600)) ([b523f62](https://github.com/dream-num/univer/commit/b523f6246425781181c21708000b8b0078cbb538))
* customize row header ([#2457](https://github.com/dream-num/univer/issues/2457)) ([f5e520f](https://github.com/dream-num/univer/commit/f5e520fc5593398bc484a9a290bd1ccaad6c6622))
* **formula:** add averagea,concat function ([#2606](https://github.com/dream-num/univer/issues/2606)) ([346b33a](https://github.com/dream-num/univer/commit/346b33a8067ff96aa4c320295db540b64f41df33))
* **formula:** add choose function ([#2613](https://github.com/dream-num/univer/issues/2613)) ([219a053](https://github.com/dream-num/univer/commit/219a053e51f52809214d8ba4defcc04b73fa9357))
* **mobile:** init basic mobile features ([#2443](https://github.com/dream-num/univer/issues/2443)) ([3583fe5](https://github.com/dream-num/univer/commit/3583fe59ed0e942ecf2645973b9346039b28c99e))

## [0.1.16](https://github.com/dream-num/univer/compare/v0.1.15...v0.1.16) (2024-06-21)


### Bug Fixes

* button style ([#2541](https://github.com/dream-num/univer/issues/2541)) ([b753dba](https://github.com/dream-num/univer/commit/b753dba108f45da71c2cddbe7dadd53794d4e220))
* change permission collaborator ([#2528](https://github.com/dream-num/univer/issues/2528)) ([856cfb8](https://github.com/dream-num/univer/commit/856cfb8615c89d95f7b2edfb5b5d095d56027021))
* **design:** adjust tooltip arrow width to 4px ([#2556](https://github.com/dream-num/univer/issues/2556)) ([9992773](https://github.com/dream-num/univer/commit/99927734c70bd883810e3c16d51c1eafb6ceb780))
* **design:** fix popup position ([#2510](https://github.com/dream-num/univer/issues/2510)) ([2920023](https://github.com/dream-num/univer/commit/2920023564629550b0b82843697478f2cc449880))
* **docs-drawing:** fix crash when editing text after inserting images and opening the sidebar ([#2548](https://github.com/dream-num/univer/issues/2548)) ([f59ab40](https://github.com/dream-num/univer/commit/f59ab40a813c9f17867073720900bb8fc99af299))
* **editor:** state error ([#2552](https://github.com/dream-num/univer/issues/2552)) ([819bbe7](https://github.com/dream-num/univer/commit/819bbe72c8de01894084a772fed2dd38a692d6fb))
* fix some permission bugs ([#2522](https://github.com/dream-num/univer/issues/2522)) ([ac0644b](https://github.com/dream-num/univer/commit/ac0644be6a5c7f26aac5816b52c7f483c1d6cee0))
* fix status bar performance ([#2537](https://github.com/dream-num/univer/issues/2537)) ([4885f4f](https://github.com/dream-num/univer/commit/4885f4fe0796fe9f6c3752fe70555444a283ba0a))
* **formula:** reverse undo range list ([#2389](https://github.com/dream-num/univer/issues/2389)) ([b6ef910](https://github.com/dream-num/univer/commit/b6ef910eb8cbd6c6c3b16f4ecf6b98ad98878c04))
* **permission:** can not edit when have not permission in cn language ([#2574](https://github.com/dream-num/univer/issues/2574)) ([7f996f1](https://github.com/dream-num/univer/commit/7f996f13871980055f52dc8e3dd502334d61f5b0))
* **permission:** change rename condition should have rename permission ([#2579](https://github.com/dream-num/univer/issues/2579)) ([39619c0](https://github.com/dream-num/univer/commit/39619c000d20191a60b5455d04d8c6db308c70f4))
* **permission:** keep permision point ref ([#2532](https://github.com/dream-num/univer/issues/2532)) ([be947bd](https://github.com/dream-num/univer/commit/be947bdeda7be5f2d50ebbf4345aa4efb50ecc86))
* set style should not clear p ([#2553](https://github.com/dream-num/univer/issues/2553)) ([9c4ea35](https://github.com/dream-num/univer/commit/9c4ea35cd6cf24e1219550c8e9c713ed166a6bab))
* **sheet:** button class priority ([#2485](https://github.com/dream-num/univer/issues/2485)) ([9205148](https://github.com/dream-num/univer/commit/9205148cab8086d974297b356674dbdfa51e71c3))
* **sheet:** force string sets style ([#2448](https://github.com/dream-num/univer/issues/2448)) ([17130d1](https://github.com/dream-num/univer/commit/17130d1c4319697ba686ba90ff22c90f62fbe292))
* **sheet:** maybe get null when get active sheet ([#2512](https://github.com/dream-num/univer/issues/2512)) ([85e15af](https://github.com/dream-num/univer/commit/85e15afa80a03661591f11c47f8a9cc51b6f7f87))
* **sheets-data-validation:** bugfix for data-validation ([#2562](https://github.com/dream-num/univer/issues/2562)) ([d1e38dd](https://github.com/dream-num/univer/commit/d1e38dd15b9859bc1167f9a9279ef4deca475562))
* **sheets-drawing-ui:** error delete cache when float-dom hide ([#2540](https://github.com/dream-num/univer/issues/2540)) ([b1dc036](https://github.com/dream-num/univer/commit/b1dc036efd18e3e1da0f6a10fe8e8344eefcc127))
* **sheets-ui:** fix unhide render controller RENDER_COMMANDS ([#2516](https://github.com/dream-num/univer/issues/2516)) ([58a954e](https://github.com/dream-num/univer/commit/58a954e7c2919848f2f614ff624b8373f0a2b062))
* **sheets:** bugfix for data-validation and hyper-link ([#2527](https://github.com/dream-num/univer/issues/2527)) ([389e65b](https://github.com/dream-num/univer/commit/389e65bcb6694ab38685e6a2de504d049bcc4a5a))
* **sheet:** selection order ([#2557](https://github.com/dream-num/univer/issues/2557)) ([eb47033](https://github.com/dream-num/univer/commit/eb4703387061a5a1e2dfc1a8a7c5d1ac1768b96d))
* **sheets:** fix some bugs ([#2536](https://github.com/dream-num/univer/issues/2536)) ([250763e](https://github.com/dream-num/univer/commit/250763e5c0090524cd9a337e79cc0db91ddd1f1d))
* **sheets:** fix some bugs ([#2545](https://github.com/dream-num/univer/issues/2545)) ([b065f02](https://github.com/dream-num/univer/commit/b065f028b66e89fbf98f3171e0edc4b480f76abe))
* **sheets:** hide rows cols should skip over already hidden ranges ([#2517](https://github.com/dream-num/univer/issues/2517)) ([1896852](https://github.com/dream-num/univer/commit/1896852bf5ae7fb5cc5ab957f5ced65a59d5dd43))
* **sheet:** ui dependency ([#2577](https://github.com/dream-num/univer/issues/2577)) ([55f6f72](https://github.com/dream-num/univer/commit/55f6f723fa2db612fd8506ae5b4ce96d63da747a))
* **sheet:** ui dependency in sort ([#2580](https://github.com/dream-num/univer/issues/2580)) ([1c67036](https://github.com/dream-num/univer/commit/1c670360c739a89f29e90d36a648832a848ac283))
* **sheet:** update freeze incorrect when insert row ([#2492](https://github.com/dream-num/univer/issues/2492)) ([7c9d69a](https://github.com/dream-num/univer/commit/7c9d69aacf23a9be0e881a81434029a0cf059de7))
* tooltip is-ellipsis not working ([#2550](https://github.com/dream-num/univer/issues/2550)) ([f3641c3](https://github.com/dream-num/univer/commit/f3641c30974a0788fa64289ac351fa8b9f85c051))
* use @univerjs/ui useObservable ([#2456](https://github.com/dream-num/univer/issues/2456)) ([8d6037d](https://github.com/dream-num/univer/commit/8d6037dd501587f756a0f9abc4f448632bfb64c3))


### Features

* add sheet drawing permission ([#2546](https://github.com/dream-num/univer/issues/2546)) ([bc108e5](https://github.com/dream-num/univer/commit/bc108e55e6de80f36c35f1e1a142c114f4e92dd5))
* **conditional-formatting:** separate the initialization logic for UI and core components ([#2530](https://github.com/dream-num/univer/issues/2530)) ([4706227](https://github.com/dream-num/univer/commit/470622743c227b95cdc16122477b6a070e4baf2f))
* customize column header ([#2333](https://github.com/dream-num/univer/issues/2333)) ([4f8eae1](https://github.com/dream-num/univer/commit/4f8eae1bc657433b1c660eb42aebc3f8cebcb9b9))
* everything feels very lag when there is a long range dashrect(cliparea) ([#2472](https://github.com/dream-num/univer/issues/2472)) ([45f15fe](https://github.com/dream-num/univer/commit/45f15fef21a293fb156d1a48e0baaeafd2c9aadb))
* **sheet:** sort feature ([#2435](https://github.com/dream-num/univer/issues/2435)) ([107fbf2](https://github.com/dream-num/univer/commit/107fbf2ee568f80b9063c65321b2a5b831d86a3d))
* **umd:** add sort umd ([#2581](https://github.com/dream-num/univer/issues/2581)) ([f49fed1](https://github.com/dream-num/univer/commit/f49fed18f4b7831c351b0596a68b8908bada9b25))

## [0.1.15](https://github.com/dream-num/univer/compare/v0.1.14...v0.1.15) (2024-06-14)


### Bug Fixes

* change ref when user change ([#2501](https://github.com/dream-num/univer/issues/2501)) ([b23148b](https://github.com/dream-num/univer/commit/b23148b07166cee702d0a2ffe81e13cdc55b8148))
* **core:** fix disposing univer causing error ([#2515](https://github.com/dream-num/univer/issues/2515)) ([ca76011](https://github.com/dream-num/univer/commit/ca76011ffb563e773a1a0c7a2b6379fc3f686537))
* **core:** init user info ([#2499](https://github.com/dream-num/univer/issues/2499)) ([b3393ef](https://github.com/dream-num/univer/commit/b3393ef05d71bb2b9e74fa87d6d57e6fc80b4085))
* **design:** fix syntax error in calculation within less file ([#2506](https://github.com/dream-num/univer/issues/2506)) ([9c2947f](https://github.com/dream-num/univer/commit/9c2947fa93e42c189d6abcb39f931b61b7d56137))
* **find:** when dispose, should close panel ([#2495](https://github.com/dream-num/univer/issues/2495)) ([4a72bcc](https://github.com/dream-num/univer/commit/4a72bcc721c73431042d57acdaee1acc7e5fd522))
* **hyper-link:** bugfix for hyper-link remove-sheet ([#2444](https://github.com/dream-num/univer/issues/2444)) ([039a59d](https://github.com/dream-num/univer/commit/039a59d96b677bcc1b5795cd6a0b91eed8681218))
* only users with editing permissions can join the protected colla… ([#2504](https://github.com/dream-num/univer/issues/2504)) ([2ea683e](https://github.com/dream-num/univer/commit/2ea683e9cf14a7999b242d2df4a02b5588298cf2))
* rename change permission ([#2481](https://github.com/dream-num/univer/issues/2481)) ([ee6a464](https://github.com/dream-num/univer/commit/ee6a464948c3d5147a7a5991418c28cb805b9087))
* scrollInfo should not save into snapshot ([#2514](https://github.com/dream-num/univer/issues/2514)) ([782c7dc](https://github.com/dream-num/univer/commit/782c7dc492dde037c53551a9cc2390fa0ae883e4))
* **sheet:** null cell ([#2483](https://github.com/dream-num/univer/issues/2483)) ([63040e1](https://github.com/dream-num/univer/commit/63040e187e64f389396cd1b02165f251bfdb9222))
* **sheets-hyper-link:** skip error on ref-range mutation ([#2446](https://github.com/dream-num/univer/issues/2446)) ([56c6e12](https://github.com/dream-num/univer/commit/56c6e1269791dfb835f1af7ccdc381518f97e6b5))
* **umd:** change dependency build order for UMD packages ([#2449](https://github.com/dream-num/univer/issues/2449)) ([3337e79](https://github.com/dream-num/univer/commit/3337e79005414e3dfc1ed15f65a46ead43b80256))


### Features

* add scrollLeftTop for sheet snapshot ([#2414](https://github.com/dream-num/univer/issues/2414)) ([23775c8](https://github.com/dream-num/univer/commit/23775c84cc55ac6447d29c72fda29d67c0665960)), closes [#2348](https://github.com/dream-num/univer/issues/2348)
* change move sheet permission ([#2493](https://github.com/dream-num/univer/issues/2493)) ([d2f3f54](https://github.com/dream-num/univer/commit/d2f3f54b5b3f1f42e592d00517cc6438b46ccbd7))
* **network:** support sse in network fetch ([#2482](https://github.com/dream-num/univer/issues/2482)) ([8f5d0f4](https://github.com/dream-num/univer/commit/8f5d0f4ef4d1bb3c2e8140d0eb4889f01c1263cd))
* set the initial cursor at the begining of document ([#2447](https://github.com/dream-num/univer/issues/2447)) ([a812d2e](https://github.com/dream-num/univer/commit/a812d2e60b12ef9ec42fe3e987850307ecb86d5b))
* **sheets-ui:** optimize ref-range for hyper-link and thread-comment ([#2405](https://github.com/dream-num/univer/issues/2405)) ([88f2f6d](https://github.com/dream-num/univer/commit/88f2f6d0c1b0a182241575d37967574d3c6b1218))
* support props on float dom component ([#2518](https://github.com/dream-num/univer/issues/2518)) ([0a52859](https://github.com/dream-num/univer/commit/0a52859a4e8dc2ccc1687db03265e8b0e7a7f1ef))

## [0.1.14](https://github.com/dream-num/univer/compare/v0.1.13...v0.1.14) (2024-06-07)


### Bug Fixes

* build error ([#2436](https://github.com/dream-num/univer/issues/2436)) ([d497b03](https://github.com/dream-num/univer/commit/d497b03a5b8894589401034da340fce3c8f105c3))
* **drawing:** plugin name ([#2402](https://github.com/dream-num/univer/issues/2402)) ([296f399](https://github.com/dream-num/univer/commit/296f399408e3d6d4293c43e5acf064d5717f7de9))
* fix findDOMNode deprecation issue under React 18.3.1 ([#2403](https://github.com/dream-num/univer/issues/2403)) ([41d21c3](https://github.com/dream-num/univer/commit/41d21c31ebe133a436e811ba42787b438a29f319))
* fix layer ([#2421](https://github.com/dream-num/univer/issues/2421)) ([ad7b3b5](https://github.com/dream-num/univer/commit/ad7b3b5bc15e307f9ab70bbab89b6522b655660d))
* fix list lint ([#2406](https://github.com/dream-num/univer/issues/2406)) ([eb8737c](https://github.com/dream-num/univer/commit/eb8737c972d80d9613f8b6a6af8f2dea6a95fe72))
* fix menu status is incorrect because focusedOnDrawing$ have not initial value  ([#2431](https://github.com/dream-num/univer/issues/2431)) ([5b7bc17](https://github.com/dream-num/univer/commit/5b7bc17b89abf81d39a07f5873af3261a436f81e))
* fix permissions wrong reference render-engine in sheets package ([#2396](https://github.com/dream-num/univer/issues/2396)) ([10387e4](https://github.com/dream-num/univer/commit/10387e48b92ad0134f0bf17e82dd28e938b4465d))
* **formula:** export AsyncObject ([#2438](https://github.com/dream-num/univer/issues/2438)) ([08df397](https://github.com/dream-num/univer/commit/08df397e136754a89525bf2d3bb3926f300d7d2f))
* **formula:** js precision problem ([#2371](https://github.com/dream-num/univer/issues/2371)) ([d2c9eeb](https://github.com/dream-num/univer/commit/d2c9eebc19f233e8ce422c8467a66b394c5f7b2d))
* **meesage:** fix in node env, the document not exist ([#2415](https://github.com/dream-num/univer/issues/2415)) ([8657cc4](https://github.com/dream-num/univer/commit/8657cc40841c80b66ce4a9880abc6db992c40b52))
* message node env ([#2417](https://github.com/dream-num/univer/issues/2417)) ([3dd2d6a](https://github.com/dream-num/univer/commit/3dd2d6a1b6e3f1730514057c6a5e3c75a82f31ec))
* not escape when copy content ([#2354](https://github.com/dream-num/univer/issues/2354)) ([c10e4d9](https://github.com/dream-num/univer/commit/c10e4d93e3995cb799ca796856f5d09b8801364b))
* sync actions between formula editor and cell editor ([#2380](https://github.com/dream-num/univer/issues/2380)) ([bdf033c](https://github.com/dream-num/univer/commit/bdf033c2ed5bb40cb5dc3a2aac8f7d8cd7332317))
* **ui:** fix findDOMNode is deprecated warning when collapsing the toolbar ([#2413](https://github.com/dream-num/univer/issues/2413)) ([754fad2](https://github.com/dream-num/univer/commit/754fad23005fae3df58682f1a9fc81aab8181bc0))
* **ui:** fix flickering on register ui parts ([#2430](https://github.com/dream-num/univer/issues/2430)) ([2d036a3](https://github.com/dream-num/univer/commit/2d036a3bd50134906195fdd40df48e97a5bb7501))
* **ui:** fix ineffective `hidden` property in menu configurations ([#2420](https://github.com/dream-num/univer/issues/2420)) ([c2b0019](https://github.com/dream-num/univer/commit/c2b0019ef394389d103adcd5645445da38c80723))
* **ui:** fix possible race conditions for ComponentContainer ([29af7c2](https://github.com/dream-num/univer/commit/29af7c2abc3d247f422aa3d071e0ccc02615ff5e))


### Features

* add scrollLeftTop for sheet snapshot ([#2348](https://github.com/dream-num/univer/issues/2348)) ([38d8003](https://github.com/dream-num/univer/commit/38d8003af71c13c319a54dc3e7fe948984375218))
* add Tools.set method ([#2399](https://github.com/dream-num/univer/issues/2399)) ([ea8f50c](https://github.com/dream-num/univer/commit/ea8f50cb63193fd6f90e8a4e68500b809c075800))
* add workbook permission ([#2391](https://github.com/dream-num/univer/issues/2391)) ([0a9a980](https://github.com/dream-num/univer/commit/0a9a980c091060596678130b6a3039c17a08a194))
* **InsertSheetCommand:** allow using partial sheet from params as sheetconfig ([#2429](https://github.com/dream-num/univer/issues/2429)) ([ce85854](https://github.com/dream-num/univer/commit/ce858541eec01cadd18b16f395a4d5195be18e86))
* **network:** add http auth interceptor ([#2424](https://github.com/dream-num/univer/issues/2424)) ([066941a](https://github.com/dream-num/univer/commit/066941a50d9e545a7271118bc0b815c9a141626a))
* **permission-share:** support permission share ([#2416](https://github.com/dream-num/univer/issues/2416)) ([0332000](https://github.com/dream-num/univer/commit/0332000ecb5b89ee5a53c1af92530d63341b2942))
* **sheets-data-validation:** add validator service allowing developer to get status of data-validation ([#2412](https://github.com/dream-num/univer/issues/2412)) ([12d531d](https://github.com/dream-num/univer/commit/12d531dc16a64918e2e91b7ee364924ddfd978a9))
* **sheets-ui:** support drawing print ([#2418](https://github.com/dream-num/univer/issues/2418)) ([f24cace](https://github.com/dream-num/univer/commit/f24cacef51e6c49d54267a5a16df355bf05676f8))
* **ui:** enhance component container ([#2395](https://github.com/dream-num/univer/issues/2395)) ([54460f9](https://github.com/dream-num/univer/commit/54460f9a8b0f20c5be357476ae490d6367747681))


### Reverts

* Revert "feat: add scrollLeftTop for sheet snapshot (#2348)" (#2398) ([1e5c40c](https://github.com/dream-num/univer/commit/1e5c40c974246e93c06c794a104aa0f6716138e3)), closes [#2348](https://github.com/dream-num/univer/issues/2348) [#2398](https://github.com/dream-num/univer/issues/2398)

## [0.1.13](https://github.com/dream-num/univer/compare/v0.1.12...v0.1.13) (2024-06-03)


### Bug Fixes

* background position error in zen editor ([#2313](https://github.com/dream-num/univer/issues/2313)) ([6e6f185](https://github.com/dream-num/univer/commit/6e6f18536e77a2987c5153519e2866014f992eb1))
* cell number display when set text wrap ([#2314](https://github.com/dream-num/univer/issues/2314)) ([0144179](https://github.com/dream-num/univer/commit/0144179a6128a2f450ac8c69e4d4f1845ce4ef8e))
* check cell data and remove linebreak in v filed ([#2382](https://github.com/dream-num/univer/issues/2382)) ([cfc2e0a](https://github.com/dream-num/univer/commit/cfc2e0a760c1dd425caa259c964b43c8ab38f21f))
* clear format failed when not change selections ([#2338](https://github.com/dream-num/univer/issues/2338)) ([07a4e0f](https://github.com/dream-num/univer/commit/07a4e0fc669c58f6e6db481f4d5cd745d0286f6d))
* **core:** observer remove unregisterOnNextCall ([#2334](https://github.com/dream-num/univer/issues/2334)) ([5c4f479](https://github.com/dream-num/univer/commit/5c4f47939656f95aca4a6a18f39cc8d7b9a0dad5))
* cursor size follow anchor glyph ([#2365](https://github.com/dream-num/univer/issues/2365)) ([9d8bb89](https://github.com/dream-num/univer/commit/9d8bb89a9a0e1946f2888e77b872c50c1afde236))
* **design:** resolve text overflow issue in Select component for long content ([#2352](https://github.com/dream-num/univer/issues/2352)) ([0ff261d](https://github.com/dream-num/univer/commit/0ff261d8faffeb41b24bd8d2694c32f921d454dc))
* **drawing-ui:** fix incomplete display of drawing panel styles ([#2387](https://github.com/dream-num/univer/issues/2387)) ([9831db9](https://github.com/dream-num/univer/commit/9831db9f92f77acd40ee9739fa32a2e5da4f19ed))
* **drawing:** doc drawing same to sheet drawing ([#2372](https://github.com/dream-num/univer/issues/2372)) ([e3f6654](https://github.com/dream-num/univer/commit/e3f66548fb2551f782383c23ad53d754366762e9))
* dv 18n ([#2370](https://github.com/dream-num/univer/issues/2370)) ([da8b06b](https://github.com/dream-num/univer/commit/da8b06b174e22d807a07b1648599147b0676689f))
* **editor:** add valid attribute ([#1730](https://github.com/dream-num/univer/issues/1730)) ([2dee268](https://github.com/dream-num/univer/commit/2dee2686141b544ffbe20193893a28ba08d3a2ce))
* email link jump error ([#2378](https://github.com/dream-num/univer/issues/2378)) ([950be43](https://github.com/dream-num/univer/commit/950be43da5540b0d4d9700cef000cfec736467be))
* fix get SSE param ([07e0ebb](https://github.com/dream-num/univer/commit/07e0ebb01a4d649890fb6cee09999f88c745d642))
* fix import error ([#2384](https://github.com/dream-num/univer/issues/2384)) ([3345064](https://github.com/dream-num/univer/commit/3345064bbcdb027ef12e73d5abfd83f4ed456a37))
* fix multiple dialogs being opened at the same time ([#2341](https://github.com/dream-num/univer/issues/2341)) ([ce5d10c](https://github.com/dream-num/univer/commit/ce5d10c538f7230d0c96161b91a3005aeaf6e136))
* fixed a typo in links ([#2325](https://github.com/dream-num/univer/issues/2325)) ([f5162c9](https://github.com/dream-num/univer/commit/f5162c90f74d48200e866f7dc92456f482b01568))
* fixed outdated start dev server command ([#2320](https://github.com/dream-num/univer/issues/2320)) ([4fb451c](https://github.com/dream-num/univer/commit/4fb451cbc4b5eff710cb4616ece1e33a6031001e))
* **formula:** case sensitive ([#2329](https://github.com/dream-num/univer/issues/2329)) ([a6761dd](https://github.com/dream-num/univer/commit/a6761dda2cd39e11de594b1935f2847f94283ec5))
* **formula:** progress for multiple calculation ([#2342](https://github.com/dream-num/univer/issues/2342)) ([1169af4](https://github.com/dream-num/univer/commit/1169af4c0f4b55fee9b3bc259d30705137b77ee2))
* formular confirm error ([#2318](https://github.com/dream-num/univer/issues/2318)) ([1eca6d1](https://github.com/dream-num/univer/commit/1eca6d1f53ac7fa9c8ab76e67a8c67329beb9a77))
* inline format support cursor ([#2347](https://github.com/dream-num/univer/issues/2347)) ([94f2149](https://github.com/dream-num/univer/commit/94f21494fe0ec71c4971e61e59db8e1018d4c42c))
* move row&col effects on filter-range ([#2284](https://github.com/dream-num/univer/issues/2284)) ([200e655](https://github.com/dream-num/univer/commit/200e6551fbd855ad390af93fd2ba0aa6c51ed0c6))
* **network:** fix http headers parsing ([a1beac6](https://github.com/dream-num/univer/commit/a1beac660641a7aa83ba086151db3f08a59c10bc))
* **network:** fix http type ([#2359](https://github.com/dream-num/univer/issues/2359)) ([fe3ac1d](https://github.com/dream-num/univer/commit/fe3ac1da4d6b9cdd64da1d2b4ffd655e31957efc))
* no need to set background to linebreak ([#2335](https://github.com/dream-num/univer/issues/2335)) ([4140cb7](https://github.com/dream-num/univer/commit/4140cb72de815849fb8a3bbc87622a02083353b0))
* paste special (format  only) will not paste richformat ([#2098](https://github.com/dream-num/univer/issues/2098)) ([8cd421b](https://github.com/dream-num/univer/commit/8cd421b5a3872c39c75a74c909e180a82287ef46))
* **render-engine:** optimize underline postion ([#2164](https://github.com/dream-num/univer/issues/2164)) ([b0ccb91](https://github.com/dream-num/univer/commit/b0ccb91a70675dec8694a3f276c9093ac14f1c19))
* **render:** dispose cycle ([#2393](https://github.com/dream-num/univer/issues/2393)) ([bfe75db](https://github.com/dream-num/univer/commit/bfe75db149be7014be85d8ee38db08d541c5c26e))
* **sheet:** active next sheet when remove sheet ([#2305](https://github.com/dream-num/univer/issues/2305)) ([9a24216](https://github.com/dream-num/univer/commit/9a24216063a31cabc078b71c9e7b4ac73ac3c093))
* **sheet:** border color ([#2326](https://github.com/dream-num/univer/issues/2326)) ([1e2b4c3](https://github.com/dream-num/univer/commit/1e2b4c36f79db698590916d3d3678cdce83efc91))
* **sheet:** insert row supports cell value ([#2346](https://github.com/dream-num/univer/issues/2346)) ([c87246c](https://github.com/dream-num/univer/commit/c87246c19c59d1f55a0dd2e7e246f640a2ea8f55))
* **sheets:** add exports ([8a4b1f5](https://github.com/dream-num/univer/commit/8a4b1f57986c295b5b76c4b2823abfc02153f089))
* storybook failed because can not override name property ([#2339](https://github.com/dream-num/univer/issues/2339)) ([5853999](https://github.com/dream-num/univer/commit/58539999a91ffba5f3b7ff352449f88d5b040749))
* **ui:** correct the resize listener target in toolbar ([#2321](https://github.com/dream-num/univer/issues/2321)) ([734c4d2](https://github.com/dream-num/univer/commit/734c4d20a48a78ec51ba459640441d163dd82aa7))
* underline in sheet cell ([#2306](https://github.com/dream-num/univer/issues/2306)) ([5c6b010](https://github.com/dream-num/univer/commit/5c6b01004b6bb2b35e8d3e097d71367322d1e691))
* update import paths for drawing UI panel in image panels ([#2392](https://github.com/dream-num/univer/issues/2392)) ([e971e28](https://github.com/dream-num/univer/commit/e971e28836a23fd702857307a0d993f0feadc964))


### Features

* add more exports from UI package ([#2309](https://github.com/dream-num/univer/issues/2309)) ([916e3cc](https://github.com/dream-num/univer/commit/916e3ccfa6ad7b7450aa88f1cf453ab8cffbede3))
* change aux line color and default cell size ([ce8b96a](https://github.com/dream-num/univer/commit/ce8b96a7aa1d6dfc942354f11bb76c82efd9856f))
* change message and notification API ([#2332](https://github.com/dream-num/univer/issues/2332)) ([5cc6881](https://github.com/dream-num/univer/commit/5cc688177941e02145c086e5b7cfb4602d15cf53))
* doc-popup ([#2322](https://github.com/dream-num/univer/issues/2322)) ([0123c54](https://github.com/dream-num/univer/commit/0123c54769beea559c320f2bffddba23a9db47ac))
* **drawing:** sheets and docs drawing ([#2324](https://github.com/dream-num/univer/issues/2324)) ([4853425](https://github.com/dream-num/univer/commit/4853425aef1e44b39d425655475923aa914b95a9))
* **facade:** add lifecycle hooks for facade ([#2357](https://github.com/dream-num/univer/issues/2357)) ([ebb1d59](https://github.com/dream-num/univer/commit/ebb1d59734b9db3312dfa9fc1774d7d66aa0bcf2))
* **facade:** click to get cell information, whether to merge and coordinates ([#2362](https://github.com/dream-num/univer/issues/2362)) ([1300ebc](https://github.com/dream-num/univer/commit/1300ebcbd47b1669dfab7f1e6a2e8d99d20d3735))
* **i18n:** add i18n support to umd ([452effb](https://github.com/dream-num/univer/commit/452effb78928cdd643cd2a0dc60bd70e3aee5de4))
* **message:** add some option property for meesage, it use for custo… ([#2340](https://github.com/dream-num/univer/issues/2340)) ([bf2c021](https://github.com/dream-num/univer/commit/bf2c021d7f2197ba500c506836ae513d46852f8d))
* **network:** add http sse method ([#2358](https://github.com/dream-num/univer/issues/2358)) ([a87c44a](https://github.com/dream-num/univer/commit/a87c44a450153f9b881c8e4c8fa5e0da0cc059ac))
* permission remaining issues ([#2375](https://github.com/dream-num/univer/issues/2375)) ([dade734](https://github.com/dream-num/univer/commit/dade7345ef17f7c982052c88227adb3a3faa6846))
* **permission:** support permission ([#1931](https://github.com/dream-num/univer/issues/1931)) ([09fd989](https://github.com/dream-num/univer/commit/09fd989097d2acd1171437f36bdd4b9ca1572d5c))
* **render-engine:** move cache to viewport ([#2188](https://github.com/dream-num/univer/issues/2188)) ([a4e5b11](https://github.com/dream-num/univer/commit/a4e5b11eb4e6c65070135ce8549e5d1f210aef15)), closes [#676](https://github.com/dream-num/univer/issues/676) [#677](https://github.com/dream-num/univer/issues/677) [#676](https://github.com/dream-num/univer/issues/676) [#677](https://github.com/dream-num/univer/issues/677) [#700](https://github.com/dream-num/univer/issues/700) [#700](https://github.com/dream-num/univer/issues/700)
* **sheet:** add name observables on Workbook ([fa76180](https://github.com/dream-num/univer/commit/fa76180421175772fc05c172733d96666c6ab4cf))
* **sheets-hyper-link:** add hyper link for sheet ([#2330](https://github.com/dream-num/univer/issues/2330)) ([09518aa](https://github.com/dream-num/univer/commit/09518aa58f26a713083b475f73dbc7c940c8e902))
* **sheets-ui:** support canvas float dom ([#2343](https://github.com/dream-num/univer/issues/2343)) ([1f95047](https://github.com/dream-num/univer/commit/1f95047410ece88dd5e25ef8f4a9c0c866633c29))
* support for tilting the cursor when italicized ([#1932](https://github.com/dream-num/univer/issues/1932)) ([ac62428](https://github.com/dream-num/univer/commit/ac62428556a7e3770132b51bd2be9a03490efde7))
* **toolbar:** add automatic calculation of toolbar gap style ([#2345](https://github.com/dream-num/univer/issues/2345)) ([91f3b7c](https://github.com/dream-num/univer/commit/91f3b7cdc492a84ba08ab6384a4eebcf5fe1202a))
* **ui:** not auto removing when duration is 0 ([#2366](https://github.com/dream-num/univer/issues/2366)) ([a98e8ab](https://github.com/dream-num/univer/commit/a98e8abd66752a5c0afaa93de7be627599664b05))

## [0.1.12](https://github.com/dream-num/univer/compare/v0.1.11...v0.1.12) (2024-05-24)


### Bug Fixes

* **engine-render:** fix "require("fs")" issue ([#2278](https://github.com/dream-num/univer/issues/2278)) ([0e25997](https://github.com/dream-num/univer/commit/0e259973b50cfa8c261dbdc8db7425854e3aa98f))
* export necessary types from ui package ([c648310](https://github.com/dream-num/univer/commit/c64831091a758eedb88baad8a4bb8e4488cfc697))
* fix identifier name ([c1b4e8b](https://github.com/dream-num/univer/commit/c1b4e8b51d6f10bede03248723e4b1c75de4c3d7))
* fix shortcut panel content not correct ([#2267](https://github.com/dream-num/univer/issues/2267)) ([bf5880a](https://github.com/dream-num/univer/commit/bf5880a8b2dabad6621ad80cb68e3ed7f79657bb))
* resolve warning about nested component updates from render methods ([#2274](https://github.com/dream-num/univer/issues/2274)) ([4e7b4c5](https://github.com/dream-num/univer/commit/4e7b4c5c0b55382b3933d6e1b3f0a1b50e94508c))
* **sheet:** add info type for Message component, use barColor in ProgressBar ([#2277](https://github.com/dream-num/univer/issues/2277)) ([7b411b3](https://github.com/dream-num/univer/commit/7b411b398d5a3dd18aeff871abc847a770eb57f3))
* **sheets-thread-comment:** fix some ui issues & update readme.md ([#2294](https://github.com/dream-num/univer/issues/2294)) ([b230655](https://github.com/dream-num/univer/commit/b230655dfca8f8949269944b183417759ac71367))
* **sheets-ui:** fix doc plugins not loaded before sheet editor ([#2279](https://github.com/dream-num/univer/issues/2279)) ([e467c1e](https://github.com/dream-num/univer/commit/e467c1efbd3849278c44c73e7fa8b33025fa7c19))
* **ui:** fix canvas popup direction definition error ([0690697](https://github.com/dream-num/univer/commit/069069759cebc8818f99732e743e2df4e24d8377))
* **ui:** fix position error ([57d4e8a](https://github.com/dream-num/univer/commit/57d4e8a980acb10ac446de66f2ca50f4f0c49e84))
* **uniscript:** export module for pro ([#2293](https://github.com/dream-num/univer/issues/2293)) ([e7ad8d5](https://github.com/dream-num/univer/commit/e7ad8d5c3e1ddb7bf6071ebd18209ddfba27ac58))


* feat(ui)!: add support for hiding context menu (#2275) ([3f12ad8](https://github.com/dream-num/univer/commit/3f12ad80188a83283bcd95c65e6c5dcc2d23ad72)), closes [#2275](https://github.com/dream-num/univer/issues/2275)


### Features

* add support for customizable context menu & toolbar ([#2273](https://github.com/dream-num/univer/issues/2273)) ([b253997](https://github.com/dream-num/univer/commit/b253997ce3126fc99f2829a76a3b7cc5b1476a95))
* **core:** command service support get command type ([6775a73](https://github.com/dream-num/univer/commit/6775a7310decfdad122b48344a6ff93d47651ea5))
* extract debugger plugin to standalone package ([#2269](https://github.com/dream-num/univer/issues/2269)) ([f89e3bd](https://github.com/dream-num/univer/commit/f89e3bd2af1860a5081bdafae2b686c7fb5d04b0))
* extract hooks for better customization ([#2301](https://github.com/dream-num/univer/issues/2301)) ([2b75400](https://github.com/dream-num/univer/commit/2b75400dd788b84b6b15872c5aea7b95b236aaeb))
* **render-engine:** facade adds onCellPointerOver,onCellDragOver,onCellDrop ([#2240](https://github.com/dream-num/univer/issues/2240)) ([874fa27](https://github.com/dream-num/univer/commit/874fa271dae7d25acd6ef6c8e564da8b70d58aaa))
* **sheets-conditional-formatting-ui:** refactor manage rule selection options ([ba56b60](https://github.com/dream-num/univer/commit/ba56b60960d1e0555484f115b190c7d9a836ff7e))
* **sheets-thread-comment:** comment support for sheets ([#2228](https://github.com/dream-num/univer/issues/2228)) ([313ab79](https://github.com/dream-num/univer/commit/313ab796d7d951838d593d3801a1771d39e13153)), closes [#2121](https://github.com/dream-num/univer/issues/2121) [#2120](https://github.com/dream-num/univer/issues/2120) [#2114](https://github.com/dream-num/univer/issues/2114) [#2112](https://github.com/dream-num/univer/issues/2112) [#684](https://github.com/dream-num/univer/issues/684) [#2174](https://github.com/dream-num/univer/issues/2174) [#2162](https://github.com/dream-num/univer/issues/2162) [#715](https://github.com/dream-num/univer/issues/715)
* **sheets-thread-comment:** optimize comment mention source injector method ([#2303](https://github.com/dream-num/univer/issues/2303)) ([a5a7b33](https://github.com/dream-num/univer/commit/a5a7b33f37e413cf6f28d4a5c9c4428c9b53be3b))
* **thread-comment:** add data-source-service export ([#2296](https://github.com/dream-num/univer/issues/2296)) ([41d0639](https://github.com/dream-num/univer/commit/41d0639e9a4393bfa7e727699e23712b0e070298))
* **ui:** popup enhance direction ([#2281](https://github.com/dream-num/univer/issues/2281)) ([e9c27b7](https://github.com/dream-num/univer/commit/e9c27b70c66008f34ff7f27d3913cc3f866199bd))
* **ui:** ui parts service support more generic situations ([#2286](https://github.com/dream-num/univer/issues/2286)) ([415d5b8](https://github.com/dream-num/univer/commit/415d5b83b246b51ec09ee0f76d6e74daf447df85))
* **umd:** add thread comment support to the UMD bundle ([#2288](https://github.com/dream-num/univer/issues/2288)) ([d909b5f](https://github.com/dream-num/univer/commit/d909b5f01b0f285f31c5ecc2526231a20dc376bc))


### BREAKING CHANGES

* The default values for `header` and `footer` are now set to true.

* feat: update examples

## [0.1.11](https://github.com/dream-num/univer/compare/v0.1.10...v0.1.11) (2024-05-17)


### Bug Fixes

* backspace in list when select all list content ([#2230](https://github.com/dream-num/univer/issues/2230)) ([e58a69e](https://github.com/dream-num/univer/commit/e58a69e97331494a2224909222b08c2c5efa4334))
* edit cell and the content is not display ([#2245](https://github.com/dream-num/univer/issues/2245)) ([08f41cf](https://github.com/dream-num/univer/commit/08f41cfaee8ed86b5fb395817cb4f99bbbf96db4))
* **editor:** focusing error ([#2264](https://github.com/dream-num/univer/issues/2264)) ([0831994](https://github.com/dream-num/univer/commit/0831994c658896227ded09e64332e1848b2c3560))
* filterRenderController works after selectionRenderService is usable ([#2236](https://github.com/dream-num/univer/issues/2236)) ([3693e7a](https://github.com/dream-num/univer/commit/3693e7ad1b647f1ac3e8cae973d8eb27310b5280))
* fix docs links ([#2224](https://github.com/dream-num/univer/issues/2224)) ([5f26e90](https://github.com/dream-num/univer/commit/5f26e9094799e387eaa76d037c83add044aa204a))
* fix facade version ([71fcd08](https://github.com/dream-num/univer/commit/71fcd0873724284ea33f71eb8bfff503ee841fb3))
* fix resource key of filter ([e832ce3](https://github.com/dream-num/univer/commit/e832ce376b2fa2970921be04a22f1c16c4ba63eb))
* **formula:** formula string results are displayed as regular strings ([#2206](https://github.com/dream-num/univer/issues/2206)) ([1d1a45f](https://github.com/dream-num/univer/commit/1d1a45fb9d1cc1dbf2ec2c6ab595e181d561074d))
* inline style undo error at the doc end ([#2241](https://github.com/dream-num/univer/issues/2241)) ([91e6fbc](https://github.com/dream-num/univer/commit/91e6fbceebbce06fa3ceb4cb65fa75f184f68b46))
* lifecycle event handling in plugin holder ([#2244](https://github.com/dream-num/univer/issues/2244)) ([85af642](https://github.com/dream-num/univer/commit/85af642046feb12ecf842c7ed729be2a029f8789))
* **sheet:** clear custom field of selection ([#2178](https://github.com/dream-num/univer/issues/2178)) ([edd2af1](https://github.com/dream-num/univer/commit/edd2af1cd893cd4bb9bbcd6e8e1959684145375e))
* **sheet:** filterRenderController work after selectionRenderControll… ([#2229](https://github.com/dream-num/univer/issues/2229)) ([8f8e80d](https://github.com/dream-num/univer/commit/8f8e80d1051b2e4d8e8ef9c56a0c58fa8805d98b))
* **sheet:** restore code in setStyleCommand ([#2225](https://github.com/dream-num/univer/issues/2225)) ([e1f4a37](https://github.com/dream-num/univer/commit/e1f4a3712749613e785c6e04efbe77c69e783cda))
* **sheets-ui:** resolve issue where hidden worksheets cannot be unhidden ([#2258](https://github.com/dream-num/univer/issues/2258)) ([5e02b6e](https://github.com/dream-num/univer/commit/5e02b6ece21c92839d3bb56760d09e9e6c28be34))
* **sheet:** save edit content when select other tab ([#2160](https://github.com/dream-num/univer/issues/2160)) ([3e02de5](https://github.com/dream-num/univer/commit/3e02de5e486e9716c1d4cf051eec4a0c9c16fb17))
* **sheets:** bugfix for freeze & hover-manager-service & data-validation ([#2233](https://github.com/dream-num/univer/issues/2233)) ([9636037](https://github.com/dream-num/univer/commit/963603757c74e662899629cdc9e21c556e8b0df5)), closes [#684](https://github.com/dream-num/univer/issues/684) [#2174](https://github.com/dream-num/univer/issues/2174) [#2162](https://github.com/dream-num/univer/issues/2162)
* **sheet:** skip filtered row on setting style ([#2221](https://github.com/dream-num/univer/issues/2221)) ([206e080](https://github.com/dream-num/univer/commit/206e080fa5e7a935f8d90e46c5cdbe8308c578cb))
* the cursor is displayed incorrectly in the presence of bg color ([#2218](https://github.com/dream-num/univer/issues/2218)) ([84620d4](https://github.com/dream-num/univer/commit/84620d44d37323526c5105ee247457718d364397))
* **ui:** fix use observable not working in StrictMode ([#2235](https://github.com/dream-num/univer/issues/2235)) ([9929eff](https://github.com/dream-num/univer/commit/9929effb03a155575f2084cdedef0ab690394248))
* use Singleton Pattern of Hyphen ([#2242](https://github.com/dream-num/univer/issues/2242)) ([ba853df](https://github.com/dream-num/univer/commit/ba853df98f8a213df41f5ca48dd4bbb511f4edcb))


### Features

* add Russian translation support ([#2248](https://github.com/dream-num/univer/issues/2248)) ([87e0f84](https://github.com/dream-num/univer/commit/87e0f8488006a75749ec2ed03cd75eb2a347aff8))
* **design:** add borderless support for Select ([#2254](https://github.com/dream-num/univer/issues/2254)) ([c59b5a5](https://github.com/dream-num/univer/commit/c59b5a52501bab2b105af746fbf0d21f0fd61e35))
* **design:** add vertical layout support for CheckboxGroup and RadioGroup ([#2252](https://github.com/dream-num/univer/issues/2252)) ([c638477](https://github.com/dream-num/univer/commit/c63847733a7d167aacf68c8b60a80a480fc3ccc2))
* **design:** support multiple tree ([#2259](https://github.com/dream-num/univer/issues/2259)) ([1d11418](https://github.com/dream-num/univer/commit/1d11418f52fb522202facc4cde6ce56c02f4a06e))
* **facade:** add API to generate HTML content ([#2219](https://github.com/dream-num/univer/issues/2219)) ([3a9afd9](https://github.com/dream-num/univer/commit/3a9afd963aa1bf17c3f3e8d4877e3e5b16a93075))
* **network:** add fetch implementation ([#2226](https://github.com/dream-num/univer/issues/2226)) ([b970fe1](https://github.com/dream-num/univer/commit/b970fe1e93c5e66e1f80ea358681142d5e84b412))
* **render-engine:** hyphenation in paragraph layout ([#2172](https://github.com/dream-num/univer/issues/2172)) ([2739fba](https://github.com/dream-num/univer/commit/2739fbae2c2de1b5b5d580641c09e0003975fee2))
* **sheet:** add tooltip to FilterPanel ([#2234](https://github.com/dream-num/univer/issues/2234)) ([12d4aef](https://github.com/dream-num/univer/commit/12d4aeff18d0a8984b15625488b6092f4f137016))
* **sheet:** allow menu scroll when it over viewport ([#2215](https://github.com/dream-num/univer/issues/2215)) ([184b98b](https://github.com/dream-num/univer/commit/184b98b19e54a054de8de265b9f5d846624d4ab8))
* **sheets:** add set workbook name command ([#2249](https://github.com/dream-num/univer/issues/2249)) ([3c24cdd](https://github.com/dream-num/univer/commit/3c24cdd1df07c9b29957d71f4059bbac99b44e16))

## [0.1.10](https://github.com/dream-num/univer/compare/v0.1.9...v0.1.10) (2024-05-10)


### Bug Fixes

* **conditional-formatting:** custom formula rendering error ([#2117](https://github.com/dream-num/univer/issues/2117)) ([d04a0f8](https://github.com/dream-num/univer/commit/d04a0f8fd496415b07bd761eaee85f716c23fbf0))
* **conditional-formatting:** update icon set id ([#2109](https://github.com/dream-num/univer/issues/2109)) ([81a59fd](https://github.com/dream-num/univer/commit/81a59fdc1c52c054f7c014cda1ea39d27be66016))
* **conditional-formatting:** update icon set id ([#2115](https://github.com/dream-num/univer/issues/2115)) ([21b7a14](https://github.com/dream-num/univer/commit/21b7a145d745d64874c6791821c8e5b02007e769))
* **conditional-formatting:** viewmodel interception is not required at initialization time ([#2107](https://github.com/dream-num/univer/issues/2107)) ([305d235](https://github.com/dream-num/univer/commit/305d235091a0cfe77be02196bbcc44d39c1e37cf))
* correct skeleton dispose timing ([#2196](https://github.com/dream-num/univer/issues/2196)) ([87e96df](https://github.com/dream-num/univer/commit/87e96df3204953aaf89d5cd9328c9026629992bb))
* **docs:** text selection in multiple columns ([#2199](https://github.com/dream-num/univer/issues/2199)) ([5f9816e](https://github.com/dream-num/univer/commit/5f9816e060942ba642df41ee9bd63d6c883e65da))
* fix ci playwright ([#2168](https://github.com/dream-num/univer/issues/2168)) ([714b244](https://github.com/dream-num/univer/commit/714b2448352712943e448cdb0c3c3e324c7bfe63))
* fix slide rendering ([#2127](https://github.com/dream-num/univer/issues/2127)) ([300d5d6](https://github.com/dream-num/univer/commit/300d5d6959b43255bfc8a3e2e4ab7574b1c42ce4))
* message service do not return disposable ([#2155](https://github.com/dream-num/univer/issues/2155)) ([d831996](https://github.com/dream-num/univer/commit/d83199680949108dca3309736ce6bf4b1106c796))
* **render-engine:** fx column dose not display content ([#2161](https://github.com/dream-num/univer/issues/2161)) ([73e8c02](https://github.com/dream-num/univer/commit/73e8c0277bea79da6c7770684b02b40e919373e3))
* **render:** memory leak ([#2166](https://github.com/dream-num/univer/issues/2166)) ([9b078e2](https://github.com/dream-num/univer/commit/9b078e2cfb4f7c714c1715fe1e067b490c93b187))
* **render:** memory leak and capture ([#2171](https://github.com/dream-num/univer/issues/2171)) ([af27e38](https://github.com/dream-num/univer/commit/af27e38c59b5ac929684ed04013038cbd8047c8e))
* **sheet:** find-replace replaceAll only effect on the active sheet ([#2202](https://github.com/dream-num/univer/issues/2202)) ([0ed9f56](https://github.com/dream-num/univer/commit/0ed9f560ac7f42560a3c21943313b097f127d005))
* **sheets-data-validation:** data validation daily bugifx ([#2126](https://github.com/dream-num/univer/issues/2126)) ([3b45f89](https://github.com/dream-num/univer/commit/3b45f89548f000e5bf4939021c1f9bfa04fb9dca)), closes [#2121](https://github.com/dream-num/univer/issues/2121) [#2120](https://github.com/dream-num/univer/issues/2120) [#2114](https://github.com/dream-num/univer/issues/2114) [#2112](https://github.com/dream-num/univer/issues/2112)
* **sheet:** unhide hidden icon render incorrect when headers resize ([#2208](https://github.com/dream-num/univer/issues/2208)) ([a68bfb9](https://github.com/dream-num/univer/commit/a68bfb9bd14485d8e287eda6476490cc2463b452))
* **slides-ui:** fix excessive re-render issue to prevent infinite loop errors ([#2159](https://github.com/dream-num/univer/issues/2159)) ([9edf924](https://github.com/dream-num/univer/commit/9edf924dfb33cc21d8dd43285927deee58e693d0))


### Features

* **docs:** image layout in doc ([#1958](https://github.com/dream-num/univer/issues/1958)) ([00d0b79](https://github.com/dream-num/univer/commit/00d0b7917d75433629fad629d635adc427b6b4a5))
* **facade:** add sheet hooks, onCellPointerMove hook ([#2193](https://github.com/dream-num/univer/issues/2193)) ([476ffd3](https://github.com/dream-num/univer/commit/476ffd33c4425890e55e8dffdcb7a2563ed85f18))
* **facade:** refactor f-univer newAPI and add getDependencies ([#2176](https://github.com/dream-num/univer/issues/2176)) ([94a86d3](https://github.com/dream-num/univer/commit/94a86d3097980dede0cca584af48c0df9855794e))
* **formula:** report formula error message, check params number by minParams and maxParams ([#1876](https://github.com/dream-num/univer/issues/1876)) ([88f517b](https://github.com/dream-num/univer/commit/88f517be0411806982e4a54062e8d6c72326827e))
* ui plugin support override dependencies ([#2125](https://github.com/dream-num/univer/issues/2125)) ([561f7aa](https://github.com/dream-num/univer/commit/561f7aae1bce9a337b55c9512515ddbf5e3eed73))
* **user:** add user model ([#2137](https://github.com/dream-num/univer/issues/2137)) ([49c1a70](https://github.com/dream-num/univer/commit/49c1a70bb1013e5a04f9b9b3c0786858fee755b6))

## [0.1.9](https://github.com/dream-num/univer/compare/v0.1.8...v0.1.9) (2024-04-29)


### Bug Fixes

* fix doc editor cannot focus ([ab4fe64](https://github.com/dream-num/univer/commit/ab4fe643ecc02180fb408c8f23ed06ff05660a3c))
* global-zone componentKey initial value error ([#2100](https://github.com/dream-num/univer/issues/2100)) ([2404690](https://github.com/dream-num/univer/commit/240469054c462a6404c4bb40c3a9c6e1a743d28c))
* **sheet-formula:** store themeColor to reuse ([#2079](https://github.com/dream-num/univer/issues/2079)) ([6c2e1d3](https://github.com/dream-num/univer/commit/6c2e1d3225d2fd18b5a3473f8ccbfc9193ae9595))
* **sheet:** set bottom by default for vertical align ([#1929](https://github.com/dream-num/univer/issues/1929)) ([392f320](https://github.com/dream-num/univer/commit/392f320d98440ee20143e84d1508c35f28b21732))
* skeleton change will remove autofill popupmenu ([#2092](https://github.com/dream-num/univer/issues/2092)) ([5b80ca7](https://github.com/dream-num/univer/commit/5b80ca734e9dc1cd14948a6110a9fa00049993f7))
* **ui:** fix close ui plugin config and focus capturing ([#2086](https://github.com/dream-num/univer/issues/2086)) ([4a360f7](https://github.com/dream-num/univer/commit/4a360f7edb7c8af8d5e50707a260a497b9520a2e)), closes [#1914](https://github.com/dream-num/univer/issues/1914) [#1967](https://github.com/dream-num/univer/issues/1967)


### Features

* **facade:** workbook and worksheet operation ([#2076](https://github.com/dream-num/univer/issues/2076)) ([2daefd7](https://github.com/dream-num/univer/commit/2daefd7f82b642182663abe4a58f3578bc017399))

## [0.1.8](https://github.com/dream-num/univer/compare/v0.1.7...v0.1.8) (2024-04-26)


### Bug Fixes

* columns is not render properly ([#1952](https://github.com/dream-num/univer/issues/1952)) ([039e5e2](https://github.com/dream-num/univer/commit/039e5e2f6c6acaa2dd6590b9bea6ce475814c3be))
* **conditional-formatting:** create cf rule error ([#1969](https://github.com/dream-num/univer/issues/1969)) ([ee8f8de](https://github.com/dream-num/univer/commit/ee8f8de7e4ecf0bc656da9abd1e2979083108446))
* **conditional-formatting:** disregarding computation beyond the tables region ([#1891](https://github.com/dream-num/univer/issues/1891)) ([c14a3a8](https://github.com/dream-num/univer/commit/c14a3a8b831f36dacfd7955004acaef5849d9377))
* **conditional-formatting:** gradient fills may conceal cell values ([#1898](https://github.com/dream-num/univer/issues/1898)) ([70d3a7e](https://github.com/dream-num/univer/commit/70d3a7e8f3b8a024a7b48b65ae57a40d1021025b))
* **design:** fix checkbox group not updating visually on click ([#1989](https://github.com/dream-num/univer/issues/1989)) ([967eb39](https://github.com/dream-num/univer/commit/967eb399a2d4dc8ff82a184e5dc6a26321e81181))
* **dv:** fix data validation plugin type to prevent loading error ([#2084](https://github.com/dream-num/univer/issues/2084)) ([937fa13](https://github.com/dream-num/univer/commit/937fa13628b701ccb0c2efda94e5b47e6ce311c8))
* **editor:** formula input esc invalid ([#1902](https://github.com/dream-num/univer/issues/1902)) ([87f0994](https://github.com/dream-num/univer/commit/87f0994f914bc45d69d88f0f7018e288b955c140))
* **facade:** fix handling of empty selections in `onSelectionChange` method ([#2066](https://github.com/dream-num/univer/issues/2066)) ([e440e04](https://github.com/dream-num/univer/commit/e440e045b232743bd886e46d82003156ff9c9b9f))
* fix API not exported ([b4913f9](https://github.com/dream-num/univer/commit/b4913f93d748d0e9f1d785c64e36af74c5a928be))
* fix current render handling in desktop controller ([#2067](https://github.com/dream-num/univer/issues/2067)) ([ddbeb02](https://github.com/dream-num/univer/commit/ddbeb022750811b07bcf32b23a9d0c6e4f68f80d))
* fix lifecycle stages ([37777f1](https://github.com/dream-num/univer/commit/37777f1dc3fa2b4c6c6b0012e609c8517a91f722))
* fix lint errors ([4e970d4](https://github.com/dream-num/univer/commit/4e970d417a904d4da4c50a936bac68cccd924a6a))
* fix memory leak on dispose sheet unit ([#1900](https://github.com/dream-num/univer/issues/1900)) ([4a5eca1](https://github.com/dream-num/univer/commit/4a5eca1927dd247f0d849392d4af9942ab8f5746))
* fix memory leaking in active cell ([761a372](https://github.com/dream-num/univer/commit/761a372ca9db59a03c55c7329e424df1369f7ab1))
* fix non-sheet renderer should not be set container ([#2044](https://github.com/dream-num/univer/issues/2044)) ([00b30e5](https://github.com/dream-num/univer/commit/00b30e567c0f34469707ac3e1552dd13f8150d40))
* fix plugin not added to seen list ([7591212](https://github.com/dream-num/univer/commit/75912125a76102c6786b0896247fbe0d35bd0386))
* fix unit cannot be destroyed or recreate ([#2081](https://github.com/dream-num/univer/issues/2081)) ([b67a9f8](https://github.com/dream-num/univer/commit/b67a9f835700394843a6d0f935ec7b6cea31620b))
* fix univer plugin lifecycle not triggered ([#2023](https://github.com/dream-num/univer/issues/2023)) ([827e5a3](https://github.com/dream-num/univer/commit/827e5a3239c042e2bfb1356b80c1ce092ee2205b))
* fix univer plugin not started ([5f5b0a7](https://github.com/dream-num/univer/commit/5f5b0a76d9a4335bd61251915bb4e49786e8cca7))
* getCurrent methods should possibly return null ([#1892](https://github.com/dream-num/univer/issues/1892)) ([859d7fc](https://github.com/dream-num/univer/commit/859d7fc2d90fb10ad1a77177ab6e8cae4ce6b326))
* punctuation adjustment ([#1867](https://github.com/dream-num/univer/issues/1867)) ([e921128](https://github.com/dream-num/univer/commit/e921128858b7827d09c5a404cc584e300ca9f22b))
* rect-popup event bind error ([#1922](https://github.com/dream-num/univer/issues/1922)) ([ac17c69](https://github.com/dream-num/univer/commit/ac17c692b1deb57c1cfa17516b3905c9b7d5fa91))
* refocus sheet cell when create new sheet ([#1896](https://github.com/dream-num/univer/issues/1896)) ([db88447](https://github.com/dream-num/univer/commit/db884470755c2ee344051226e1cbfe93f6a93dee))
* **render-engine:** punctuation render error in sheet cell ([#2034](https://github.com/dream-num/univer/issues/2034)) ([d7ddad1](https://github.com/dream-num/univer/commit/d7ddad11c3d8cc5512c40e5c087d6953afa1a4cc))
* replace whitespace characters in html str ([#1904](https://github.com/dream-num/univer/issues/1904)) ([1ff1261](https://github.com/dream-num/univer/commit/1ff12617f33da57c4fd4c1a0594b4f309e2d6c54))
* **sheet-formula:** fix error message on missing formula ([#1885](https://github.com/dream-num/univer/issues/1885)) ([0ab866e](https://github.com/dream-num/univer/commit/0ab866e2f6668a27de6ddc45908c315169ac6830))
* **sheet:** add cell custom field ([#2021](https://github.com/dream-num/univer/issues/2021)) ([53b9041](https://github.com/dream-num/univer/commit/53b904140ae8ef4037eb0bc1693a0011b2037cd3))
* **sheet:** cell custom supports updating from mutation ([#2058](https://github.com/dream-num/univer/issues/2058)) ([bec1944](https://github.com/dream-num/univer/commit/bec1944bd4d8e0a9bd77a759034c03325dd8f969))
* **sheet:** defined name move ([#1888](https://github.com/dream-num/univer/issues/1888)) ([be2fec3](https://github.com/dream-num/univer/commit/be2fec37cbad9d8e0e7c3672347cc0222b3dfef8))
* **sheet:** defined name update name ([#1917](https://github.com/dream-num/univer/issues/1917)) ([5b6e223](https://github.com/dream-num/univer/commit/5b6e2237a1d1f02ff29494737f077a7f4eb6b92a))
* **sheet:** editor set rich error ([#1918](https://github.com/dream-num/univer/issues/1918)) ([d4f67f8](https://github.com/dream-num/univer/commit/d4f67f81877931848a8b059d6c82f6a4106b4ca2))
* **sheet:** esc key for editor ([#1928](https://github.com/dream-num/univer/issues/1928)) ([54487b8](https://github.com/dream-num/univer/commit/54487b824ecb3e1f5122ddd94032a7f0dd5c42b5))
* **sheet:** fix some copy/paste bugs ([#1754](https://github.com/dream-num/univer/issues/1754)) ([496dcb8](https://github.com/dream-num/univer/commit/496dcb8c2f6851be308043340a026307a040daf3))
* **sheet:** header hidden ([#1954](https://github.com/dream-num/univer/issues/1954)) ([e3dc9ce](https://github.com/dream-num/univer/commit/e3dc9ce992b4d409bbca4ad07dd5a6811f505bda))
* **sheet:** life cycle steady ([#1927](https://github.com/dream-num/univer/issues/1927)) ([fbabfaa](https://github.com/dream-num/univer/commit/fbabfaa6d9d92fccfc2df1e03c2d05229e55ee40))
* **sheet:** move formula ref ([#2078](https://github.com/dream-num/univer/issues/2078)) ([fa4ebea](https://github.com/dream-num/univer/commit/fa4ebeaa1d9265bc84e518e0053c6a03001d12b3))
* **sheet:** range selector drag row ([#1729](https://github.com/dream-num/univer/issues/1729)) ([530a852](https://github.com/dream-num/univer/commit/530a852970726ac788607d13f5d75ea2599661bc))
* **sheet:** range selector error ([#1897](https://github.com/dream-num/univer/issues/1897)) ([a2c8cb6](https://github.com/dream-num/univer/commit/a2c8cb645bef11d1658a0eb613e1fa444c98c328))
* **sheets-data-validation:** fix reject input incorrect ([#2082](https://github.com/dream-num/univer/issues/2082)) ([6e03118](https://github.com/dream-num/univer/commit/6e0311881a54880c46faf4bd3d48f802f7565c7c))
* sheets-formula initialize time ([#1910](https://github.com/dream-num/univer/issues/1910)) ([a461d16](https://github.com/dream-num/univer/commit/a461d16fdf7af30052b02762d3dc2eea4a2647d4))
* **sheets-ui:** after unhiding row or col icon doesn't disappear ([#2075](https://github.com/dream-num/univer/issues/2075)) ([f07c2d9](https://github.com/dream-num/univer/commit/f07c2d9bd5acfc95db8cde7cc5ee70a617a65ab7))
* **sheets:** the text is aligned at editorial and non-editorial states ([#1874](https://github.com/dream-num/univer/issues/1874)) ([c7e26a0](https://github.com/dream-num/univer/commit/c7e26a04c27284c17a4cb8835090320459ec79ac))
* text is cropped when rendered in italic style with background ([#1862](https://github.com/dream-num/univer/issues/1862)) ([80f43b8](https://github.com/dream-num/univer/commit/80f43b87755954018972a51013dccd35d486f72b))
* the strickthough position is wrong when fontsize is different ([#1919](https://github.com/dream-num/univer/issues/1919)) ([2564456](https://github.com/dream-num/univer/commit/2564456e34137c2536a83d7aeb4af2ce7a2aa29d))
* **ui:** stop onblur propagation at root to prevent external focusout conflicts ([#1894](https://github.com/dream-num/univer/issues/1894)) ([04abb1b](https://github.com/dream-num/univer/commit/04abb1b68237debc8dfec3510948386cfd0620c5))
* univer plugin holder start immediately ([8c3bb90](https://github.com/dream-num/univer/commit/8c3bb904ee44a76e2ee46dd014766c56c4e979e4))
* univer should auto start ([af032c8](https://github.com/dream-num/univer/commit/af032c806b09f7bcef0d71bc84ce236542504c04))


### Features

* **core:** refactoring resources load and snapshot ([#1853](https://github.com/dream-num/univer/issues/1853)) ([8ae91b7](https://github.com/dream-num/univer/commit/8ae91b7664396a2d6dbfc5185ca2f4ee80e5f2d2))
* **core:** univer support override dependencies ([#2050](https://github.com/dream-num/univer/issues/2050)) ([cfad0da](https://github.com/dream-num/univer/commit/cfad0da04abb585b8ea6387c01e085af3bea7c53))
* **data-validation:** transform support for data validation ([#1915](https://github.com/dream-num/univer/issues/1915)) ([22ccbb1](https://github.com/dream-num/univer/commit/22ccbb17e4b9037e90e320c2eae17c4c18d42991))
* **doc:** refactor of text shaping and support kerning ([#1785](https://github.com/dream-num/univer/issues/1785)) ([e7f1036](https://github.com/dream-num/univer/commit/e7f103622f6c07ed6dccc31078e9fe9dc21cc851))
* **engine-formula:** add iseven isodd ([#1873](https://github.com/dream-num/univer/issues/1873)) ([21d145c](https://github.com/dream-num/univer/commit/21d145c4091a5bdb1bbc7f6099992844794445cb))
* **engine-render:** add render unit system ([#2025](https://github.com/dream-num/univer/issues/2025)) ([a5243da](https://github.com/dream-num/univer/commit/a5243da72008514c0810a79c9ad3719f32debc04))
* export identifiers from packages index.ts ([#2049](https://github.com/dream-num/univer/issues/2049)) ([bced914](https://github.com/dream-num/univer/commit/bced9140bc6bdae9d5d8069dd09fbc1f0ef52cf8))
* **facade:** f-worksheet add getName method ([#2042](https://github.com/dream-num/univer/issues/2042)) ([10cc6e1](https://github.com/dream-num/univer/commit/10cc6e1526b1c0c0f07c275c74e08f40842fd846))
* **formula:** formula calculation progress ([#1985](https://github.com/dream-num/univer/issues/1985)) ([ad1d632](https://github.com/dream-num/univer/commit/ad1d6325122d3982070d74de0fc6453680633244))
* **formula:** implement formula lower ([#1970](https://github.com/dream-num/univer/issues/1970)) ([db3fa45](https://github.com/dream-num/univer/commit/db3fa45f0b60c31254679ff540bc2a8bc6a62e5a))
* **image:** add plugin ([#1962](https://github.com/dream-num/univer/issues/1962)) ([9c494ae](https://github.com/dream-num/univer/commit/9c494aecfedb85f6120ed3a3d8f2537c75435eb6))
* **numfmt:** refactor the numfmt model ([#1945](https://github.com/dream-num/univer/issues/1945)) ([1840166](https://github.com/dream-num/univer/commit/18401663906e8b2a44814b3a8011128aa85f58b8))
* **sheet:** force string adds popup ([#1934](https://github.com/dream-num/univer/issues/1934)) ([add1214](https://github.com/dream-num/univer/commit/add121435f52cd82e9d25763acc082cd33585e2d))
* **sheet:** indirect support defined name ([#1899](https://github.com/dream-num/univer/issues/1899)) ([6c0833a](https://github.com/dream-num/univer/commit/6c0833af4eda76571da2fac3f0febb0d0142a86b))
* **sheets-ui:** optimize popup service ([#1912](https://github.com/dream-num/univer/issues/1912)) ([a555160](https://github.com/dream-num/univer/commit/a555160a97f7aa92dd0891b5e805806c5398a99d))
* **sheets:** filter ([#1465](https://github.com/dream-num/univer/issues/1465)) ([1f03b7a](https://github.com/dream-num/univer/commit/1f03b7a33975d0c8e4203c962a4aadd6e5b5240e))
* **sheets:** register other formula ([#2045](https://github.com/dream-num/univer/issues/2045)) ([4a8ffd9](https://github.com/dream-num/univer/commit/4a8ffd944cc13958ffe03a8e2355f64dc3ebb69a))
* **umd:** create all-in-one UMD bundle ([#2062](https://github.com/dream-num/univer/issues/2062)) ([e76fe4e](https://github.com/dream-num/univer/commit/e76fe4e601adf7c879f3e887ed18a919f7725aa1))
* univer can take parent injector ([f8ea16a](https://github.com/dream-num/univer/commit/f8ea16ae08076458ada0fca7523684fb332610c6))
* update codeowners ([#2019](https://github.com/dream-num/univer/issues/2019)) ([5b0a103](https://github.com/dream-num/univer/commit/5b0a103818d42c747d2ac178d3fdfe08d91d2f90))


### Performance Improvements

* **formula:** dependency maintain ([#1638](https://github.com/dream-num/univer/issues/1638)) ([b745845](https://github.com/dream-num/univer/commit/b745845c9ad93d9af4f42507c1025e564f54ea93))

## [0.1.7](https://github.com/dream-num/univer/compare/v0.1.6...v0.1.7) (2024-04-12)


### Bug Fixes

* auto height is not work when at default column width ([#1840](https://github.com/dream-num/univer/issues/1840)) ([55e0869](https://github.com/dream-num/univer/commit/55e08698ec66e15fc0146e38f5099b0d50e8c41a))
* **condiational-formatting:** rename `SheetsConditionalFormattingUiPlugin` ([#1801](https://github.com/dream-num/univer/issues/1801)) ([9b14a5a](https://github.com/dream-num/univer/commit/9b14a5a0ec2426fde4e841f747dae92ecdcfd4df))
* **conditional-formatting:** fix the logic for hidden$ in conditional formatting ([#1813](https://github.com/dream-num/univer/issues/1813)) ([cd631af](https://github.com/dream-num/univer/commit/cd631af7b28b674489a961a93b417b43c8fd5746))
* **design:** ensure popup component is appended to root to prevent offset from stacking contexts ([#1850](https://github.com/dream-num/univer/issues/1850)) ([1ad518a](https://github.com/dream-num/univer/commit/1ad518a8ba429ccfb5f6682a40c1a3bae3b540f2))
* **design:** fix slider to stop responding to mouse movement after release during zoom operations ([#1834](https://github.com/dream-num/univer/issues/1834)) ([3d5a26e](https://github.com/dream-num/univer/commit/3d5a26e28c815440d307921abb8a5c44fb9088cf))
* **design:** fix tooltip behavior ([#1845](https://github.com/dream-num/univer/issues/1845)) ([bd85759](https://github.com/dream-num/univer/commit/bd8575919f80a6b2adbba8084774efa5dec3d9ce))
* **design:** set default language to zhCN ([#1863](https://github.com/dream-num/univer/issues/1863)) ([08e8d58](https://github.com/dream-num/univer/commit/08e8d58297ed29d3f365653ed1da2100fc7e8585))
* display error in font family ([#1700](https://github.com/dream-num/univer/issues/1700)) ([8c2282b](https://github.com/dream-num/univer/commit/8c2282b174887bedafb8f9d29d2e73c03c0cfd91))
* **docs:** list indent and hanging ([#1675](https://github.com/dream-num/univer/issues/1675)) ([4020055](https://github.com/dream-num/univer/commit/402005514924328161714f26207f72ed7781c9af))
* **docs:** strikethrough position is incorrect ([#1836](https://github.com/dream-num/univer/issues/1836)) ([3f68158](https://github.com/dream-num/univer/commit/3f68158d69f3bf30c87b1d11618c7b86ccbb44a7))
* **engine-render:** ignore media change on printing mode ([#1808](https://github.com/dream-num/univer/issues/1808)) ([f5fc6be](https://github.com/dream-num/univer/commit/f5fc6bef73166b132087ea5595916728e8b9fea4))
* **formula:** copy paste range with formulas ([#1765](https://github.com/dream-num/univer/issues/1765)) ([58c7d3e](https://github.com/dream-num/univer/commit/58c7d3e722638c56a4ce91b3f2ab3c0fb7b42d78))
* **formula:** null value return not zero ([#1851](https://github.com/dream-num/univer/issues/1851)) ([87d8e20](https://github.com/dream-num/univer/commit/87d8e207c97b17c872f82848237e61cca828a4c1))
* **formula:** use ref range formula ([#1694](https://github.com/dream-num/univer/issues/1694)) ([d8f1dc4](https://github.com/dream-num/univer/commit/d8f1dc4100c7472e1e1a82205b853e879ce60311))
* inline format error in cell ([#1843](https://github.com/dream-num/univer/issues/1843)) ([2002fdf](https://github.com/dream-num/univer/commit/2002fdfb1a52a44b97835fbfb8b068a3a88ba8fa))
* **rpc:** skip missing mutations in remote replica ([#1826](https://github.com/dream-num/univer/issues/1826)) ([1e10cbf](https://github.com/dream-num/univer/commit/1e10cbfe72ba3eee8647aae09e92a6fbbac8d31b))
* **sheet-ui:** make the default font family and font size correct ([#1827](https://github.com/dream-num/univer/issues/1827)) ([ea18b99](https://github.com/dream-num/univer/commit/ea18b99b5f0b01b1712c38f61f83c78d2b2a38c8))
* **sheet:** defined name vertical ([#1832](https://github.com/dream-num/univer/issues/1832)) ([edf86f4](https://github.com/dream-num/univer/commit/edf86f45299de4ba8be30aaaed4e867861a50671))
* **sheet:** editor and selection position ([#1830](https://github.com/dream-num/univer/issues/1830)) ([e23992f](https://github.com/dream-num/univer/commit/e23992fcb0d8ef69ec57a721dfc1c7d14c525bee))
* **sheet:** remove set current mutation ([#1802](https://github.com/dream-num/univer/issues/1802)) ([79ce85d](https://github.com/dream-num/univer/commit/79ce85d648a57ceb40eeaf837794654ae9b626f0))
* **sheets-ui:** data-validation event bind timing ([#1804](https://github.com/dream-num/univer/issues/1804)) ([d0cac23](https://github.com/dream-num/univer/commit/d0cac23b90bbe6c12ee32435a73579af96599c37))
* **sheets-ui:** fix border panel icons ([#1815](https://github.com/dream-num/univer/issues/1815)) ([ea7636e](https://github.com/dream-num/univer/commit/ea7636ec81056423ef018bafdfe059be3ec16658))
* **sheets:** fix the issue where the editor position is incorrect after unmerging cells ([#1717](https://github.com/dream-num/univer/issues/1717)) ([7d27f11](https://github.com/dream-num/univer/commit/7d27f1178f681e4b912326627b5e44dd77085048))
* **sheet:** update internal id ([#1825](https://github.com/dream-num/univer/issues/1825)) ([fc4cc4c](https://github.com/dream-num/univer/commit/fc4cc4cb2db892d643c4b3ce1f5a48e72d1d164b))
* ts-error ([#1858](https://github.com/dream-num/univer/issues/1858)) ([b8007cb](https://github.com/dream-num/univer/commit/b8007cb9e7f042a2085872b741933217d7c2e996))
* uniscript entry is displayed in zen mode ([#1842](https://github.com/dream-num/univer/issues/1842)) ([337af7d](https://github.com/dream-num/univer/commit/337af7daac84d9ff3c32e8a8ab91f307b5cce16a))
* **uniscript:** script editor service is not exposed ([68647a6](https://github.com/dream-num/univer/commit/68647a6d8019d14d255a34059bfc27463100770b))


### Features

* **conditional-formatting:** bugfix ([#1838](https://github.com/dream-num/univer/issues/1838)) ([c0b3dce](https://github.com/dream-num/univer/commit/c0b3dce0f713fe083523eff9b0fc5bda83853439))
* **design:** add `indeterminate` property support to Checkbox component ([#1870](https://github.com/dream-num/univer/issues/1870)) ([f522a34](https://github.com/dream-num/univer/commit/f522a345e32f4a3fd4cf0db50ecdc22e8ab69c4a))
* **docs:** support background color in doc ([#1846](https://github.com/dream-num/univer/issues/1846)) ([3a38828](https://github.com/dream-num/univer/commit/3a38828fafbb7c2b8681362bd6471367a559cde1))
* **formula:** add the Maxifs function ([#1711](https://github.com/dream-num/univer/issues/1711)) ([52b2698](https://github.com/dream-num/univer/commit/52b26982ae3eb3c86dfc253166571ea37481f758))
* **sheets-data-validation:** move draggable-list to design ([#1822](https://github.com/dream-num/univer/issues/1822)) ([3acf286](https://github.com/dream-num/univer/commit/3acf286af96752d44ea47c9287ed93d608ce33ef))
* **sheets-ui:** add f2 to start editing ([#1875](https://github.com/dream-num/univer/issues/1875)) ([b740dfa](https://github.com/dream-num/univer/commit/b740dfa864162d9eabb99910b577cb78f8deb7ac))
* **sheets-ui:** sheet popup service should respond to row col changes ([#1848](https://github.com/dream-num/univer/issues/1848)) ([6868a47](https://github.com/dream-num/univer/commit/6868a47cd22265b1718a9bf8c3318450b9d9dcfb))
* **sheets:** add watch API to ref-range-service ([#1635](https://github.com/dream-num/univer/issues/1635)) ([5f7e9a2](https://github.com/dream-num/univer/commit/5f7e9a2f238efcb6b0b6598991b897d56d6ed549))
* **sheets:** data-validation ref-range & optimize package orignize ([#1784](https://github.com/dream-num/univer/issues/1784)) ([a475474](https://github.com/dream-num/univer/commit/a4754741871698760f839c93051c0c6e8199016f))
* **ui:** add disable auto focus config ([#1682](https://github.com/dream-num/univer/issues/1682)) ([6256c15](https://github.com/dream-num/univer/commit/6256c151caa8975053edc65e6bf3d54b37b0329c))
* **ui:** optimize scrollbar ([#1856](https://github.com/dream-num/univer/issues/1856)) ([9e76a28](https://github.com/dream-num/univer/commit/9e76a28ec92715ab299049ad464f3a821bdc8607))

## [0.1.6](https://github.com/dream-num/univer/compare/v0.1.5...v0.1.6) (2024-04-03)


### Bug Fixes

* backspace will cause error when doc is not ready ([#1725](https://github.com/dream-num/univer/issues/1725)) ([f24fdb1](https://github.com/dream-num/univer/commit/f24fdb17b7e967cb53f09d0c4a877b646b53c6b7))
* **conditional-formatting:** configuration exceptions are specifically handled ([#1750](https://github.com/dream-num/univer/issues/1750)) ([37a7787](https://github.com/dream-num/univer/commit/37a77873c6e5757f125593e6babf5d408d457817))
* **conditional-formatting:** support row/col hidden ([#1747](https://github.com/dream-num/univer/issues/1747)) ([7ed59d1](https://github.com/dream-num/univer/commit/7ed59d138b91440ae5c7ea9941c2c8f444c8dc1b))
* data-validation i18n ([#1788](https://github.com/dream-num/univer/issues/1788)) ([73aae0b](https://github.com/dream-num/univer/commit/73aae0bbee39e0fac3c5059a18411679ef92b898))
* delete undo redo ([#1781](https://github.com/dream-num/univer/issues/1781)) ([8d8e615](https://github.com/dream-num/univer/commit/8d8e6153308bdc574a0014924286d0715b70790c))
* **design:** apply `pointer-events: none` to avoid `::selection` in Safari ([#1792](https://github.com/dream-num/univer/issues/1792)) ([86bb772](https://github.com/dream-num/univer/commit/86bb772224f8b4c19d9c296413ec8ac2ba7135e5))
* **design:** change tooltip to not remain active after hover ([#1756](https://github.com/dream-num/univer/issues/1756)) ([2019a77](https://github.com/dream-num/univer/commit/2019a775cc712a62172a36f1f491e9f14b0c6450))
* **facade:** fix set horizontal, vertical, warp ([#1766](https://github.com/dream-num/univer/issues/1766)) ([1876e68](https://github.com/dream-num/univer/commit/1876e68d23241f14faf6885cc5e8f2b074ff4c72))
* **find-replace:** add locale exports ([#1760](https://github.com/dream-num/univer/issues/1760)) ([a573166](https://github.com/dream-num/univer/commit/a573166c48e160ea279ba3917fde04b375fe8c05))
* **formula:** bracket nested ([#1799](https://github.com/dream-num/univer/issues/1799)) ([d84a618](https://github.com/dream-num/univer/commit/d84a6187d59a905abfd654e2d21d31e6fc380337))
* **formula:** today fill error ([#1798](https://github.com/dream-num/univer/issues/1798)) ([4b35198](https://github.com/dream-num/univer/commit/4b35198d436ac1e2bc79e98c81904029b3871480))
* punctuation adjustment in the middle of line ([#1686](https://github.com/dream-num/univer/issues/1686)) ([2382e3b](https://github.com/dream-num/univer/commit/2382e3bdb092f47342993b2bd5b723c0bf381111))
* **sheet:** error while creating an empty subunit ([#1748](https://github.com/dream-num/univer/issues/1748)) ([662b4e0](https://github.com/dream-num/univer/commit/662b4e0b843d2f399257f689d51c065f232f44b6))
* **sheet:** selection size and editor position ([#1743](https://github.com/dream-num/univer/issues/1743)) ([fd83cbf](https://github.com/dream-num/univer/commit/fd83cbfd168b383fb0dc604a8d6d0a149ee8e287))
* **sheets:** fix shallow copy bugs of the sheet snapshot ([#1742](https://github.com/dream-num/univer/issues/1742)) ([83d910c](https://github.com/dream-num/univer/commit/83d910c328e91b196491fc3459de2744d3948b90))
* **sheets:** fix the issue with selection during autofill ([#1707](https://github.com/dream-num/univer/issues/1707)) ([eb6f8d0](https://github.com/dream-num/univer/commit/eb6f8d00bb81118e4e642d17d024eb14c6f52087))
* **sheets:** fix value type casting in set range values ([#1646](https://github.com/dream-num/univer/issues/1646)) ([227f5b0](https://github.com/dream-num/univer/commit/227f5b0ba1c4bc19257e3fae6ca8fc93cd1139ea))
* **sheets:** merge disappear on hide row ([#1714](https://github.com/dream-num/univer/issues/1714)) ([e68d47f](https://github.com/dream-num/univer/commit/e68d47f1951dc9d5f7f76750c8afee413c9c457b))
* **sheets:** some bugs about copy&paste / remove row&col / autofill ([#1561](https://github.com/dream-num/univer/issues/1561)) ([e1072c7](https://github.com/dream-num/univer/commit/e1072c743941019d51ed5f284c66d6f01bda333d))
* the error clip the last char when linebreak ([#1745](https://github.com/dream-num/univer/issues/1745)) ([009b5b4](https://github.com/dream-num/univer/commit/009b5b4708a927939e76dd0936fe2e5244dfc14d))


### Features

* **condiational-formatting:** update enUS locale ([#1787](https://github.com/dream-num/univer/issues/1787)) ([785e141](https://github.com/dream-num/univer/commit/785e141f8b8a311bb1bf55922bac34ecd6765d8e))
* **conditional-formatting:** support set cfId ([#1753](https://github.com/dream-num/univer/issues/1753)) ([4a277f9](https://github.com/dream-num/univer/commit/4a277f932c6e27f7bd354494ce13851b31b7eaa5))
* **design:** add `Textarea` component ([#1778](https://github.com/dream-num/univer/issues/1778)) ([a2dd33d](https://github.com/dream-num/univer/commit/a2dd33d914580a067ea3149b1e17b31c8bd68973))
* **design:** set default text color to prevent inheritance ([#1751](https://github.com/dream-num/univer/issues/1751)) ([71e1d94](https://github.com/dream-num/univer/commit/71e1d9406f7e82a30b37afb70b9a78ab0bdce480))
* **facade:** add getMaxColumns and getMaxRows API on FWorksheet ([#1775](https://github.com/dream-num/univer/issues/1775)) ([c903780](https://github.com/dream-num/univer/commit/c90378045f0a1caf65b555ff933348d1599a4632))
* **facade:** add getSheetBySheetId API on FWorkbook ([#1762](https://github.com/dream-num/univer/issues/1762)) ([436b1b4](https://github.com/dream-num/univer/commit/436b1b47f8461c6ed25f1d4a98a8a2d9b4b150c1))
* **facade:** sheet api getId rename to getSheetId ([#1770](https://github.com/dream-num/univer/issues/1770)) ([dff654c](https://github.com/dream-num/univer/commit/dff654c156f8e0f4aa501a8ad655cf5baf21eaf7))
* **sheet:** defined name ([#1737](https://github.com/dream-num/univer/issues/1737)) ([cfa9375](https://github.com/dream-num/univer/commit/cfa9375720ac6cdebc1e1572687a8849204fd372))
* **sheet:** optimize data validation i18n & dropdown bugfix ([#1768](https://github.com/dream-num/univer/issues/1768)) ([a8c9452](https://github.com/dream-num/univer/commit/a8c945290283578029f09104082581a8bd1cceb0))
* **sheets:** support data validation ([#1676](https://github.com/dream-num/univer/issues/1676)) ([9961b32](https://github.com/dream-num/univer/commit/9961b3243c339e8fee64dea145c1507524e03b49))
* support char which length is great than 1 ([#1783](https://github.com/dream-num/univer/issues/1783)) ([32cfb3b](https://github.com/dream-num/univer/commit/32cfb3bf2e7c039813908a4523df3dc0d72ef227))

## [0.1.5](https://github.com/dream-num/univer/compare/v0.1.4...v0.1.5) (2024-03-29)


### Bug Fixes

* **editor:** range selector and range drag ([#1713](https://github.com/dream-num/univer/issues/1713)) ([02e9647](https://github.com/dream-num/univer/commit/02e96473f309d03984a03e5a64e1e61bba5040fa))
* **editor:** short key error and normal range show ([#1688](https://github.com/dream-num/univer/issues/1688)) ([571ec0b](https://github.com/dream-num/univer/commit/571ec0b17f8064953967e635331154e4e57856b9))
* fixing the range of remove merged selection and filter empty ranges ([#1680](https://github.com/dream-num/univer/issues/1680)) ([117cbbe](https://github.com/dream-num/univer/commit/117cbbefbf86b7847f565fbcd3ea74b956f8d285))
* **formula:** index function handles base value object ([#1692](https://github.com/dream-num/univer/issues/1692)) ([1f0b700](https://github.com/dream-num/univer/commit/1f0b7003f44e908f6c1a8e0a68343184c5658d91))
* punctuation adjustment issues in slide ([#1690](https://github.com/dream-num/univer/issues/1690)) ([15cb6df](https://github.com/dream-num/univer/commit/15cb6df4f0224e18c318c00d6e972c5d06f01cbc))
* **render:** media change for refresh canvas ([#1697](https://github.com/dream-num/univer/issues/1697)) ([dd6bfed](https://github.com/dream-num/univer/commit/dd6bfed0403dc87c9414ae90c1fe67c15cb30743))
* **sheet:** active dirty dependency ui ([#1728](https://github.com/dream-num/univer/issues/1728)) ([d8c9e4b](https://github.com/dream-num/univer/commit/d8c9e4b241872b1470ae7a87bba4ba13cd782809))
* **sheet:** fix the selection is incorrect when autofill intersects w… ([#1661](https://github.com/dream-num/univer/issues/1661)) ([ebdcc6c](https://github.com/dream-num/univer/commit/ebdcc6ccf66362d14863a5e9daf0c6dc070e57a9))
* **sheet:** fix toolbar state when there's overlapping selection ([#1521](https://github.com/dream-num/univer/issues/1521)) ([1ebfe1a](https://github.com/dream-num/univer/commit/1ebfe1a7befe19ce0decd634d9bd69ca7bcaaaf2))
* **sheet:** handle key value conflicts ([#1720](https://github.com/dream-num/univer/issues/1720)) ([9abc7c5](https://github.com/dream-num/univer/commit/9abc7c575c68017996d9f564cb5ae7e182f6a1c7))
* **sheet:** null-value will not unexpected deleted when moving row/cols  ([#1691](https://github.com/dream-num/univer/issues/1691)) ([1a1f7c8](https://github.com/dream-num/univer/commit/1a1f7c89cf562375e97cab9642e93415c6a02806))
* **sheet:** set-tab-order-mutation should has fromIndex in parmas for transforming ([#1704](https://github.com/dream-num/univer/issues/1704)) ([6d05bd9](https://github.com/dream-num/univer/commit/6d05bd9adcbfd78fdec9a597c29fcbe1d9ff001d))
* **slides:** export locale ([#1702](https://github.com/dream-num/univer/issues/1702)) ([403c529](https://github.com/dream-num/univer/commit/403c529312b04d5e233c5b3f750dae642060227a))
* **ui:** canvas popup event bind error ([#1683](https://github.com/dream-num/univer/issues/1683)) ([8a0bfd6](https://github.com/dream-num/univer/commit/8a0bfd6be5632b94d30724906c4a2c2561a1cdb6))
* **ui:** fix toolbar display issues by adjusting reactive hidden item filtering logic ([8b604eb](https://github.com/dream-num/univer/commit/8b604eb4c37538fc1176dc3baac28f4547cce261))
* **ui:** fix toolbar responsiveness on small screens ([#1716](https://github.com/dream-num/univer/issues/1716)) ([a9755e8](https://github.com/dream-num/univer/commit/a9755e8c901259ff6fb9f0253d8802eb76ac2cd7))
* **ui:** fix use observable ([#1719](https://github.com/dream-num/univer/issues/1719)) ([eabe6fb](https://github.com/dream-num/univer/commit/eabe6fbd6a8e51ff7a1f81cd7c292ca7767d3f32))


### Features

* **conditional-format:** support conditional format ([#1681](https://github.com/dream-num/univer/issues/1681)) ([50edd34](https://github.com/dream-num/univer/commit/50edd3475c6c75ef3491e1d52cda601768a0a321)), closes [#433](https://github.com/dream-num/univer/issues/433) [#439](https://github.com/dream-num/univer/issues/439) [#495](https://github.com/dream-num/univer/issues/495) [#489](https://github.com/dream-num/univer/issues/489) [#487](https://github.com/dream-num/univer/issues/487) [#485](https://github.com/dream-num/univer/issues/485) [#483](https://github.com/dream-num/univer/issues/483) [#480](https://github.com/dream-num/univer/issues/480) [#475](https://github.com/dream-num/univer/issues/475) [#472](https://github.com/dream-num/univer/issues/472) [#468](https://github.com/dream-num/univer/issues/468) [#458](https://github.com/dream-num/univer/issues/458) [#433](https://github.com/dream-num/univer/issues/433) [#437](https://github.com/dream-num/univer/issues/437) [#446](https://github.com/dream-num/univer/issues/446) [#486](https://github.com/dream-num/univer/issues/486) [#437](https://github.com/dream-num/univer/issues/437) [#461](https://github.com/dream-num/univer/issues/461) [#454](https://github.com/dream-num/univer/issues/454) [#480](https://github.com/dream-num/univer/issues/480)

## [0.1.4](https://github.com/dream-num/univer/compare/v0.1.3...v0.1.4) (2024-03-25)


### Bug Fixes

* **design:** correct checkbox checked state logic for standalone usage ([#1627](https://github.com/dream-num/univer/issues/1627)) ([5eea109](https://github.com/dream-num/univer/commit/5eea1090faeef938f8ee208a875863cf062d4cc4))
* **design:** fix checkbox group value couldn't be modified ([#1613](https://github.com/dream-num/univer/issues/1613)) ([dcb3e93](https://github.com/dream-num/univer/commit/dcb3e934afe0733fba89cddd25941148db74beef))
* **docs:** remove deprecated property standalone ([#1670](https://github.com/dream-num/univer/issues/1670)) ([ff686e6](https://github.com/dream-num/univer/commit/ff686e63f22a96d5ec42ff70a7ac91e4c02a9e7e))
* **editor:** control state ([#1649](https://github.com/dream-num/univer/issues/1649)) ([c39799f](https://github.com/dream-num/univer/commit/c39799fb54cc77dd917e3d599f419b0f1dc52e2f))
* **editor:** optimize editor focus ([#1616](https://github.com/dream-num/univer/issues/1616)) ([e4231eb](https://github.com/dream-num/univer/commit/e4231eb70c5b28ea18ecc65c9ca6e7bee013179f))
* **editor:** preload the editor ([#1662](https://github.com/dream-num/univer/issues/1662)) ([09ceb16](https://github.com/dream-num/univer/commit/09ceb165d515f584b07c8538960d09e9a184f97c))
* **editor:** short key error ([#1679](https://github.com/dream-num/univer/issues/1679)) ([7afaff0](https://github.com/dream-num/univer/commit/7afaff0f54f0ea37e9dfa1609bb30f40cd824b74))
* **engine-render:** add missing `IPageRenderConfig` type export ([d972f5d](https://github.com/dream-num/univer/commit/d972f5d97ec005e2d57f5461457c1c6ece0fe2b7))
* export more types from render engine plugin ([#1608](https://github.com/dream-num/univer/issues/1608)) ([cf134be](https://github.com/dream-num/univer/commit/cf134bed37b2c85b8a78969f9241109bf7805955))
* **facade:** should not return promise in syncExecuteCommand ([#1648](https://github.com/dream-num/univer/issues/1648)) ([9a0d300](https://github.com/dream-num/univer/commit/9a0d300320fafdf911c6cb18b221ec12a8ab99be))
* **find-replace:** fix dialog issues ([#1590](https://github.com/dream-num/univer/issues/1590)) ([2390086](https://github.com/dream-num/univer/commit/2390086f57537d492acd64ae1a09561c34b9c143))
* fix extracted value from cell content ([2e22324](https://github.com/dream-num/univer/commit/2e22324ac9347ac229a56eee92e6398bc0074f8c))
* **formula:** add OR/TEXT/LEN functions ([#1593](https://github.com/dream-num/univer/issues/1593)) ([c26eed1](https://github.com/dream-num/univer/commit/c26eed129aed76c13c5b3e9b70c12afac82dd166))
* **formula:** array cache error ([#1644](https://github.com/dream-num/univer/issues/1644)) ([19d9612](https://github.com/dream-num/univer/commit/19d961203858bc6fb61cdd68b3f9f3802e9c0ade))
* **formula:** index function supports reference object ([#1657](https://github.com/dream-num/univer/issues/1657)) ([b47487a](https://github.com/dream-num/univer/commit/b47487a5d33ae8c1cada2dd5a1bdf44ff4eed3ef))
* **formula:** math functions support string number calculation ([#1581](https://github.com/dream-num/univer/issues/1581)) ([0779488](https://github.com/dream-num/univer/commit/077948859e9c0df681363c88002f0647aa8be884))
* rectangle subtract func ([#1647](https://github.com/dream-num/univer/issues/1647)) ([345fddc](https://github.com/dream-num/univer/commit/345fddca2b9b7227b6257eb2280585b72b9cdb31))
* **sheet:** error value object ([#1596](https://github.com/dream-num/univer/issues/1596)) ([e3714e1](https://github.com/dream-num/univer/commit/e3714e14a3a4496373317b90eaa80632a7d1285f))
* **sheet:** fix error edit position after merging ([#1520](https://github.com/dream-num/univer/issues/1520)) ([8685e14](https://github.com/dream-num/univer/commit/8685e14904677f2f15cd88e2a199f5d105d10551))
* **sheet:** fix the issue of incorrect number of merged cells in the format painter ([#1526](https://github.com/dream-num/univer/issues/1526)) ([cd9b6f8](https://github.com/dream-num/univer/commit/cd9b6f877850171404e0fc34cd356a2fb6f2639f))
* **sheet:** handleRemoveRowsCols util func ([#1656](https://github.com/dream-num/univer/issues/1656)) ([f30b987](https://github.com/dream-num/univer/commit/f30b987b0aee41fb7f2d5457a4f796b08d57107b))
* **sheets-ui:** merge setRangeValuesMutation at clipboardservice ([#1665](https://github.com/dream-num/univer/issues/1665)) ([bf9fc0d](https://github.com/dream-num/univer/commit/bf9fc0da3f7cddfd2d691b16f367bfb98ce0e300))
* **sheets:** boolean should store as number ([#1605](https://github.com/dream-num/univer/issues/1605)) ([78e5426](https://github.com/dream-num/univer/commit/78e54269fabbf9845ef667a4b52c77e402ea228f)), closes [#1534](https://github.com/dream-num/univer/issues/1534)
* **slide:** image loaded ([#1653](https://github.com/dream-num/univer/issues/1653)) ([9cecaaa](https://github.com/dream-num/univer/commit/9cecaaaa155de2d790d19cbadc7b53a049034453))
* **slide:** slide initialize ([#1641](https://github.com/dream-num/univer/issues/1641)) ([599ed71](https://github.com/dream-num/univer/commit/599ed71151cefc569b41892e4f7c3097862a0d70))
* **ui:** cleanup DOMs when dispose ([#1663](https://github.com/dream-num/univer/issues/1663)) ([b81ba1a](https://github.com/dream-num/univer/commit/b81ba1ad8d20680bcd071efe4f1a33ab4f510f05))
* **ui:** prevent formula bar from displaying when header is set to false & remove unused code ([#1633](https://github.com/dream-num/univer/issues/1633)) ([e3d875c](https://github.com/dream-num/univer/commit/e3d875ca78d31e8eb8736f0d9e9655ea94c42136))
* **ui:** should not make clipboard util iframe visible ([#1620](https://github.com/dream-num/univer/issues/1620)) ([06760b5](https://github.com/dream-num/univer/commit/06760b5cda5f8f13791043732ec4eff126f6317a))
* wrong doc example data ([#1667](https://github.com/dream-num/univer/issues/1667)) ([a875a31](https://github.com/dream-num/univer/commit/a875a3185cd70abf28b61f8a6335944cdb94c591))


### Features

* add disable status to doc ([#1622](https://github.com/dream-num/univer/issues/1622)) ([b03c707](https://github.com/dream-num/univer/commit/b03c70764bcfebadf82969266ed371e261a98315))
* **core:** add registerPlugin config types ([#1484](https://github.com/dream-num/univer/issues/1484)) ([a5a073c](https://github.com/dream-num/univer/commit/a5a073c18ac34ba572908ef493b32c43157bbede))
* create empty doc by pass empty object `{}` ([#1606](https://github.com/dream-num/univer/issues/1606)) ([ff54fa0](https://github.com/dream-num/univer/commit/ff54fa01e428d3a844acd33dc811d55135a2410c))
* **design:** add component Segmented ([#1618](https://github.com/dream-num/univer/issues/1618)) ([78156fd](https://github.com/dream-num/univer/commit/78156fd3477994e7b63d4b3dec67f7e99d153176))
* **design:** ssr support ([#1603](https://github.com/dream-num/univer/issues/1603)) ([cdb7d49](https://github.com/dream-num/univer/commit/cdb7d492851b6d85ca7805036123bac2c76ec4ae))
* **doc:** continuous punctuation extrusion and paragraph align ([#1625](https://github.com/dream-num/univer/issues/1625)) ([b50997d](https://github.com/dream-num/univer/commit/b50997dff3f85b70b858c919fe304ea65ba921ca)), closes [#1670](https://github.com/dream-num/univer/issues/1670)
* **network:** add retry and threshold interceptor ([#1664](https://github.com/dream-num/univer/issues/1664)) ([5791d4d](https://github.com/dream-num/univer/commit/5791d4d5b4d2ba714c92613f72b679e5e03c72e0))
* **sheet:** add range merge util ([#1615](https://github.com/dream-num/univer/issues/1615)) ([e2118b5](https://github.com/dream-num/univer/commit/e2118b5deb086f4eebfb55c6986599a6427ee257))
* **sheet:** numfmt support i18n ([#1558](https://github.com/dream-num/univer/issues/1558)) ([b39f982](https://github.com/dream-num/univer/commit/b39f98280c877ee25abcfebcee57311b350cef31))
* **ui:** support popup service ([#1640](https://github.com/dream-num/univer/issues/1640)) ([5e597fd](https://github.com/dream-num/univer/commit/5e597fdd4bd985b3d6afd60cfd0ac46296fb8761))


### Performance Improvements

* **engine-render:** optimize border perf ([#1574](https://github.com/dream-num/univer/issues/1574)) ([0aa2898](https://github.com/dream-num/univer/commit/0aa2898570fa077c9c08a8fbbbd5e6d8541097b5))
* **formula:** optimize dependency calculate and array value object compare ([#1629](https://github.com/dream-num/univer/issues/1629)) ([d884ee0](https://github.com/dream-num/univer/commit/d884ee05615d7ed3cdfdeb6e68e46893367a7db4))
* **render:** optimize doc render ([#1599](https://github.com/dream-num/univer/issues/1599)) ([ab76ebd](https://github.com/dream-num/univer/commit/ab76ebde180161ec4f924e0cef4bf53243478418))
* **sheet:** statistic and formula perf ([#1583](https://github.com/dream-num/univer/issues/1583)) ([9e63af7](https://github.com/dream-num/univer/commit/9e63af78ec78c4698c47d07e506d76e1e9df4323))


### BREAKING CHANGES

* **sheets:** Before:
Boolean values ("TRUE" "FALSE") were stored in the IWorkbooData
as strings.
After:
Boolean values would be store as number (0, 1).

## [0.1.3](https://github.com/dream-num/univer/compare/v0.1.2...v0.1.3) (2024-03-15)


### Bug Fixes

* **design:** fix title in `Dialog` to use passed variable ([#1556](https://github.com/dream-num/univer/issues/1556)) ([5aeb65f](https://github.com/dream-num/univer/commit/5aeb65f519eefb81e168fa8684c12ec38adbca49))
* **design:** restore styles for non-draggable dialog ([#1498](https://github.com/dream-num/univer/issues/1498)) ([ee694f2](https://github.com/dream-num/univer/commit/ee694f224b91c74b904a95984fe468b87d1ef339))
* **doc:** copy form univer text and paste to univer ([#1473](https://github.com/dream-num/univer/issues/1473)) ([4f3ab13](https://github.com/dream-num/univer/commit/4f3ab13063453b9e5e4d2919f1e65399093e68b1))
* **editor:**  range selector ([#1568](https://github.com/dream-num/univer/issues/1568)) ([bba50e7](https://github.com/dream-num/univer/commit/bba50e7d7ed2b2ed2f65346889f8116da3d2ed3c))
* **editor:** add value ([#1512](https://github.com/dream-num/univer/issues/1512)) ([d398384](https://github.com/dream-num/univer/commit/d3983845681d4e7fdbf6c9c56a083024556c7d11))
* **editor:** controlled component and readonly ([#1507](https://github.com/dream-num/univer/issues/1507)) ([c8c7bf3](https://github.com/dream-num/univer/commit/c8c7bf310776e49b155f2ead52f3ba2c25380604))
* **editor:** cursor and menu and single choice ([#1499](https://github.com/dream-num/univer/issues/1499)) ([6cdccde](https://github.com/dream-num/univer/commit/6cdccdeb57e663d6bf5df7542f0683ea717ea020))
* **editor:** range selector ([#1503](https://github.com/dream-num/univer/issues/1503)) ([eee2aab](https://github.com/dream-num/univer/commit/eee2aabe8c95844a53448cdf9e99606c58dbabdc))
* **editor:** value change ([#1514](https://github.com/dream-num/univer/issues/1514)) ([4a21331](https://github.com/dream-num/univer/commit/4a21331dff254cf8547dcfc8983df8334ed79715))
* **formula:** check syntax ([#1543](https://github.com/dream-num/univer/issues/1543)) ([15a04ed](https://github.com/dream-num/univer/commit/15a04ed90567cc4bace30efbb560106cbf437344))
* **formula:** formula select and negative ([#1444](https://github.com/dream-num/univer/issues/1444)) ([75de31c](https://github.com/dream-num/univer/commit/75de31c9e3323714b840cd7706a2a897d99b0364))
* **formula:** isMatchWildcard escape regular string, add icons ([#1493](https://github.com/dream-num/univer/issues/1493)) ([c520ad7](https://github.com/dream-num/univer/commit/c520ad7a02e43ccde9a3995e9e61a40a789664b4))
* **formula:** token uppercase ([#1579](https://github.com/dream-num/univer/issues/1579)) ([5c99f3a](https://github.com/dream-num/univer/commit/5c99f3a31902cb4ac6244b679f2a64fd50c8a3a5))
* **formula:** worker error ([#1565](https://github.com/dream-num/univer/issues/1565)) ([47377ae](https://github.com/dream-num/univer/commit/47377ae958bf28b281dc26c3c69c2456138a015d))
* inline format in cell with rich text ([#1560](https://github.com/dream-num/univer/issues/1560)) ([447a095](https://github.com/dream-num/univer/commit/447a095733f14cddff6e7ae0926a9760403e8120))
* **render:** rect blurring ([#1511](https://github.com/dream-num/univer/issues/1511)) ([97ed99a](https://github.com/dream-num/univer/commit/97ed99a19fb11a1206b99d4876f5adc2c51aba14))
* **render:** update font offset ([#1545](https://github.com/dream-num/univer/issues/1545)) ([42fb8a2](https://github.com/dream-num/univer/commit/42fb8a25f1e8e61056c8e1639f517b4af094b03a))
* **sheet:** add focus change ([#1500](https://github.com/dream-num/univer/issues/1500)) ([ed27e84](https://github.com/dream-num/univer/commit/ed27e8484c0f972c0de8f0b2963d7f7189d7fefb))
* **sheet:** border corner ([#1567](https://github.com/dream-num/univer/issues/1567)) ([0fc3a6d](https://github.com/dream-num/univer/commit/0fc3a6d4d69be97bf12bbe56d5f3cbb341878664))
* **sheet:** border excel compatibility ([#1539](https://github.com/dream-num/univer/issues/1539)) ([d68896a](https://github.com/dream-num/univer/commit/d68896ad7f73a36badf890f73c8df2386c8ee3c8))
* **sheet:** editor error ([#1533](https://github.com/dream-num/univer/issues/1533)) ([0da7b64](https://github.com/dream-num/univer/commit/0da7b647e05fc2c3bed3b202f2a1afbcd133a5c5))
* **sheet:** first sheet hidden ([#1538](https://github.com/dream-num/univer/issues/1538)) ([6123772](https://github.com/dream-num/univer/commit/6123772abbc25e506cf0a79ded1f942756a0e910))
* **sheet:** inline format menu display error when paste ([#1482](https://github.com/dream-num/univer/issues/1482)) ([c66f9e1](https://github.com/dream-num/univer/commit/c66f9e18d4201cfc1554488e87c7c561713ccdf8))
* **sheet:** keep consistent with excel rotation ([#1562](https://github.com/dream-num/univer/issues/1562)) ([c100bc8](https://github.com/dream-num/univer/commit/c100bc8c9084679697a395d4521b8be16db6e1c7))
* **sheet:** merge align ([#1537](https://github.com/dream-num/univer/issues/1537)) ([e0b49cc](https://github.com/dream-num/univer/commit/e0b49cc05f04256e5f80fce4f82b02c7c53ed513))
* **sheets-ui:** fix z-index value in operate-container ([#1516](https://github.com/dream-num/univer/issues/1516)) ([0ce931d](https://github.com/dream-num/univer/commit/0ce931de38d75494c8b9aaaba6f5b19dc987b8b0))
* **sheets-ui:** room slide does not need to be disabled ([45c60bf](https://github.com/dream-num/univer/commit/45c60bfe50d949a3a55f9294927f3bbf8a0f3678))
* **sheet:** selection color ([#1572](https://github.com/dream-num/univer/issues/1572)) ([609f907](https://github.com/dream-num/univer/commit/609f907a647b937cca8dbdce06f3f10653dd314a))
* **sheet:** string bool and number align ([#1525](https://github.com/dream-num/univer/issues/1525)) ([473cf6f](https://github.com/dream-num/univer/commit/473cf6f91844f36922c5d338df96fa2ec77e4b1b))
* **sheet:** the icons for hiding rows and columns do not disappear. ([#1527](https://github.com/dream-num/univer/issues/1527)) ([598e7eb](https://github.com/dream-num/univer/commit/598e7eb59f4bc0d392c8d68f6d6dd4a42c428ff7))
* **sheet:** wrap and rotation ([#1517](https://github.com/dream-num/univer/issues/1517)) ([9e8cc45](https://github.com/dream-num/univer/commit/9e8cc4500f71a39f496f01725dd604806862e87f))
* system shortcut teminate ime input ([#1535](https://github.com/dream-num/univer/issues/1535)) ([91397c6](https://github.com/dream-num/univer/commit/91397c6eb244a5e913df35d205dfb4c1e971c4ab))
* **ui:** fix layout service throwing error ([#1490](https://github.com/dream-num/univer/issues/1490)) ([c2ee6d2](https://github.com/dream-num/univer/commit/c2ee6d2c621c35b0e67d276975a9a21fc28fcca1))
* **ui:** fix menu not displaying as expected ([#1529](https://github.com/dream-num/univer/issues/1529)) ([48c1ab8](https://github.com/dream-num/univer/commit/48c1ab85bd09366664442b25eac358ce4d2f6d25))
* **ui:** handle dynamic import in renderVue3Component with try-catch due to esbuild limitations ([#1518](https://github.com/dream-num/univer/issues/1518)) ([a684e9d](https://github.com/dream-num/univer/commit/a684e9d1abf233a0b397076f906c2cb2e33740e2))
* warning for postcss-preset-env ([#1544](https://github.com/dream-num/univer/issues/1544)) ([351e2a4](https://github.com/dream-num/univer/commit/351e2a4a0e46bbcf2d60c33c2d719939f10e6153))


### Features

* add function to extract pure text from cell ([#1575](https://github.com/dream-num/univer/issues/1575)) ([fe0c8de](https://github.com/dream-num/univer/commit/fe0c8de4b27b201377bef52aca51f45693bb3640))
* **collaboration:** move snapshot transform to core ([#1519](https://github.com/dream-num/univer/issues/1519)) ([6557ea5](https://github.com/dream-num/univer/commit/6557ea50e63f1db4634799ce53afc30602aade4e))
* **core:** add `getCurrentLocale` to LocaleService ([#1555](https://github.com/dream-num/univer/issues/1555)) ([05866a3](https://github.com/dream-num/univer/commit/05866a32ea055d40e786af6d46f969405f706b80))
* **core:** export function to use in exchange ([#1547](https://github.com/dream-num/univer/issues/1547)) ([54da0dc](https://github.com/dream-num/univer/commit/54da0dc0aedf38c1e35d8b51934924cad70abbea))
* **design:** add `className` props to `Input` ([#1569](https://github.com/dream-num/univer/issues/1569)) ([b73df3f](https://github.com/dream-num/univer/commit/b73df3f0558d82dd5550576a2dc95bc4fb3a90b3))
* **design:** add `DateRangePicker` ([#1510](https://github.com/dream-num/univer/issues/1510)) ([9f0a842](https://github.com/dream-num/univer/commit/9f0a84204870804a6d84e037a536dc53a68c3dc0))
* **design:** add DatePicker ([#1497](https://github.com/dream-num/univer/issues/1497)) ([44ec056](https://github.com/dream-num/univer/commit/44ec0562e7e4f2eb6e660250c19d480a79bcca96))
* **design:** implement edge avoidance for `Dialog` ([#1522](https://github.com/dream-num/univer/issues/1522)) ([290e5d0](https://github.com/dream-num/univer/commit/290e5d0141a55b2dc8c2406773ed8469ea2b07a3))
* **editor:** style and placeholder ([#1571](https://github.com/dream-num/univer/issues/1571)) ([be4482c](https://github.com/dream-num/univer/commit/be4482cf1c2ac2e4d670347da1efdc2888a73077))
* **editor:** support shortcut ([#1513](https://github.com/dream-num/univer/issues/1513)) ([b362e73](https://github.com/dream-num/univer/commit/b362e733bfe0d8bc8f26c28a3f949543198e7516))
* **example:** add doc uniscript example ([#1495](https://github.com/dream-num/univer/issues/1495)) ([ed01f92](https://github.com/dream-num/univer/commit/ed01f9256cd702273c01de47a2c9f06db881474a))
* **facade:** register sheet render extension ([#1356](https://github.com/dream-num/univer/issues/1356)) ([264c097](https://github.com/dream-num/univer/commit/264c0975fc2a6cc6826f73524be5c29a0d6677dc))
* **formula:** support cubeValueObject ([#1536](https://github.com/dream-num/univer/issues/1536)) ([1c77658](https://github.com/dream-num/univer/commit/1c77658431c2b9830c3b0e47cc1d5d15ca4f6508))
* **sheet-ui:** find & replace ([#1349](https://github.com/dream-num/univer/issues/1349)) ([3828239](https://github.com/dream-num/univer/commit/3828239d5cc862aa448d9e5891ed69406d859598))
* **sheet:** add font method ([#1506](https://github.com/dream-num/univer/issues/1506)) ([9cf028f](https://github.com/dream-num/univer/commit/9cf028faffd9a6ac4bc45b13ef2488f6f81502f5))
* **sheet:** empty formular bar when in array range ([#1532](https://github.com/dream-num/univer/issues/1532)) ([eea95ac](https://github.com/dream-num/univer/commit/eea95ac30c90c9567ead5f8923b599af2b9ac8cc))
* **sheet:** range selector ([#1463](https://github.com/dream-num/univer/issues/1463)) ([b639394](https://github.com/dream-num/univer/commit/b6393945492b46a8c062b14175dbb014427ca59c))
* **sheet:** support font render config ([#1542](https://github.com/dream-num/univer/issues/1542)) ([ef48825](https://github.com/dream-num/univer/commit/ef488258bc33d24df26d7fea9d4c3188f7da6f6f))
* **ui:** extend support for registering and using Vue 3 components ([#1502](https://github.com/dream-num/univer/issues/1502)) ([7c28761](https://github.com/dream-num/univer/commit/7c2876123960a9986ba1dcd28ca45a08fb036c32))

## [0.1.2](https://github.com/dream-num/univer/compare/v0.1.1...v0.1.2) (2024-03-06)


### Bug Fixes

* **design:** fix z-index for `SubMenu` ([#1440](https://github.com/dream-num/univer/issues/1440)) ([4d49dad](https://github.com/dream-num/univer/commit/4d49dad4bc1bc6b6f4376c287595cc3477abc0cd))
* **doc:** copy error when range is empty ([#1488](https://github.com/dream-num/univer/issues/1488)) ([1ae73ca](https://github.com/dream-num/univer/commit/1ae73ca1f09722815e2527848a932daf3d53e27a))
* **doc:** need to serialize text ranges ([#1487](https://github.com/dream-num/univer/issues/1487)) ([de87e10](https://github.com/dream-num/univer/commit/de87e109077fad6beb23835d26efd370f9fa1a6b))
* **engine-formula:** ensure super is called at the beginning of the constructor ([#1452](https://github.com/dream-num/univer/issues/1452)) ([a9cb84d](https://github.com/dream-num/univer/commit/a9cb84dc0095d6d40c99268366e28101fff84f25))
* **examples:** fix multi-instance & uniscript UI rendering error ([#1469](https://github.com/dream-num/univer/issues/1469)) ([1d6e257](https://github.com/dream-num/univer/commit/1d6e257ea39375a71a5d5fa6198122a6916a3eed))
* insert row col with effect freeze ([#1464](https://github.com/dream-num/univer/issues/1464)) ([8de2b10](https://github.com/dream-num/univer/commit/8de2b10a9d92229ad11e01bf0b56f55e106ecd5c))
* only editing need to scroll to selection ([#1455](https://github.com/dream-num/univer/issues/1455)) ([5296f32](https://github.com/dream-num/univer/commit/5296f32128d20db39387346c12a838e58be81ca1))
* **sheet:** fix unreasonable merged selections ([#1477](https://github.com/dream-num/univer/issues/1477)) ([bd8c5df](https://github.com/dream-num/univer/commit/bd8c5dfc16939a115802611cee1ca88f1d416eff))
* **sheet:** inline format error when textRuns is empty ([#1480](https://github.com/dream-num/univer/issues/1480)) ([8f5caae](https://github.com/dream-num/univer/commit/8f5caae899bc948cf3d6bffb30e4fb24062f55d9))
* **sheet:** insert row/col undo bug ([#1350](https://github.com/dream-num/univer/issues/1350)) ([5781a63](https://github.com/dream-num/univer/commit/5781a63d14843fd826f4bc946a114ccd5f73f7d5))
* **sheets-ui:** dynamically adjust row header width ([#1475](https://github.com/dream-num/univer/issues/1475)) ([371b4f1](https://github.com/dream-num/univer/commit/371b4f13a07bd0afc5d673dae817c348830455e2)), closes [#1471](https://github.com/dream-num/univer/issues/1471)
* wrong cell value in cell data ([#1461](https://github.com/dream-num/univer/issues/1461)) ([0cda975](https://github.com/dream-num/univer/commit/0cda9753b3d23a7f6c84f654bc1591478ec1148a))


### Features

* add focus handler for doc ([#1433](https://github.com/dream-num/univer/issues/1433)) ([7c3ad49](https://github.com/dream-num/univer/commit/7c3ad491a7d9855feba8caec4d612ffb2203533a))
* **design:** add `preservePositionOnDestroy` & `defaultPosition` to Dialog ([#1439](https://github.com/dream-num/univer/issues/1439)) ([b1d18ca](https://github.com/dream-num/univer/commit/b1d18cae4ed379a5645173699e9a3689c2e78117))
* **editor:** editor modifications to accommodate the range selector ([#1460](https://github.com/dream-num/univer/issues/1460)) ([22b2734](https://github.com/dream-num/univer/commit/22b2734a2a5be2b6a23a320b8a208a4e155a8103))
* **formula:** add functions, fix function calculation error ([#1395](https://github.com/dream-num/univer/issues/1395)) ([885ba4b](https://github.com/dream-num/univer/commit/885ba4b182952746abca2834b7e01e87bbb0e4fe))
* **numfmt:** support enUs ([#1456](https://github.com/dream-num/univer/issues/1456)) ([0f825fb](https://github.com/dream-num/univer/commit/0f825fb608dbbd0d254c0b90cc733a8a951d476c))
* **numfmt:** support percent ([#1457](https://github.com/dream-num/univer/issues/1457)) ([22b9c0c](https://github.com/dream-num/univer/commit/22b9c0caca9610b18d8529e9b6b303bb90fdc004))
* replacement in document body ([#1451](https://github.com/dream-num/univer/issues/1451)) ([e258abd](https://github.com/dream-num/univer/commit/e258abde82ce736f8898d6880dc2fd129b33b005))
* **sheets:** add row col iterator in worksheet ([#1478](https://github.com/dream-num/univer/issues/1478)) ([5abd68e](https://github.com/dream-num/univer/commit/5abd68e922802b2825e308fae43aa21845946872))

## [0.1.1](https://github.com/dream-num/univer/compare/v0.1.0-beta.5...v0.1.1) (2024-03-01)


### Bug Fixes

* apply mutation ([#1423](https://github.com/dream-num/univer/issues/1423)) ([ccd30dc](https://github.com/dream-num/univer/commit/ccd30dca36221f1246a8ca6bd11872716d6f9053))
* double click to selection also need to share cursor ([#1446](https://github.com/dream-num/univer/issues/1446)) ([c6ae623](https://github.com/dream-num/univer/commit/c6ae623be29e40b686120117e3b2d69d32961faa))
* **editor:** zen error and formula align ([#1437](https://github.com/dream-num/univer/issues/1437)) ([60d94a3](https://github.com/dream-num/univer/commit/60d94a3ff49fd297ce06515937c6c31cb541dea7))
* inline menu highlight ([#1401](https://github.com/dream-num/univer/issues/1401)) ([b3d25e9](https://github.com/dream-num/univer/commit/b3d25e932844044d4926d18f4b629c3315429bf0))
* page width should great than 0 ([#1402](https://github.com/dream-num/univer/issues/1402)) ([281a4b9](https://github.com/dream-num/univer/commit/281a4b9be488a07fec8b4d0be3b43bb7dfe78333))
* **sheet:** formula boolean value ([#1360](https://github.com/dream-num/univer/issues/1360)) ([9a8a4be](https://github.com/dream-num/univer/commit/9a8a4bea037da2aaf561998a2398d70f937aca2b))
* **sheet:** optimize memory release and resolve issues with the editor being recreated repeatedly ([#1432](https://github.com/dream-num/univer/issues/1432)) ([b14207b](https://github.com/dream-num/univer/commit/b14207b368e2bc478e729bb2e8cfe9bdbe0071ad))


### Features

* add isEditing param ([#1428](https://github.com/dream-num/univer/issues/1428)) ([aa92e60](https://github.com/dream-num/univer/commit/aa92e60de5a4915d6946d93b8dc0004aaf355af6))
* add trigger in the if condition for share cursor use ([#1431](https://github.com/dream-num/univer/issues/1431)) ([c781f22](https://github.com/dream-num/univer/commit/c781f22d34d24d64c542ad58e834757d3bbe8d5f))
* export is active for share cursor use ([#1420](https://github.com/dream-num/univer/issues/1420)) ([ba51971](https://github.com/dream-num/univer/commit/ba5197191cb80744f94b716fc7a89d59ead437ea))
* **i18n:** add TypeScript type checking for localization files ([#1424](https://github.com/dream-num/univer/issues/1424)) ([4afe9e5](https://github.com/dream-num/univer/commit/4afe9e5f8c6e04cb4398ef8eb8e2137258417b92))

# [0.1.0-beta.5](https://github.com/dream-num/univer/compare/v0.1.0-beta.4...v0.1.0-beta.5) (2024-02-23)


### Bug Fixes

* cursor position ([#1363](https://github.com/dream-num/univer/issues/1363)) ([34508a0](https://github.com/dream-num/univer/commit/34508a0ecfcfa1a019f39a633c1a23bebab8578f))
* cut paste undo bug & optimize status bar calc ([#1353](https://github.com/dream-num/univer/issues/1353)) ([072e0de](https://github.com/dream-num/univer/commit/072e0de9aaae5e3d1c74bde20b49d5d772859492))
* **design:** remove duplicate z-index property from Select's dropdown CSS definition ([#1408](https://github.com/dream-num/univer/issues/1408)) ([abc13b4](https://github.com/dream-num/univer/commit/abc13b45a63938def3c3801450eeb1c0791b31f0))
* **doc:** copy data ([#1399](https://github.com/dream-num/univer/issues/1399)) ([1eb9113](https://github.com/dream-num/univer/commit/1eb91131b1da26d422f339de0905ddb8e82d8baf))
* **doc:** ts check ([#1354](https://github.com/dream-num/univer/issues/1354)) ([bca22c6](https://github.com/dream-num/univer/commit/bca22c63f4334f3cdc4fb0c7117fab804228ee99))
* **examples:** fix the broken uniscript demo ([70c2a5c](https://github.com/dream-num/univer/commit/70c2a5cc60490ad171f78a2010ed6653a89aca23))
* fix autofixable lint ([#1325](https://github.com/dream-num/univer/issues/1325)) ([4065ea8](https://github.com/dream-num/univer/commit/4065ea8a55f549fe8a1f2a970407eedb9d201a81))
* fix sheet command preconditions ([#1319](https://github.com/dream-num/univer/issues/1319)) ([6e92c60](https://github.com/dream-num/univer/commit/6e92c60833ab79e9d5f6be4ae30904ad77ad9da1))
* **formula:** get rich text data stream as content ([#1305](https://github.com/dream-num/univer/issues/1305)) ([51ae0e1](https://github.com/dream-num/univer/commit/51ae0e1e7cd81ae1303d5b53430e645d2d7c3ec4))
* **formula:** sum get error when cell has error  ([#1306](https://github.com/dream-num/univer/issues/1306)) ([a13c450](https://github.com/dream-num/univer/commit/a13c45031df396f4ed37bc658ffd1e5a754f462f))
* inline format error ([#1365](https://github.com/dream-num/univer/issues/1365)) ([a3f1e9b](https://github.com/dream-num/univer/commit/a3f1e9bb1b2748fe6f221ebaa838e3c79aa5cb22))
* modify doc rev default value ([#1377](https://github.com/dream-num/univer/issues/1377)) ([86f93be](https://github.com/dream-num/univer/commit/86f93bed75fc3d07f66cb014a66b12a57539a377))
* no history no need to collaboration ([#1348](https://github.com/dream-num/univer/issues/1348)) ([157b4db](https://github.com/dream-num/univer/commit/157b4db74fad39acf039897e28251ec31fa94be2))
* no need to convert to px ([#1385](https://github.com/dream-num/univer/issues/1385)) ([a655169](https://github.com/dream-num/univer/commit/a65516958661be1fb3cc54d5c1664d8cd740e946))
* paste row height and col width ([#1330](https://github.com/dream-num/univer/issues/1330)) ([60bd78a](https://github.com/dream-num/univer/commit/60bd78a2062f3f742fe014a4592a1c8624a85446))
* **render:** context native line width ([#1381](https://github.com/dream-num/univer/issues/1381)) ([36aa429](https://github.com/dream-num/univer/commit/36aa42990ac5c3d6bb3e3e564974a3875237b246))
* **render:** px to pt ([#1382](https://github.com/dream-num/univer/issues/1382)) ([608f9df](https://github.com/dream-num/univer/commit/608f9df980223d91890ccde79d46874a5709bc80))
* **sheet-ui:** fix clipboard not available in unsecure context ([#1345](https://github.com/dream-num/univer/issues/1345)) ([bd57a84](https://github.com/dream-num/univer/commit/bd57a8452cae6632578da87d461cc9b0c3cfe97e))
* **sheet:** auto add bracket ([#1358](https://github.com/dream-num/univer/issues/1358)) ([fdecc66](https://github.com/dream-num/univer/commit/fdecc663eeaf8a8eb612f5ae08b906175c6ff2a1))
* **sheet:** binary search ([#1361](https://github.com/dream-num/univer/issues/1361)) ([23221c4](https://github.com/dream-num/univer/commit/23221c43cef474d06200ab63f4216a4404b25ed3))
* **sheet:** default vertical align ([#1383](https://github.com/dream-num/univer/issues/1383)) ([d96edf0](https://github.com/dream-num/univer/commit/d96edf0f761bb386506fab5866ea01e170beb175))
* **sheet:** editor input ([#1411](https://github.com/dream-num/univer/issues/1411)) ([76f5e9c](https://github.com/dream-num/univer/commit/76f5e9c0c5cc93e8a7e96c4db9872c5152e9943f))
* **sheet:** fix snapshot references are not consistent ([#1339](https://github.com/dream-num/univer/issues/1339)) ([bf71b36](https://github.com/dream-num/univer/commit/bf71b360eee3d8919b5436789cd45fba0a8cb783)), closes [#1332](https://github.com/dream-num/univer/issues/1332)
* **sheet:** formula ref move ([#1359](https://github.com/dream-num/univer/issues/1359)) ([65e64bf](https://github.com/dream-num/univer/commit/65e64bfa5cf44c0c73fb86a655e9bfca93416a7e))
* **sheets:** inline menu highlight error ([#1388](https://github.com/dream-num/univer/issues/1388)) ([8ca9cc1](https://github.com/dream-num/univer/commit/8ca9cc11ecbf54d94f5f22c79e2e4fa99c9e1676))
* **sheet:** suffix ([#1409](https://github.com/dream-num/univer/issues/1409)) ([fdd7b72](https://github.com/dream-num/univer/commit/fdd7b72bcfaa8142919ec0d79923afcb54e5df8e))


### Features

* add `destroyOnClose` for `Dialog` ([#1391](https://github.com/dream-num/univer/issues/1391)) ([a6e17ef](https://github.com/dream-num/univer/commit/a6e17ef8265d9854330f3811231955c0532b2478))
* add resources in IDocumentData ([#1327](https://github.com/dream-num/univer/issues/1327)) ([339c36b](https://github.com/dream-num/univer/commit/339c36b9c7a92a3fb1e76a18a9c5536ccb2821ba))
* add string interpolation support for locale service ([#1362](https://github.com/dream-num/univer/issues/1362)) ([8f338ba](https://github.com/dream-num/univer/commit/8f338badd297feefc4b9dab8e0c94f026e904e00))
* **core:** set appVersion to package version ([#1328](https://github.com/dream-num/univer/issues/1328)) ([c9193a1](https://github.com/dream-num/univer/commit/c9193a1795f6362d549e7c001fb6f8980ff71300))
* **design:** change the style of the `Dialog` and `Select` ([#1352](https://github.com/dream-num/univer/issues/1352)) ([0204b43](https://github.com/dream-num/univer/commit/0204b433fd0e22a18f8810409ee9f497017a45c4))
* export IDocStateChangeParams and DocStateChangeManagerService ([#1336](https://github.com/dream-num/univer/issues/1336)) ([8a99b05](https://github.com/dream-num/univer/commit/8a99b0533ba398e99ff6959295581cdaf8f6078e))
* **facade:** add onBeforeCommandExecute API ([#1370](https://github.com/dream-num/univer/issues/1370)) ([b842579](https://github.com/dream-num/univer/commit/b8425794147c065022975be2f95e667005160d12)), closes [#1346](https://github.com/dream-num/univer/issues/1346)
* **facade:** add set font apis and get cell model data api ([#1266](https://github.com/dream-num/univer/issues/1266)) ([d0a8709](https://github.com/dream-num/univer/commit/d0a87094ebe18366ded98a4ade02cf3b9d91b261))
* **formula:** today function, set numfmt data ([#1295](https://github.com/dream-num/univer/issues/1295)) ([f069dd8](https://github.com/dream-num/univer/commit/f069dd87ae326b2b92e86f4e3211032bd9e8e2b1))
* hide the header menu when there is no content in it ([#1331](https://github.com/dream-num/univer/issues/1331)) ([bf692c2](https://github.com/dream-num/univer/commit/bf692c2c60a646dd8f018ac041b6d145cf89e4b2))
* **ref-range:** support default range change util ([#1351](https://github.com/dream-num/univer/issues/1351)) ([54512ea](https://github.com/dream-num/univer/commit/54512ea6245fb277ceec4122c5da1a35215aed7b))
* **sheet:** optimize sheet render ([#1245](https://github.com/dream-num/univer/issues/1245)) ([33bc465](https://github.com/dream-num/univer/commit/33bc4657e8b92d17fc156856749f901293a7a038))
* **sheets-zen-editor:** export language packs ([#1413](https://github.com/dream-num/univer/issues/1413)) ([0ec2dc9](https://github.com/dream-num/univer/commit/0ec2dc934e1e4fa21da9b86ccfd8b52b3f73eda1))
