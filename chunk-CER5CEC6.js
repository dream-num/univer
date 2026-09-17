import {
  Disposable,
  ICommandService,
  IConfigService,
  IResourceManagerService,
  Inject,
  Injector,
  LifecycleService,
  Plugin,
  Subject,
  createIdentifier,
  dateKit,
  mergeOverrideWithDependencies,
  merge_default
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/thread-comment/package.json
var package_default = {
  name: "@univerjs/thread-comment",
  version: "0.25.2",
  private: false,
  description: "Shared thread comment models, commands, and services for Univer.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "comment",
    "thread-comment",
    "collaboration",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/thread-comment/src/services/tc-datasource.service.ts
var ThreadCommentDataSourceService = class extends Disposable {
  constructor() {
    super();
    __publicField(this, "_dataSource", null);
    __publicField(this, "syncUpdateMutationToColla", true);
  }
  set dataSource(dataSource) {
    this._dataSource = dataSource;
  }
  get dataSource() {
    return this._dataSource;
  }
  async getThreadComment(unitId, subUnitId, threadId) {
    if (this._dataSource) {
      const comments = await this._dataSource.listComments(unitId, subUnitId, [threadId]);
      return comments[0];
    }
    return null;
  }
  async addComment(comment) {
    const savedComment = this._dataSource ? await this._dataSource.addComment(comment) : comment;
    return { ...savedComment, threadId: savedComment.threadId || savedComment.id };
  }
  async updateComment(comment) {
    if (this._dataSource) {
      return this._dataSource.updateComment(comment);
    }
    return true;
  }
  async resolveComment(comment) {
    if (this._dataSource) {
      return this._dataSource.resolveComment(comment);
    }
    return true;
  }
  async deleteComment(unitId, subUnitId, threadId, commentId) {
    if (this._dataSource) {
      return this._dataSource.deleteComment(unitId, subUnitId, threadId, commentId);
    }
    return true;
  }
  async listThreadComments(unitId, subUnitId, threadIds) {
    if (this.dataSource) {
      return this.dataSource.listComments(unitId, subUnitId, threadIds);
    }
    return false;
  }
  saveToSnapshot(unitComments, unitId) {
    if (this._dataSource) {
      const map = {};
      Object.keys(unitComments).forEach((subUnitId) => {
        const comments = unitComments[subUnitId];
        map[subUnitId] = comments.map(this.dataSource.saveCommentToSnapshot);
      });
      return map;
    }
    return unitComments;
  }
};
var IThreadCommentDataSourceService = createIdentifier("univer.thread-comment.data-source-service");

// ../packages/thread-comment/src/models/thread-comment.model.ts
var ThreadCommentModel = class extends Disposable {
  constructor(_dataSourceService, _lifecycleService) {
    super();
    __publicField(this, "_dataSourceService", _dataSourceService);
    __publicField(this, "_lifecycleService", _lifecycleService);
    __publicField(this, "_commentsMap", /* @__PURE__ */ new Map());
    __publicField(this, "_threadMap", /* @__PURE__ */ new Map());
    __publicField(this, "_commentUpdate$", new Subject());
    __publicField(this, "commentUpdate$", this._commentUpdate$.asObservable());
    __publicField(this, "_tasks", []);
    this.disposeWithMe(() => {
      this._commentUpdate$.complete();
    });
    this.disposeWithMe(this._lifecycleService.lifecycle$.subscribe((stage) => {
      const taskMap = /* @__PURE__ */ new Map();
      if (stage === 2 /* Rendered */) {
        this._tasks.forEach(({ unitId, subUnitId, threadIds }) => {
          let unitMap = taskMap.get(unitId);
          if (!unitMap) {
            unitMap = /* @__PURE__ */ new Map();
            taskMap.set(unitId, unitMap);
          }
          let subUnitMap = unitMap.get(subUnitId);
          if (!subUnitMap) {
            subUnitMap = /* @__PURE__ */ new Set();
            unitMap.set(subUnitId, subUnitMap);
          }
          for (const threadId of threadIds) {
            subUnitMap.add(threadId);
          }
        });
        this._tasks = [];
        taskMap.forEach((subUnitMap, unitId) => {
          subUnitMap.forEach((threadIds, subUnitId) => {
            this.syncThreadComments(unitId, subUnitId, Array.from(threadIds));
          });
        });
      }
    }));
  }
  _ensureCommentMap(unitId, subUnitId) {
    let unitMap = this._commentsMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._commentsMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = /* @__PURE__ */ new Map();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  ensureMap(unitId, subUnitId) {
    return this._ensureCommentMap(unitId, subUnitId);
  }
  _ensureThreadMap(unitId, subUnitId) {
    let unitMap = this._threadMap.get(unitId);
    if (!unitMap) {
      unitMap = /* @__PURE__ */ new Map();
      this._threadMap.set(unitId, unitMap);
    }
    let subUnitMap = unitMap.get(subUnitId);
    if (!subUnitMap) {
      subUnitMap = /* @__PURE__ */ new Map();
      unitMap.set(subUnitId, subUnitMap);
    }
    return subUnitMap;
  }
  _replaceComment(unitId, subUnitId, comment) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const currentComment = commentMap.get(comment.id);
    if (!currentComment) {
      this.addComment(unitId, subUnitId, comment);
      return;
    }
    const { children, ...rest } = comment;
    const newComment = {
      ...rest,
      ref: currentComment.ref
    };
    commentMap.set(comment.id, newComment);
    children == null ? void 0 : children.forEach((child) => {
      commentMap.set(child.id, {
        ...child,
        ref: ""
      });
    });
    this._commentUpdate$.next({
      unitId,
      subUnitId,
      type: "syncUpdate",
      payload: newComment
    });
    if (Boolean(comment.resolved) !== Boolean(currentComment.resolved)) {
      this._commentUpdate$.next({
        unitId,
        subUnitId,
        type: "resolve",
        payload: {
          commentId: comment.id,
          resolved: Boolean(comment.resolved)
        }
      });
    }
  }
  async syncThreadComments(unitId, subUnitId, threadIds) {
    if (this._lifecycleService.stage < 2 /* Rendered */) {
      this._tasks.push({ unitId, subUnitId, threadIds });
      return;
    }
    const threadMap = this._ensureThreadMap(unitId, subUnitId);
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const comments = await this._dataSourceService.listThreadComments(unitId, subUnitId, threadIds);
    if (!comments) {
      return;
    }
    const deleteThreads = new Set(threadIds);
    comments.forEach((comment) => {
      if (!deleteThreads.has(comment.threadId)) {
        return;
      }
      this._replaceComment(unitId, subUnitId, comment);
      deleteThreads.delete(comment.threadId);
    });
    deleteThreads.forEach((id) => {
      threadMap.delete(id);
      commentMap.forEach((comment, commentId) => {
        if (comment.threadId === id) {
          commentMap.delete(commentId);
        }
      });
    });
  }
  addComment(unitId, subUnitId, origin, shouldSync) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const { parentId, children = [], ...rest } = origin;
    const comment = {
      ...rest,
      parentId: parentId === origin.id ? void 0 : parentId
    };
    if (!comment.threadId) {
      comment.threadId = comment.parentId || comment.id;
    }
    const addCommentItem = (item) => {
      commentMap.set(item.id, item);
      this._commentUpdate$.next({
        unitId,
        subUnitId,
        type: "add",
        payload: item,
        isRoot: !item.parentId
      });
    };
    addCommentItem(comment);
    const threadMap = this._ensureThreadMap(unitId, subUnitId);
    if (!comment.parentId) {
      threadMap.set(comment.threadId, comment);
      for (const child of children) {
        addCommentItem(child);
      }
    }
    if (shouldSync) {
      this.syncThreadComments(unitId, subUnitId, [comment.threadId]);
    }
    return true;
  }
  updateComment(unitId, subUnitId, payload, silent) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const oldComment = commentMap.get(payload.commentId);
    if (!oldComment) {
      return true;
    }
    oldComment.updated = true;
    oldComment.text = payload.text;
    oldComment.attachments = payload.attachments;
    oldComment.updateT = payload.updateT;
    this._commentUpdate$.next({
      unitId,
      subUnitId,
      type: "update",
      payload,
      silent
    });
    return true;
  }
  updateCommentRef(unitId, subUnitId, payload, silent) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const oldComment = commentMap.get(payload.commentId);
    if (!oldComment) {
      return false;
    }
    oldComment.ref = payload.ref;
    this._commentUpdate$.next({
      unitId,
      subUnitId,
      type: "updateRef",
      payload,
      silent,
      threadId: oldComment.threadId
    });
    return true;
  }
  resolveComment(unitId, subUnitId, commentId, resolved) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const oldComment = commentMap.get(commentId);
    if (!oldComment) {
      return false;
    }
    oldComment.resolved = resolved;
    this._commentUpdate$.next({
      unitId,
      subUnitId,
      type: "resolve",
      payload: {
        commentId,
        resolved
      }
    });
    return true;
  }
  getComment(unitId, subUnitId, commentId) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    return commentMap.get(commentId);
  }
  getRootComment(unitId, subUnitId, threadId) {
    const threadMap = this._ensureThreadMap(unitId, subUnitId);
    return threadMap.get(threadId);
  }
  getThread(unitId, subUnitId, threadId) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const comments = Array.from(commentMap.values()).filter((comment) => comment.threadId === threadId);
    let root;
    const children = [];
    const relativeUsers = /* @__PURE__ */ new Set();
    for (const comment of comments) {
      if (!comment.parentId) {
        root = comment;
      } else {
        children.push(comment);
      }
      relativeUsers.add(comment.personId);
    }
    if (!root) {
      return void 0;
    }
    return {
      root,
      children,
      relativeUsers,
      unitId,
      subUnitId,
      threadId
    };
  }
  getCommentWithChildren(unitId, subUnitId, commentId) {
    const comment = this.getComment(unitId, subUnitId, commentId);
    if (!comment) {
      return void 0;
    }
    return this.getThread(unitId, subUnitId, comment.threadId);
  }
  _deleteComment(unitId, subUnitId, commentId) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const current = commentMap.get(commentId);
    if (!current) {
      return;
    }
    commentMap.delete(commentId);
    this._commentUpdate$.next({
      unitId,
      subUnitId,
      type: "delete",
      payload: {
        commentId,
        isRoot: !current.parentId,
        comment: current
      }
    });
  }
  deleteThread(unitId, subUnitId, threadId) {
    const threadMap = this._ensureThreadMap(unitId, subUnitId);
    threadMap.delete(threadId);
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    commentMap.forEach((comment) => {
      if (comment.threadId === threadId) {
        this._deleteComment(unitId, subUnitId, comment.id);
      }
    });
  }
  deleteComment(unitId, subUnitId, commentId) {
    const commentMap = this._ensureCommentMap(unitId, subUnitId);
    const current = commentMap.get(commentId);
    if (!current) {
      return true;
    }
    if (current.parentId) {
      this._deleteComment(unitId, subUnitId, commentId);
    } else {
      this.deleteThread(unitId, subUnitId, current.threadId);
    }
    return true;
  }
  deleteUnit(unitId) {
    const unitMap = this._commentsMap.get(unitId);
    if (!unitMap) {
      return;
    }
    unitMap.forEach((subUnitMap, subUnitId) => {
      subUnitMap.forEach((comment) => {
        this.deleteComment(unitId, subUnitId, comment.id);
      });
    });
  }
  getUnit(unitId) {
    const unitMap = this._threadMap.get(unitId);
    if (!unitMap) {
      return [];
    }
    const threads = [];
    unitMap.forEach((subUnitSet, subUnitId) => {
      subUnitSet.forEach((threadComment, threadId) => {
        const thread = this.getThread(unitId, subUnitId, threadId);
        if (thread) {
          threads.push(thread);
        }
      });
    });
    return threads;
  }
  getAll() {
    const all = [];
    this._commentsMap.forEach((unitMap, unitId) => {
      all.push({
        unitId,
        threads: this.getUnit(unitId)
      });
    });
    return all;
  }
};
ThreadCommentModel = __decorateClass([
  __decorateParam(0, Inject(IThreadCommentDataSourceService)),
  __decorateParam(1, Inject(LifecycleService))
], ThreadCommentModel);

