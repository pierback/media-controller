module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var filename = require("path").join(__dirname, "" + chunkId + "." + hotCurrentHash + ".hot-update.js");
/******/ 		require("fs").readFile(filename, "utf-8", function(err, content) {
/******/ 			if(err) {
/******/ 				if(__webpack_require__.onError)
/******/ 					return __webpack_require__.oe(err);
/******/ 				else
/******/ 					throw err;
/******/ 			}
/******/ 			var chunk = {};
/******/ 			require("vm").runInThisContext("(function(exports) {" + content + "\n})", filename)(chunk);
/******/ 			hotAddUpdateChunk(chunk.id, chunk.modules);
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest() { // eslint-disable-line no-unused-vars
/******/ 		var filename = require("path").join(__dirname, "" + hotCurrentHash + ".hot-update.json");
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			require("fs").readFile(filename, "utf-8", function(err, content) {
/******/ 				if(err) return resolve();
/******/ 				try {
/******/ 					var update = JSON.parse(content);
/******/ 				} catch(e) {
/******/ 					return reject(e);
/******/ 				}
/******/ 				resolve(update);
/******/ 			});
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotDisposeChunk(chunkId) { //eslint-disable-line no-unused-vars
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "550a92ff5081ae015757"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if(cb) {
/******/ 							if(callbacks.indexOf(cb) >= 0) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for(i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch(err) {
/******/ 							if(options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if(!options.ignoreErrored) {
/******/ 								if(!error)
/******/ 									error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err, // TODO remove in webpack 4
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/electron-webpack/out/electron-main-hmr/main-hmr.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n__webpack_require__(\"source-map-support/source-map-support.js\").install();\nconst socketPath = process.env.ELECTRON_HMR_SOCKET_PATH;\nif (socketPath == null) {\n    throw new Error(`[HMR] Env ELECTRON_HMR_SOCKET_PATH is not set`);\n}\n// module, but not relative path must be used (because this file is used as entry)\nconst HmrClient = __webpack_require__(\"electron-webpack/out/electron-main-hmr/HmrClient\").HmrClient;\n// tslint:disable:no-unused-expression\nnew HmrClient(socketPath, module.hot, () => {\n    return __webpack_require__.h();\n});\n//# sourceMappingURL=main-hmr.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24td2VicGFjay9vdXQvZWxlY3Ryb24tbWFpbi1obXIvbWFpbi1obXIuanM/ZDA3NyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy9lbGVjdHJvbi13ZWJwYWNrL291dC9lbGVjdHJvbi1tYWluLWhtci9tYWluLWhtci5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwic291cmNlLW1hcC1zdXBwb3J0L3NvdXJjZS1tYXAtc3VwcG9ydC5qc1wiKS5pbnN0YWxsKCk7XG5jb25zdCBzb2NrZXRQYXRoID0gcHJvY2Vzcy5lbnYuRUxFQ1RST05fSE1SX1NPQ0tFVF9QQVRIO1xuaWYgKHNvY2tldFBhdGggPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgW0hNUl0gRW52IEVMRUNUUk9OX0hNUl9TT0NLRVRfUEFUSCBpcyBub3Qgc2V0YCk7XG59XG4vLyBtb2R1bGUsIGJ1dCBub3QgcmVsYXRpdmUgcGF0aCBtdXN0IGJlIHVzZWQgKGJlY2F1c2UgdGhpcyBmaWxlIGlzIHVzZWQgYXMgZW50cnkpXG5jb25zdCBIbXJDbGllbnQgPSByZXF1aXJlKFwiZWxlY3Ryb24td2VicGFjay9vdXQvZWxlY3Ryb24tbWFpbi1obXIvSG1yQ2xpZW50XCIpLkhtckNsaWVudDtcbi8vIHRzbGludDpkaXNhYmxlOm5vLXVudXNlZC1leHByZXNzaW9uXG5uZXcgSG1yQ2xpZW50KHNvY2tldFBhdGgsIG1vZHVsZS5ob3QsICgpID0+IHtcbiAgICByZXR1cm4gX193ZWJwYWNrX2hhc2hfXztcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi1obXIuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24td2VicGFjay9vdXQvZWxlY3Ryb24tbWFpbi1obXIvbWFpbi1obXIuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL2VsZWN0cm9uLXdlYnBhY2svb3V0L2VsZWN0cm9uLW1haW4taG1yL21haW4taG1yLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/electron-webpack/out/electron-main-hmr/main-hmr.js\n");

/***/ }),

/***/ "./src/main/index.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(__dirname) {\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst electron_1 = __webpack_require__(\"electron\");\nconst electron = __webpack_require__(\"electron\");\nconst events_1 = __webpack_require__(\"events\");\nconst mediaKeyHandler_1 = __webpack_require__(\"./src/scripts/mediaKeyHandler.ts\");\n//@ts-ignore\nlet mainWindow;\nconst mkh = new mediaKeyHandler_1.MediaKeyHandler(events_1.EventEmitter);\nlet tray;\nfunction createWindow() {\n    let displays = electron.screen.getAllDisplays();\n    let windowX = (displays[0].size.width / 2) - 250;\n    const window = new electron_1.BrowserWindow({\n        width: 245, height: 275, x: windowX, y: 50, resizable: false,\n        minimizable: false, maximizable: false,\n    });\n    window.loadURL(`file://${__dirname}/index.html`);\n    return window;\n}\nfunction PlayersMap() {\n    return mkh.getPlayersMap();\n}\nmkh.Event.on('update', () => {\n    createTrayIcon();\n    //updateMenuBar();\n});\nfunction updateMenuBar() {\n    const separator = { type: 'separator' };\n    const prefs = {\n        label: 'Preferences', click: () => {\n            createWindow();\n        }\n    };\n    const quit = {\n        label: 'Quit', click: () => {\n            electron_1.app.quit();\n        }\n    };\n    //setActivePlayers();\n    let contextMenu = new electron_1.Menu();\n    if (contextMenu) {\n        //console.log('playersmap ', PlayersMap());\n        for (let ap of PlayersMap().keys()) {\n            //@ts-ignore\n            let itemAttr = PlayersMap().get(ap);\n            let curPlayer = ap === mkh.CurrentPlayer.id;\n            let newItem = {\n                label: itemAttr[1].title, checked: curPlayer, type: 'radio', click: (menuItem) => {\n                    for (let item of contextMenu.items) {\n                        item.checked = false;\n                    }\n                    menuItem.checked = true;\n                    mkh.changePlayer(ap, itemAttr[1].title);\n                }\n            };\n            let menuIt = new electron_1.MenuItem(newItem);\n            contextMenu.append(menuIt);\n        }\n        let sep = new electron_1.MenuItem(separator);\n        contextMenu.append(sep);\n        let _prefs = new electron_1.MenuItem(prefs);\n        contextMenu.append(_prefs);\n        contextMenu.append(sep);\n        let _quit = new electron_1.MenuItem(quit);\n        contextMenu.append(_quit);\n        /* for (let item of contextMenu.items) {\n          if (item.label === mkh.CurrentPlayer.name.split(':').pop()) {\n            item.checked = true;\n          }\n        } */\n    }\n    tray.setContextMenu(contextMenu);\n}\nfunction createTrayIcon(_state) {\n    if (process.platform === 'darwin') {\n        electron_1.app.dock.hide();\n    }\n    let image = null;\n    let icon = null;\n    if (!mkh.CurrentPlayer.playing) {\n        icon = `${__dirname}/../assets/play.png`;\n    }\n    else {\n        icon = `${__dirname}/../assets/pause.png`;\n    }\n    image = electron_1.nativeImage.createFromPath(icon);\n    image.setTemplateImage(true);\n    if (!tray) {\n        tray = new electron_1.Tray(image);\n    }\n    else {\n        tray.setImage(image); //\n    }\n    tray.on('right-click', function () {\n        tray.popUpContextMenu();\n    });\n    if (!mkh.Store.get('player')) {\n        createWindow();\n    }\n    else {\n        //@ts-ignore\n        let temp = mkh.Store.get('player');\n        updateMenuBar();\n    }\n}\nelectron_1.app.on('window-all-closed', () => {\n    if (process.platform !== 'darwin') {\n        electron_1.app.quit();\n    }\n});\nelectron_1.app.on('ready', () => {\n    createTrayIcon();\n});\n\n/* WEBPACK VAR INJECTION */}.call(exports, \"src/main\"))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi9pbmRleC50cz9kYzY0Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJpREFBYTs7QUFDYixtREFBaUY7QUFDakYsaURBQXFDO0FBQ3JDLCtDQUFzQztBQUN0QyxrRkFBNkQ7QUFHN0QsWUFBWTtBQUNaLElBQUksVUFBa0MsQ0FBQztBQUN2QyxNQUFNLEdBQUcsR0FBRyxJQUFJLGlDQUFlLENBQUMscUJBQVksQ0FBQyxDQUFDO0FBQzlDLElBQUksSUFBbUIsQ0FBQztBQUV4QjtJQUNFLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDaEQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBYSxDQUFDO1FBQy9CLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUs7UUFDNUQsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSztLQUN2QyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FBUyxhQUFhLENBQUMsQ0FBQztJQUVqRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNyQixjQUFjLEVBQUUsQ0FBQztJQUNqQixrQkFBa0I7QUFDcEIsQ0FBQyxDQUFDLENBQUM7QUFFSDtJQUNFLE1BQU0sU0FBUyxHQUF3QyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FB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bXBvcnQgeyBhcHAsIE1lbnUsIFRyYXksIG5hdGl2ZUltYWdlLCBCcm93c2VyV2luZG93LCBNZW51SXRlbSB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCAqIGFzIGVsZWN0cm9uIGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBNZWRpYUtleUhhbmRsZXIgfSBmcm9tICcuLi9zY3JpcHRzL21lZGlhS2V5SGFuZGxlcic7XG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuLi9zY3JpcHRzL3V0aWxpdHkvanMvaW50ZXJmYWNlcyc7XG5cbi8vQHRzLWlnbm9yZVxubGV0IG1haW5XaW5kb3c6IEVsZWN0cm9uLkJyb3dzZXJXaW5kb3c7XG5jb25zdCBta2ggPSBuZXcgTWVkaWFLZXlIYW5kbGVyKEV2ZW50RW1pdHRlcik7XG5sZXQgdHJheTogRWxlY3Ryb24uVHJheTtcblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICBsZXQgZGlzcGxheXMgPSBlbGVjdHJvbi5zY3JlZW4uZ2V0QWxsRGlzcGxheXMoKTtcbiAgbGV0IHdpbmRvd1ggPSAoZGlzcGxheXNbMF0uc2l6ZS53aWR0aCAvIDIpIC0gMjUwO1xuICBjb25zdCB3aW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgd2lkdGg6IDI0NSwgaGVpZ2h0OiAyNzUsIHg6IHdpbmRvd1gsIHk6IDUwLCByZXNpemFibGU6IGZhbHNlLFxuICAgIG1pbmltaXphYmxlOiBmYWxzZSwgbWF4aW1pemFibGU6IGZhbHNlLCAvKnZpYnJhbmN5OiAncG9wb3ZlcicsIHpvb21Ub1BhZ2VXaWR0aDogdHJ1ZSovXG4gIH0pO1xuICB3aW5kb3cubG9hZFVSTChgZmlsZTovLyR7X19kaXJuYW1lfS9pbmRleC5odG1sYCk7XG5cbiAgcmV0dXJuIHdpbmRvdztcbn1cblxuZnVuY3Rpb24gUGxheWVyc01hcCgpOiBNYXA8c3RyaW5nLCBbRGF0ZSwgUGxheWVyXT4ge1xuICByZXR1cm4gbWtoLmdldFBsYXllcnNNYXAoKTtcbn1cblxubWtoLkV2ZW50Lm9uKCd1cGRhdGUnLCAoKSA9PiB7XG4gIGNyZWF0ZVRyYXlJY29uKCk7XG4gIC8vdXBkYXRlTWVudUJhcigpO1xufSk7XG5cbmZ1bmN0aW9uIHVwZGF0ZU1lbnVCYXIoKSB7XG4gIGNvbnN0IHNlcGFyYXRvcjogRWxlY3Ryb24uTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMgPSB7IHR5cGU6ICdzZXBhcmF0b3InIH07XG4gIGNvbnN0IHByZWZzOiBFbGVjdHJvbi5NZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9ucyA9IHtcbiAgICBsYWJlbDogJ1ByZWZlcmVuY2VzJywgY2xpY2s6ICgpID0+IHtcbiAgICAgIGNyZWF0ZVdpbmRvdygpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcXVpdDogRWxlY3Ryb24uTWVudUl0ZW1Db25zdHJ1Y3Rvck9wdGlvbnMgPSB7XG4gICAgbGFiZWw6ICdRdWl0JywgY2xpY2s6ICgpID0+IHtcbiAgICAgIGFwcC5xdWl0KCk7XG4gICAgfVxuICB9O1xuXG4gIC8vc2V0QWN0aXZlUGxheWVycygpO1xuICBsZXQgY29udGV4dE1lbnUgPSBuZXcgTWVudSgpO1xuICBpZiAoY29udGV4dE1lbnUpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdwbGF5ZXJzbWFwICcsIFBsYXllcnNNYXAoKSk7XG4gICAgZm9yIChsZXQgYXAgb2YgUGxheWVyc01hcCgpLmtleXMoKSkge1xuICAgICAgLy9AdHMtaWdub3JlXG5cbiAgICAgIGxldCBpdGVtQXR0cjogW0RhdGUsIFBsYXllckF0dHJpYnV0ZXNdID0gUGxheWVyc01hcCgpLmdldChhcCk7XG5cbiAgICAgIGxldCBjdXJQbGF5ZXIgPSBhcCA9PT0gbWtoLkN1cnJlbnRQbGF5ZXIuaWQ7XG5cbiAgICAgIGxldCBuZXdJdGVtOiBFbGVjdHJvbi5NZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9ucyA9IHtcbiAgICAgICAgbGFiZWw6IGl0ZW1BdHRyWzFdLnRpdGxlLCBjaGVja2VkOiBjdXJQbGF5ZXIsIHR5cGU6ICdyYWRpbycsIGNsaWNrOiAobWVudUl0ZW06IE1lbnVJdGVtKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBjb250ZXh0TWVudS5pdGVtcykge1xuICAgICAgICAgICAgaXRlbS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1lbnVJdGVtLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgIG1raC5jaGFuZ2VQbGF5ZXIoYXAsIGl0ZW1BdHRyWzFdLnRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGxldCBtZW51SXQgPSBuZXcgTWVudUl0ZW0obmV3SXRlbSk7XG4gICAgICBjb250ZXh0TWVudS5hcHBlbmQobWVudUl0KTtcbiAgICB9XG5cbiAgICBsZXQgc2VwID0gbmV3IE1lbnVJdGVtKHNlcGFyYXRvcik7XG4gICAgY29udGV4dE1lbnUuYXBwZW5kKHNlcCk7XG5cbiAgICBsZXQgX3ByZWZzID0gbmV3IE1lbnVJdGVtKHByZWZzKTtcbiAgICBjb250ZXh0TWVudS5hcHBlbmQoX3ByZWZzKTtcblxuICAgIGNvbnRleHRNZW51LmFwcGVuZChzZXApO1xuXG4gICAgbGV0IF9xdWl0ID0gbmV3IE1lbnVJdGVtKHF1aXQpO1xuICAgIGNvbnRleHRNZW51LmFwcGVuZChfcXVpdCk7XG5cbiAgICAvKiBmb3IgKGxldCBpdGVtIG9mIGNvbnRleHRNZW51Lml0ZW1zKSB7XG4gICAgICBpZiAoaXRlbS5sYWJlbCA9PT0gbWtoLkN1cnJlbnRQbGF5ZXIubmFtZS5zcGxpdCgnOicpLnBvcCgpKSB7XG4gICAgICAgIGl0ZW0uY2hlY2tlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSAqL1xuICB9XG4gIHRyYXkuc2V0Q29udGV4dE1lbnUoY29udGV4dE1lbnUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUcmF5SWNvbihfc3RhdGU/OiBhbnkpIHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7IGFwcC5kb2NrLmhpZGUoKTsgfVxuICBsZXQgaW1hZ2UgPSBudWxsO1xuICBsZXQgaWNvbiA9IG51bGw7XG5cbiAgaWYgKCFta2guQ3VycmVudFBsYXllci5wbGF5aW5nKSB7XG4gICAgaWNvbiA9IGAke19fZGlybmFtZX0vLi4vYXNzZXRzL3BsYXkucG5nYDtcbiAgfSBlbHNlIHtcbiAgICBpY29uID0gYCR7X19kaXJuYW1lfS8uLi9hc3NldHMvcGF1c2UucG5nYDtcbiAgfVxuXG4gIGltYWdlID0gbmF0aXZlSW1hZ2UuY3JlYXRlRnJvbVBhdGgoaWNvbik7XG4gIGltYWdlLnNldFRlbXBsYXRlSW1hZ2UodHJ1ZSk7XG5cbiAgaWYgKCF0cmF5KSB7XG4gICAgdHJheSA9IG5ldyBUcmF5KGltYWdlKTtcbiAgfSBlbHNlIHtcbiAgICB0cmF5LnNldEltYWdlKGltYWdlKTsgLy9cbiAgfVxuICB0cmF5Lm9uKCdyaWdodC1jbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICB0cmF5LnBvcFVwQ29udGV4dE1lbnUoKTtcbiAgfSk7XG5cbiAgaWYgKCFta2guU3RvcmUuZ2V0KCdwbGF5ZXInKSkge1xuICAgIGNyZWF0ZVdpbmRvdygpO1xuICB9IGVsc2Uge1xuICAgIC8vQHRzLWlnbm9yZVxuICAgIGxldCB0ZW1wOiBzdHJpbmcgPSBta2guU3RvcmUuZ2V0KCdwbGF5ZXInKTtcbiAgICB1cGRhdGVNZW51QmFyKCk7XG4gIH1cbn1cblxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7IGFwcC5xdWl0KCk7IH1cbn0pO1xuXG5hcHAub24oJ3JlYWR5JywgKCkgPT4ge1xuICBjcmVhdGVUcmF5SWNvbigpO1xufSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFpbi9pbmRleC50cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/main/index.ts\n");

/***/ }),

/***/ "./src/scripts/handlers/itunesStateHandler.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst utility_1 = __webpack_require__(\"./src/scripts/utility/js/utility.ts\");\nconst controller_1 = __webpack_require__(\"./src/scripts/utility/player-control/itunes/controller.ts\");\nconst iTunes = new controller_1.ItunesController();\nclass ItunesStateHandler {\n    constructor(ev) {\n        this.Event = ev;\n        this._isPlaying = false;\n        this.Name = 'iTunes';\n    }\n    get Name() {\n        return this._name;\n    }\n    set Name(n) {\n        this._name = n;\n    }\n    get Event() {\n        return this._event;\n    }\n    set Event(evt) {\n        this._event = evt;\n    }\n    get IsPlaying() {\n        return this._isPlaying;\n    }\n    set IsPlaying(state) {\n        this._isPlaying = state;\n    }\n    get IsRunning() {\n        return this._isRunning;\n    }\n    set IsRunning(val) {\n        this._isRunning = val;\n    }\n    get IsFrontmost() {\n        let actWin = utility_1.utility.ActiveApp();\n        if (actWin === this.Name) {\n            return true;\n        }\n        else {\n            return false;\n        }\n    }\n    init() {\n        try {\n            this.checkPlaystate();\n        }\n        catch (e) {\n            console.log(e);\n        }\n    }\n    checkPlaystate() {\n        try {\n            iTunes.Playing.on((data) => {\n                this.IsPlaying = data;\n                const player = { id: this.Name, title: this.Name, playing: data, plObj: this };\n                this.Event.emit('playing', player);\n            });\n        }\n        catch (e) {\n            console.log(e);\n        }\n        try {\n            //@ts-ignore\n            iTunes.Running.on((isRunning) => {\n                this.IsRunning = utility_1.utility.convertToRunningType(isRunning);\n                this.Event.emit('running', { id: this.Name, running: isRunning, _dualP: false });\n            });\n        }\n        catch (e) {\n            console.log(e);\n        }\n    }\n    activate() {\n        iTunes.activate();\n    }\n    pause() {\n        iTunes.pause();\n    }\n    play() {\n        iTunes.play();\n    }\n    next() {\n        iTunes.next();\n    }\n    previous() {\n        iTunes.previous();\n    }\n}\nexports.ItunesStateHandler = ItunesStateHandler;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy9oYW5kbGVycy9pdHVuZXNTdGF0ZUhhbmRsZXIudHM/YjkyOCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBYTs7QUFHYiw2RUFBZ0Q7QUFDaEQsc0dBQStFO0FBQy9FLE1BQU0sTUFBTSxHQUFHLElBQUksNkJBQWdCLEVBQUUsQ0FBQztBQUV0QztJQU1JLFlBQVksRUFBZ0I7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxDQUFTO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxHQUFpQjtRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksU0FBUyxDQUFDLEtBQWM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxHQUFZO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLFdBQVc7UUFDWCxJQUFJLE1BQU0sR0FBRyxpQkFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztJQUVELGNBQWM7UUFDVixJQUFJLENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQVM7Z0JBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixNQUFNLE1BQU0sR0FBVyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUN2RixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUksQ0FBQztZQUNELFlBQVk7WUFDWixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQWtCO2dCQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFPLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ0osTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxLQUFLO1FBQ0QsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxJQUFJO1FBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFJO1FBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxRQUFRO1FBQ0osTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7Q0FDSjtBQXRHRCxnREFzR0MiLCJmaWxlIjoiLi9zcmMvc2NyaXB0cy9oYW5kbGVycy9pdHVuZXNTdGF0ZUhhbmRsZXIudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgSGFuZGxlckludGVyZmFjZSwgUnVubmluZywgUGxheWVyIH0gZnJvbSAnLi4vdXRpbGl0eS9qcy9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHV0aWxpdHkgfSBmcm9tICcuLi91dGlsaXR5L2pzL3V0aWxpdHknO1xuaW1wb3J0IHsgSXR1bmVzQ29udHJvbGxlciB9IGZyb20gJy4uL3V0aWxpdHkvcGxheWVyLWNvbnRyb2wvaXR1bmVzL2NvbnRyb2xsZXInO1xuY29uc3QgaVR1bmVzID0gbmV3IEl0dW5lc0NvbnRyb2xsZXIoKTtcblxuZXhwb3J0IGNsYXNzIEl0dW5lc1N0YXRlSGFuZGxlciBpbXBsZW1lbnRzIEhhbmRsZXJJbnRlcmZhY2Uge1xuICAgIHByb3RlY3RlZCBfaXNSdW5uaW5nOiBSdW5uaW5nO1xuICAgIHByb3RlY3RlZCBfaXNQbGF5aW5nOiBib29sZWFuO1xuICAgIHByb3RlY3RlZCBfZXZlbnQ6IEV2ZW50RW1pdHRlcjtcbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGV2OiBFdmVudEVtaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5FdmVudCA9IGV2O1xuICAgICAgICB0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5OYW1lID0gJ2lUdW5lcyc7XG4gICAgfVxuXG4gICAgZ2V0IE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIHNldCBOYW1lKG46IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbjtcbiAgICB9XG5cbiAgICBnZXQgRXZlbnQoKTogRXZlbnRFbWl0dGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xuICAgIH1cblxuICAgIHNldCBFdmVudChldnQ6IEV2ZW50RW1pdHRlcikge1xuICAgICAgICB0aGlzLl9ldmVudCA9IGV2dDtcbiAgICB9XG5cbiAgICBnZXQgSXNQbGF5aW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNQbGF5aW5nO1xuICAgIH1cblxuICAgIHNldCBJc1BsYXlpbmcoc3RhdGU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5faXNQbGF5aW5nID0gc3RhdGU7XG4gICAgfVxuXG4gICAgZ2V0IElzUnVubmluZygpOiBSdW5uaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzUnVubmluZztcbiAgICB9XG5cbiAgICBzZXQgSXNSdW5uaW5nKHZhbDogUnVubmluZykge1xuICAgICAgICB0aGlzLl9pc1J1bm5pbmcgPSB2YWw7XG4gICAgfVxuXG4gICAgZ2V0IElzRnJvbnRtb3N0KCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYWN0V2luID0gdXRpbGl0eS5BY3RpdmVBcHAoKTtcbiAgICAgICAgaWYgKGFjdFdpbiA9PT0gdGhpcy5OYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5jaGVja1BsYXlzdGF0ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrUGxheXN0YXRlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaVR1bmVzLlBsYXlpbmcub24oKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuSXNQbGF5aW5nID0gZGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbGF5ZXI6IFBsYXllciA9IHsgaWQ6IHRoaXMuTmFtZSwgdGl0bGU6IHRoaXMuTmFtZSwgcGxheWluZzogZGF0YSwgcGxPYmo6IHRoaXMgfTtcbiAgICAgICAgICAgICAgICB0aGlzLkV2ZW50LmVtaXQoJ3BsYXlpbmcnLCBwbGF5ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgaVR1bmVzLlJ1bm5pbmcub24oKGlzUnVubmluZzogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuSXNSdW5uaW5nID0gdXRpbGl0eS5jb252ZXJ0VG9SdW5uaW5nVHlwZShpc1J1bm5pbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuRXZlbnQuZW1pdCgncnVubmluZycsIHsgaWQ6IHRoaXMuTmFtZSwgcnVubmluZzogaXNSdW5uaW5nLCBfZHVhbFA6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICAgIGlUdW5lcy5hY3RpdmF0ZSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpVHVuZXMucGF1c2UoKTtcbiAgICB9XG5cbiAgICBwbGF5KCkge1xuICAgICAgICBpVHVuZXMucGxheSgpO1xuICAgIH1cblxuICAgIG5leHQoKSB7XG4gICAgICAgIGlUdW5lcy5uZXh0KCk7XG4gICAgfVxuXG4gICAgcHJldmlvdXMoKSB7XG4gICAgICAgIGlUdW5lcy5wcmV2aW91cygpO1xuICAgIH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zY3JpcHRzL2hhbmRsZXJzL2l0dW5lc1N0YXRlSGFuZGxlci50cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/scripts/handlers/itunesStateHandler.ts\n");

/***/ }),

/***/ "./src/scripts/index.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst itunesStateHandler_1 = __webpack_require__(\"./src/scripts/handlers/itunesStateHandler.ts\");\nlet extHandlers = [itunesStateHandler_1.ItunesStateHandler];\nexports.extHandlers = extHandlers;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy9pbmRleC50cz8wMzkxIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUdBQW1FO0FBRW5FLElBQUksV0FBVyxHQUFHLENBQUMsdUNBQWtCLENBQUMsQ0FBQztBQUU5QixrQ0FBVyIsImZpbGUiOiIuL3NyYy9zY3JpcHRzL2luZGV4LnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSXR1bmVzU3RhdGVIYW5kbGVyIH0gZnJvbSAnLi9oYW5kbGVycy9pdHVuZXNTdGF0ZUhhbmRsZXInO1xuXG5sZXQgZXh0SGFuZGxlcnMgPSBbSXR1bmVzU3RhdGVIYW5kbGVyXTtcblxuZXhwb3J0IHsgZXh0SGFuZGxlcnMgfTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2NyaXB0cy9pbmRleC50cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/scripts/index.ts\n");

