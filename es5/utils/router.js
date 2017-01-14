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
        global.router = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * original by
     * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
     */
    if (!window.rb) {
        window.rb = {};
    }

    var rb = window.rb;
    var regSlashEnd = /\/$/;
    var regSlashBegin = /^\//;
    var regFullHash = /#(.*)$/;

    rb.Router = {
        routes: [],
        mode: 'hash',
        root: '/',
        regHash: /#!(.*)$/,
        config: function config(options) {
            options = options || {};
            this.mode = options.mode && options.mode == 'history' && 'pushState' in history ? 'history' : 'hash';

            if (options.regHash) {
                this.regHash = options.regHash;
            }

            this.root = options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
            return this;
        },
        getFragment: function getFragment() {
            var match;
            var fragment = '';
            if (this.mode === 'history') {
                fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
                //fragment = fragment.replace(/\?(.*)$/, '');
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            } else {
                match = window.location.href.match(this.regHash);
                fragment = match ? match[1] : '';
            }
            return this.clearSlashes(fragment);
        },
        clearSlashes: function clearSlashes(path) {
            return path.toString().replace(regSlashEnd, '').replace(regSlashBegin, '');
        },
        add: function add(re, handler) {
            if (typeof re == 'function') {
                handler = re;
                re = '';
            }
            this.routes.push({ re: re, handler: handler });
            return this;
        },
        remove: function remove(param) {
            for (var i = 0, r; i < this.routes.length; i++) {
                r = this.routes[i];
                if (r.handler === param || r.re.toString() === param.toString()) {
                    this.routes.splice(i, 1);
                    return this;
                }
            }
            return this;
        },
        flush: function flush() {
            this.routes = [];
            this.mode = null;
            this.root = '/';
            return this;
        },
        applyRoutes: function applyRoutes(f) {
            var i, match;
            var data = { fragment: f || this.getFragment() };

            this.beforeFragment = this.current;
            this.current = data.fragment;

            for (i = 0; i < this.routes.length; i++) {
                match = data.fragment.match(this.routes[i].re);
                if (match) {
                    match.shift();
                    if (!this.routes[i].handler.apply(data, match)) {
                        return this;
                    }
                }
            }
            return this;
        },
        unlisten: function unlisten() {
            if (this._listener) {
                window.removeEventListener('hashchange', this._listener);
                window.removeEventListener('popstate', this._listener);
            }
            if (this._listener || this.interval) {
                clearInterval(this.interval);
            }
        },
        listen: function listen() {
            var that = this;

            that.current = that.getFragment();

            this.unlisten();

            if (!this._listener) {
                this._listener = function () {
                    var cur = that.getFragment();
                    if (that.current !== cur) {
                        that.applyRoutes(cur);
                    }
                };
            }

            this.interval = setInterval(this._listener, 999);

            if (this.mode == 'hash') {
                window.addEventListener('hashchange', this._listener);
            } else {
                window.addEventListener('popstate', this._listener);
            }
            return this;
        },
        navigate: function navigate(path) {
            path = path ? path : '';
            if (this.mode === 'history') {
                history.pushState(null, '', this.root + this.clearSlashes(path));
            } else {
                window.location.href = window.location.href.replace(regFullHash, '') + '#' + path;
            }
            if (this._listener) {
                this._listener();
            }
            return this;
        }
    };

    exports.default = rb.Router;
});