// ../packages/thread-comment/src/commands/mutations/comment.mutation.ts
var AddCommentMutation = {
  id: "thread-comment.mutation.add-comment",
  type: 2 /* MUTATION */,
  handler(accessor, params, options) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const { unitId, subUnitId, comment, sync } = params;
    const shouldSync = sync || (options == null ? void 0 : options.fromChangeset) && !comment.parentId;
    return threadCommentModel.addComment(unitId, subUnitId, comment, shouldSync);
  }
};
var UpdateCommentMutation = {
  id: "thread-comment.mutation.update-comment",
  type: 2 /* MUTATION */,
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const { unitId, subUnitId, payload, silent } = params;
    return threadCommentModel.updateComment(unitId, subUnitId, payload, silent);
  }
};
var UpdateCommentRefMutation = {
  id: "thread-comment.mutation.update-comment-ref",
  type: 2 /* MUTATION */,
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const { unitId, subUnitId, payload, silent } = params;
    return threadCommentModel.updateCommentRef(unitId, subUnitId, payload, silent);
  }
};
var ResolveCommentMutation = {
  id: "thread-comment.mutation.resolve-comment",
  type: 2 /* MUTATION */,
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const { unitId, subUnitId, resolved, commentId } = params;
    return threadCommentModel.resolveComment(unitId, subUnitId, commentId, resolved);
  }
};
var DeleteCommentMutation = {
  id: "thread-comment.mutation.delete-comment",
  type: 2 /* MUTATION */,
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const { unitId, subUnitId, commentId } = params;
    return threadCommentModel.deleteComment(unitId, subUnitId, commentId);
  }
};