/***/ }),

/***/ "./src/scripts/mediaKeyHandler.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst events_1 = __webpack_require__(\"events\");\nconst utility_1 = __webpack_require__(\"./src/scripts/utility/js/utility.ts\");\nconst store_1 = __webpack_require__(\"./src/scripts/utility/js/store.ts\");\nconst electron_1 = __webpack_require__(\"electron\");\n//@ts-ignore\nconst MediaService = __webpack_require__(\"electron-media-service\");\nconst index_1 = __webpack_require__(\"./src/scripts/index.ts\");\nconst myService = new MediaService();\nconst handlerListener = new events_1.EventEmitter();\nlet handlers = [];\nlet playersMap = new Map();\nclass MediaKeyHandler {\n    constructor(evt) {\n        let mainEvent = evt;\n        this.Event = new mainEvent();\n        this.init();\n    }\n    set TouchbarItem(playing) {\n        if (playing) {\n            myService.setMetaData({\n                state: 'playing'\n            });\n        }\n        else {\n            myService.setMetaData({\n                state: 'pause'\n            });\n        }\n    }\n    set Event(evt) {\n        this._event = evt;\n    }\n    get Event() {\n        return this._event;\n    }\n    set Store(_opt) {\n        this._store = new store_1.Store({\n            configName: 'user-preferences',\n            defaults: {\n                player: ''\n            }\n        });\n    }\n    get DefaultPlayer() {\n        return this._defaultplayer;\n    }\n    set DefaultPlayer(str) {\n        if (str) {\n            this._defaultplayer = str;\n        }\n    }\n    get Handlers() {\n        return handlers;\n    }\n    get Store() {\n        return this._store;\n    }\n    get CurrentPlayer() {\n        //@ts-ignore\n        let curPl = {\n            id: '', title: '', playing: false, plObj: null\n        };\n        let maxDate;\n        playersMap.forEach((val, key) => {\n            if (maxDate == null || val[0] > maxDate) {\n                maxDate = val[0];\n                let attr = val[1];\n                curPl = {\n                    id: key, title: attr.title, playing: attr.playing, plObj: attr.plObj\n                };\n            }\n        });\n        return curPl;\n    }\n    set CurrentPlayer(_player) {\n        if (_player.id != null) {\n            playersMap.set(_player.id, [new Date(), { id: _player.id, title: _player.title, playing: _player.playing, plObj: _player.plObj }]);\n        }\n        //playersMap.set(_player.id, { title: _player.title, playing: _player.playing, dualP: _player.dualP });\n        console.log(`CurrentPlayer { id: ${this.CurrentPlayer.id}, playing: ${this.CurrentPlayer.playing}}`);\n        console.log('');\n    }\n    keyListenerIni() {\n        electron_1.globalShortcut.register('MediaPlayPause', () => {\n            let player = this.CurrentPlayer.plObj;\n            let state = player.IsPlaying;\n            state === true ? player.pause() : player.play();\n        });\n        electron_1.globalShortcut.register('MediaPreviousTrack', () => {\n            this.CurrentPlayer.plObj.previous();\n        });\n        electron_1.globalShortcut.register('MediaNextTrack', () => {\n            let pl = this.CurrentPlayer.plObj;\n            pl.next();\n        });\n        electron_1.globalShortcut.register('command+F7', () => {\n            let pl = this.CurrentPlayer.plObj;\n            pl.activate();\n        });\n    }\n    init() {\n        this.Store = '';\n        myService.startService();\n        electron_1.app.on('ready', () => {\n            this.listenerIni();\n            this.keyListenerIni();\n            this.eventListeners();\n            this.evalDefaultPlayer();\n            //this.logging();\n        });\n        electron_1.app.on('will-quit', () => {\n            electron_1.globalShortcut.unregisterAll();\n        });\n    }\n    //@ts-ignore\n    logging() {\n        //@ts-ignore\n        let log = new store_1.Store({\n            configName: 'player-log',\n            defaults: {\n                /* playersMap: playersMap,\n                handlers: handlers */\n                mkh: this\n            }\n        });\n        console.log(this);\n        //log.set('mkh', this);\n        /*  setInterval(() => {\n             log.set('playersMap', playersMap);\n             log.set('handlers', handlers);\n         }, 2000); */\n    }\n    eventListeners() {\n        /**\n        * renew accelerator handle, when Google music app launches\n        */\n        /* this.gpmsh.Event.on('startup', () => {\n            this.reRegisterKeys();\n        }); */\n        /**\n        * renew accelerator handle, when spotify launches\n        */\n        /* this.ssh.Event.on('startup', () => {\n            this.reRegisterKeys();\n        }); */\n        electron_1.ipcMain.on('storeget', (event) => {\n            this.DefaultPlayer = this.Store.get('player');\n            if (!this.CurrentPlayer.playing || this.CurrentPlayer.id === ' ') {\n                this.CurrentPlayer.id = this.DefaultPlayer;\n            }\n            event.sender.send('asynchronous-reply', this.Store.get('player'));\n        });\n        electron_1.ipcMain.on('storeSet', (_event, data) => {\n            this.Store.set('player', data.data);\n            this.DefaultPlayer = data.data;\n            if (!this.CurrentPlayer.playing) {\n                //this.updateMenuBar(data.mb);\n                this.CurrentPlayer.id = this.DefaultPlayer;\n            }\n        });\n    }\n    listenerIni() {\n        handlerListener.setMaxListeners(150);\n        handlerListener.on('playing', (message) => {\n            let tempPlayer = { id: message.id, title: message.title || message.id, playing: message.playing, plObj: message.plObj };\n            this.setPlayers(tempPlayer);\n        });\n        handlerListener.on('running', (message) => {\n            if (!message.running) {\n                this.appQuit(message.id);\n            }\n        });\n        for (let h of index_1.extHandlers) {\n            handlers.push(new h(handlerListener));\n        }\n        for (let h of handlers) {\n            h.init();\n        }\n    }\n    setPlayers(player, plAct) {\n        if (player.id.includes('none')) {\n            return;\n        }\n        const activatePlayer = plAct; //!player.playing && this.CurrentPlayer.id !== player.id && !this.CurrentPlayer.playing;\n        const newPlayer = this.CurrentPlayer.id !== player.id && player.playing;\n        const stateChange = this.CurrentPlayer.playing !== player.playing && this.CurrentPlayer.id === player.id;\n        //console.log('player', player.id, 'activatePlayer', activatePlayer, 'newPlayer ', newPlayer, ' stateChange ', stateChange);\n        if (stateChange || newPlayer || activatePlayer) {\n            if (player.playing) {\n                this.pause(player);\n            }\n            this.TouchbarItem = player.playing;\n            this.CurrentPlayer = { id: player.id, title: player.title, playing: player.playing, plObj: player.plObj };\n            this.updateMenuBar();\n        }\n    }\n    //@ts-ignore\n    reRegisterKeys() {\n        electron_1.globalShortcut.unregisterAll();\n        console.log('reregister');\n        this.keyListenerIni();\n    }\n    /**\n    * Returns a player-object\n    * @param str\n    */\n    getPlayerObject(str) {\n        for (let h of handlers) {\n            if (h.Name === this.appName(str)) {\n                return h;\n            }\n        }\n        console.log('no player found');\n    }\n    pause(player) {\n        //let currAppName = this.appName(player.id);\n        playersMap.forEach((_value, key) => {\n            /* let appName = this.appName(key);\n            let pl = this.getPlayerObject(appName); */\n            if (key !== player.id) {\n                //important for tray icon\n                _value[1].playing = false;\n                if (_value[1].plObj !== player.plObj)\n                    _value[1].plObj.pause();\n            }\n        });\n        this.TouchbarItem = false;\n    }\n    appName(playerName) {\n        let appName = utility_1.utility.extractAppName(playerName);\n        /* if (appName === 'none') {\n            appName = this.DefaultPlayer;\n        } */\n        return appName;\n    }\n    setDefaultPlayer() {\n        this.DefaultPlayer = this.Store.get('player');\n        if (this.DefaultPlayer && !this.getPlayerObject(this.DefaultPlayer).IsPlaying) {\n            // tslint:disable-next-line:max-line-length\n            this.CurrentPlayer = { id: this.DefaultPlayer, title: this.DefaultPlayer, playing: false, plObj: this.getPlayerObject(this.DefaultPlayer) };\n            setTimeout(() => {\n                this.updateMenuBar();\n            }, 200);\n        }\n    }\n    evalDefaultPlayer() {\n        setTimeout(() => {\n            this.DefaultPlayer = this.Store.get('player');\n            for (let h of handlers) {\n                if (h.IsRunning && !this.CurrentPlayer.playing) {\n                    if (h.Name === this.DefaultPlayer) {\n                        this.setDefaultPlayer();\n                    }\n                    else if (h.Name !== 'Chrome') {\n                        this.CurrentPlayer = { id: h.Name, title: h.title, playing: false, plObj: this.getPlayerObject(h.Name) };\n                    }\n                }\n            }\n        }, 1000);\n    }\n    appQuit(_playerName) {\n        if (playersMap.has(_playerName)) {\n            playersMap.delete(_playerName);\n            playersMap.forEach(pl => pl[1].playing = false);\n            console.log('deleted', _playerName);\n        }\n        if (playersMap.size === 0) {\n            // tslint:disable-next-line:max-line-length\n            this.CurrentPlayer = { id: this.DefaultPlayer, title: this.DefaultPlayer, playing: false, plObj: this.getPlayerObject(this.DefaultPlayer) };\n        }\n        console.log('appQuit ', playersMap);\n        let menbarPl = utility_1.utility.extractAppName(_playerName);\n        if (!playersMap.has(_playerName) && menbarPl !== this.DefaultPlayer) {\n            this.updateMenuBar();\n        }\n    }\n    //Methods called from main.ts\n    /**\n     * Raises player which is last(this.CurrentPlayer.id) in map\n     */\n    activate(str) {\n        //console.log('med key Current ', this.CurrentPlayer.id);\n        this.getPlayerObject(this.CurrentPlayer.id).activate(str);\n    }\n    getPlayersMap() {\n        return playersMap;\n    }\n    changePlayer(playerName, playerTitle) {\n        let pl = { id: playerName, title: playerTitle, playing: false, plObj: this.getPlayerObject(playerName) };\n        this.CurrentPlayer.playing = false;\n        this.pause(pl);\n        this.setPlayers(pl, true);\n        this.activate(playerName);\n    }\n    updateMenuBar() {\n        /*  let playerName: string = name.split(':').pop() || name;\n         let playState = _state;\n         if (playerName === this.DefaultPlayer) {\n             playState = true;\n         } */\n        this.Event.emit('update', this.CurrentPlayer);\n    }\n}\nexports.MediaKeyHandler = MediaKeyHandler;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy9tZWRpYUtleUhhbmRsZXIudHM/OTIxYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBYTs7QUFDYiwrQ0FBc0M7QUFDdEMsNkVBQStDO0FBQy9DLHlFQUEyQztBQUUzQyxtREFBK0Q7QUFDL0QsWUFBWTtBQUNaLG1FQUF1RDtBQUN2RCw4REFBc0M7QUFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNyQyxNQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFZLEVBQUUsQ0FBQztBQUUzQyxJQUFJLFFBQVEsR0FBZSxFQUFFLENBQUM7QUFDOUIsSUFBSSxVQUFVLEdBQWtDLElBQUksR0FBRyxFQUE0QixDQUFDO0FBRXBGO0lBS0ksWUFBWSxHQUFRO1FBQ2hCLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFJLFlBQVksQ0FBQyxPQUE0QjtRQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1YsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDbEIsS0FBSyxFQUFFLFNBQVM7YUFDbkIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDbEIsS0FBSyxFQUFFLE9BQU87YUFDakIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxHQUFpQjtRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxLQUFLO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLElBQVM7UUFDZixJQUFJ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Q0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLGFBQWE7UUFDaEIsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRU0sWUFBWSxDQUFDLFVBQWtCLEVBQUUsV0FBbUI7UUFDdkQsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3pHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ00sYUFBYTtRQUNoQjs7OzthQUlLO1FBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0o7QUFyVUQsMENBcVVDIiwiZmlsZSI6Ii4vc3JjL3NjcmlwdHMvbWVkaWFLZXlIYW5kbGVyLnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IHV0aWxpdHkgfSBmcm9tICcuL3V0aWxpdHkvanMvdXRpbGl0eSc7XG5pbXBvcnQgeyBTdG9yZSB9IGZyb20gJy4vdXRpbGl0eS9qcy9zdG9yZSc7XG5pbXBvcnQgeyBQbGF5ZXIsIFBsYXllcklEIH0gZnJvbSAnLi91dGlsaXR5L2pzL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXBwLCBnbG9iYWxTaG9ydGN1dCwgaXBjTWFpbiBhcyBpcGMgfSBmcm9tICdlbGVjdHJvbic7XG4vL0B0cy1pZ25vcmVcbmltcG9ydCAqIGFzIE1lZGlhU2VydmljZSBmcm9tICdlbGVjdHJvbi1tZWRpYS1zZXJ2aWNlJztcbmltcG9ydCB7IGV4dEhhbmRsZXJzIH0gZnJvbSAnLi9pbmRleCc7XG5jb25zdCBteVNlcnZpY2UgPSBuZXcgTWVkaWFTZXJ2aWNlKCk7XG5jb25zdCBoYW5kbGVyTGlzdGVuZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbmxldCBoYW5kbGVyczogQXJyYXk8YW55PiA9IFtdO1xubGV0IHBsYXllcnNNYXA6IE1hcDxQbGF5ZXJJRCwgW0RhdGUsIFBsYXllcl0+ID0gbmV3IE1hcDxQbGF5ZXJJRCwgW0RhdGUsIFBsYXllcl0+KCk7XG5cbmV4cG9ydCBjbGFzcyBNZWRpYUtleUhhbmRsZXIge1xuICAgIHByb3RlY3RlZCBfc3RvcmU6IFN0b3JlO1xuICAgIHByb3RlY3RlZCBfZXZlbnQ6IEV2ZW50RW1pdHRlcjtcbiAgICBwcm90ZWN0ZWQgX2RlZmF1bHRwbGF5ZXI6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGV2dDogYW55KSB7XG4gICAgICAgIGxldCBtYWluRXZlbnQgPSBldnQ7XG4gICAgICAgIHRoaXMuRXZlbnQgPSBuZXcgbWFpbkV2ZW50KCk7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIHNldCBUb3VjaGJhckl0ZW0ocGxheWluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAocGxheWluZykge1xuICAgICAgICAgICAgbXlTZXJ2aWNlLnNldE1ldGFEYXRhKHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ3BsYXlpbmcnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG15U2VydmljZS5zZXRNZXRhRGF0YSh7XG4gICAgICAgICAgICAgICAgc3RhdGU6ICdwYXVzZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0IEV2ZW50KGV2dDogRXZlbnRFbWl0dGVyKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50ID0gZXZ0O1xuICAgIH1cbiAgICBnZXQgRXZlbnQoKTogRXZlbnRFbWl0dGVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50O1xuICAgIH1cblxuICAgIHNldCBTdG9yZShfb3B0OiBhbnkpIHtcbiAgICAgICAgdGhpcy5fc3RvcmUgPSBuZXcgU3RvcmUoe1xuICAgICAgICAgICAgY29uZmlnTmFtZTogJ3VzZXItcHJlZmVyZW5jZXMnLFxuICAgICAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgICAgICBwbGF5ZXI6ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBEZWZhdWx0UGxheWVyKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWZhdWx0cGxheWVyO1xuICAgIH1cblxuICAgIHNldCBEZWZhdWx0UGxheWVyKHN0cjogc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdHIpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRwbGF5ZXIgPSBzdHI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgSGFuZGxlcnMoKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVycztcbiAgICB9XG5cbiAgICBnZXQgU3RvcmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdG9yZTtcbiAgICB9XG5cbiAgICBnZXQgQ3VycmVudFBsYXllcigpOiBQbGF5ZXIge1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgbGV0IGN1clBsOiBQbGF5ZXIgPSB7XG4gICAgICAgICAgICBpZDogJycsIHRpdGxlOiAnJywgcGxheWluZzogZmFsc2UsIHBsT2JqOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIGxldCBtYXhEYXRlOiBEYXRlO1xuICAgICAgICBwbGF5ZXJzTWFwLmZvckVhY2goKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAobWF4RGF0ZSA9PSBudWxsIHx8IHZhbFswXSA+IG1heERhdGUpIHtcbiAgICAgICAgICAgICAgICBtYXhEYXRlID0gdmFsWzBdO1xuICAgICAgICAgICAgICAgIGxldCBhdHRyID0gdmFsWzFdO1xuICAgICAgICAgICAgICAgIGN1clBsID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDoga2V5LCB0aXRsZTogYXR0ci50aXRsZSwgcGxheWluZzogYXR0ci5wbGF5aW5nLCBwbE9iajogYXR0ci5wbE9ialxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY3VyUGw7XG4gICAgfVxuXG4gICAgc2V0IEN1cnJlbnRQbGF5ZXIoX3BsYXllcjogUGxheWVyKSB7XG4gICAgICAgIGlmIChfcGxheWVyLmlkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHBsYXllcnNNYXAuc2V0KF9wbGF5ZXIuaWQsIFtuZXcgRGF0ZSgpLCB7IGlkOiBfcGxheWVyLmlkLCB0aXRsZTogX3BsYXllci50aXRsZSwgcGxheWluZzogX3BsYXllci5wbGF5aW5nLCBwbE9iajogX3BsYXllci5wbE9iaiB9XSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9wbGF5ZXJzTWFwLnNldChfcGxheWVyLmlkLCB7IHRpdGxlOiBfcGxheWVyLnRpdGxlLCBwbGF5aW5nOiBfcGxheWVyLnBsYXlpbmcsIGR1YWxQOiBfcGxheWVyLmR1YWxQIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgQ3VycmVudFBsYXllciB7IGlkOiAke3RoaXMuQ3VycmVudFBsYXllci5pZH0sIHBsYXlpbmc6ICR7dGhpcy5DdXJyZW50UGxheWVyLnBsYXlpbmd9fWApO1xuICAgICAgICBjb25zb2xlLmxvZygnJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBrZXlMaXN0ZW5lckluaSgpIHtcbiAgICAgICAgZ2xvYmFsU2hvcnRjdXQucmVnaXN0ZXIoJ01lZGlhUGxheVBhdXNlJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHBsYXllciA9IHRoaXMuQ3VycmVudFBsYXllci5wbE9iajtcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IHBsYXllci5Jc1BsYXlpbmc7XG4gICAgICAgICAgICBzdGF0ZSA9PT0gdHJ1ZSA/IHBsYXllci5wYXVzZSgpIDogcGxheWVyLnBsYXkoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyKCdNZWRpYVByZXZpb3VzVHJhY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLkN1cnJlbnRQbGF5ZXIucGxPYmoucHJldmlvdXMoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyKCdNZWRpYU5leHRUcmFjaycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBwbCA9IHRoaXMuQ3VycmVudFBsYXllci5wbE9iajtcbiAgICAgICAgICAgIHBsLm5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdsb2JhbFNob3J0Y3V0LnJlZ2lzdGVyKCdjb21tYW5kK0Y3JywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHBsID0gdGhpcy5DdXJyZW50UGxheWVyLnBsT2JqO1xuICAgICAgICAgICAgcGwuYWN0aXZhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0KCkge1xuICAgICAgICB0aGlzLlN0b3JlID0gJyc7XG4gICAgICAgIG15U2VydmljZS5zdGFydFNlcnZpY2UoKTtcbiAgICAgICAgYXBwLm9uKCdyZWFkeScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJJbmkoKTtcbiAgICAgICAgICAgIHRoaXMua2V5TGlzdGVuZXJJbmkoKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgICAgIHRoaXMuZXZhbERlZmF1bHRQbGF5ZXIoKTtcbiAgICAgICAgICAgIC8vdGhpcy5sb2dnaW5nKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5vbignd2lsbC1xdWl0JywgKCkgPT4ge1xuICAgICAgICAgICAgZ2xvYmFsU2hvcnRjdXQudW5yZWdpc3RlckFsbCgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy9AdHMtaWdub3JlXG4gICAgcHJpdmF0ZSBsb2dnaW5nKCkge1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgbGV0IGxvZyA9IG5ldyBTdG9yZSh7XG4gICAgICAgICAgICBjb25maWdOYW1lOiAncGxheWVyLWxvZycsXG4gICAgICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgICAgIC8qIHBsYXllcnNNYXA6IHBsYXllcnNNYXAsXG4gICAgICAgICAgICAgICAgaGFuZGxlcnM6IGhhbmRsZXJzICovXG4gICAgICAgICAgICAgICAgbWtoOiB0aGlzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgLy9sb2cuc2V0KCdta2gnLCB0aGlzKTtcbiAgICAgICAgLyogIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICBsb2cuc2V0KCdwbGF5ZXJzTWFwJywgcGxheWVyc01hcCk7XG4gICAgICAgICAgICAgbG9nLnNldCgnaGFuZGxlcnMnLCBoYW5kbGVycyk7XG4gICAgICAgICB9LCAyMDAwKTsgKi9cbiAgICB9XG5cbiAgICBwcml2YXRlIGV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICAvKipcbiAgICAgICAgKiByZW5ldyBhY2NlbGVyYXRvciBoYW5kbGUsIHdoZW4gR29vZ2xlIG11c2ljIGFwcCBsYXVuY2hlc1xuICAgICAgICAqL1xuICAgICAgICAvKiB0aGlzLmdwbXNoLkV2ZW50Lm9uKCdzdGFydHVwJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZVJlZ2lzdGVyS2V5cygpO1xuICAgICAgICB9KTsgKi9cblxuICAgICAgICAvKipcbiAgICAgICAgKiByZW5ldyBhY2NlbGVyYXRvciBoYW5kbGUsIHdoZW4gc3BvdGlmeSBsYXVuY2hlc1xuICAgICAgICAqL1xuICAgICAgICAvKiB0aGlzLnNzaC5FdmVudC5vbignc3RhcnR1cCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVSZWdpc3RlcktleXMoKTtcbiAgICAgICAgfSk7ICovXG5cbiAgICAgICAgaXBjLm9uKCdzdG9yZWdldCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLkRlZmF1bHRQbGF5ZXIgPSB0aGlzLlN0b3JlLmdldCgncGxheWVyJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuQ3VycmVudFBsYXllci5wbGF5aW5nIHx8IHRoaXMuQ3VycmVudFBsYXllci5pZCA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5DdXJyZW50UGxheWVyLmlkID0gdGhpcy5EZWZhdWx0UGxheWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQuc2VuZGVyLnNlbmQoJ2FzeW5jaHJvbm91cy1yZXBseScsIHRoaXMuU3RvcmUuZ2V0KCdwbGF5ZXInKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpcGMub24oJ3N0b3JlU2V0JywgKF9ldmVudDogYW55LCBkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuU3RvcmUuc2V0KCdwbGF5ZXInLCBkYXRhLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5EZWZhdWx0UGxheWVyID0gZGF0YS5kYXRhO1xuICAgICAgICAgICAgaWYgKCF0aGlzLkN1cnJlbnRQbGF5ZXIucGxheWluZykge1xuICAgICAgICAgICAgICAgIC8vdGhpcy51cGRhdGVNZW51QmFyKGRhdGEubWIpO1xuICAgICAgICAgICAgICAgIHRoaXMuQ3VycmVudFBsYXllci5pZCA9IHRoaXMuRGVmYXVsdFBsYXllcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsaXN0ZW5lckluaSgpIHtcbiAgICAgICAgaGFuZGxlckxpc3RlbmVyLnNldE1heExpc3RlbmVycygxNTApO1xuICAgICAgICBoYW5kbGVyTGlzdGVuZXIub24oJ3BsYXlpbmcnLCAobWVzc2FnZTogUGxheWVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGVtcFBsYXllciA9IHsgaWQ6IG1lc3NhZ2UuaWQsIHRpdGxlOiBtZXNzYWdlLnRpdGxlIHx8IG1lc3NhZ2UuaWQsIHBsYXlpbmc6IG1lc3NhZ2UucGxheWluZywgcGxPYmo6IG1lc3NhZ2UucGxPYmogfTtcbiAgICAgICAgICAgIHRoaXMuc2V0UGxheWVycyh0ZW1wUGxheWVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaGFuZGxlckxpc3RlbmVyLm9uKCdydW5uaW5nJywgKG1lc3NhZ2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFtZXNzYWdlLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcFF1aXQobWVzc2FnZS5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGggb2YgZXh0SGFuZGxlcnMpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzLnB1c2gobmV3IGgoaGFuZGxlckxpc3RlbmVyKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBoIG9mIGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBoLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0UGxheWVycyhwbGF5ZXI6IFBsYXllciwgcGxBY3Q/OiBib29sZWFuKSB7XG4gICAgICAgIGlmIChwbGF5ZXIuaWQuaW5jbHVkZXMoJ25vbmUnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFjdGl2YXRlUGxheWVyID0gcGxBY3Q7IC8vIXBsYXllci5wbGF5aW5nICYmIHRoaXMuQ3VycmVudFBsYXllci5pZCAhPT0gcGxheWVyLmlkICYmICF0aGlzLkN1cnJlbnRQbGF5ZXIucGxheWluZztcbiAgICAgICAgY29uc3QgbmV3UGxheWVyID0gdGhpcy5DdXJyZW50UGxheWVyLmlkICE9PSBwbGF5ZXIuaWQgJiYgcGxheWVyLnBsYXlpbmc7XG4gICAgICAgIGNvbnN0IHN0YXRlQ2hhbmdlID0gdGhpcy5DdXJyZW50UGxheWVyLnBsYXlpbmcgIT09IHBsYXllci5wbGF5aW5nICYmIHRoaXMuQ3VycmVudFBsYXllci5pZCA9PT0gcGxheWVyLmlkO1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3BsYXllcicsIHBsYXllci5pZCwgJ2FjdGl2YXRlUGxheWVyJywgYWN0aXZhdGVQbGF5ZXIsICduZXdQbGF5ZXIgJywgbmV3UGxheWVyLCAnIHN0YXRlQ2hhbmdlICcsIHN0YXRlQ2hhbmdlKTtcbiAgICAgICAgaWYgKHN0YXRlQ2hhbmdlIHx8IG5ld1BsYXllciB8fCBhY3RpdmF0ZVBsYXllcikge1xuICAgICAgICAgICAgaWYgKHBsYXllci5wbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZShwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5Ub3VjaGJhckl0ZW0gPSBwbGF5ZXIucGxheWluZztcbiAgICAgICAgICAgIHRoaXMuQ3VycmVudFBsYXllciA9IHsgaWQ6IHBsYXllci5pZCwgdGl0bGU6IHBsYXllci50aXRsZSwgcGxheWluZzogcGxheWVyLnBsYXlpbmcsIHBsT2JqOiBwbGF5ZXIucGxPYmogfTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTWVudUJhcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9AdHMtaWdub3JlXG4gICAgcHJpdmF0ZSByZVJlZ2lzdGVyS2V5cygpIHtcbiAgICAgICAgZ2xvYmFsU2hvcnRjdXQudW5yZWdpc3RlckFsbCgpO1xuICAgICAgICBjb25zb2xlLmxvZygncmVyZWdpc3RlcicpO1xuICAgICAgICB0aGlzLmtleUxpc3RlbmVySW5pKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIGEgcGxheWVyLW9iamVjdFxuICAgICogQHBhcmFtIHN0clxuICAgICovXG4gICAgcHJpdmF0ZSBnZXRQbGF5ZXJPYmplY3Qoc3RyOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBmb3IgKGxldCBoIG9mIGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBpZiAoaC5OYW1lID09PSB0aGlzLmFwcE5hbWUoc3RyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdubyBwbGF5ZXIgZm91bmQnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhdXNlKHBsYXllcjogUGxheWVyKSB7XG4gICAgICAgIC8vbGV0IGN1cnJBcHBOYW1lID0gdGhpcy5hcHBOYW1lKHBsYXllci5pZCk7XG4gICAgICAgIHBsYXllcnNNYXAuZm9yRWFjaCgoX3ZhbHVlOiBbRGF0ZSwgUGxheWVyXSwga2V5OiBQbGF5ZXJJRCkgPT4ge1xuICAgICAgICAgICAgLyogbGV0IGFwcE5hbWUgPSB0aGlzLmFwcE5hbWUoa2V5KTtcbiAgICAgICAgICAgIGxldCBwbCA9IHRoaXMuZ2V0UGxheWVyT2JqZWN0KGFwcE5hbWUpOyAqL1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gcGxheWVyLmlkKSB7XG4gICAgICAgICAgICAgICAgLy9pbXBvcnRhbnQgZm9yIHRyYXkgaWNvblxuICAgICAgICAgICAgICAgIF92YWx1ZVsxXS5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKF92YWx1ZVsxXS5wbE9iaiAhPT0gcGxheWVyLnBsT2JqKSBfdmFsdWVbMV0ucGxPYmoucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuVG91Y2hiYXJJdGVtID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBOYW1lKHBsYXllck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGxldCBhcHBOYW1lID0gdXRpbGl0eS5leHRyYWN0QXBwTmFtZShwbGF5ZXJOYW1lKTtcbiAgICAgICAgLyogaWYgKGFwcE5hbWUgPT09ICdub25lJykge1xuICAgICAgICAgICAgYXBwTmFtZSA9IHRoaXMuRGVmYXVsdFBsYXllcjtcbiAgICAgICAgfSAqL1xuICAgICAgICByZXR1cm4gYXBwTmFtZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldERlZmF1bHRQbGF5ZXIoKSB7XG4gICAgICAgIHRoaXMuRGVmYXVsdFBsYXllciA9IHRoaXMuU3RvcmUuZ2V0KCdwbGF5ZXInKTtcbiAgICAgICAgaWYgKHRoaXMuRGVmYXVsdFBsYXllciAmJiAhdGhpcy5nZXRQbGF5ZXJPYmplY3QodGhpcy5EZWZhdWx0UGxheWVyKS5Jc1BsYXlpbmcpIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgIHRoaXMuQ3VycmVudFBsYXllciA9IHsgaWQ6IHRoaXMuRGVmYXVsdFBsYXllciwgdGl0bGU6IHRoaXMuRGVmYXVsdFBsYXllciwgcGxheWluZzogZmFsc2UsIHBsT2JqOiB0aGlzLmdldFBsYXllck9iamVjdCh0aGlzLkRlZmF1bHRQbGF5ZXIpIH07XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU1lbnVCYXIoKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGV2YWxEZWZhdWx0UGxheWVyKCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuRGVmYXVsdFBsYXllciA9IHRoaXMuU3RvcmUuZ2V0KCdwbGF5ZXInKTtcbiAgICAgICAgICAgIGZvciAobGV0IGggb2YgaGFuZGxlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaC5Jc1J1bm5pbmcgJiYgIXRoaXMuQ3VycmVudFBsYXllci5wbGF5aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoLk5hbWUgPT09IHRoaXMuRGVmYXVsdFBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXREZWZhdWx0UGxheWVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaC5OYW1lICE9PSAnQ2hyb21lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5DdXJyZW50UGxheWVyID0geyBpZDogaC5OYW1lLCB0aXRsZTogaC50aXRsZSwgcGxheWluZzogZmFsc2UsIHBsT2JqOiB0aGlzLmdldFBsYXllck9iamVjdChoLk5hbWUpIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXBwUXVpdChfcGxheWVyTmFtZTogUGxheWVySUQpIHtcbiAgICAgICAgaWYgKHBsYXllcnNNYXAuaGFzKF9wbGF5ZXJOYW1lKSkge1xuICAgICAgICAgICAgcGxheWVyc01hcC5kZWxldGUoX3BsYXllck5hbWUpO1xuICAgICAgICAgICAgcGxheWVyc01hcC5mb3JFYWNoKHBsID0+IHBsWzFdLnBsYXlpbmcgPSBmYWxzZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGVsZXRlZCcsIF9wbGF5ZXJOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwbGF5ZXJzTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICAgICAgICAgIHRoaXMuQ3VycmVudFBsYXllciA9IHsgaWQ6IHRoaXMuRGVmYXVsdFBsYXllciwgdGl0bGU6IHRoaXMuRGVmYXVsdFBsYXllciwgcGxheWluZzogZmFsc2UsIHBsT2JqOiB0aGlzLmdldFBsYXllck9iamVjdCh0aGlzLkRlZmF1bHRQbGF5ZXIpIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ2FwcFF1aXQgJywgcGxheWVyc01hcCk7XG5cbiAgICAgICAgbGV0IG1lbmJhclBsID0gdXRpbGl0eS5leHRyYWN0QXBwTmFtZShfcGxheWVyTmFtZSk7XG4gICAgICAgIGlmICghcGxheWVyc01hcC5oYXMoX3BsYXllck5hbWUpICYmIG1lbmJhclBsICE9PSB0aGlzLkRlZmF1bHRQbGF5ZXIpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTWVudUJhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vTWV0aG9kcyBjYWxsZWQgZnJvbSBtYWluLnRzXG5cbiAgICAvKipcbiAgICAgKiBSYWlzZXMgcGxheWVyIHdoaWNoIGlzIGxhc3QodGhpcy5DdXJyZW50UGxheWVyLmlkKSBpbiBtYXBcbiAgICAgKi9cbiAgICBwdWJsaWMgYWN0aXZhdGUoc3RyPzogc3RyaW5nKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ21lZCBrZXkgQ3VycmVudCAnLCB0aGlzLkN1cnJlbnRQbGF5ZXIuaWQpO1xuICAgICAgICB0aGlzLmdldFBsYXllck9iamVjdCh0aGlzLkN1cnJlbnRQbGF5ZXIuaWQpLmFjdGl2YXRlKHN0cik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBsYXllcnNNYXAoKTogTWFwPFBsYXllcklELCBbRGF0ZSwgUGxheWVyXT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyc01hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hhbmdlUGxheWVyKHBsYXllck5hbWU6IHN0cmluZywgcGxheWVyVGl0bGU6IHN0cmluZykge1xuICAgICAgICBsZXQgcGwgPSB7IGlkOiBwbGF5ZXJOYW1lLCB0aXRsZTogcGxheWVyVGl0bGUsIHBsYXlpbmc6IGZhbHNlLCBwbE9iajogdGhpcy5nZXRQbGF5ZXJPYmplY3QocGxheWVyTmFtZSkgfTtcbiAgICAgICAgdGhpcy5DdXJyZW50UGxheWVyLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wYXVzZShwbCk7XG4gICAgICAgIHRoaXMuc2V0UGxheWVycyhwbCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuYWN0aXZhdGUocGxheWVyTmFtZSk7XG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGVNZW51QmFyKCkge1xuICAgICAgICAvKiAgbGV0IHBsYXllck5hbWU6IHN0cmluZyA9IG5hbWUuc3BsaXQoJzonKS5wb3AoKSB8fCBuYW1lO1xuICAgICAgICAgbGV0IHBsYXlTdGF0ZSA9IF9zdGF0ZTtcbiAgICAgICAgIGlmIChwbGF5ZXJOYW1lID09PSB0aGlzLkRlZmF1bHRQbGF5ZXIpIHtcbiAgICAgICAgICAgICBwbGF5U3RhdGUgPSB0cnVlO1xuICAgICAgICAgfSAqL1xuICAgICAgICB0aGlzLkV2ZW50LmVtaXQoJ3VwZGF0ZScsIHRoaXMuQ3VycmVudFBsYXllcik7XG4gICAgfVxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zY3JpcHRzL21lZGlhS2V5SGFuZGxlci50cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/scripts/mediaKeyHandler.ts\n");

