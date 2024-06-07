

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