// ../packages/thread-comment/src/commands/commands/comment.command.ts
var AddCommentCommand = {
  id: "thread-comment.command.add-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const { comment: originComment } = params;
    const comment = await dataSourceService.addComment(originComment);
    const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
    const isRoot = !originComment.parentId;
    const redo = {
      id: AddCommentMutation.id,
      params: {
        ...params,
        comment
      }
    };
    if (isRoot) {
      const res = await commandService.executeCommand(redo.id, redo.params);
      return res;
    }
    return commandService.executeCommand(redo.id, redo.params, {
      onlyLocal: !syncUpdateMutationToColla
    });
  }
};
var UpdateCommentCommand = {
  id: "thread-comment.command.update-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, payload } = params;
    const commandService = accessor.get(ICommandService);
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
    const current = threadCommentModel.getComment(
      unitId,
      subUnitId,
      payload.commentId
    );
    if (!current) {
      return false;
    }
    const { children, ...currentComment } = current;
    const success = await dataSourceService.updateComment({
      ...currentComment,
      ...payload
    });
    if (!success) {
      return false;
    }
    const redo = {
      id: UpdateCommentMutation.id,
      params
    };
    commandService.executeCommand(redo.id, redo.params, { onlyLocal: !syncUpdateMutationToColla });
    return true;
  }
};
var ResolveCommentCommand = {
  id: "thread-comment.command.resolve-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { unitId, subUnitId, resolved, commentId } = params;
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const currentComment = threadCommentModel.getComment(unitId, subUnitId, commentId);
    const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
    if (!currentComment) {
      return false;
    }
    const success = await dataSourceService.resolveComment({
      ...currentComment,
      resolved
    });
    if (!success) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(
      ResolveCommentMutation.id,
      params,
      { onlyLocal: !syncUpdateMutationToColla }
    );
  }
};
var DeleteCommentCommand = {
  id: "thread-comment.command.delete-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const commandService = accessor.get(ICommandService);
    const { unitId, subUnitId, commentId } = params;
    const syncUpdateMutationToColla = dataSourceService.syncUpdateMutationToColla;
    const comment = threadCommentModel.getComment(unitId, subUnitId, commentId);
    if (!comment) {
      return false;
    }
    if (!await dataSourceService.deleteComment(unitId, subUnitId, comment.threadId, commentId)) {
      return false;
    }
    const redo = {
      id: DeleteCommentMutation.id,
      params
    };
    return commandService.executeCommand(redo.id, redo.params, { onlyLocal: !syncUpdateMutationToColla });
  }
};
var DeleteCommentTreeCommand = {
  id: "thread-comment.command.delete-comment-tree",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const threadCommentModel = accessor.get(ThreadCommentModel);
    const commandService = accessor.get(ICommandService);
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const { unitId, subUnitId, commentId } = params;
    const commentWithChildren = threadCommentModel.getCommentWithChildren(unitId, subUnitId, commentId);
    if (!commentWithChildren) {
      return false;
    }
    if (!await dataSourceService.deleteComment(unitId, subUnitId, commentWithChildren.root.threadId, commentId)) {
      return false;
    }
    return await commandService.executeCommand(DeleteCommentMutation.id, {
      unitId,
      subUnitId,
      commentId: commentWithChildren.root.id
    });
  }
};