/***/ }),

/***/ "./src/scripts/utility/js/emitter.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass LiteEvent {\n    constructor() {\n        this.handlers = [];\n    }\n    on(handler) {\n        this.handlers.push(handler);\n    }\n    off(handler) {\n        this.handlers = this.handlers.filter(h => h !== handler);\n    }\n    trigger(data) {\n        this.handlers.slice(0).forEach(h => h(data));\n    }\n    expose() {\n        return this;\n    }\n}\nexports.LiteEvent = LiteEvent;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL2VtaXR0ZXIudHM/MWY2MyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBO0lBQUE7UUFDWSxhQUFRLEdBQTRCLEVBQUUsQ0FBQztJQWlCbkQsQ0FBQztJQWZVLEVBQUUsQ0FBQyxPQUE2QjtRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sR0FBRyxDQUFDLE9BQTZCO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRU0sT0FBTyxDQUFDLElBQVE7UUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sTUFBTTtRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBbEJELDhCQWtCQyIsImZpbGUiOiIuL3NyYy9zY3JpcHRzL3V0aWxpdHkvanMvZW1pdHRlci50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgSUxpdGVFdmVudDxUPiB7XG4gICAgb24oaGFuZGxlcjogeyAoZGF0YT86IFQpOiB2b2lkIH0pOiB2b2lkO1xuICAgIG9mZihoYW5kbGVyOiB7IChkYXRhPzogVCk6IHZvaWQgfSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBMaXRlRXZlbnQ8VD4gaW1wbGVtZW50cyBJTGl0ZUV2ZW50PFQ+IHtcbiAgICBwcml2YXRlIGhhbmRsZXJzOiB7IChkYXRhPzogVCk6IHZvaWQ7IH1bXSA9IFtdO1xuXG4gICAgcHVibGljIG9uKGhhbmRsZXI6IHsgKGRhdGE/OiBUKTogdm9pZCB9KTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb2ZmKGhhbmRsZXI6IHsgKGRhdGE/OiBUKTogdm9pZCB9KTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzLmZpbHRlcihoID0+IGggIT09IGhhbmRsZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmlnZ2VyKGRhdGE/OiBUKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMuc2xpY2UoMCkuZm9yRWFjaChoID0+IGgoZGF0YSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBleHBvc2UoKTogSUxpdGVFdmVudDxUPiB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL2VtaXR0ZXIudHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/scripts/utility/js/emitter.ts\n");

