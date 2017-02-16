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
        global.packageloader = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var rb = window.rb;
    var regPath = /^[./]|:\//;

    var rejectedPromise = new Promise(function (resolve, reject) {
        setTimeout(reject);
    }).catch(function () {});

    var promises = rb.loadScript.rb_promises;

    var _packages = {};

    var packageConfig = {
        basePath: '',
        modulePath: '',
        onlyKnown: true
    };

    var createPath = function createPath(moduleId, index, packageIds) {
        var key = 'basePath';
        if (!regPath.test(moduleId)) {
            if (packageIds.isModule) {
                key = 'modulePath';
            }
            moduleId = packageConfig[key] + moduleId;
        }
        return moduleId;
    };

    rb.packageConfig = packageConfig;

    /**
     * Loads a given package and returns a Promise. If it's a registered package the sources will be prefixed using `rb.packageConfig.basePath` option otherwise the packageName will be used as source and prefixed with the `rb.packageConfig.modulePath` option.
     * @memberof rb
     *
     * @see rb.registerPackage
     *
     * @param {String} packageName
     * @returns {Promise}
     */
    rb.loadPackage = function (packageName, onlyKnown) {
        var packagePaths;
        var packages = _packages[packageName];
        if (!packages) {
            if (!onlyKnown && (!packageConfig.onlyKnown || onlyKnown === false)) {
                packages = [packageName];
                packages.isModule = true;
            } else {
                return rejectedPromise;
            }
        }

        packagePaths = packages.map(createPath);

        packagePaths.filter(function (path) {
            return !promises[path];
        }).forEach(function (src) {
            rb.loadScript(src);
        });

        return promises[packagePaths[packagePaths.length - 1]];
    };

    /**
     * Registers a package name with one or multiple sources. If a package is loaded all sources are loaded async but executed in order. The sources will be prefixed with `rb.packageConfig..basePath`.
     * Different packages can have overlapping sources/dependencies. If an array of packageName is passed these are treated as aliases.
     *
     * @memberof rb
     *
     * @param {String|String[]} packageName
     * @param {String|String[]} srces
     *
     * @example
     * //aliasing
     * rb.registerPackage(['accordion', 'tabs', 'panelgroup'], ['js/panelgroup.js']);
     *
     * rb.registerPackage('form-validation', ['js/form-validation.js']);
     * rb.registerPackage('checkout-form', ['js/form-validation.js', 'js/checkout-form.js']);
     */
    rb.registerPackage = function (packageName, srces) {
        var addPackage = function addPackage(packageName) {
            _packages[packageName] = srces;
        };
        if (!Array.isArray(srces)) {
            srces = [srces];
        }
        if (Array.isArray(packageName)) {
            packageName.forEach(addPackage);
        } else {
            addPackage(packageName);
        }
    };

    rb.logInfo('rb.loadPackage is deprecated. Use rb_loadscript or webpack bundles instead.');

    exports.default = rb.loadPackage;
});