// ../packages/thread-comment/src/config/config.ts
var THREAD_COMMENT_PLUGIN_CONFIG_KEY = "thread-comment.config";
var configSymbol = Symbol(THREAD_COMMENT_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/thread-comment/src/types/const/index.ts
var TC_PLUGIN_NAME = "UNIVER_THREAD_COMMENT_PLUGIN";

// ../packages/thread-comment/src/controllers/tc-resource.controller.ts
var SHEET_UNIVER_THREAD_COMMENT_PLUGIN = `SHEET_${TC_PLUGIN_NAME}`;
var ThreadCommentResourceController = class extends Disposable {
  constructor(_resourceManagerService, _threadCommentModel, _threadCommentDataSourceService) {
    super();
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    __publicField(this, "_threadCommentDataSourceService", _threadCommentDataSourceService);
    this._initSnapshot();
  }
  _initSnapshot() {
    const toJson = (unitID) => {
      const map = this._threadCommentModel.getUnit(unitID);
      const resultMap = {};
      if (map) {
        map.forEach((info) => {
          var _a;
          const subUnitComments = (_a = resultMap[info.subUnitId]) != null ? _a : [];
          subUnitComments.push({
            ...info.root,
            children: info.children
          });
          resultMap[info.subUnitId] = subUnitComments;
        });
        return JSON.stringify(this._threadCommentDataSourceService.saveToSnapshot(resultMap, unitID));
      }
      return "";
    };
    const parseJson = (json) => {
      if (!json) {
        return {};
      }
      try {
        return JSON.parse(json);
      } catch (err) {
        return {};
      }
    };
    this.disposeWithMe(
      this._resourceManagerService.registerPluginResource({
        pluginName: SHEET_UNIVER_THREAD_COMMENT_PLUGIN,
        businesses: [2 /* UNIVER_SHEET */, 1 /* UNIVER_DOC */],
        toJson: (unitID) => toJson(unitID),
        parseJson: (json) => parseJson(json),
        onUnLoad: (unitID) => {
          this._threadCommentModel.deleteUnit(unitID);
        },
        onLoad: async (unitID, value) => {
          Object.keys(value).forEach((subunitId) => {
            const commentList = value[subunitId];
            commentList.forEach((comment) => {
              this._threadCommentModel.addComment(unitID, subunitId, comment);
            });
            this._threadCommentModel.syncThreadComments(unitID, subunitId, commentList.map((i) => i.threadId));
          });
        }
      })
    );
  }
};
ThreadCommentResourceController = __decorateClass([
  __decorateParam(0, IResourceManagerService),
  __decorateParam(1, Inject(ThreadCommentModel)),
  __decorateParam(2, IThreadCommentDataSourceService)
], ThreadCommentResourceController);

// ../packages/thread-comment/src/plugin.ts
var UniverThreadCommentPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(THREAD_COMMENT_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    var _a;
    mergeOverrideWithDependencies([
      [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
      [ThreadCommentModel],
      [ThreadCommentResourceController]
    ], (_a = this._config) == null ? void 0 : _a.overrides).forEach(
      (d) => {
        this._injector.add(d);
      }
    );
    [
      AddCommentCommand,
      UpdateCommentCommand,
      DeleteCommentCommand,
      ResolveCommentCommand,
      DeleteCommentTreeCommand,
      AddCommentMutation,
      UpdateCommentMutation,
      UpdateCommentRefMutation,
      DeleteCommentMutation,
      ResolveCommentMutation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
    this._injector.get(ThreadCommentResourceController);
  }
};
__publicField(UniverThreadCommentPlugin, "pluginName", TC_PLUGIN_NAME);
__publicField(UniverThreadCommentPlugin, "packageName", package_default.name);
__publicField(UniverThreadCommentPlugin, "version", package_default.version);
__publicField(UniverThreadCommentPlugin, "type", 0 /* UNIVER_UNKNOWN */);
UniverThreadCommentPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigService)
], UniverThreadCommentPlugin);

// ../packages/thread-comment/src/common/utils.ts
function getDT(date) {
  return dateKit(date).format("YYYY/MM/DD HH:mm");
}

export {
  IThreadCommentDataSourceService,
  ThreadCommentModel,
  AddCommentMutation,
  UpdateCommentRefMutation,
  DeleteCommentMutation,
  AddCommentCommand,
  UpdateCommentCommand,
  ResolveCommentCommand,
  DeleteCommentCommand,
  DeleteCommentTreeCommand,
  getDT,
  UniverThreadCommentPlugin
};