/***/ }),

/***/ "./src/scripts/utility/js/interfaces.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar Running;\n(function (Running) {\n    Running[Running[\"False\"] = 0] = \"False\";\n    Running[Running[\"True\"] = 1] = \"True\";\n    Running[Running[\"Unknown\"] = 2] = \"Unknown\";\n})(Running = exports.Running || (exports.Running = {}));\nvar PlayerType;\n(function (PlayerType) {\n    PlayerType[PlayerType[\"DUAL\"] = 0] = \"DUAL\";\n    PlayerType[PlayerType[\"MONO\"] = 1] = \"MONO\";\n})(PlayerType = exports.PlayerType || (exports.PlayerType = {}));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL2ludGVyZmFjZXMudHM/OTBiMyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBYTs7QUFHYixJQUFZLE9BSVg7QUFKRCxXQUFZLE9BQU87SUFDZix1Q0FBSztJQUNMLHFDQUFJO0lBQ0osMkNBQU87QUFDWCxDQUFDLEVBSlcsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBSWxCO0FBRUQsSUFBWSxVQUdYO0FBSEQsV0FBWSxVQUFVO0lBQ2xCLDJDQUFJO0lBQ0osMkNBQUk7QUFDUixDQUFDLEVBSFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFHckIiLCJmaWxlIjoiLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL2ludGVyZmFjZXMudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZW51bSBSdW5uaW5nIHtcbiAgICBGYWxzZSxcbiAgICBUcnVlLFxuICAgIFVua25vd25cbn1cblxuZXhwb3J0IGVudW0gUGxheWVyVHlwZSB7XG4gICAgRFVBTCxcbiAgICBNT05PXG59XG4vKlxuZXhwb3J0IGludGVyZmFjZSBUeXBlZEV2ZW50RW1pdHRlcjxULCBLPiB7XG4gICAgYWRkTGlzdGVuZXI8SyBleHRlbmRzIGtleW9mIFQ+KGV2ZW50OiBLLCBsaXN0ZW5lcjogKGFyZzogVFtLXSkgPT4gYW55KTogdGhpcztcbiAgICBvbjxLIGV4dGVuZHMga2V5b2YgVD4oZXZlbnQ6IEssIGxpc3RlbmVyOiAoYXJnOiBUW0tdKSA9PiBhbnkpOiB0aGlzO1xuICAgIG9uY2U8SyBleHRlbmRzIGtleW9mIFQ+KGV2ZW50OiBLLCBsaXN0ZW5lcjogKGFyZzogVFtLXSkgPT4gYW55KTogdGhpcztcbiAgICByZW1vdmVMaXN0ZW5lcjxLIGV4dGVuZHMga2V5b2YgVD4oZXZlbnQ6IEssIGxpc3RlbmVyOiAoYXJnOiBUW0tdKSA9PiBhbnkpOiB0aGlzO1xuICAgIHJlbW92ZUFsbExpc3RlbmVyczxLIGV4dGVuZHMga2V5b2YgVD4oZXZlbnQ/OiBLKTogdGhpcztcbiAgICBzZXRNYXhMaXN0ZW5lcnMobjogbnVtYmVyKTogdGhpcztcbiAgICBnZXRNYXhMaXN0ZW5lcnMoKTogbnVtYmVyO1xuICAgIGxpc3RlbmVyczxLIGV4dGVuZHMga2V5b2YgVD4oZXZlbnQ6IEspOiAoKGFyZzogVFtLXSkgPT4gYW55KVtdO1xuICAgIGVtaXQ8SyBleHRlbmRzIGtleW9mIFQ+KGV2ZW50OiBLLCBhcmc6IFRbS10pOiBib29sZWFuO1xuICAgIGxpc3RlbmVyQ291bnQ8SyBleHRlbmRzIGtleW9mIFQ+KHR5cGU6IEspOiBudW1iZXI7XG4gICAgcHJlcGVuZExpc3RlbmVyPEsgZXh0ZW5kcyBrZXlvZiBUPihldmVudDogSywgbGlzdGVuZXI6IChhcmc6IFRbS10pID0+IGFueSk6IHRoaXM7XG4gICAgcHJlcGVuZE9uY2VMaXN0ZW5lcjxLIGV4dGVuZHMga2V5b2YgVD4oZXZlbnQ6IEssIGxpc3RlbmVyOiAoYXJnOiBUW0tdKSA9PiBhbnkpOiB0aGlzO1xuICAgIGV2ZW50TmFtZXMoKTogKHN0cmluZyB8IHN5bWJvbClbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNeUV2ZW50RW1pdHRlciBleHRlbmRzIFR5cGVkRXZlbnRFbWl0dGVyPGFueSwgYW55PiB7XG4gICAgZXZlbnQobmFtZTogJ3VwZGF0ZScpOiB0aGlzO1xuICAgIGV2ZW50KG5hbWU6ICdydW5uaW5nJyk6IFR5cGVkRXZlbnRFbWl0dGVyPHRoaXMsIHN0cmluZz47XG4gICAgZXZlbnQobmFtZTogJ3BsYXlpbmcnKTogVHlwZWRFdmVudEVtaXR0ZXI8dGhpcywgUGxheWVyPjtcbn1cbiovXG5leHBvcnQgaW50ZXJmYWNlIEhhbmRsZXJJbnRlcmZhY2Uge1xuICAgIHJlYWRvbmx5IElzUGxheWluZzogYm9vbGVhbjtcbiAgICByZWFkb25seSBFdmVudDogRXZlbnRFbWl0dGVyO1xuICAgIHJlYWRvbmx5IElzUnVubmluZzogUnVubmluZztcbiAgICByZWFkb25seSBOYW1lOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgSXNGcm9udG1vc3Q6IGJvb2xlYW47XG4gICAgY2hlY2tQbGF5c3RhdGUoKTogdm9pZDtcbiAgICBwbGF5KCk6IHZvaWQ7XG4gICAgcGF1c2Uoc3RyPzogc3RyaW5nKTogdm9pZDtcbiAgICBuZXh0KCk6IHZvaWQ7XG4gICAgcHJldmlvdXMoKTogdm9pZDtcbiAgICBhY3RpdmF0ZShzdHI/OiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBsYXllck1lc3NhZ2Uge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBzdGF0ZTogYm9vbGVhbjtcbiAgICBfZHVhbFA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgdGl0bGU/OiBzdHJpbmc7XG4gICAgb2JqOiBIYW5kbGVySW50ZXJmYWNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENocm9tZU9iaiB7XG4gICAgaGFuZGxlVGFiOiBDaHJvbWVQbGF5ZXI7XG4gICAgYWN0aXZlVGFiOiB7XG4gICAgICAgIGlkOiBudW1iZXI7XG4gICAgICAgIHVybDogc3RyaW5nO1xuICAgIH07XG4gICAgc2l0ZXM6IEFycmF5PENocm9tZVBsYXllcj47XG4gICAgaXNSdW5uaW5nOiBib29sZWFuO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBsYXllclN0YXRlTWVzc2FnZSB7XG4gICAgc3RhdGU6IGJvb2xlYW47XG4gICAgcnVubmluZzogYm9vbGVhbjtcbiAgICB0cmFja0lkOiBzdHJpbmc7XG59XG5cbi8qIGV4cG9ydCBpbnRlcmZhY2UgUGxheWVyIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgYXR0cjogUGxheWVyQXR0cmlidXRlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbGF5ZXJBdHRyaWJ1dGVzIHtcbiAgICBwbGF5aW5nOiBib29sZWFuO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgZHVhbFA6IGJvb2xlYW47XG59ICovXG5cbmV4cG9ydCB0eXBlIFBsYXllcklEID0gc3RyaW5nO1xuZXhwb3J0IGludGVyZmFjZSBQbGF5ZXIge1xuICAgIGlkOiBQbGF5ZXJJRDtcbiAgICBwbGF5aW5nOiBib29sZWFuO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgcGxPYmo6IEhhbmRsZXJJbnRlcmZhY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hyb21lUGxheWVyIHtcbiAgICBpZDogbnVtYmVyO1xuICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgcGxheWluZz86IGJvb2xlYW47XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL2ludGVyZmFjZXMudHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/scripts/utility/js/interfaces.ts\n");

