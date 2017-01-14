(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.mutate = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;
    var $ = rb.$;
    var mutationProp = rb.Symbol('mutate');

    var createObserver = function createObserver(element, fn, opts) {
        if (window.MutationObserver) {
            new MutationObserver(fn).observe(element, { childList: true, subtree: !opts.onlyChilds });
        } else {
            rb.logWarn('no MutationObserver');
        }
    };

    var rb_mutate = {
        /**
         * @memberOf rb.events.special.rb_mutate
         * @param {Element} element
         * @param {Function} handler
         * @param {Object} [options]
         * @param {String} [options.selector=*] Selector to search in added and removed Nodes for. (* is fastest)
         * @param {Boolean} [options.onlyMatches=false] Checks only added/removed nodes for matches against selector, but doesn't search inside those nodes for selector. (onlyMatches=true is faster).
         * @param {Boolean} [options.onlyChilds=false] Checks only whether childs of `element` and not the hole subtree. (onlyChilds=true is faster)
         *
         * @example
         * //usage in events object of component:
         * 'rb_mutate:selector(.{name}-cell)': 'onCellChanged',
         * //improved performance:
         * 'rb_mutate:selector(.{name}-cell):onlyMatches()': 'onCellChanged',
         * //even more improved performance:
         * 'rb_mutate:@(find(.{name}-content)):selector(.{name}-cell):onlyMatches():onlyChilds()': 'onCellChanged',
         */
        add: function add(element, handler, options) {
            options = options || {};

            var mutationObj = element[mutationProp];

            var selector = (options.selector || '*').trim();
            var onlyMatches = options.onlyMatches ? 'matches' : 'query';
            var observerKey = options.onlyChilds ? 'childList' : 'subtree';
            var key = onlyMatches + '_' + selector;

            if (!mutationObj) {
                mutationObj = {};
                element[mutationProp] = mutationObj;
            }

            if (!mutationObj[observerKey]) {
                mutationObj[observerKey] = {
                    everything: true,
                    observers: {}
                };
                addObserver(element, mutationObj[observerKey], options);
            }

            if (mutationObj[observerKey].everything) {
                mutationObj[observerKey].everything = selector == '*';
            }

            if (!mutationObj[observerKey].observers[key]) {
                mutationObj[observerKey].observers[key] = {
                    selector: selector,
                    onlyMatches: options.onlyMatches,
                    cbs: $.Callbacks()
                };
            }

            mutationObj[observerKey].observers[key].cbs.add(handler);
        },
        remove: function remove(element, fn, opts) {
            opts = opts || {};

            var mutationObj = element[mutationProp];
            var selector = (opts.selector || '*').trim();
            var onlyMatches = opts.onlyMatches ? 'matches' : 'query';
            var key = onlyMatches + '_' + selector;

            if (mutationObj && mutationObj[key]) {
                mutationObj[key].cbs.remove(fn);

                if (!mutationObj[key].cbs.has()) {
                    mutationObj[key] = null;
                }
            }
        },
        _isRelevantMutation: function _isRelevantMutation(nodeList, observer) {
            var i = void 0,
                len = void 0;
            var ret = observer.selector == '*' && !!nodeList.length;

            for (i = 0, len = nodeList.length; i < len && !ret; i++) {
                if (nodeList[i].matches(observer.selector) || !observer.onlyMatches && nodeList[i].querySelector(observer.selector)) {
                    ret = true;
                    break;
                }
            }

            return ret;
        },
        isRelevantMutation: function isRelevantMutation(mutationRecord, observer) {
            return this._isRelevantMutation(mutationRecord.addedNodes, observer) || this._isRelevantMutation(mutationRecord.removedNodes, observer);
        }
    };

    function addObserver(element, observersObj, opts) {

        var observer = function observer(mutationRecords) {
            var recordIndex = void 0,
                recordLength = void 0,
                mutation = void 0,
                observerProp = void 0,
                event = void 0,
                observer = void 0,
                calledObservers = void 0;

            if (observersObj.everything) {
                for (observerProp in observersObj.observers) {
                    if (!event) {
                        event = [{ type: 'rb_mutate', target: element, mutationRecords: mutationRecords }];
                    }
                    observersObj.observers[observerProp].cbs.fireWith(element, event);
                }
            } else {
                for (recordIndex = 0, recordLength = mutationRecords.length; recordIndex < recordLength; recordIndex++) {
                    mutation = mutationRecords[recordIndex];
                    for (observerProp in observersObj.observers) {
                        observer = observersObj.observers[observerProp];
                        if ((!calledObservers || !calledObservers[observerProp]) && rb_mutate.isRelevantMutation(mutation, observer)) {
                            if (!event) {
                                event = [{ type: 'rb_mutate', target: element, mutationRecords: mutationRecords }];
                            }
                            if (!calledObservers) {
                                calledObservers = {};
                            }
                            calledObservers[observerProp] = true;
                            observer.cbs.fireWith(element, event);
                        }
                    }
                }
            }
        };

        createObserver(element, observer, opts);
    }

    rb.events.special.rb_mutate = rb_mutate;

    exports.default = rb_mutate;
});
