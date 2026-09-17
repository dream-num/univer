import {
  editor
} from "./chunk-CLMLYKFF.js";

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/common/workers.js
function createTrustedTypesPolicy(policyName, policyOptions) {
  var _a;
  const monacoEnvironment = globalThis.MonacoEnvironment;
  if (monacoEnvironment == null ? void 0 : monacoEnvironment.createTrustedTypesPolicy) {
    try {
      return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
    } catch (err) {
      console.error(err);
      return void 0;
    }
  }
  try {
    return (_a = globalThis.trustedTypes) == null ? void 0 : _a.createPolicy(policyName, policyOptions);
  } catch (err) {
    console.error(err);
    return void 0;
  }
}
var ttPolicy;
if (typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope" && globalThis.workerttPolicy !== void 0) {
  ttPolicy = globalThis.workerttPolicy;
} else {
  ttPolicy = createTrustedTypesPolicy("defaultWorkerFactory", {
    createScriptURL: (value) => value
  });
}
function getWorker(descriptor) {
  const label = descriptor.label;
  const monacoEnvironment = globalThis.MonacoEnvironment;
  if (monacoEnvironment) {
    if (typeof monacoEnvironment.getWorker === "function") {
      return monacoEnvironment.getWorker("workerMain.js", label);
    }
    if (typeof monacoEnvironment.getWorkerUrl === "function") {
      const workerUrl = monacoEnvironment.getWorkerUrl("workerMain.js", label);
      return new Worker(
        ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl,
        { name: label, type: "module" }
      );
    }
  }
  if (descriptor.createWorker) {
    return descriptor.createWorker();
  }
  throw new Error(
    `You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`
  );
}
function createWebWorker(opts) {
  var _a;
  const worker = Promise.resolve(
    getWorker({
      label: (_a = opts.label) != null ? _a : "monaco-editor-worker",
      moduleId: opts.moduleId,
      createWorker: opts.createWorker
    })
  ).then((w) => {
    w.postMessage("ignore");
    w.postMessage(opts.createData);
    return w;
  });
  return editor.createWebWorker({
    worker,
    host: opts.host,
    keepIdleModels: opts.keepIdleModels
  });
}

export {
  createWebWorker
};