/***/ }),

/***/ "./src/scripts/utility/js/store.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n/* const electron = require('electron');\n\nconst fs = require('fs');\n */\nconst electron = __webpack_require__(\"electron\");\n//const Path = require('path');\nconst Path = __webpack_require__(\"path\");\nconst fs = __webpack_require__(\"fs\");\nclass Store {\n    constructor(opts) {\n        const userDataPath = (electron.app || electron.remote.app).getPath('userData');\n        this.path = Path.join(userDataPath, opts.configName + '.json');\n        this.data = parseDataFile(this.path, opts.defaults);\n    }\n    get(key) {\n        return this.data[key];\n    }\n    set(key, val) {\n        this.data[key] = val;\n        fs.writeFileSync(this.path, JSON.stringify(this.data));\n    }\n}\nexports.Store = Store;\nfunction parseDataFile(filePath, defaults) {\n    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.\n    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object\n    try {\n        return JSON.parse(fs.readFileSync(filePath, 'utf8'));\n    }\n    catch (error) {\n        // if there was some kind of error, return the passed in defaults instead.\n        return defaults;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL3N0b3JlLnRzPzVhZTMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7O0dBR0c7QUFDSCxpREFBcUM7QUFDckMsK0JBQStCO0FBQy9CLHlDQUE2QjtBQUM3QixxQ0FBeUI7QUFFekI7SUFHSSxZQUFZLElBQVM7UUFDakIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsR0FBRyxDQUFDLEdBQVE7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsR0FBRyxDQUFDLEdBQVEsRUFBRSxHQUFRO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDSjtBQWxCRCxzQkFrQkM7QUFFRCx1QkFBdUIsUUFBZ0IsRUFBRSxRQUFhO0lBQ2xELDhHQUE4RztJQUM5RywyRkFBMkY7SUFDM0YsSUFBSSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNiLDBFQUEwRTtRQUMxRSxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ3BCLENBQUM7QUFDTCxDQUFDIiwiZmlsZSI6Ii4vc3JjL3NjcmlwdHMvdXRpbGl0eS9qcy9zdG9yZS50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGNvbnN0IGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICovXG5pbXBvcnQgKiBhcyBlbGVjdHJvbiBmcm9tICdlbGVjdHJvbic7XG4vL2NvbnN0IFBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuICAgIHBhdGg6IHN0cmluZztcbiAgICBkYXRhOiBhbnk7XG4gICAgY29uc3RydWN0b3Iob3B0czogYW55KSB7XG4gICAgICAgIGNvbnN0IHVzZXJEYXRhUGF0aCA9IChlbGVjdHJvbi5hcHAgfHwgZWxlY3Ryb24ucmVtb3RlLmFwcCkuZ2V0UGF0aCgndXNlckRhdGEnKTtcbiAgICAgICAgdGhpcy5wYXRoID0gUGF0aC5qb2luKHVzZXJEYXRhUGF0aCwgb3B0cy5jb25maWdOYW1lICsgJy5qc29uJyk7XG5cbiAgICAgICAgdGhpcy5kYXRhID0gcGFyc2VEYXRhRmlsZSh0aGlzLnBhdGgsIG9wdHMuZGVmYXVsdHMpO1xuICAgIH1cblxuICAgIGdldChrZXk6IGFueSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuXG4gICAgc2V0KGtleTogYW55LCB2YWw6IGFueSkge1xuICAgICAgICB0aGlzLmRhdGFba2V5XSA9IHZhbDtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnBhdGgsIEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRhRmlsZShmaWxlUGF0aDogc3RyaW5nLCBkZWZhdWx0czogYW55KSB7XG4gICAgLy8gV2UnbGwgdHJ5L2NhdGNoIGl0IGluIGNhc2UgdGhlIGZpbGUgZG9lc24ndCBleGlzdCB5ZXQsIHdoaWNoIHdpbGwgYmUgdGhlIGNhc2Ugb24gdGhlIGZpcnN0IGFwcGxpY2F0aW9uIHJ1bi5cbiAgICAvLyBgZnMucmVhZEZpbGVTeW5jYCB3aWxsIHJldHVybiBhIEpTT04gc3RyaW5nIHdoaWNoIHdlIHRoZW4gcGFyc2UgaW50byBhIEphdmFzY3JpcHQgb2JqZWN0XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBpZiB0aGVyZSB3YXMgc29tZSBraW5kIG9mIGVycm9yLCByZXR1cm4gdGhlIHBhc3NlZCBpbiBkZWZhdWx0cyBpbnN0ZWFkLlxuICAgICAgICByZXR1cm4gZGVmYXVsdHM7XG4gICAgfVxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zY3JpcHRzL3V0aWxpdHkvanMvc3RvcmUudHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/scripts/utility/js/store.ts\n");

/***/ }),

/***/ "./src/scripts/utility/js/utility.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(__dirname) {\nObject.defineProperty(exports, \"__esModule\", { value: true });\n//@ts-ignore\nconst spawn = __webpack_require__(\"child_process\").spawn;\n//@ts-ignore\nconst exec = __webpack_require__(\"child_process\").exec;\nconst cp = __webpack_require__(\"child_process\");\nconst interfaces_1 = __webpack_require__(\"./src/scripts/utility/js/interfaces.ts\");\nconst path = __webpack_require__(\"path\");\n//@ts-ignore\nvar utility;\n(function (utility) {\n    function execCmd(cmdStr) {\n        exec(cmdStr);\n    }\n    utility.execCmd = execCmd;\n    function convertToBoolean(input) {\n        try {\n            return JSON.parse(input);\n        }\n        catch (e) {\n            return undefined;\n        }\n    }\n    utility.convertToBoolean = convertToBoolean;\n    function undefinedToBoolean(input) {\n        try {\n            if (input == undefined) {\n                return false;\n            }\n            return input;\n        }\n        catch (e) {\n            return false;\n        }\n    }\n    utility.undefinedToBoolean = undefinedToBoolean;\n    function undefinedToString(input) {\n        try {\n            if (input == undefined) {\n                return '';\n            }\n            return input;\n        }\n        catch (e) {\n            return '';\n        }\n    }\n    utility.undefinedToString = undefinedToString;\n    function convertToRunningType(input) {\n        try {\n            let val = JSON.parse(input);\n            if (val) {\n                return interfaces_1.Running.True;\n            }\n            else {\n                return interfaces_1.Running.False;\n            }\n        }\n        catch (e) {\n            return interfaces_1.Running.False;\n        }\n    }\n    utility.convertToRunningType = convertToRunningType;\n    function callbackCmd(bin, args) {\n        let oncheckspw;\n        let timeout;\n        return new Promise((resolve, reject) => {\n            //let hrstart = process.hrtime();\n            oncheckspw = spawn(bin, args);\n            oncheckspw.stdout.setEncoding('utf8');\n            oncheckspw.stdout.on('data', function (data) {\n                let parsedJSON = JSON.parse(data);\n                if (parsedJSON) {\n                    //let hrend = process.hrtime(hrstart);\n                    //console.info(\"Execution time (hr): %ds %dms\", hrend[0], hrend[1] / 1000000);\n                    clearTimeout(timeout);\n                    resolve(parsedJSON);\n                }\n                else {\n                    clearTimeout(timeout);\n                    reject(parsedJSON);\n                }\n            });\n            oncheckspw.stdout.on('error', function (err) {\n                clearTimeout(timeout);\n                reject(err);\n            });\n        });\n    }\n    utility.callbackCmd = callbackCmd;\n    function execCallback(cmdStr) {\n        let p = new Promise((resolve, reject) => {\n            try {\n                exec((cmdStr), (err, stdout) => {\n                    if (err instanceof Error) {\n                        reject(err);\n                    }\n                    resolve(stdout);\n                });\n            }\n            catch (err) {\n                reject(err);\n            }\n        });\n        return p;\n    }\n    utility.execCallback = execCallback;\n    function fork() {\n        const spawnPath = path.join(__dirname, '/child.js');\n        const helperProcess = cp.fork(spawnPath);\n        return helperProcess;\n    }\n    utility.fork = fork;\n    function lastActiveApp(cmd) {\n        let p = new Promise((resolve, reject) => {\n            execCallback(cmd)\n                .then((data) => {\n                resolve(data);\n            })\n                .catch((err) => {\n                reject(err);\n            });\n        });\n        return p;\n    }\n    utility.lastActiveApp = lastActiveApp;\n    function extractAppName(fullName) {\n        try {\n            if (fullName == null || fullName == 'undefined') {\n                return 'none';\n            }\n            if (fullName.includes(':')) {\n                return undefinedToString(fullName.split(':').shift());\n            }\n            return fullName;\n        }\n        catch (e) {\n            return 'none';\n        }\n    }\n    utility.extractAppName = extractAppName;\n    function safelyParseJSON(json) {\n        let parsed;\n        try {\n            let dataStr = json.toString() || 'null';\n            parsed = JSON.parse(dataStr);\n        }\n        catch (e) {\n            parsed = 'NULL';\n        }\n        return parsed;\n    }\n    utility.safelyParseJSON = safelyParseJSON;\n    function ActiveApp() {\n        try {\n            //return activeWin.sync().app;\n            return '';\n        }\n        catch (e) {\n            console.log(e);\n            return '';\n        }\n    }\n    utility.ActiveApp = ActiveApp;\n})(utility = exports.utility || (exports.utility = {}));\n\n/* WEBPACK VAR INJECTION */}.call(exports, \"src/scripts/utility/js\"))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL3V0aWxpdHkudHM/MTllYyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiaURBQWE7O0FBQ2IsWUFBWTtBQUNaLE1BQU0sS0FBSyxHQUFHLG1CQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLFlBQVk7QUFDWixNQUFNLElBQUksR0FBRyxtQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMzQyxnREFBb0M7QUFDcEMsbUZBQXVDO0FBQ3ZDLHlDQUE2QjtBQUM3QixZQUFZO0FBRVosSUFBYyxPQUFPLENBb0pwQjtBQXBKRCxXQUFjLE9BQU87SUFFakIsaUJBQXdCLE1BQWM7UUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFGZSxlQUFPLFVBRXRCO0lBRUQsMEJBQWlDLEtBQWE7UUFDMUMsSUFBSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JCLENBQUM7SUFDTCxDQUFDO0lBUGUsd0JBQWdCLG1CQU8vQjtJQUVELDRCQUFtQyxLQUEwQjtRQUN6RCxJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFWZSwwQkFBa0IscUJBVWpDO0lBQ0QsMkJBQWtDLEtBQXlCO1FBQ3ZELElBQUksQ0FB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QUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQztJQUVMLENBQUM7SUFiZSxzQkFBYyxpQkFhN0I7SUFFRCx5QkFBZ0MsSUFBUztRQUNyQyxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksQ0FBQztZQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUM7WUFDeEMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFUZSx1QkFBZSxrQkFTOUI7SUFFRDtRQUNJLElBQUksQ0FBQztZQUNELDhCQUE4QjtZQUM5QixNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0lBUmUsaUJBQVMsWUFReEI7QUFDTCxDQUFDLEVBcEphLE9BQU8sR0FBUCxlQUFPLEtBQVAsZUFBTyxRQW9KcEIiLCJmaWxlIjoiLi9zcmMvc2NyaXB0cy91dGlsaXR5L2pzL3V0aWxpdHkudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vL0B0cy1pZ25vcmVcbmNvbnN0IHNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduO1xuLy9AdHMtaWdub3JlXG5jb25zdCBleGVjID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWM7XG5pbXBvcnQgKiBhcyBjcCBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IFJ1bm5pbmcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbi8vQHRzLWlnbm9yZVxuXG5leHBvcnQgbW9kdWxlIHV0aWxpdHkge1xuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGV4ZWNDbWQoY21kU3RyOiBTdHJpbmcpIHtcbiAgICAgICAgZXhlYyhjbWRTdHIpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VG9Cb29sZWFuKGlucHV0OiBzdHJpbmcpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB1bmRlZmluZWRUb0Jvb2xlYW4oaW5wdXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChpbnB1dCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gdW5kZWZpbmVkVG9TdHJpbmcoaW5wdXQ6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gY29udmVydFRvUnVubmluZ1R5cGUoaW5wdXQ6IGFueSk6IFJ1bm5pbmcge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHZhbCA9IEpTT04ucGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBSdW5uaW5nLlRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBSdW5uaW5nLkZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gUnVubmluZy5GYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjYWxsYmFja0NtZDxUPihiaW46IHN0cmluZywgYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8VD4ge1xuICAgICAgICBsZXQgb25jaGVja3NwdzogYW55O1xuICAgICAgICBsZXQgdGltZW91dDogYW55O1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy9sZXQgaHJzdGFydCA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gICAgICAgICAgICBvbmNoZWNrc3B3ID0gc3Bhd24oYmluLCBhcmdzKTtcbiAgICAgICAgICAgIG9uY2hlY2tzcHcuc3Rkb3V0LnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICBvbmNoZWNrc3B3LnN0ZG91dC5vbignZGF0YScsIGZ1bmN0aW9uIChkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkSlNPTiA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlZEpTT04pIHtcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgaHJlbmQgPSBwcm9jZXNzLmhydGltZShocnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oXCJFeGVjdXRpb24gdGltZSAoaHIpOiAlZHMgJWRtc1wiLCBocmVuZFswXSwgaHJlbmRbMV0gLyAxMDAwMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHBhcnNlZEpTT04pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHBhcnNlZEpTT04pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb25jaGVja3Nwdy5zdGRvdXQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycjogRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGV4ZWNDYWxsYmFjayhjbWRTdHI6IFN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBwID0gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGV4ZWMoKGNtZFN0ciksIChlcnI6IEVycm9yLCBzdGRvdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3Rkb3V0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZvcmsoKTogY3AuQ2hpbGRQcm9jZXNzIHtcbiAgICAgICAgY29uc3Qgc3Bhd25QYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy9jaGlsZC5qcycpO1xuICAgICAgICBjb25zdCBoZWxwZXJQcm9jZXNzOiBjcC5DaGlsZFByb2Nlc3MgPSBjcC5mb3JrKHNwYXduUGF0aCk7XG4gICAgICAgIHJldHVybiBoZWxwZXJQcm9jZXNzO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBsYXN0QWN0aXZlQXBwKGNtZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IHAgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGV4ZWNDYWxsYmFjayhjbWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZXh0cmFjdEFwcE5hbWUoZnVsbE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZnVsbE5hbWUgPT0gbnVsbCB8fCBmdWxsTmFtZSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZnVsbE5hbWUuaW5jbHVkZXMoJzonKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRUb1N0cmluZyhmdWxsTmFtZS5zcGxpdCgnOicpLnNoaWZ0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZ1bGxOYW1lO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc2FmZWx5UGFyc2VKU09OKGpzb246IGFueSkge1xuICAgICAgICBsZXQgcGFyc2VkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGRhdGFTdHIgPSBqc29uLnRvU3RyaW5nKCkgfHwgJ251bGwnO1xuICAgICAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhU3RyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcGFyc2VkID0gJ05VTEwnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEFjdGl2ZUFwcCgpOiBzdHJpbmcge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9yZXR1cm4gYWN0aXZlV2luLnN5bmMoKS5hcHA7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NjcmlwdHMvdXRpbGl0eS9qcy91dGlsaXR5LnRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/scripts/utility/js/utility.ts\n");

/***/ }),

/***/ "./src/scripts/utility/player-control/itunes/controller.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(__dirname) {\nObject.defineProperty(exports, \"__esModule\", { value: true });\n//@ts-ignore\nconst emitter_1 = __webpack_require__(\"./src/scripts/utility/js/emitter.ts\");\n//@ts-ignore\nconst interfaces_1 = __webpack_require__(\"./src/scripts/utility/js/interfaces.ts\");\nconst utility_1 = __webpack_require__(\"./src/scripts/utility/js/utility.ts\");\nconst path = __webpack_require__(\"path\");\nconst itunesControlPathMac = path.join(__dirname, 'applescript', 'itunesControl.applescript');\nconst frontmostAppScptMac = path.join(__dirname, '..', '..', 'cmd', 'activateApp');\nclass ItunesController {\n    constructor() {\n        this.onPlay = new emitter_1.LiteEvent();\n        this.onRunning = new emitter_1.LiteEvent();\n        this.lastActiveApp = 'com.apple.iTunes';\n        this.IsRunning = interfaces_1.Running.False;\n        this._isPlaying = false;\n        this.playstate();\n    }\n    get Playing() { return this.onPlay.expose(); }\n    get Running() { return this.onRunning.expose(); }\n    get IsPlaying() {\n        return this._isPlaying;\n    }\n    set IsPlaying(state1) {\n        this._isPlaying = state1;\n    }\n    get IsRunning() {\n        return this._isRunning;\n    }\n    set IsRunning(val) {\n        this._isRunning = val;\n    }\n    playstate() {\n        const helperProcess = utility_1.utility.fork();\n        let msg = { bin: '', args: '' };\n        if (process.platform == 'darwin') {\n            msg.bin = 'osascript';\n            msg.args = path.join('..', 'player-control', 'itunes', 'applescript', 'itunesGetPlayState.applescript');\n        }\n        if (!msg.bin) {\n            this.onPlay.trigger(false);\n            return;\n        }\n        helperProcess.send(msg);\n        helperProcess.on('message', (res) => {\n            setTimeout(() => helperProcess.send(msg), 700);\n            if (res === 'error' || res == null) {\n                return;\n            }\n            if (this.IsPlaying !== res.state) {\n                if (res.state) {\n                    this.IsPlaying = true;\n                    this.onPlay.trigger(true);\n                }\n                else if (!res.state) {\n                    this.IsPlaying = false;\n                    this.onPlay.trigger(false);\n                }\n            }\n            if (res.running && this.IsRunning == 0) {\n                this.IsRunning = interfaces_1.Running.True;\n                this.onRunning.trigger(true);\n            }\n            else if (!res.running && this.IsRunning == 1) {\n                this.IsRunning = interfaces_1.Running.False;\n                this.onRunning.trigger(false);\n            }\n        });\n        helperProcess.on('error', (_err) => {\n            console.log('error itunes helper', _err);\n            helperProcess.disconnect();\n        });\n        helperProcess.on('disconnect', (_err) => {\n            console.log('RESTART itunes helper', _err);\n            helperProcess.unref();\n            helperProcess.kill();\n            setTimeout(this.playstate, 3000);\n        });\n    }\n    activate() {\n        let cmd = '';\n        if (process.platform === 'darwin') {\n            cmd = frontmostAppScptMac;\n            let strings = [cmd, 'com.apple.iTunes', this.lastActiveApp];\n            let activate = strings.join(' ');\n            utility_1.utility.lastActiveApp(activate)\n                .then((data) => {\n                this.lastActiveApp = data;\n            })\n                .catch((data) => {\n                console.log(data);\n            });\n        }\n    }\n    pause() {\n        //@ts-ignore\n        let cmd = '';\n        if (process.platform === 'darwin') {\n            cmd = itunesControlPathMac;\n            utility_1.utility.execCmd('osascript ' + itunesControlPathMac + ' pause');\n        }\n    }\n    play() {\n        //@ts-ignore\n        let cmd = '';\n        if (process.platform === 'darwin') {\n            cmd = itunesControlPathMac;\n            utility_1.utility.execCmd('osascript ' + itunesControlPathMac + ' play');\n        }\n    }\n    next() {\n        //@ts-ignore\n        let cmd = '';\n        if (process.platform === 'darwin') {\n            cmd = itunesControlPathMac;\n            utility_1.utility.execCmd('osascript ' + itunesControlPathMac + ' next');\n        }\n    }\n    previous() {\n        //@ts-ignore\n        let cmd = '';\n        if (process.platform === 'darwin') {\n            cmd = itunesControlPathMac;\n            utility_1.utility.execCmd('osascript ' + itunesControlPathMac + ' previous');\n        }\n    }\n}\nexports.ItunesController = ItunesController;\n\n/* WEBPACK VAR INJECTION */}.call(exports, \"src/scripts/utility/player-control/itunes\"))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvc2NyaXB0cy91dGlsaXR5L3BsYXllci1jb250cm9sL2l0dW5lcy9jb250cm9sbGVyLnRzPzlkOWQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxZQUFZO0FBQ1osNkVBQTJEO0FBQzNELFlBQVk7QUFDWixtRkFBb0U7QUFDcEUsNkVBQTZDO0FBQzdDLHlDQUE2QjtBQUU3QixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0FBQzlGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFFbkY7SUFTSTtRQUhpQixXQUFNLEdBQUcsSUFBSSxtQkFBUyxFQUFXLENBQUM7UUFDbEMsY0FBUyxHQUFHLElBQUksbUJBQVMsRUFBVyxDQUFDO1FBR2xELElBQUksQ0FBQyxhQUFhLEdBQUcsa0JBQWtCLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxvQkFBTyxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELElBQVcsT0FBTyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFXLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFeEQsSUFBSSxTQUFTO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksU0FBUyxDQUFDLE1BQWU7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxHQUFZO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBQzFCLENBQUM7SUFFRCxTQUFTO1FBQ0wsTUFBTSxhQUFhLEdBQW9CLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEQsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0IsR0FBRyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUM7WUFDdEIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFDckQsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QixhQUFhLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQVE7WUFDakMsVUFBVSxDQUFDLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUFDLENBQUM7WUFDL0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7WUFDTCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsb0JBQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxvQkFBTyxDQUFDLEtBQUssQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFTO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsYUFBYSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFTO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoQyxHQUFHLEdBQUcsbUJBQW1CLENBQUM7WUFDMUIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsaUJBQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO2lCQUMxQixJQUFJLENBQUMsQ0FBQyxJQUFZO2dCQUNmLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQzlCLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsQ0FBQyxJQUFZO2dCQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztJQUNMLENBQUM7SUFFRCxLQUFLO1FBQ0QsWUFBWTtRQUNaLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRyxHQUFHLG9CQUFvQixDQUFDO1lBQzNCLGlCQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxvQkFBb0IsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUk7UUFDQSxZQUFZO1FBQ1osSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoQyxHQUFHLEdBQUcsb0JBQW9CLENBQUM7WUFDM0IsaUJBQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSTtRQUNBLFlBQVk7UUFDWixJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQztZQUMzQixpQkFBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDbkUsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ0osWUFBWTtRQUNaLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRyxHQUFHLG9CQUFvQixDQUFDO1lBQzNCLGlCQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxvQkFBb0IsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUN2RSxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBbklELDRDQW1JQyIsImZpbGUiOiIuL3NyYy9zY3JpcHRzL3V0aWxpdHkvcGxheWVyLWNvbnRyb2wvaXR1bmVzL2NvbnRyb2xsZXIudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL0B0cy1pZ25vcmVcbmltcG9ydCB7IExpdGVFdmVudCwgSUxpdGVFdmVudCB9IGZyb20gJy4vLi4vLi4vanMvZW1pdHRlcic7XG4vL0B0cy1pZ25vcmVcbmltcG9ydCB7IFJ1bm5pbmcsIFBsYXllclN0YXRlTWVzc2FnZSB9IGZyb20gJy4vLi4vLi4vanMvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyB1dGlsaXR5IH0gZnJvbSAnLi8uLi8uLi9qcy91dGlsaXR5JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBjcCBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmNvbnN0IGl0dW5lc0NvbnRyb2xQYXRoTWFjID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2FwcGxlc2NyaXB0JywgJ2l0dW5lc0NvbnRyb2wuYXBwbGVzY3JpcHQnKTtcbmNvbnN0IGZyb250bW9zdEFwcFNjcHRNYWMgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnY21kJywgJ2FjdGl2YXRlQXBwJyk7XG5cbmV4cG9ydCBjbGFzcyBJdHVuZXNDb250cm9sbGVyIHtcbiAgICBwcm90ZWN0ZWQgX2lzUnVubmluZzogUnVubmluZztcbiAgICBwcm90ZWN0ZWQgX2lzUGxheWluZzogYm9vbGVhbjtcbiAgICBsYXN0QWN0aXZlQXBwOiBzdHJpbmc7XG4gICAgcnVubmluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgb25QbGF5ID0gbmV3IExpdGVFdmVudDxib29sZWFuPigpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb25SdW5uaW5nID0gbmV3IExpdGVFdmVudDxib29sZWFuPigpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubGFzdEFjdGl2ZUFwcCA9ICdjb20uYXBwbGUuaVR1bmVzJztcbiAgICAgICAgdGhpcy5Jc1J1bm5pbmcgPSBSdW5uaW5nLkZhbHNlO1xuICAgICAgICB0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5c3RhdGUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IFBsYXlpbmcoKSB7IHJldHVybiB0aGlzLm9uUGxheS5leHBvc2UoKTsgfVxuICAgIHB1YmxpYyBnZXQgUnVubmluZygpIHsgcmV0dXJuIHRoaXMub25SdW5uaW5nLmV4cG9zZSgpOyB9XG5cbiAgICBnZXQgSXNQbGF5aW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNQbGF5aW5nO1xuICAgIH1cblxuICAgIHNldCBJc1BsYXlpbmcoc3RhdGUxOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2lzUGxheWluZyA9IHN0YXRlMTtcbiAgICB9XG5cbiAgICBnZXQgSXNSdW5uaW5nKCk6IFJ1bm5pbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNSdW5uaW5nO1xuICAgIH1cblxuICAgIHNldCBJc1J1bm5pbmcodmFsOiBSdW5uaW5nKSB7XG4gICAgICAgIHRoaXMuX2lzUnVubmluZyA9IHZhbDtcbiAgICB9XG5cbiAgICBwbGF5c3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IGhlbHBlclByb2Nlc3M6IGNwLkNoaWxkUHJvY2VzcyA9IHV0aWxpdHkuZm9yaygpO1xuICAgICAgICBsZXQgbXNnID0geyBiaW46ICcnLCBhcmdzOiAnJyB9O1xuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnZGFyd2luJykge1xuICAgICAgICAgICAgbXNnLmJpbiA9ICdvc2FzY3JpcHQnO1xuICAgICAgICAgICAgbXNnLmFyZ3MgPSBwYXRoLmpvaW4oJy4uJywgJ3BsYXllci1jb250cm9sJywgJ2l0dW5lcycsICdhcHBsZXNjcmlwdCcsICdpdHVuZXNHZXRQbGF5U3RhdGUuYXBwbGVzY3JpcHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1zZy5iaW4pIHsgdGhpcy5vblBsYXkudHJpZ2dlcihmYWxzZSk7IHJldHVybjsgfVxuICAgICAgICBoZWxwZXJQcm9jZXNzLnNlbmQobXNnKTtcblxuICAgICAgICBoZWxwZXJQcm9jZXNzLm9uKCdtZXNzYWdlJywgKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGhlbHBlclByb2Nlc3Muc2VuZChtc2cpLCA3MDApO1xuICAgICAgICAgICAgaWYgKHJlcyA9PT0gJ2Vycm9yJyB8fCByZXMgPT0gbnVsbCkgeyByZXR1cm47IH1cbiAgICAgICAgICAgIGlmICh0aGlzLklzUGxheWluZyAhPT0gcmVzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcy5zdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLklzUGxheWluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25QbGF5LnRyaWdnZXIodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuSXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25QbGF5LnRyaWdnZXIoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcy5ydW5uaW5nICYmIHRoaXMuSXNSdW5uaW5nID09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLklzUnVubmluZyA9IFJ1bm5pbmcuVHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUnVubmluZy50cmlnZ2VyKHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghcmVzLnJ1bm5pbmcgJiYgdGhpcy5Jc1J1bm5pbmcgPT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuSXNSdW5uaW5nID0gUnVubmluZy5GYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUnVubmluZy50cmlnZ2VyKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaGVscGVyUHJvY2Vzcy5vbignZXJyb3InLCAoX2VycjogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3IgaXR1bmVzIGhlbHBlcicsIF9lcnIpO1xuICAgICAgICAgICAgaGVscGVyUHJvY2Vzcy5kaXNjb25uZWN0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGhlbHBlclByb2Nlc3Mub24oJ2Rpc2Nvbm5lY3QnLCAoX2VycjogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUkVTVEFSVCBpdHVuZXMgaGVscGVyJywgX2Vycik7XG4gICAgICAgICAgICBoZWxwZXJQcm9jZXNzLnVucmVmKCk7XG4gICAgICAgICAgICBoZWxwZXJQcm9jZXNzLmtpbGwoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5wbGF5c3RhdGUsIDMwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhY3RpdmF0ZSgpIHtcbiAgICAgICAgbGV0IGNtZDogc3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgICAgICAgY21kID0gZnJvbnRtb3N0QXBwU2NwdE1hYztcbiAgICAgICAgICAgIGxldCBzdHJpbmdzID0gW2NtZCwgJ2NvbS5hcHBsZS5pVHVuZXMnLCB0aGlzLmxhc3RBY3RpdmVBcHBdO1xuICAgICAgICAgICAgbGV0IGFjdGl2YXRlID0gc3RyaW5ncy5qb2luKCcgJyk7XG4gICAgICAgICAgICB1dGlsaXR5Lmxhc3RBY3RpdmVBcHAoYWN0aXZhdGUpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGRhdGE6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RBY3RpdmVBcHAgPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChkYXRhOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGxldCBjbWQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgICAgICAgIGNtZCA9IGl0dW5lc0NvbnRyb2xQYXRoTWFjO1xuICAgICAgICAgICAgdXRpbGl0eS5leGVjQ21kKCdvc2FzY3JpcHQgJyArIGl0dW5lc0NvbnRyb2xQYXRoTWFjICsgJyBwYXVzZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGxldCBjbWQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICAgICAgICAgIGNtZCA9IGl0dW5lc0NvbnRyb2xQYXRoTWFjO1xuICAgICAgICAgICAgdXRpbGl0eS5leGVjQ21kKCdvc2FzY3JpcHQgJyArIGl0dW5lc0NvbnRyb2xQYXRoTWFjICsgJyBwbGF5Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZXh0KCkge1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgbGV0IGNtZDogc3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgICAgICAgY21kID0gaXR1bmVzQ29udHJvbFBhdGhNYWM7XG4gICAgICAgICAgICB1dGlsaXR5LmV4ZWNDbWQoJ29zYXNjcmlwdCAnICsgaXR1bmVzQ29udHJvbFBhdGhNYWMgKyAnIG5leHQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByZXZpb3VzKCkge1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgbGV0IGNtZDogc3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgICAgICAgY21kID0gaXR1bmVzQ29udHJvbFBhdGhNYWM7XG4gICAgICAgICAgICB1dGlsaXR5LmV4ZWNDbWQoJ29zYXNjcmlwdCAnICsgaXR1bmVzQ29udHJvbFBhdGhNYWMgKyAnIHByZXZpb3VzJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NjcmlwdHMvdXRpbGl0eS9wbGF5ZXItY29udHJvbC9pdHVuZXMvY29udHJvbGxlci50cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/scripts/utility/player-control/itunes/controller.ts\n");

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("./node_modules/electron-webpack/out/electron-main-hmr/main-hmr.js");
module.exports = __webpack_require__("./src/main/index.ts");


/***/ }),

/***/ "child_process":
/***/ (function(module, exports) {

eval("module.exports = require(\"child_process\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjaGlsZF9wcm9jZXNzXCI/NDMwOCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJjaGlsZF9wcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIlxuLy8gbW9kdWxlIGlkID0gY2hpbGRfcHJvY2Vzc1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///child_process\n");

/***/ }),

/***/ "electron":
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJlbGVjdHJvblwiPzY5MjgiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoiZWxlY3Ryb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImVsZWN0cm9uXCJcbi8vIG1vZHVsZSBpZCA9IGVsZWN0cm9uXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///electron\n");

/***/ }),

/***/ "electron-media-service":
/***/ (function(module, exports) {

eval("module.exports = require(\"electron-media-service\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJlbGVjdHJvbi1tZWRpYS1zZXJ2aWNlXCI/YjgzMiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJlbGVjdHJvbi1tZWRpYS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZWxlY3Ryb24tbWVkaWEtc2VydmljZVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImVsZWN0cm9uLW1lZGlhLXNlcnZpY2VcIlxuLy8gbW9kdWxlIGlkID0gZWxlY3Ryb24tbWVkaWEtc2VydmljZVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///electron-media-service\n");

/***/ }),

/***/ "electron-webpack/out/electron-main-hmr/HmrClient":
/***/ (function(module, exports) {

eval("module.exports = require(\"electron-webpack/out/electron-main-hmr/HmrClient\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJlbGVjdHJvbi13ZWJwYWNrL291dC9lbGVjdHJvbi1tYWluLWhtci9IbXJDbGllbnRcIj9mMGM5Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImVsZWN0cm9uLXdlYnBhY2svb3V0L2VsZWN0cm9uLW1haW4taG1yL0htckNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImVsZWN0cm9uLXdlYnBhY2svb3V0L2VsZWN0cm9uLW1haW4taG1yL0htckNsaWVudFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImVsZWN0cm9uLXdlYnBhY2svb3V0L2VsZWN0cm9uLW1haW4taG1yL0htckNsaWVudFwiXG4vLyBtb2R1bGUgaWQgPSBlbGVjdHJvbi13ZWJwYWNrL291dC9lbGVjdHJvbi1tYWluLWhtci9IbXJDbGllbnRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///electron-webpack/out/electron-main-hmr/HmrClient\n");

/***/ }),

/***/ "events":
/***/ (function(module, exports) {

eval("module.exports = require(\"events\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJldmVudHNcIj9jNjhmIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImV2ZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImV2ZW50c1wiXG4vLyBtb2R1bGUgaWQgPSBldmVudHNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///events\n");

/***/ }),

/***/ "fs":
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiPzJlMDkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoiZnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzXCJcbi8vIG1vZHVsZSBpZCA9IGZzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///fs\n");

/***/ }),

/***/ "path":
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCI/NWIyYSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJwYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInBhdGhcIlxuLy8gbW9kdWxlIGlkID0gcGF0aFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///path\n");

/***/ }),

/***/ "source-map-support/source-map-support.js":
/***/ (function(module, exports) {

eval("module.exports = require(\"source-map-support/source-map-support.js\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzb3VyY2UtbWFwLXN1cHBvcnQvc291cmNlLW1hcC1zdXBwb3J0LmpzXCI/YTMyNCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJzb3VyY2UtbWFwLXN1cHBvcnQvc291cmNlLW1hcC1zdXBwb3J0LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic291cmNlLW1hcC1zdXBwb3J0L3NvdXJjZS1tYXAtc3VwcG9ydC5qc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInNvdXJjZS1tYXAtc3VwcG9ydC9zb3VyY2UtbWFwLXN1cHBvcnQuanNcIlxuLy8gbW9kdWxlIGlkID0gc291cmNlLW1hcC1zdXBwb3J0L3NvdXJjZS1tYXAtc3VwcG9ydC5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///source-map-support/source-map-support.js\n");

/***/ })

/******/ });