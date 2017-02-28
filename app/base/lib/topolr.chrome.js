(function () {
    var topolr = function (start) {
        return new dom(start);
    };
    var browser = (function () {
        var map = {
            kenel: [{n: "webkit", g: /applewebkit\/([\d.]+)/}, {n: "gecko", g: /gecko\/([\d.]+)/}, {n: "trident", g: /trident\/([\d.]+)/}],
            info: [{n: "chrome", g: /chrome\/([\d.]+)/}, {n: "firefox", g: /firefox\/([\d.]+)/}, {n: "msie", g: /msie ([\d.]+)/}, {n: "opera", g: /opera\/([\d.]+)/}, {n: "safari", g: /safari\/([\d.]+)/}, {n: "blackberry", g: /blackberry ([\d.]+)/}],
            os: [{n: "windows", g: /windows ([a-z\d. ]+)/}, {n: "osx", g: /mac os x ([a-z\d. ]+)/}, {n: "ios", g: /os ([a-z\d. _]+)/}, {n: "linux", g: /linux ([a-z\d. _]+)/}, {n: "linux", g: /linux/}, {n: "blackberry", g: /blackberry ([a-z\d. ]+)/}, {n: "blackberry", g: /bb[0-9]+/}],
            mobile: [{n: "android", g: /android ([\d.]+)/}, {n: "iphone", g: /iphone/}, {n: "ipad", g: /ipad/}, {n: "blackberry", g: /bb[0-9]+/}, {n: "blackberry", g: /blackberry/}]
        }, ua = window.navigator.userAgent.toLowerCase(), c = {};
        for (var i in map) {
            c[i] = undefined;
            for (var t in map[i]) {
                var a = map[i][t];
                var b = ua.match(a.g);
                if (b) {
                    var v = b[0].match(/[0-9._]+/);
                    c[i] = {
                        name: a.n,
                        version: v ? v[0] : undefined
                    };
                    break;
                }
            }
        }
        if (c.kenel && c.kenel.name === "trident" && c.kenel.version === "7.0") {
            c.info = {name: "msie", version: "11"};
        }
        c.isMobile = function () {
            return this.mobile !== null;
        };
        c.isAndroid = function (version) {
            if (arguments.length === 0) {
                return this.mobile ? (this.mobile.name === "android") : false;
            } else {
                return this.mobile.name === "android" && parseInt(this.mobile.version) === parseInt(version);
            }
        };
        c.isIos = function (version) {
            if (arguments.length === 0) {
                return this.mobile ? (this.mobile.name === "ios") : false;
            } else {
                return this.mobile.name === "ios" && parseInt(this.mobile.version) === parseInt(version);
            }
        };
        c.isWebkit = function (version) {
            if (arguments.length === 0) {
                return this.kenel ? (this.kenel.name === "webkit") : false;
            } else {
                return this.kenel.name === "webkit" && parseInt(this.kenel.version) === parseInt(version);
            }
        };
        c.isGecko = function (version) {
            if (arguments.length === 0) {
                return this.kenel ? (this.kenel.name === "gecko") : false;
            } else {
                return this.kenel.name === "gecko" && parseInt(this.kenel.version) === parseInt(version);
            }
        };
        c.isTrident = function () {
            return this.kenel ? (this.kenel.name === "trident") : false;
        };
        c.isIe = function (version) {
            if (arguments.length === 0) {
                return this.info ? (this.info.name === "msie") : false;
            } else {
                return this.info.name === "msie" && parseInt(this.info.version) === parseInt(version);
            }
        };
        c.isSupport = function () {
            return this.kenel && (this.kenel.name === "webkit" || this.kenel.name === "gecko" || (this.kenel.name === "trident" && this.kenel.version / 1 >= 6));
        };
        return c;
    })();
    var is = {
        isFunction: function (obj) {
            return (typeof obj === 'function') && obj.constructor === Function;
        },
        isEmptyObject: function (obj) {
            for (var a in obj) {
                return false;
            }
            return true;
        },
        isWindow: function (obj) {
            return obj !== undefined && obj !== null && obj === obj.window;
        },
        isDocument: function (obj) {
            return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
        },
        isObject: function (obj) {
            return  typeof (obj) === "object" && Object.prototype.toString.call(obj).toLowerCase() === "[object object]" && !obj.length;
        },
        isString: function (obj) {
            return (typeof obj === 'string') && obj.constructor === String;
        },
        isNumber: function (obj) {
            return typeof obj === "number";
        },
        isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        isAvalid: function (obj) {
            return obj !== null && obj !== undefined;
        },
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        isQueryString: function (str) {
            return is.isString(str) && /(^|&).*=([^&]*)(&|$)/.test(str);
        },
        isElement: function (e) {
            return e && e.nodeType === 1 && e.nodeName;
        }
    };
    var serialize = {
        parse: function (str) {
            return window.JSON.parse(str);
        },
        stringify: function (obj) {
            return window.JSON.stringify(obj);
        },
        postData: function (obj) {
            if (obj) {
                if (obj instanceof FormData || obj instanceof Blob || obj instanceof ArrayBuffer) {
                    return obj;
                } else if (is.isObject(obj)) {
                    var has = false;
                    for (var i in obj) {
                        if (obj[i] instanceof Blob || obj[i] instanceof ArrayBuffer || obj[i] instanceof File) {
                            has = true;
                            break;
                        }
                    }
                    if (has) {
                        var fd = new FormData();
                        for (var i in obj) {
                            if (obj[i] instanceof Blob) {
                                fd.append(i, obj[i]);
                            } else if (obj[i] instanceof File) {
                                fd.append(i, obj[i]);
                            } else if (is.isArray(obj[i]) || is.isObject(obj[i])) {
                                fd.append(i, window.encodeURIComponent(serialize.stringify(obj[i])));
                            } else if (obj[i] instanceof FormData) {
                            } else {
                                fd.append(i, window.encodeURIComponent(obj[i].toString()));
                            }
                        }
                        return fd;
                    } else {
                        return serialize.queryString(obj);
                    }
                } else if (is.isArray(obj)) {
                    return window.encodeURIComponent(serialize.stringify({key: obj}));
                } else {
                    return obj;
                }
            } else {
                return null;
            }
        },
        queryString: function (obj) {
            var result = "";
            if (obj) {
                for (var i in obj) {
                    var val = obj[i];
                    if (is.isString(val)) {
                        result += i + "=" + window.encodeURIComponent(val) + "&";
                    } else if (is.isObject(val) || is.isArray(val)) {
                        result += i + "=" + window.encodeURIComponent(serialize.stringify(val)) + "&";
                    } else if (val instanceof FormData || val instanceof Blob || val instanceof File || val instanceof ArrayBuffer) {
                    } else {
                        result += i + "=" + (val ? window.encodeURIComponent(val.toString()) : "") + "&";
                    }
                }
                return result.length > 0 ? result.substring(0, result.length - 1) : "";
            } else {
                return "";
            }
        },
        queryObject: function (str) {
            var n = str.split("?"), result = {};
            if (n.length > 1) {
                n[1].split("&").forEach(function (a) {
                    var c = a.split("=");
                    result[c[0]] = c.length > 1 ? c[1] : "";
                });
                return result;
            } else {
                return null;
            }
        },
        hashObject: function (str) {
            var n = str.split("#"), result = {};
            if (n.length > 1) {
                n[1].split("&").forEach(function (a) {
                    var c = a.split("=");
                    result[c[0]] = c.length > 1 ? c[1] : "";
                });
                return result;
            } else {
                return null;
            }
        }
    };
    var json = {
        each: function (object, fn) {
            var name, i = 0, length = object.length, isObj = length === undefined || is.isFunction(object);
            if (isObj) {
                for (name in object) {
                    if (fn.call(object[ name ], name, object[ name ]) === false) {
                        break;
                    }
                }
            } else {
                while (i < length) {
                    if (fn.call(object[ i ], i, object[ i++ ]) === false) {
                        break;
                    }
                }
            }
            return object;
        },
        clone: function (obj) {
            var a;
            if (is.isArray(obj)) {
                a = [];
                for (var i = 0; i < obj.length; i++) {
                    a[i] = arguments.callee(obj[i]);
                }
                return a;
            } else if (is.isObject(obj)) {
                a = {};
                for (var i in obj) {
                    a[i] = arguments.callee(obj[i]);
                }
                return a;
            } else {
                return obj;
            }
        },
        cover: function () {
            var obj, key, val, vals, arrayis, clone, result = arguments[0] || {}, i = 1, length = arguments.length, isdeep = false;
            if (typeof result === "boolean") {
                isdeep = result;
                result = arguments[1] || {};
                i = 2;
            }
            if (typeof result !== "object" && !is.isFunction(result)) {
                result = {};
            }
            if (length === i) {
                result = this;
                i = i - 1;
            }
            while (i < length) {
                obj = arguments[i];
                if (obj !== null) {
                    for (key in obj) {
                        val = result[key];
                        vals = obj[key];
                        if (result === vals) {
                            continue;
                        }
                        arrayis = is.isArray(vals);
                        if (isdeep && vals && (is.isObject(vals) || arrayis)) {
                            if (arrayis) {
                                arrayis = false;
                                clone = val && is.isArray(val) ? val : [];
                            } else {
                                clone = val && is.isObject(val) ? val : {};
                            }
                            result[key] = arguments.callee(isdeep, clone, vals);
                        } else if (vals !== undefined) {
                            result[key] = vals;
                        }
                    }
                }
                i++;
            }
            return result;
        }
    };
    var prefix = (function () {
        var c = {};
        if (browser.isWebkit()) {
            c.prefix = "-webkit-";
            c.transitionEnd = "webkitTransitionEnd";
        } else if (browser.isGecko() === "gecko") {
            c.prefix = "-moz-";
            c.transitionEnd = "transitionend";
        } else {
            c.prefix = "";
            c.transitionEnd = "transitionend";
        }
        c.fix = function (cssset) {
            var prefix = /^-all-/;
            if (is.isString(cssset)) {
                return cssset.replace(prefix, this.prefix);
            } else if (is.isArray(cssset)) {
                var a = [];
                for (var i = 0; i < cssset.length; i++) {
                    a.push(cssset[i].replace(prefix, this.prefix));
                }
                return a;
            } else if (is.isObject(cssset)) {
                var result = {};
                for (var i in cssset) {
                    result[i.replace(prefix, this.prefix)] = is.isString(cssset[i]) ? cssset[i].replace(prefix, this.prefix) : cssset[i];
                }
                return result;
            } else {
                return cssset;
            }
        };
        return c;
    })();
    var util = {
        uuid: function () {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''), uuid = new Array(36), rnd = 0, r;
            for (var i = 0; i < 36; i++) {
                if (i === 8 || i === 13 || i === 18 || i === 23) {
                    uuid[i] = '-';
                } else if (i === 14) {
                    uuid[i] = '4';
                } else {
                    if (rnd <= 0x02)
                        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join('');
        }
    };
    topolr.json = json, topolr.is = is, topolr.browser = browser, topolr.prefix = prefix, topolr.util = util;
    topolr.serialize = serialize, topolr.extend = topolr.json.cover;
    topolr.nfn = function () {
    };

    var queue = function () {
        this.list = [];
        this.length = null;
        this.current = null;
        this.state = "init";//running,end,stop.
        this._start = null;
        this._progress = null;
        this._complete = null;
        this.result = null;
    };
    queue.prototype.add = function (fn, error, parameter) {
        if (this.state === "init") {
            this.list.push({
                fn: fn,
                parameter: parameter,
                error: error || null
            });
        } else {
            throw Error("[topolr]-this queue can not add task when it is not in state of init.");
        }
        return this;
    };
    queue.prototype.next = function (data) {
        this._progress && this._progress.call(this, {
            total: this.length,
            runed: this.length - this.list.length,
            data: data
        });
        queue._fire.call(this, data);
        return this;
    };
    queue.prototype.left = function () {
        return this.list.length;
    };
    queue.prototype.total = function () {
        return this.length;
    };
    queue.prototype.run = function (data) {
        if (this.length === null) {
            this._start && this._start.call(this);
            this.length = this.list.length;
        }
        this.state = 'running';
        queue._fire.call(this, data);
    };
    queue.prototype.stop = function () {
        if (this.state === "running") {
            this.state = "stop";
        }
        return this;
    };
    queue.prototype.reset = function () {
        this.length === null;
        this.state = "init";
        this.result = null;
        return this;
    };
    queue.prototype.clean = function () {
        this.list.length = 0;
        this.state = "end";
        this.length = 0;
        this.reuslt = null;
        return this;
    };
    queue.prototype.isRunning = function () {
        return this.state === "running";
    };
    queue.prototype.isEnd = function () {
        return this.state === "end";
    };
    queue.prototype.isStop = function () {
        return this.state === "stop";
    };
    queue.prototype.start = function (fn) {
        fn && (this._start = fn);
        return this;
    };
    queue.prototype.progress = function (fn) {
        fn && (this._progress = fn);
        return this;
    };
    queue.prototype.complete = function (fn) {
        fn && (this._complete = fn);
        if (this.state === "end") {
            this._complete.call(this, this.result);
        }
        return this;
    };
    queue._fire = function (result) {
        if (this.list.length > 0) {
            var a = this.list.shift(), ths = this;
            this.current = a;
            try {
                a.fn && a.fn.call(ths, result, a.parameter);
            } catch (e) {
                queue.error.call(this, result, e);
                this.next(result);
            }
        } else {
            this.state = 'end';
            this.result = result;
            this._complete && this._complete.call(this, result);
        }
        return this;
    };
    queue.error = function (result, e) {
        if (this.current) {
            this.current.error && this.current.error.call(this, result, e, this.current.parameter);
        }
    };
    topolr.queue = function () {
        return new queue();
    };

    var dynamicQueue = function () {
        this.state = "waiting";//waiting,running
        this.list = [];
        this.result = null;
        this.current = null;
        this._complete = null;
        this._notify = null;
        this.waits = 1;
        this._completeTimes = 0;
        this._handleTimes = 0;
    };
    dynamicQueue.prototype.add = function (fn, error, parameters) {
        this.list.push({
            fn: fn,
            error: error,
            parameters: parameters
        });
        if (this.state === "waiting") {
            if (this.list.length === this.waits) {
                dynamicQueue._fire.call(this, this.result);
            }
        }
        return this;
    };
    dynamicQueue.prototype.size = function () {
        return this.list.length;
    };
    dynamicQueue.prototype.wait = function (num) {
        if (arguments.length === 0 || num === 0) {
            num = 10000000;
        }
        this.waits = num;
        return this;
    };
    dynamicQueue.prototype.work = function (data) {
        if (this.state === "waiting") {
            this.waits = 1;
            dynamicQueue.next.call(this, data);
        }
        return this;
    };
    dynamicQueue.prototype.delay = function (time) {
        this.add(function (data) {
            var ths = this;
            setTimeout(function () {
                ths.next(data);
            }, time);
        });
        return this;
    };
    dynamicQueue.prototype.notify = function (fn) {
        fn && (this._notify = fn);
        return this;
    };
    dynamicQueue.prototype.complete = function (fn) {
        fn && (this._complete = fn);
        return this;
    };
    dynamicQueue.prototype.isRunning = function () {
        return this.state === "running";
    };
    dynamicQueue.prototype.isWaiting = function () {
        return this.state === "waiting";
    };
    dynamicQueue.prototype.isHandleAtOnce = function () {
        if (this.state === "running" && this.list.length > 0) {
            return false;
        } else {
            return true;
        }
    };
    dynamicQueue.prototype.completeTimes = function () {
        return this._completeTimes;
    };
    dynamicQueue.prototype.handleTimes = function () {
        return this._handleTimes;
    };
    dynamicQueue.prototype.clean = function () {
        this.list.length = 0;
        this.state = "waiting";
        for (var i in this) {
            this[i] = null;
        }
    };
    dynamicQueue.getQueueLite = function (queue) {
        return {
            isRunning: function () {
                return queue.isRunning();
            },
            isWaiting: function () {
                return queue.isWaiting();
            },
            isHandleAtOnce: function () {
                return queue.isHandleAtOnce();
            },
            completeTimes: function () {
                return queue.completeTimes();
            },
            handleTimes: function () {
                return queue.handleTimes();
            },
            next: function (data) {
                dynamicQueue.next.call(queue, data);
                return queue;
            },
            delay: function (time) {
                queue.delay(time);
                return queue;
            },
            error: function (e) {
                return dynamicQueue.error.call(queue, e);
            },
            clean: function () {
                queue.clean();
                return queue;
            }
        };
    };
    dynamicQueue.next = function (data) {
        this._notify && this._notify.call(this, data);
        dynamicQueue._fire.call(this, data);
        return this;
    };
    dynamicQueue.error = function (data) {
        if (this.current) {
            this.current.error && this.current.error(this, data);
        }
        return this;
    };
    dynamicQueue._fire = function (result) {
        if (this.list.length > 0) {
            this.state = 'running';
            this._handleTimes = this._handleTimes + 1;
            var a = this.list.shift(), ths = dynamicQueue.getQueueLite(this);
            this.current = a;
            try {
                a.fn && a.fn.call(ths, result, a.parameters);
            } catch (e) {
                dynamicQueue.error.call(e);
                dynamicQueue.next.call(ths, result);
            }
        } else {
            if (this.state === 'running') {
                this.result = result;
                this.state = 'waiting';
                this._completeTimes = this._completeTimes + 1;
                this.current = null;
            }
            this._complete && this._complete.call(this, result);
        }
        return this;
    };
    topolr.dynamicQueue = function () {
        return new dynamicQueue();
    };

    var promise = function (task) {
        this.state = 0;//0,1,2
        this.queue = new dynamicQueue();
        this._finally = null;
        this._notify = null;
        this._complete = null;
        this._result = null;
        this._scope = null;
        var ths = this;
        this.queue.complete(function (data) {
            ths._result = data;
            var a = ths._finally && ths._finally.call(ths, data);
            if (a instanceof promise) {
                a.complete(function (b) {
                    ths._result = b;
                    ths._complete && ths._complete.call(ths, b);
                });
            } else {
                ths._complete && ths._complete.call(ths, data);
            }
        }).notify(function (e) {
            ths._notify && ths._notify(e);
        });
        if (is.isFunction(task)) {
            this.queue.wait();
            this.done(function (a) {
                return a;
            });
            task(function (a) {
                ths.resolve(a);
            }, function (a) {
                ths.reject(a);
            });
        } else if (task) {
            this._result = task;
            this.state = 1;
            this.queue.add(function () {
                this.next(task);
            });
        } else {
            this.queue.wait();
            this.done(function (a) {
                return a;
            });
        }
    };
    promise.prototype.scope = function (scope) {
        if (arguments.length === 1) {
            this._scope = scope;
            return this;
        } else {
            return this._scope;
        }
    };
    promise.prototype.then = function (resolver, rejecter) {
        promise.add.call(this, resolver, 1);
        promise.add.call(this, rejecter, 2);
        return this;
    };
    promise.prototype.wait = function (fn) {
        this.queue.add(function (data) {
            var ths = this;
            fn.call(ths, function (a) {
                ths.next(a);
            }, data);
        });
        return this;
    };
    promise.prototype.done = function (fn) {
        promise.add.call(this, fn, 1);
        return this;
    };
    promise.prototype.fail = function (fn) {
        promise.add.call(this, fn, 2);
        return this;
    };
    promise.prototype.always = function (fn) {
        is.isFunction(fn) && (this._finally = fn);
        return this;
    };
    promise.prototype.reject = function (data) {
        this.state = 2;
        this.queue.work(data);
        return this;
    };
    promise.prototype.resolve = function (data) {
        this.state = 1;
        this.queue.work(data);
        return this;
    };
    promise.prototype.notify = function (fn) {
        is.isFunction(fn) && (this._notify = fn);
        return this;
    };
    promise.prototype.complete = function (fn) {
        is.isFunction(fn) && (this._complete = fn);
        return this;
    };
    promise.prototype.delay = function (time) {
        this.queue.delay(time);
        return this;
    };
    promise.prototype.clean = function () {
        this.queue.clean();
        for (var i in this) {
            this[i] = null;
        }
    };
    promise.add = function (fn, state) {
        var ps = this;
        if (fn && is.isFunction(fn)) {
            this.queue.add(function (data) {
                var ths = this;
                setTimeout(function () {
                    if (ps.state === state) {
                        var a;
                        if (ps._scope) {
                            a = fn && fn.call(ps._scope, data);
                        } else {
                            a = fn && fn(data);
                        }
                        if (a instanceof promise) {
                            a.complete(function (b) {
                                ths.next(b);
                            });
                        } else {
                            ths.next(a);
                        }
                    } else {
                        ths.next(data);
                    }
                }, 0);
            });
        }
    };
    topolr.promise = function (fn) {
        return new promise(fn);
    };
    topolr.all = function () {
        var ps = $.promise();
        if (arguments.length > 0) {
            var a = Array.prototype.slice.call(arguments);
            var total = a.length;
            a.forEach(function (pros) {
                pros.complete(function () {
                    if (this.isResolve) {
                        total = total - 1;
                        if (total === 0) {
                            ps.resolve();
                        }
                    }
                });
            });
        }
        return ps;
    };
    topolr.any = function () {
        var ps = $.promise();
        if (arguments.length > 0) {
            var a = Array.prototype.slice.call(arguments);
            var total = a.length, resolved = false;
            a.forEach(function (pros) {
                pros.complete(function () {
                    total = total - 1;
                    if (this.isResolve) {
                        resolved = true;
                    }
                    if (total === 0 && resolved) {
                        ps.resolve();
                    }
                });
            });
        }
        return ps;
    };

    var dom = function (start) {
        this.nodes = [];
        this.length = 0;
        if (arguments.length === 1 && is.isAvalid(start)) {
            if (is.isString(start)) {
                if (domx.util.isHTML(start)) {
                    this.nodes = domx.util.parseHTML(start);
                } else {
                    this.nodes = domx.util.query(window.document, start);
                }
                this.length = this.nodes.length;
            } else if (start instanceof query) {
                this.nodes = start.nodes;
                this.length = start.length;
            } else if (is.isWindow(start) || is.isDocument(start)) {
                return new windoc(start);
            } else if (start.nodeType === 1) {
                this.nodes = [start];
                this.length = 1;
            } else {
                this.nodes = [];
                this.length = 0;
            }
        } else if (arguments.length === 0) {
            this.nodes = [];
            this.length = 0;
        }
    };
    var domx = {};
    domx.regs = {
        root: /^(?:body|html)$/i,
        _class: /^\.([\w-]+)$/,
        _id: /^#([\w-]*)$/,
        _tag: /^[\w-]+$/,
        _html: /^\s*<(\w+|!)[^>]*>/,
        _tagName: /<([\w:]+)/,
        _property: /-+(.)?/g
    };
    domx.util = {
        getDom: function (nodes) {
            var a = new dom();
            if (arguments.length === 1) {
                a.nodes = nodes;
                a.length = nodes.length;
            } else {
                a.nodes = [];
                a.length = 0;
            }
            return a;
        },
        isClass: function (selector) {
            return domx.regs._class.test(selector);
        },
        isId: function (selector) {
            return domx.regs._id.test(selector);
        },
        isTag: function (selector) {
            return domx.regs._tag.test(selector);
        },
        isHTML: function (selector) {
            return domx.regs._html.test(selector);
        },
        query: function (node, selector) {
            var ar = null;
            switch (true) {
                case this.isId(selector):
                    var _a = document.getElementById(selector.substring(1, selector.length));
                    ar = _a ? [_a] : [];
                    break;
                case this.isClass(selector):
                    var t = node.getElementsByClassName(selector.substring(1, selector.length));
                    ar = Array.prototype.slice.call(t);
                    break;
                case this.isTag(selector):
                    var t = node.getElementsByTagName(selector);
                    ar = Array.prototype.slice.call(t);
                    break;
                default :
                    ar = Array.prototype.slice.call(node.querySelectorAll(selector));
                    break;
            }
            return ar;
        },
        queryChild: function (node, selector) {
            var id = node.getAttribute("id") || "__bright__";
            node.setAttribute("id", id);
            var ar = domx.util.query(node, "#" + id + ">" + selector);
            if (id === "__bright__") {
                node.removeAttribute("id");
            }
            return ar;
        },
        repairTags: {
            area: {l: 1, s: "<map>", e: ""},
            param: {l: 1, s: "<object>", e: ""},
            col: {l: 2, s: "<table><tbody></tbody><colgroup>", e: "</table>"},
            legend: {l: 1, s: "<fieldset>"},
            option: {l: 1, s: "<select multiple='multiple'>", e: ""},
            thead: {l: 1, s: "<table>", e: "</table>"},
            tr: {l: 2, s: "<table><tbody>", e: ""},
            td: {l: 3, s: "<table><tbody><tr>", e: ""},
            _general: {s: "", e: "", l: 0}
        },
        parseHTML: function (html) {
            var a = html.match(domx.regs._tagName), ops = domx.util.repairTags[(a ? a[1] : "_general")] || domx.util.repairTags["_general"];
            var div = document.createElement("DIV");
            div.innerHTML = ops.s + html + ops.e;
            var t = div;
            for (var i = 0; i < ops.l; i++) {
                t = t.firstChild;
            }
            return Array.prototype.slice.call(t.childNodes);
        },
        parseFlagment: function (html) {
            var _c = domx.util.parseHTML(html);
            var a = window.document.createDocumentFragment();
            for (var i in _c) {
                a.appendChild(_c[i]);
            }
            return a;
        },
        propertyName: function (str) {
            return str.replace(domx.regs._property, function (match, chr, index) {
                if (index === 0) {
                    return match.substring(1, 2);
                } else {
                    return chr ? chr.toUpperCase() : "";
                }
            });
        },
        cleanNode: function (node) {
            if (node) {
                if (node.datasets) {
                    for (var t in node.datasets) {
                        var p = node.datasets[t];
                        if (p && p.clean) {
                            p.clean();
                        }
                        node.datasets[t] = null;
                    }
                    node.datasets = null;
                }
                event.util.unbindnode(node);
                var c = node.getElementsByClassName("incache");
                for (var n in c) {
                    if (c[n].nodeType) {
                        for (var m in c[n].datasets) {
                            var q = c[n].datasets[m];
                            if (q && q.clean) {
                                q.clean();
                            }
                            c[n].datasets[m] = null;
                        }
                        c[n].datasets = null;
                        event.util.unbindnode(c[n]);
                    }
                }
            }
        },
        supported: function (paras) {
            if (arguments.length === 1) {
                return is.isString(paras) || paras instanceof dom || is.isWindow(paras) || is.isDocument(paras) || paras.nodeType === 1;
            } else {
                return false;
            }
        }
    };

    var transition = function (dom) {
        this.dom = dom;
        this.mapping = {};
        transition.init.call(this);
        this.dom.get(0).addEventListener(prefix.transitionEnd, transition.fn, false);
        this.dom.data("_transition_", this);
    };
    transition.fn = function (e) {
        var obj = $(e.currentTarget).data("_transition_");
        var name = e.propertyName;
        if (obj.mapping[name]) {
            if (obj.mapping[name].promise) {
                obj.mapping[name].promise.resolve();
            }
        } else if (obj.mapping[prefix.prefix + name]) {
            if (obj.mapping[prefix.prefix + name].promise) {
                obj.mapping[prefix.prefix + name].promise.resolve();
            }
        } else if (obj.mapping["all"]) {
            if (obj.mapping["all"].promise) {
                obj.mapping["all"].promise.resolve();
            }
        }
    };
    transition.setCss = function () {
        var value = "", q = "";
        for (var i in this.mapping) {
            if (this.mapping[i]) {
                value += i + " " + this.mapping[i].time + "ms " + this.mapping[i].type + " " + this.mapping[i].delay + "ms,";
            }
        }
        if (value.length > 0) {
            value = value.substring(0, value.length - 1);
        } else {
            value = "none";
        }
        this.dom.css(prefix.prefix + "transition", value);
    };
    transition.init = function () {
        var type = this.dom.css("-all-transition-timing-function").split(",");
        var delay = this.dom.css("-all-transition-delay").split(",");
        var duration = this.dom.css("-all-transition-duration").split(",");
        var prop = this.dom.css("-all-transition-property").split(",");
        for (var i = 0; i < prop.length; i++) {
            if (prop[i] !== "all") {
                this.mapping[prop[i]] = {
                    property: prop[i],
                    time: parseFloat(duration[i]) * 1000,
                    type: type[i],
                    delay: parseFloat(delay[i]) * 1000,
                    fn: null
                };
            }
        }
    };
    transition.prototype.set = function (properties, option) {
        var ops = {time: 300, type: "ease-out", delay: 0};
        var k = new promise();
        k.scope(this.dom);
        topolr.extend(ops, option);
        var a = prefix.fix(properties.split(","));
        for (var i = 0; i < a.length; i++) {
            var property = a[i];
            if (property !== "all") {
                this.mapping[property] = {property: property, time: ops.time, type: ops.type, delay: ops.delay, promise: k};
            } else {
                this.mapping = {all: {property: property, time: ops.time, type: ops.type, delay: ops.delay, promise: k}};
                break;
            }
        }
        transition.setCss.call(this);
        return k;
    };
    transition.prototype.all = function (option) {
        var ops = {time: 300, type: "ease-out", delay: 0};
        var k = new promise();
        k.scope(this.dom);
        topolr.extend(ops, option);
        this.mapping = {all: {property: "all", time: ops.time, type: ops.type, delay: ops.delay, promise: k}};
        transition.setCss.call(this);
        return k;
    };
    transition.prototype.get = function (property) {
        var a = this.mapping[prefix.fix(property)];
        if (a) {
            return {
                type: a.type,
                time: a.time,
                delay: a.delay,
                property: property
            };
        }
        return a;
    };
    transition.prototype.remove = function (properties) {
        var a = prefix.fix(properties.split(","));
        for (var i = 0; i < a.length; i++) {
            this.mapping[a[i]] && (this.mapping[a[i]] = null);
        }
        transition.setCss.call(this);
        return this;
    };
    transition.prototype.removeAll = function () {
        this.mapping = {};
        transition.setCss.call(this);
        return this;
    };
    transition.prototype.scope = function () {
        return this.dom;
    };
    transition.prototype.clean = function () {
        this.dom.get(0).removeEventListener(prefix.transitionEnd, transition.fn, false);
        for (var i in this) {
            this[i] = null;
        }
    };

    var transform = function (dom, attrs) {
        this.dom = dom;
        this.attrs = attrs.length === 0 ? ["translate"] : attrs;
        transform.init.call(this);
        transform.defaultValue.call(this);
        dom.data("_transform_", this);
    };
    transform.parse = function () {
        var matrix = this.dom.css(prefix.prefix + "transform");
        var a = matrix.match(/(-?[0-9\.]+)/g);
        if (a) {
            if (a.length > 6) {
                a.shift();
            }
            for (var i = 0; i < a.length; i++) {
                a[i] = a[i] / 1;
            }
        }
        return a;
    };
    transform.defaultValue = function () {
        var trans = {translate: [0, 0], translate3d: [0, 0, 0], translateX: 0, translateY: 0, translateZ: 0, rotate: 0, rotateX: 0, rotateY: 0, rotateZ: 0, rotate3d: [0, 0, 0, 1], scale: [1, 1], scaleX: 1, scaleY: 1, scaleZ: 1, scale3d: [1, 1, 1], skew: [0, 0], skewX: 0, skewY: 0};
        var ap = transform.parse.call(this);
        if (ap) {
            if (ap[0] !== 1) {
                var a = this.dom.get(0), transformstr = a.style.webkitTransform || a.style.mozTransform || a.style.msTransform || a.style.transform;
                if (transformstr || transformstr === "") {
                    var sheets = document.styleSheets;
                    a.matches = a.matches || a.webkitMatchesSelector || a.mozMatchesSelector || a.msMatchesSelector;
                    for (var i in sheets) {
                        var rules = sheets[i].rules || sheets[i].cssRules;
                        for (var r in rules) {
                            if (a.matches(rules[r].selectorText)) {
                                transformstr = rules[r].style.webkitTransform || rules[r].style.mozTransform || rules[r].style.msTransform || rules[r].style.transform;
                            }
                        }
                    }
                }
                if (transformstr && transformstr !== "") {
                    var names = [], values = [], name = "", value = "", isname = true;
                    for (var i = 0; i < transformstr.length; i++) {
                        var c = transformstr[i];
                        if (c !== "(" && c !== ")") {
                            if (isname) {
                                name += c;
                            } else {
                                value += c;
                            }
                        } else if (c === "(") {
                            names.push(name.trim());
                            name = "";
                            isname = false;
                        } else if (c === ")") {
                            values.push(value.trim());
                            value = "";
                            isname = true;
                        }
                    }
                    for (var i = 0; i < names.length; i++) {
                        var val = "";
                        if (values[i].indexOf(",") !== -1) {
                            var p = values[i].split(",");
                            for (var k = 0; k < p.length; k++) {
                                p[k] = parseFloat(p[k]);
                            }
                            val = p;
                        } else {
                            val = parseFloat(values[i]);
                        }
                        trans[names[i]] = val;
                    }
                }
            }
            if (ap.length === 6) {
                trans.translate3d = [ap[4], ap[5], 0];
                trans.translateX = ap[4];
                trans.translateY = ap[5];
            } else {
                trans.translate3d = [ap[12], ap[13], ap[14]];
                trans.translateX = ap[12];
                trans.translateY = ap[13];
                trans.translateZ = ap[14];
            }
        }
        this.values = trans;
    };
    transform.init = function () {
        this.setter = [];
        this.attrs.indexOf("translate") !== -1 && this.setter.push(function () {
            return "translate3d(" + (is.isNumber(this.values.translate3d[0]) ? this.values.translate3d[0] + "px" : this.values.translate3d[0]) + "," +
                    (is.isNumber(this.values.translate3d[1]) ? this.values.translate3d[1] + "px" : this.values.translate3d[1]) + "," +
                    (is.isNumber(this.values.translate3d[2]) ? this.values.translate3d[2] + "px" : this.values.translate3d[2]) + ")";
        });
        this.attrs.indexOf("rotate3d") !== -1 && this.setter.push(function () {
            var rotate3d = this.values.rotate3d.join("") !== "0000" ? "rotate3d(" + this.values.rotate3d[0] + "," + this.values.rotate3d[1] + "," + this.values.rotate3d[2] + "," + this.values.rotate3d[3] + "deg)" : "";
            rotate3d += (this.values.rotateX !== 0 ? " rotateX(" + this.values.rotateX + "deg)" : "");
            rotate3d += (this.values.rotateY !== 0 ? " rotateY(" + this.values.rotateY + "deg)" : "");
            rotate3d += (this.values.rotateZ !== 0 ? " rotateZ(" + this.values.rotateZ + "deg)" : "");
            return rotate3d;
        });
        this.attrs.indexOf("scale3d") !== -1 && this.setter.push(function () {
            var scale3d = this.values.scale3d.join("") !== "111" ? "scale3d(" + this.values.scale3d[0] + "," + this.values.scale3d[1] + "," + this.values.scale3d[2] + ")" : "";
            scale3d += this.values.scaleX !== 1 ? " scaleX(" + this.values.scaleX + ")" : "";
            scale3d += this.values.scaleY !== 1 ? " scaleY(" + this.values.scaleY + ")" : "";
            scale3d += this.values.scaleZ !== 1 ? " scaleZ(" + this.values.scaleZ + ")" : "";
            return scale3d;
        });
        this.attrs.indexOf("scale") !== -1 && this.setter.push(function () {
            return this.values.scale.join("") !== "11" ? "scale(" + this.values.scale[0] + "," + this.values.scale[1] + ")" : "";
        });
        this.attrs.indexOf("skew") !== -1 && this.setter.push(function () {
            return this.values.skew.join("") !== "00" ? "skew(" + this.values.skew[0] + "deg," + this.values.skew[1] + "deg)" : "";
        });
        this.attrs.indexOf("rotate") !== -1 && this.setter.push(function () {
            return this.values.rotate !== 0 ? "rotate(" + this.values.rotate + "deg)" : "";
        });
    };
    transform.set = function () {
        var str = "";
        for (var i in this.setter) {
            str += this.setter[i].call(this) + " ";
        }
        this.dom.css(prefix.prefix + "transform", str);
    };
    transform.translate = function (index, name, x) {
        if (arguments.length === 2) {
            var n = this.values.translate3d[index];
            if (!/^[0-9\.]*$/.test(n)) {
                var ap = transform.parse.call(this);
                if (ap.length === 6) {
                    this.values.translate3d = [ap[4], ap[5], 0];
                    this.values.translateX = ap[4];
                    this.values.translateY = ap[5];
                } else {
                    this.values.translate3d = [ap[12], ap[13], ap[14]];
                    this.values.translateX = ap[12];
                    this.values.translateY = ap[13];
                    this.values.translateZ = ap[14];
                }
            }
            return this.values.translate3d[index];
        } else {
            this.values.translate3d[index] = x;
            this.values.translate[index] = x;
            this.values[name] = x;
            transform.set.call(this);
            return this;
        }
    };
    transform.sett = function (type, defaultValue, value) {
        if (arguments.length === 2) {
            return this.values[type];
        } else {
            (value === undefined || value === null) && (value = defaultValue);
            this.values[type] = value;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.matrix = function () {
        return transform.parse.call(this);
    };
    transform.prototype.sets = function (a) {
        for (var i in a) {
            if (this.values[i] !== undefined) {
                this.values[i] = a[i];
            }
        }
        transform.set.call(this);
        return this;
    };
    transform.prototype.scale = function (x, y) {
        if (arguments.length === 0) {
            return this.values.scale;
        } else {
            (x === undefined || x === null) && (x = 1), (y === undefined || y === null) && (y = 1);
            this.values.scale[0] = x;
            this.values.scale[1] = y;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.rotate = function (reg) {
        if (arguments.length === 0) {
            return this.values.rotate;
        } else {
            (reg === undefined || reg === null) && (reg = 0);
            this.values.rotate = reg;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.scale3d = function (x, y, z) {
        if (arguments.length === 0) {
            return this.values.scale3d;
        } else {
            (x === undefined || x === null) && (x = 1), (y === undefined || y === null) && (y = 1), (z === undefined || z === null) && (z = 1);
            this.values.scale3d[0] = x;
            this.values.scale3d[1] = y;
            this.values.scale3d[2] = z;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.rotate3d = function (x, y, z, reg) {
        if (arguments.length === 0) {
            return this.values.rotate3d;
        } else {
            (x === undefined || x === null) && (x = 0), (y === undefined || y === null) && (y = 0), (z === undefined || z === null) && (z = 0), (reg === undefined || reg === null) && (reg = 0);
            this.values.rotate3d[0] = x;
            this.values.rotate3d[1] = y;
            this.values.rotate3d[2] = z;
            this.values.rotate3d[3] = reg;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.skew = function (x, y) {
        if (arguments.length === 0) {
            return this.values.skew;
        } else {
            (x === undefined || x === null) && (x = 1), (y === undefined || y === null) && (y = 1);
            this.values.skew[0] = x;
            this.values.skew[1] = y;
            transform.set.call(this);
            return this;
        }
    };
    transform.prototype.x = function (x) {
        return transform.translate.apply(this, arguments.length === 0 ? [0, "translateX"] : [0, "translateX", x]);
    };
    transform.prototype.y = function (x) {
        return transform.translate.apply(this, arguments.length === 0 ? [1, "translateY"] : [1, "translateY", x]);
    };
    transform.prototype.z = function (x) {
        return transform.translate.apply(this, arguments.length === 0 ? [2, "translateZ"] : [2, "translateZ", x]);
    };
    transform.prototype.scaleX = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["scaleX", 1, x] : ["scaleX", 1, x]);
    };
    transform.prototype.scaleY = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["scaleY", 1, x] : ["scaleY", 1, x]);
    };
    transform.prototype.scaleZ = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["scaleZ", 1, x] : ["scaleZ", 1, x]);
    };
    transform.prototype.rotateX = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["rotateX", 0, x] : ["rotateX", 0, x]);
    };
    transform.prototype.rotateY = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["rotateY", 0, x] : ["rotateY", 0, x]);
    };
    transform.prototype.rotateZ = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["rotateZ", 0, x] : ["rotateZ", 0, x]);
    };
    transform.prototype.skewX = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["skewX", 0, x] : ["skewX", 0, x]);
    };
    transform.prototype.skewY = function (x) {
        return transform.sett.apply(this, arguments.length === 0 ? ["skewY", 0, x] : ["skewY", 0, x]);
    };
    transform.prototype.origin = function (a, b) {
        if (arguments.length === 0) {
            var a = this.dom.css(prefix.prefix + "transform-origin").split(" ");
            return {x: a[0], y: a[1]};
        } else if (arguments.length === 2) {
            return this.dom.css(prefix.prefix + "transform-origin", a + " " + b);
        }
    };
    transform.prototype.style = function (a) {
        if (arguments.length === 0) {
            return this.dom.css(prefix.prefix + "transform-style");
        } else {
            this.dom.css(prefix.prefix + "transform-style", a);
            return this;
        }
    };
    transform.prototype.perspective = function (a) {
        if (arguments.length === 0) {
            return this.dom.css(prefix.prefix + "perspective");
        } else {
            this.dom.css(prefix.prefix + "perspective", a);
            return this;
        }
    };
    transform.prototype.perspectiveOrigin = function () {
        if (arguments.length === 0) {
            var a = this.dom.css(prefix.prefix + "perspective-origin").split(" ");
            return {x: a[0], y: a[1]};
        } else if (arguments.length === 2) {
            return this.dom.css(prefix.prefix + "perspective-origin", a + " " + b);
        }
    };
    transform.prototype.backface = function () {
        if (arguments.length === 0) {
            return this.dom.css(prefix.prefix + "backface-visibility");
        } else {
            this.dom.css(prefix.prefix + "backface-visibility", a);
            return this;
        }
    };
    transform.prototype.clean = function () {
        for (var i in this) {
            this[i] = null;
        }
    };
    transform.prototype.dom = function () {
        return this.dom;
    };

    var query = function () {
    };
    query.prototype.get = function (a) {
        a = a / 1;
        if (is.isAvalid(a) && a >= 0 && a < this.nodes.length) {
            return this.nodes[a];
        } else {
            return null;
        }
    };
    query.prototype.ready = function (fn) {
        var a = /complete|loaded/;
        if (a.test(window.document.readyState)) {
            fn && fn();
        } else {
            window.document.addEventListener('DOMContentLoaded', function () {
                fn && fn();
            }, false);
        }
        return this;
    };
    query.prototype.find = function (selector) {
        var r = [];
        if (!this.isEmpty()) {
            if (is.isString(selector)) {
                r = domx.util.query(this.nodes[0], selector);
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.children = function (num) {
        var r = [];
        if (!this.isEmpty()) {
            if (is.isString(num)) {
                r = domx.util.queryChild(this.nodes[0], num);
            } else {
                if (arguments.length === 1 && num >= 0) {
                    r = this.nodes[0].children[num] ? [this.nodes[0].children[num]] : [];
                } else {
                    r = Array.prototype.slice.call(this.nodes[0].children);
                }
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.siblings = function (selector) {
        var r = [];
        if (!this.isEmpty()) {
            var a = [];
            if (is.isString(selector) && this.nodes[0].parentNode) {
                a = domx.util.queryChild(this.nodes[0].parentNode, selector);
            } else {
                a = this.nodes[0].parentNode ? Array.prototype.slice.call(this.nodes[0].parentNode.children) : [];
            }
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== this.nodes[0]) {
                    r.push(a[i]);
                }
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.has = function (selector) {
        var r = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var a = domx.util.queryChild(this.nodes[i], selector);
            if (a.length > 0) {
                r.push(this.nodes[i]);
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.index = function () {
        var a = -1;
        if (!this.isEmpty()) {
            var parent = this.nodes[0].parentNode;
            for (var i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === this.nodes[0]) {
                    a = i;
                    break;
                }
            }
        }
        return a;
    };
    query.prototype.filter = function (selector) {
        var r = [];
        if (!this.isEmpty()) {
            var a = domx.util.query(window.document, selector);
            if (a.length > 0) {
                for (var i = 0; i < this.nodes.length; i++) {
                    (a.indexOf(this.nodes[i]) !== -1) && r.push(this.nodes[i]);
                }
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.first = function () {
        var r = [];
        if (!this.isEmpty()) {
            r.push(this.get(0));
        }
        return domx.util.getDom(r);
    };
    query.prototype.last = function () {
        var r = [];
        if (this.nodes.length > 0) {
            r.push(this.get(this.length - 1));
        }
        return domx.util.getDom(r);
    };
    query.prototype.parent = function () {
        var selector = arguments[0], r = [];
        if (!this.isEmpty()) {
            if (is.isString(selector)) {
                var n = domx.util.query(window.document, selector);
                var b = this.nodes[0].parentNode;
                while (b && !is.isDocument(b)) {
                    if (n.indexOf(b) !== -1) {
                        r.push(b);
                    }
                    b = b.parentNode;
                }
            } else if (is.isNumber(selector) && selector > 0) {
                var b = this.nodes[0].parentNode, c = selector - 1;
                while (b && !is.isDocument(b) && c > 0) {
                    c--;
                    b = b.parentNode;
                }
                r.push(b);
            } else {
                this.nodes[0].parentNode && r.push(this.nodes[0].parentNode);
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.parents = function () {
        var selector = arguments[0], r = [];
        if (!this.isEmpty()) {
            var b = this.nodes[0].parentNode;
            while (b && !is.isDocument(b)) {
                r.push(b);
                b = b.parentNode;
            }
            if (is.isString(selector)) {
                var n = domx.util.query(window.document, selector);
                r = r.filter(function (c) {
                    if (n.indexOf(c) !== -1) {
                        return true;
                    }
                });
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.next = function () {
        var r = [];
        if (!this.isEmpty()) {
            var a = this.nodes[0].nextSibling;
            while (a && a.nodeType !== 1) {
                a = a.nextSibling;
            }
            a && r.push(a);
        }
        return domx.util.getDom(r);
    };
    query.prototype.nexts = function (selector) {
        var r = [], ths = this;
        if (!this.isEmpty()) {
            var a = this.nodes[0].nextSibling;
            while (a) {
                if (a.nodeType === 1) {
                    r.push(a);
                }
                a = a.nextSibling;
            }
            if (is.isString(selector) && this.nodes[0].parentNode) {
                var c = domx.util.queryChild(this.nodes[0].parentNode, selector);
                r = r.filter(function (n) {
                    if (c.indexOf(n) !== -1 && n !== ths.nodes[0]) {
                        return true;
                    }
                });
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.prev = function () {
        var r = [];
        if (!this.isEmpty()) {
            var a = this.nodes[0].previousSibling;
            while (a && a.nodeType !== 1) {
                a = a.previousSibling;
            }
            a && r.push(a);
        }
        return domx.util.getDom(r);
    };
    query.prototype.prevs = function (selector) {
        var r = [], ths = this;
        if (!this.isEmpty()) {
            var a = this.nodes[0].previousSibling;
            while (a) {
                if (a.nodeType === 1) {
                    r.push(a);
                }
                a = a.previousSibling;
            }
            if (is.isString(selector) && this.nodes[0].parentNode) {
                var c = domx.util.queryChild(this.nodes[0].parentNode, selector);
                r = r.filter(function (n) {
                    if (c.indexOf(n) !== -1 && n !== ths.nodes[0]) {
                        return true;
                    }
                });
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.eq = function (index) {
        var r = [];
        if (index >= 0 && index < this.nodes.length) {
            r.push(this.nodes[index]);
        }
        return domx.util.getDom(r);
    };
    query.prototype.each = function (fn) {
        if (fn) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (fn.call(this.nodes[i], i, this.nodes[i], this.nodes.length) === false) {
                    break;
                }
            }
        }
        return this;
    };
    query.prototype.remove = function () {
        var num = arguments[0];
        if (num && is.isNumber(num) && num < this.nodes.length) {
            var a = this.nodes[num];
            if (a) {
                domx.util.cleanNode(a);
                a.parentNode.removeChild(a);
            }
        } else if (is.isString(num)) {
            var c = domx.util.query(window.document, num);
            for (var i = 0; i < this.nodes.length; i++) {
                if (c.indexOf(this.nodes[i] !== -1)) {
                    this.nodes[i].parentNode && this.nodes[i].parentNode.removeChild(this.nodes[i]);
                }
            }
        } else {
            for (var i = 0; i < this.nodes.length; i++) {
                var a = this.nodes[i];
                if (a) {
                    domx.util.cleanNode(a);
                    a.parentNode.removeChild(a);
                }
            }
        }
        return this;
    };
    query.prototype.empty = function () {
        for (var t = 0; t < this.nodes.length; t++) {
            var c = this.nodes[t].children;
            for (var i = 0; i < c.length; i++) {
                c[i].nodeType && domx.util.cleanNode(c[i]);
            }
            this.nodes[t].innerHTML = "";
        }
    };
    query.prototype.clean = function () {
        for (var i = 0; i <= this.nodes.length; i++) {
            domx.util.cleanNode(this.nodes[i]);
        }
        this.nodes = null;
        this.length = 0;
    };
    query.prototype.clone = function () {
        var r = [];
        if (!this.isEmpty()) {
            r.push(this.nodes[0].cloneNode(true));
        }
        return domx.util.getDom(r);
    };
    query.prototype.wrap = function (htm) {
        for (var i = 0; i < this.nodes.length; i++) {
            var vv = null;
            if (is.isString(htm)) {
                vv = domx.util.parseHTML(htm)[0] || null;
            } else if (htm instanceof query) {
                vv = dom.nodes[0];
            } else if (htm.nodeType) {
                vv = htm;
            } else if (is.isFunction(htm)) {
                var b = htm();
                is.isString(b) && (vv = domx.util.parseHTML(htm)[0] || null);
            }
            if (vv) {
                var c = this.nodes[i];
                if (c.parentNode) {
                    c.parentNode.replaceChild(vv, c);
                    vv.appendChild(c);
                }
            }
        }
        return this;
    };
    query.prototype.append = function () {
        var a = arguments[0];
        if (!this.isEmpty()) {
            if (is.isString(a)) {
                var _c = domx.util.parseFlagment(a);
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].appendChild(_c.cloneNode(true));
                }
            } else if (a instanceof query) {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].appendChild(a.nodes[0]);
                }
            } else if (a && a.nodeType) {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].appendChild(a);
                }
            } else if (is.isFunction(a)) {
                for (var i = 0; i < this.nodes.length; i++) {
                    var d = a.call(this.nodes[i], i, this.nodes[i].innerHTML);
                    domx.util.isHTML(d) && this.nodes[i].appendChild(domx.util.parseFlagment(d));
                }
            }
        }
        return this;
    };
    query.prototype.appendTo = function (a) {
        if (!this.isEmpty()) {
            if (is.isString(a)) {
                var b = domx.util.query(window.document, a);
                b.length > 0 && b[0].appendChild(this.nodes[0]);
            } else if (a instanceof query) {
                a.length > 0 && a.nodes[0].appendChild(this.nodes[0]);
            } else {
                a.appendChild(this.nodes[0]);
            }
        }
        return this;
    };
    query.prototype.insertBefore = function (a) {
        if (!this.isEmpty()) {
            if (is.isString(a)) {
                var cd = domx.util.query(window.document, a)[0];
                cd && cd.parentNode && cd.parentNode.insertBefore(this.nodes[0], cd);
            } else if (a instanceof query) {
                !a.isEmpty() && a.parent().get(0).insertBefore(this.nodes[0], a.get(0));
            } else {
                a.parentNode && a.parentNode.insertBefore(this.nodes[0], a);
            }
        }
        return this;
    };
    query.prototype.insertAfter = function (a) {
        if (!this.isEmpty()) {
            var newnode = null;
            if (is.isString(a)) {
                var newnode = domx.util.query(window.document, a)[0] || null;
            } else if (a instanceof query) {
                newnode = a.nodes[0] || null;
            } else if (a.nodeType) {
                newnode = a;
            }
            if (newnode) {
                if (newnode.nextSibling) {
                    newnode.parentNode.insertBefore(this.nodes[0], newnode.nextSibling);
                } else {
                    newnode.parentNode.appendChild(this.nodes[0]);
                }
            }
        }
        return this;
    };
    query.prototype.prepend = function () {
        var a = arguments[0];
        if (!this.isEmpty()) {
            if (is.isString(a)) {
                var _c = domx.util.parseFlagment(a);
                for (var i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].childNodes.length !== 0) {
                        this.nodes[i].insertBefore(_c.cloneNode(true), this.nodes[i].firstChild);
                    } else {
                        this.nodes[i].appendChild(_c.cloneNode(true));
                    }
                }
            } else if (is.isFunction(a)) {
                for (var i = 0; i < this.nodes.length; i++) {
                    var d = a.call(this.nodes[i], i, this.nodes[i].innerHTML);
                    if (domx.util.isHTML(d)) {
                        if (this.nodes[i].childNodes.length > 0) {
                            this.nodes[i].insertBefore(domx.util.parseFlagment(d), this.nodes[i].firstChild);
                        } else {
                            this.nodes[i].appendChild(domx.util.parseFlagment(d));
                        }
                    }
                }
            }
        }
        return this;
    };
    query.prototype.prependTo = function (a) {
        if (!this.isEmpty()) {
            if (is.isString(a)) {
                var b = domx.util.query(window.document, a);
                if (b.length > 0) {
                    if (b[0].childNodes.length > 0) {
                        b[0].insertBefore(this.nodes[0], b[0].firstChild);
                    } else {
                        b[0].appendChild(this.nodes[0]);
                    }
                }
            } else if (a instanceof query) {
                if (!a.isEmpty()) {
                    if (a.nodes[0].childNodes.length > 0) {
                        a.nodes[0].insertBefore(this.nodes[0], a.nodes[0].firstChild);
                    } else {
                        a.nodes[0].appendChild(this.nodes[0]);
                    }
                }
            } else if (a.nodeType === 1) {
                if (a.children.length > 0) {
                    a.insertBefore(this.nodes[0], a.firstChild);
                } else {
                    a.appendChild(this.nodes[0]);
                }
            }
        }
        return this;
    };
    query.prototype.before = function (a) {
        if (!this.isEmpty() && this.nodes[0].parentNode) {
            if (is.isString(a)) {
                var _c = domx.util.parseFlagment(a);
                this.nodes[0].parentNode && this.nodes[0].parentNode.insertBefore(_c, this.nodes[0]);
            } else if (a instanceof dom) {
                this.nodes[0].parentNode && this.nodes[0].parentNode.insertBefore(a.nodes[0], this.nodes[0]);
            } else if (a.nodeType) {
                this.nodes[0].parentNode && this.nodes[0].parentNode.insertBefore(a, this.nodes[0]);
            }
        }
        return this;
    };
    query.prototype.after = function (a) {
        if (!this.isEmpty()) {
            var newnode = null;
            if (is.isString(a)) {
                newnode = domx.util.parseFlagment(a);
            } else if (a instanceof query) {
                newnode = a.get(0);
            } else if (a.nodeType) {
                newnode = a;
            }
            if (this.nodes[0].nextSibling) {
                this.nodes[0].parentNode && this.nodes[0].parentNode.insertBefore(newnode, this.nodes[0].nextSibling);
            } else {
                this.nodes[0].parentNode && this.nodes[0].parentNode.appendChild(newnode);
            }
        }
        return this;
    };
    query.prototype.replaceWith = function (a) {
        if (!this.isEmpty()) {
            var newnode = null;
            if (is.isString(a)) {
                newnode = domx.util.query(window.document, a)[0];
            } else if (a instanceof query) {
                newnode = a.nodes[0];
            } else if (a.nodeType) {
                newnode = a;
            }
            if (newnode) {
                newnode.parentNode.replaceChild(this.nodes[0], newnode);
            }
        }
        return this;
    };
    query.prototype.equal = function (a) {
        return this === a;
    };
    query.prototype.same = function (a) {
        var r = true;
        a = topolr(a);
        if (this.length === a.length) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (a.nodes.indexOf(this.nodes[i]) === -1) {
                    r = false;
                    break;
                }
            }
        } else {
            r = false;
        }
        return r;
    };
    query.prototype.css = function (a, b) {
        var t = this;
        if (!this.isEmpty()) {
            if (arguments.length === 1 && is.isObject(a)) {
                a = prefix.fix(a);
                for (var i = 0; i < this.nodes.length; i++) {
                    var str = this.nodes[i].style.cssText + ";";
                    for (var j in a) {
                        str += j + ":" + a[j] + ";";
                    }
                    this.nodes[i].style.cssText = str;
                }
            } else if (arguments.length === 1 && is.isString(a)) {
                a = prefix.fix(a);
                t = window.getComputedStyle(this.nodes[0], '').getPropertyValue(a);
            } else if (arguments.length === 2) {
                for (var i in this.nodes) {
                    var c = prefix.fix(a);
                    this.nodes[i].style[domx.util.propertyName(c)] = b;
                }
            }
        }
        return t;
    };
    query.prototype.attr = function (a, b) {
        var tp = this;
        if (!this.isEmpty()) {
            if (arguments.length === 2) {
                if (a !== "") {
                    for (var i = 0; i < this.nodes.length; i++) {
                        this.nodes[i].setAttribute(a, b);
                    }
                }
            } else if (arguments.length === 1) {
                if (is.isObject(a)) {
                    for (var t = 0; t < this.nodes.length; t++) {
                        for (var i in a) {
                            if (i !== "") {
                                this.nodes[t].setAttribute(i, a[i]);
                            }
                        }
                    }
                } else if (a) {
                    tp = this.nodes[0].getAttribute(a);
                }
            }
        }
        return tp;
    };
    query.prototype.removeAttr = function (name) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].removeAttribute(name);
        }
        return this;
    };
    query.prototype.data = function (a, b) {
        var c = null;
        if (!this.isEmpty()) {
            if (arguments.length === 1) {
                if (!this.nodes[0].datasets) {
                    this.nodes[0].datasets = {
                    };
                }
                if (is.isString(a)) {
                    if (this.nodes[0].datasets[a] !== undefined && this.nodes[0].datasets[a] !== null) {
                        c = this.nodes[0].datasets[a];
                    }
                } else if (is.isObject(a)) {
                    topolr.extend(this.nodes[0].datasets, a);
                }
            } else if (arguments.length === 2) {
                this.addClass("incache");
                for (var i in this.nodes) {
                    if (!this.nodes[i].datasets) {
                        this.nodes[i].datasets = {
                        };
                    }
                    this.nodes[i].datasets[a] = b;
                }
                c = this;
            }
        }
        return c;
    };
    query.prototype.removeData = function (a) {
        if (!this.isEmpty()) {
            if (arguments.length === 1) {
                this.data(a, null);
            }
        }
        return this;
    };
    query.prototype.dataset = function (name, value) {
        var _a = this;
        if (this.nodes.length > 0) {
            if (arguments.length === 1) {
                if (is.isString(name)) {
                    _a = this.nodes[0].dataset[name];
                } else if (is.isObject(name)) {
                    for (var i in name) {
                        this.nodes[0].dataset[i] = name[i];
                    }
                }
            } else if (arguments.length === 2) {
                for (var i in this.nodes) {
                    this.nodes[i].dataset[name] = value;
                }
            } else if (arguments.length === 0) {
                _a = this.nodes[0].dataset;
            }
        }
        return _a;
    };
    query.prototype.create = function (tagName, ns) {
        if (tagName) {
            if (ns) {
                this.nodes = [window.document.createElementNS(ns, tagName)];
            } else {
                this.nodes = [window.document.createElement(tagName)];
            }
        } else {
            this.nodes = [window.document.createDocumentFragment()];
        }
        this.length = this.nodes.length;
        return this;
    };
    query.prototype.element = function (tagName, ns) {
        if (tagName) {
            if (ns) {
                this.nodes = [window.document.createElementNS(ns, tagName)];
            } else {
                this.nodes = [window.document.createElement(tagName)];
            }
        } else {
            this.nodes = [window.document.createDocumentFragment()];
        }
        this.length = this.nodes.length;
        return this;
    };
    query.prototype.width = function (a) {
        if (arguments.length === 1) {
            if (is.isNumber(a)) {
                a = a + "px";
            }
            this.css("width", a);
            return this;
        } else {
            return this.nodes[0].offsetWidth;
        }
    };
    query.prototype.height = function (a) {
        if (arguments.length === 1) {
            if (is.isNumber(a)) {
                a = a + "px";
            }
            this.css("height", a);
            return this;
        } else {
            return this.nodes[0].offsetHeight;
        }
    };
    query.prototype.offset = function () {
        if (!this.isEmpty()) {
            var obj = this.nodes[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: obj.width,
                height: obj.height
            };
        } else {
            return null;
        }
    };
    query.prototype.hide = function () {
        for (var i = 0; i < this.nodes.length; i++) {
            var ds = window.getComputedStyle(this.nodes[i], '').getPropertyValue("display");
            if (ds !== "none") {
                this.nodes[i].setAttribute("ds", ds);
                this.nodes[i].style.display = "none";
            }
        }
        return this;
    };
    query.prototype.show = function () {
        for (var i = 0; i < this.nodes.length; i++) {
            var ds = window.getComputedStyle(this.nodes[i], '').getPropertyValue("display");
            if (ds === "none") {
                var a = this.nodes[i].getAttribute("ds");
                if (a) {
                    this.nodes[i].removeAttribute("ds");
                    this.nodes[i].style.display = a;
                } else {
                    this.nodes[i].style.display = "block";
                }
            }
        }
        return this;
    };
    query.prototype.html = function (tags) {
        var t = this;
        if (!this.isEmpty()) {
            if (arguments.length === 1) {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].innerHTML = tags;
                }
            } else {
                t = this.nodes[0].innerHTML;
            }
        }
        return t;
    };
    query.prototype.outer = function () {
        if (!this.isEmpty()) {
            return this.nodes[0].outerHTML;
        }
        return "";
    };
    query.prototype.text = function (text) {
        var t = this;
        if (!this.isEmpty()) {
            if (arguments.length === 1) {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].innerText = text;
                }
            } else {
                t = this.nodes[0].innerText;
            }
        }
        return t;
    };
    query.prototype.val = function (a) {
        var t = this;
        if (!this.isEmpty()) {
            if (arguments.length === 1) {
                for (var i = 0; i < this.nodes.length; i++) {
                    this.nodes[i].value = a;
                }
            } else {
                t = this.nodes[0].value;
            }
        }
        return t;
    };
    query.prototype.addClass = function (a) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].classList) {
                this.nodes[i].classList.add(a);
            } else {
                if (this.nodes[i].className.indexOf(a) === -1) {
                    this.nodes[i].className = this.nodes[i].className + " " + a;
                }
            }
        }
        return this;
    };
    query.prototype.removeClass = function (a) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].classList) {
                this.nodes[i].classList.remove(a);
            } else {
                if (this.nodes[i].className.indexOf(a) !== -1) {
                    var reg = new RegExp('(\\s|^)' + a + '(\\s|$)');
                    this.nodes[i].className = this.nodes[i].className.replace(reg, ' ');
                }
            }
        }
        return this;
    };
    query.prototype.contains = function (a) {
        if (!this.isEmpty()) {
            var b = topolr(a);
            if (!b.isEmpty()) {
                return this.nodes[0].contains(b.nodes[0]);
            }
        }
        return false;
    };
    query.prototype.contain = function (a) {
        return this.same(a) || this.contains(a);
    };
    query.prototype.hasClass = function (a) {
        var _a = false;
        if (!this.isEmpty()) {
            if (this.nodes[0].classList) {
                _a = this.nodes[0].classList.contains(a);
            } else {
                _a = this.nodes[0].className.indexOf(a) === -1;
            }
        }
        return _a;
    };
    query.prototype.toggleClass = function (a) {
        if (!this.isEmpty()) {
            if (this.nodes[0].classList) {
                this.nodes[0].classList.toggle(a);
            } else {
                if (this.nodes[0].className.indexOf(a) !== -1) {
                    var reg = new RegExp('(\\s|^)' + a + '(\\s|$)');
                    for (var i in this.nodes) {
                        this.nodes[i].className = this.nodes[i].className.replace(reg, ' ');
                    }
                } else {
                    for (var i in this.nodes) {
                        this.nodes[i].className = this.nodes[i].className + " " + a;
                    }
                }
            }
        }
        return this;
    };
    query.prototype.scrollTop = function (top) {
        var a = this;
        if (arguments.length === 0) {
            if (!this.isEmpty()) {
                a = ('scrollTop' in this.nodes[0]) ? this.nodes[0].scrollTop : this.nodes[0].scrollY;
            } else {
                a = null;
            }
        } else {
            for (var i in this.nodes) {
                if ('scrollTop' in this.nodes[i]) {
                    this.nodes[i].scrollTop = top;
                } else {
                    this.nodes[i].scrollY = top;
                }
            }
        }
        return a;
    };
    query.prototype.scrollLeft = function (left) {
        var a = this;
        if (arguments.length === 0) {
            if (!this.isEmpty()) {
                a = ('scrollLeft' in this.nodes[0]) ? this.nodes[0].scrollLeft : this.nodes[0].scrollX;
            } else {
                a = null;
            }
        } else {
            for (var i in this.nodes) {
                if ('scrollLeft' in this.nodes[i]) {
                    this.nodes[i].scrollLeft = left;
                } else {
                    this.nodes[i].scrollX = left;
                }
            }
        }
        return a;
    };
    query.prototype.click = function (fn) {
        if (arguments.length === 1) {
            this.bind("click", fn);
        } else {
            this.trigger("click");
        }
        return this;
    };
    query.prototype.load = function (fn) {
        if (arguments.length === 1) {
            this.bind("load", fn);
        } else {
            this.trigger("load");
        }
        return this;
    };
    query.prototype.trigger = function (type, data) {
        return event.util.trigger(this, type, data);
    };
    query.prototype.bind = function (type, fn) {
        return event.util.bind(this, type, fn);
    };
    query.prototype.unbind = function (type, fn) {
        return event.util.unbind(this, type, fn);
    };
    query.prototype.isEmpty = function (fn) {
        if (arguments.length === 0) {
            return this.nodes.length === 0;
        } else {
            if (is.isFunction(fn)) {
                fn.call(this, this.nodes.length === 0);
                return this;
            }
            return this;
        }
    };
    query.prototype.isWrapper = function () {
        return this instanceof query;
    };
    query.prototype.add = function (a) {
        var k = topolr(a);
        this.nodes = this.nodes.concat(k.nodes);
        this.length = this.nodes.length;
        return this;
    };
    query.prototype.prop = function (name, value) {
        for (var i = 0; i < this.nodes.length; i++) {
            var val = this.nodes[i][name];
            if (val !== undefined) {
                if (is.isFunction(value)) {
                    this.nodes[i][name] = value.call(this.nodes[i], i, val);
                } else {
                    this.nodes[i][name] = value;
                }
            }
        }
        return this;
    };
    query.prototype.position = function (a, b) {
        if (arguments.length === 0) {
            var a = this.offsetParent();
            if (a.length > 0 && !is.isDocument(a.get(0))) {
                return {
                    left: this.css("left"),
                    top: this.css("top")
                };
            } else {
                return this.offset();
            }
        } else {
            a && this.css("left", a);
            b && this.css("top", b);
            return this;
        }
    };
    query.prototype.offsetParent = function () {
        var r = [];
        if (!this.isEmpty()) {
            if (this.nodes[0].offsetParent === undefined) {
                var a = this.nodes[0].parentNode;
                while (a && !domx.regs.root.test(a.nodeName) && window.getComputedStyle(a, '').getPropertyValue("position") === "static") {
                    a = a.parentNode;
                }
                r.push(a);
            } else {
                r.push(this.nodes[0].offsetParent);
            }
        }
        return domx.util.getDom(r);
    };
    query.prototype.scrollingLeft = function (scrollLeft, time, type) {
        var promise = topolr.promise().scope(this), ths = this;
        if (this.scrollLeft() !== scrollLeft) {
            new tween({
                from: this.scrollLeft(),
                to: scrollLeft,
                during: time,
                fn: type,
                onrunning: function (a) {
                    ths.scrollLeft(a);
                },
                onend: function () {
                    promise.resolve();
                }
            }).start();
        } else {
            promise.resolve();
        }
        return promise;
    };
    query.prototype.scrollingTop = function (scrollTop, time, type) {
        var promise = topolr.promise().scope(this), ths = this;
        if (this.scrollTop() !== scrollTop) {
            new tween({
                from: this.scrollTop(),
                to: scrollTop,
                during: time,
                fn: type,
                onrunning: function (a) {
                    ths.scrollTop(a);
                },
                onend: function () {
                    promise.resolve();
                }
            }).start();
        } else {
            promise.resolve();
        }
        return promise;
    };
    query.prototype.transition = function () {
        var trans = this.data("_transition_");
        if (!trans) {
            trans = new transition(this);
        }
        return trans;
    };
    query.prototype.animate = function (cssset, option) {
        var dom = this;
        var ani = this.data("_animate_");
        var ops = {
            duration: 350,
            delay: 0,
            type: "ease-out"
        };
        topolr.extend(ops, option);
        cssset = prefix.fix(cssset);
        var v = "";
        for (var i in cssset) {
            v += i + " " + ops.duration + "ms " + ops.type + " " + ops.delay + "ms,";
        }
        if (v.length > 0) {
            v = v.substring(0, v.length - 1);
        }
        if (!ani) {
            var promise = topolr.promise().scope(dom);
            var _endHandler = function (e) {
                dom.get(0).removeEventListener(prefix.transitionEnd, _endHandler, false);
                promise.resolve(e);
            };
            dom.css(prefix.prefix + "transition", v).get(0).addEventListener(prefix.transitionEnd, _endHandler, false);
            dom.css(cssset);
            dom.data("_animate_", promise);
            ani = promise;
        } else {
            ani.then(function () {
                var promise = topolr.promise().scope(dom);
                var _endHandler = function (e) {
                    dom.get(0).removeEventListener(prefix.transitionEnd, _endHandler, false);
                    promise.resolve(e);
                };
                dom.css(prefix.prefix + "transition", v).get(0).addEventListener(prefix.transitionEnd, _endHandler, false);
                dom.css(cssset);
                return promise;
            });
        }
        return ani;
    };
    query.prototype.transform = function (attrs) {
        var a = this.data("_transform_");
        if (!a) {
            a = new transform(this, Array.prototype.slice.call(arguments));
        }
        return a;
    };
    dom.prototype = new query();

    var windoc = function (obj) {
        this.obj = obj;
    };
    windoc.prototype.width = function () {
        return window.innerWidth;
    };
    windoc.prototype.height = function () {
        return window.innerHeight;
    };
    windoc.prototype.bind = function (type, fn) {
        if (is.isWindow(this.obj)) {
            window.addEventListener(type, fn, false);
        } else {
            this.nodes = [this.obj];
            event.util.bind(this, type, fn);
        }
        return this;
    };
    windoc.prototype.unbind = function (type, fn) {
        if (is.isWindow(this.obj)) {
            window.removeEventListener(type, fn, false);
        } else {
            this.nodes = [this.obj];
            event.util.bind(this, type, fn);
        }
        return this;
    };
    windoc.prototype.scrollTop = function (top) {
        var a = this;
        if (arguments.length === 0) {
            a = document.body.scrollTop || document.documentElement.scrollTop;
        } else {
            document.body.scrollTop = top;
            document.documentElement.scrollTop = top;
        }
        return a;
    };
    windoc.prototype.scrollLeft = function (left) {
        var a = this;
        if (arguments.length === 0) {
            a = document.body.scrollLeft || document.documentElement.scrollLeft;
        } else {
            document.body.scrollLeft = left;
        }
        return a;
    };
    windoc.prototype.scrollingLeft = function (scrollLeft, time, type) {
        var promise = topolr.promise().scope(this), ths = this;
        if (this.scrollLeft() !== scrollLeft) {
            new tween({
                from: this.scrollLeft(),
                to: scrollLeft,
                during: time,
                fn: type,
                onrunning: function (a) {
                    ths.scrollLeft(a);
                },
                onend: function () {
                    promise.resolve();
                }
            }).start();
        } else {
            promise.resolve();
        }
        return promise;
    };
    windoc.prototype.scrollingTop = function (scrollTop, time, type) {
        var promise = topolr.promise().scope(this), ths = this;
        if (this.scrollTop() !== scrollTop) {
            new tween({
                from: this.scrollTop(),
                to: scrollTop,
                during: time,
                fn: type,
                onrunning: function (a) {
                    ths.scrollTop(a);
                },
                onend: function () {
                    promise.resolve();
                }
            }).start();
        } else {
            promise.resolve();
        }
        return promise;
    };
    var event = function (data) {
        this.currentTarget = null;
        this.target = null;
        this.timeStamp = new Date().getTime();
        this.type = "";
        this.cancelable = false;
        this._stop = false;
        this.data = data;
    };
    event.prototype.stopPropagation = function () {
        this._stop = true;
    };
    event.prototype.preventDefault = function () {
        this.cancelable = true;
    };
    event.trigger = function (e) {
        var events = e.currentTarget.events[e.type];
        for (var i in events) {
            events[i].call(e.currentTarget, e);
        }
    };
    event.util = {
        types: {
            HTMLEvents: "load,unload,abort,error,select,change,submit,reset,focus,blur,resize,scroll",
            MouseEvent: "click,mousedown,mouseup,mouseover,mousemove,mouseout",
            UIEvent: "DOMFocusIn,DOMFocusOut,DOMActivate",
            MutationEvent: "DOMSubtreeModified,DOMNodeInserted,DOMNodeRemoved,DOMNodeRemovedFromDocument,DOMNodeInsertedIntoDocument,DOMAttrModified,DOMCharacterDataModified"
        },
        isEvent: function (type) {
            var result = {
                type: type,
                interfaceName: null
            };
            for (var i in event.util.types) {
                if (event.util.types[i].indexOf(type) !== -1) {
                    result.interfaceName = i;
                    break;
                }
            }
            return result;
        },
        bind: function (dom, type, fn) {
            for (var i = 0; i < dom.nodes.length; i++) {
                if (!dom.nodes[i].events) {
                    dom.nodes[i].events = {
                    };
                }
                if (dom.nodes[i].events[type]) {
                    dom.nodes[i].events[type].push(fn);
                } else {
                    dom.nodes[i].events[type] = [];
                    dom.nodes[i].events[type].push(fn);
                }
                dom.nodes[i].addEventListener(type, event.trigger, false);
            }
            return dom;
        },
        unbind: function (dom, type, fn) {
            for (var i = 0; i < dom.nodes.length; i++) {
                var b = dom.nodes[i];
                if (b.events) {
                    if (type && type !== "") {
                        var events = b.events[type];
                        if (events) {
                            b.removeEventListener(type, event.trigger, false);
                            if (is.isFunction(fn)) {
                                for (var i in events) {
                                    if (events[i] === fn) {
                                        events.splice(i, 1);
                                    }
                                }
                            } else {
                                events.length = 0;
                            }
                        }
                    } else {
                        var c = b.events;
                        for (var i in c) {
                            b.removeEventListener(i, event.trigger, false);
                            c[i].length = 0;
                        }
                    }
                }
            }
            return dom;
        },
        unbindAll: function (dom) {
            var a = dom.nodes;
            for (var i = 0; i < a.length; i++) {
                var b = a[i].events;
                for (var j in b) {
                    a[i].removeEventListener(j, event.trigger, false);
                    b[j].length = 0;
                }
            }
            return dom;
        },
        unbindnode: function (node) {
            var b = node.events;
            for (var j in b) {
                node.removeEventListener(j, event.trigger, false);
                b[j].length = 0;
            }
        },
        trigger: function (dom, type, data) {
            var a = this.isEvent(type);
            if (a.interfaceName) {
                var eventx = document.createEvent(a.interfaceName);
                switch (a.interfaceName) {
                    case "MouseEvent":
                        eventx.initMouseEvent(type, true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        break;
                    case "HTMLEvents":
                        eventx.initEvent(type, true, false, window);
                        break;
                    case "UIEvents":
                        eventx.initUIEvents(type, true, false, window, null);
                        break
                    case "MutationEvent ":
                        eventx.initMutationEvent(type, true, false, window, null, null, null, null);
                        break;
                }
                for (var i = 0; i < dom.nodes.length; i++) {
                    dom.nodes[i].dispatchEvent(eventx);
                }
            } else {
                var _c = new event(data);
                _c.type = type;
                _c.target = dom.nodes[0];
                var _parent = dom.nodes[0];
                while (_parent) {
                    _c.currentTarget = _parent;
                    if (_parent.events && _parent.events[type]) {
                        var events = _parent.events[type];
                        for (var i in events) {
                            events[i].call(_parent, _c);
                        }
                    }
                    if (_c._stop) {
                        break;
                    }
                    _parent = _parent.parentNode;
                }
            }
            return dom;
        }
    };

    var tweenmapping = {
        "linner": function (t, b, c, d) {
            return c * t / d + b;
        },
        "ease-in-quad": function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        "ease-out-quad": function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        "ease-in-out-quad": function (t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        "ease-in-cubic": function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        "ease-out-cubic": function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        "ease-in-out-cubic": function (t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        "ease-in-quart": function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        "ease-out-quart": function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        "ease-in-out-quart": function (t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        "ease-in-quint": function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        "ease-out-quint": function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        "ease-in-out-quint": function (t, b, c, d) {
            if ((t /= d / 2) < 1)
                return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        "ease-in-sine": function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        "ease-out-sine": function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        "ease-in-out-sine": function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        "ease-in-expo": function (t, b, c, d) {
            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        "ease-out-expo": function (t, b, c, d) {
            return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        "ease-in-out-expo": function (t, b, c, d) {
            if (t === 0)
                return b;
            if (t === d)
                return b + c;
            if ((t /= d / 2) < 1)
                return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        "ease-in-circ": function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        "ease-out-circ": function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        "ease-in-out-circ": function (t, b, c, d) {
            if ((t /= d / 2) < 1)
                return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        "ease-in-elastic": function (t, b, c, d, a, p) {
            var s;
            if (t === 0)
                return b;
            if ((t /= d) == 1)
                return b + c;
            if (typeof p === "undefined")
                p = d * .3;
            if (!a || a < Math.abs(c)) {
                s = p / 4;
                a = c;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        "ease-out-elastic": function (t, b, c, d, a, p) {
            var s;
            if (t === 0)
                return b;
            if ((t /= d) === 1)
                return b + c;
            if (typeof p === "undefined")
                p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        "ease-in-out-elastic": function (t, b, c, d, a, p) {
            var s;
            if (t === 0)
                return b;
            if ((t /= d / 2) === 2)
                return b + c;
            if (typeof p === "undefined")
                p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1)
                return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        "ease-in-back": function (t, b, c, d, s) {
            if (typeof s === "undefined")
                s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        "ease-out-back": function (t, b, c, d, s) {
            if (typeof s === "undefined")
                s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        "ease-in-out-back": function (t, b, c, d, s) {
            if (typeof s === "undefined")
                s = 1.70158;
            if ((t /= d / 2) < 1)
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        "ease-in-bounce": function (t, b, c, d) {
            return c - tweenmapping["ease-out-bounce"](d - t, 0, c, d) + b;
        },
        "ease-out-bounce": function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        "ease-in-out-bounce": function (t, b, c, d) {
            if (t < d / 2) {
                return tweenmapping["ease-in-bounce"](t * 2, 0, c, d) * .5 + b;
            } else {
                return tweenmapping["ease-out-bounce"](t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        }
    };
    var tween = function (option) {
        this.from = is.isAvalid(option.from) ? option.from : 0;
        this.to = is.isAvalid(option.to) ? option.to : 100;
        if (is.isString(option.fn)) {
            this.fn = tweenmapping[option.type] || tweenmapping["ease-out-quart"];
        } else if (is.isFunction(option.fn)) {
            this.fn = option.fn;
        } else {
            this.fn = tweenmapping["ease-out-quart"];
        }
        this.during = Math.round((option.during || 1000) / 16.7);
        this.onrunning = option.onrunning;
        this.onend = option.onend;
        this.delay = is.isAvalid(option.delay) ? option.delay : 0;
        this.isstop = true;
    };
    tween._run = function () {
        var start = 0, during = this.during, offset = this.to - this.from, ths = this;
        var run = function () {
            start++;
            ths.onrunning && ths.onrunning.call(ths, ths.fn(start, ths.from, offset, during));
            if (start < during && !ths.isstop) {
                requestAnimationFrame(run);
            } else {
                ths.onend && ths.onend.call(ths);
                ths.isstop = true;
            }
        };
        run();
    };
    tween._runs = function () {
        var start = 0, during = this.during;
        var offset = [], ths = this;
        for (var i = 0; i < this.from.length; i++) {
            offset.push(this.to[i] || 0 - this.from[i]);
        }
        var run = function () {
            start++;
            var news = [];
            for (var i = 0; i < ths.from.length; i++) {
                news.push(ths.fn(start, ths.from[i], offset[i], during));
            }
            ths.onrunning && ths.onrunning.call(ths, news);
            if (start < during && !ths.isstop) {
                requestAnimationFrame(run);
            } else {
                ths.onend && ths.onend.call(ths);
                ths.isstop = true;
            }
        };
        run();
    };
    tween._runo = function () {
        var start = 0, during = this.during;
        var offset = {}, ths = this;
        for (var i in this.from) {
            offset[i] = this.to[i] || 0 - this.from[i];
        }
        var run = function () {
            start++;
            var news = {};
            for (var i in ths.from) {
                news[i] = ths.fn(start, ths.from[i], offset[i], during);
            }
            ths.onrunning && ths.onrunning.call(ths, news);
            if (start < during && !ths.isstop) {
                requestAnimationFrame(run);
            } else {
                ths.onend && ths.onend.call(ths);
                ths.isstop = true;
            }
        };
        run();
    };
    tween.prototype.start = function () {
        var ths = this;
        this.isstop = false;
        setTimeout(function () {
            if (is.isArray(ths.from)) {
                tween._runs.call(ths);
            } else if (is.isObject(ths.from)) {
                tween._runo.call(ths);
            } else if (is.isNumber(ths.from)) {
                tween._run.call(ths);
            }
        }, this.delay);
        return this;
    };
    tween.prototype.stop = function () {
        this.isstop = true;
        return this;
    };
    tween.prototype.isRunning = function () {
        return this.isstop === true;
    };
    tween.prototype.clean = function () {
        for (var i in this) {
            this[i] = null;
        }
    };
    topolr.tween = function (option) {
        return new tween(option);
    };

    var request = function (option) {
        this.mimeType = null;
        this.data = option.data || "";
        this.url = option.url || "";
        this.realURL = option.url || "";
        this.type = option.type || "post";
        this.realType = option.dataType || "text";
        this.dataType = ["arraybuffer", "blob", "document", "text"].indexOf(option.dataType) !== -1 ? option.dataType : "text";
        this.async = option.async === false ? false : true;
        this.timeout = option.timeout || 30000;
        this.headers = option.headers || {};
        this.events = json.cover({
            readystatechange: null,
            loadstart: null,
            progress: null,
            abort: null,
            error: null,
            load: null,
            timeout: null,
            loadend: null
        }, option.events);
        var ths = this;
        this._eventproxy = function (e) {
            var deal = ths.events[e.type];
            ths.response = this;
            deal && deal.call(ths, e);
            if (e.type === "loadend") {
                ths.clean();
            }
        };
        this._uploadproxy = function (e) {
            var deal = ths.events[e.type];
            ths.response = this;
            deal && deal.call(ths, e);
        };
        this.xhr = new XMLHttpRequest();
    };
    request.prototype.clean = function () {
        for (var i in this.events) {
            if (i === "progress") {
                this.xhr.upload.removeEventListener(i, this._uploadproxy, false);
            } else {
                this.xhr.removeEventListener(i, this._eventproxy, false);
            }
        }
        for (var i in this) {
            this[i] = null;
        }
    };
    request.prototype.abort = function () {
        this.xhr.abort();
        return this;
    };
    request.prototype.header = function (params, val) {
        if (arguments.length === 1) {
            for (var i in params) {
                this.headers[i] = params[i];
            }
        } else {
            this.headers[params] = val;
        }
        return this;
    };
    request.prototype.bind = function (type, fn) {
        if (arguments.length === 1) {
            for (var i in type) {
                this.events[i] = type[i];
            }
        } else {
            this.events[type] = fn;
        }
        return this;
    };
    request.prototype.unbind = function (type, fn) {
        var m = this.events[type];
        for (var i in m) {
            if (m[i] === fn) {
                m[i] = null;
            }
        }
        return this;
    };
    request.prototype.fire = function () {
        if (this.mimeType) {
            this.xhr.overrideMimeType(this.mimeType);
        }
        if (this.type === "get") {
            var querystr = serialize.queryString(this.data);
            this.url += (this.url.indexOf("?") !== -1 ? (querystr === "" ? "" : "&" + querystr) : (querystr === "" ? "" : "?" + querystr));
        } else {
            this.data = serialize.postData(this.data);
        }
        this.xhr.open(this.type, this.url, this.async);
        if (this.async) {
            this.xhr.responseType = this.dataType;
            this.xhr.timeout = this.timeout;
        }
        for (var i in this.events) {
            if (i === "progress") {
                this.xhr.upload.addEventListener(i, this._uploadproxy, false);
            } else {
                this.xhr.addEventListener(i, this._eventproxy, false);
            }
        }
        for (var i in this.headers) {
            this.xhr.setRequestHeader(i, this.headers[i]);
        }
        if (is.isQueryString(this.data)) {
            this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        this.xhr.send(this.data);
        return this;
    };
    topolr.ajax = function (option) {
        var pros = new promise();
        if (option) {
            option["events"] = {
                error: function (e) {
                    option.error && option.error.call(this, e);
                    pros.reject(e);
                },
                load: function (e) {
                    var status = this.response.status;
                    if ((status >= 200 && status < 300) || status === 304) {
                        var result = this.response.response;
                        if (this.realType === "json") {
                            var txt = this.response.responseText;
                            try {
                                result = serialize.parse(txt);
                            } catch (e) {
                                throw Error("[topolr] ajax unvaliable json string,url is '" + option.url + "'");
                            }
                        }
                        option.success && option.success.call(this, result);
                        pros.resolve(result);
                    } else {
                        option.error && option.error.call(this, e);
                        pros.reject(this.response);
                    }
                }
            };
            new request(option).fire();
            return pros;
        } else {
            return pros.resolve();
        }
    };
    topolr.request = function (option) {
        return new request(option);
    };

    var loader = {
        importsmapping: {
            js: [],
            css: [],
            hasJs: function (path) {
                return this.js.indexOf(path) !== -1 ? true : false;
            },
            hasCss: function (path) {
                return this.css.indexOf(path) !== -1 ? true : false;
            },
            addJs: function (path) {
                this.js.push(path);
                return this;
            },
            addCss: function (path) {
                this.css.push(path);
                return this;
            }
        },
        css: function (csspath, callback, error, async) {
            if (async === undefined || async === null) {
                async = false;
            }
            if (!loader.importsmapping.hasCss(csspath)) {
                if (!async) {
                    var _a = document.createElement("link"), interval = null;
                    _a.href = csspath;
                    _a.type = "text/css";
                    _a.rel = "stylesheet";
                    var _oe = function (e) {
                        _a.removeEventListener("error", _oe);
                        _a.removeEventListener("load", _ol);
                        error && error.call(e.target, e);
                    };
                    var _ol = function (e) {
                        _a.removeEventListener("error", _oe);
                        _a.removeEventListener("load", _ol);
                        if (callback) {
                            clearTimeout(interval);
                            callback.call(e.target, e);
                        }
                    };
                    _a.addEventListener("error", _oe, false);
                    _a.addEventListener("load", _ol, false);
                    document.getElementsByTagName("head")[0].appendChild(_a);
                    loader.importsmapping.addCss(csspath);
                    (function () {
                        try {
                            if (_a.sheet.cssRules) {
                                if (_a.sheet.cssRules.length > 0) {
                                    _a.removeEventListener("error", _oe);
                                    _a.removeEventListener("load", _ol);
                                    callback && callback.call(_a);
                                }
                            }
                        } catch (e) {
                            interval = setTimeout(arguments.callee, 100);
                        }
                    })();
                } else {
                    topolr.ajax({
                        url: csspath,
                        dataType: "text",
                        type: "get",
                        async: true,
                        success: function (e) {
                            var _a = document.createElement("style");
                            _a.type = "text/css";
                            _a.styleSheet.cssText = e;
                            _a.setAttribute("media", "screen");
                            document.getElementsByTagName("head")[0].appendChild(_a);
                            if (callback) {
                                callback();
                            }
                        },
                        error: function (e) {
                            if (error) {
                                error();
                            }
                        }
                    });
                    loader.importsmapping.addJs(csspath);
                }
            } else {
                if (callback)
                    callback();
            }
            return this;
        },
        js: function (jspath, callback, error, charset, async) {
            if (async === undefined || async === null) {
                async = true;
            }
            if (!loader.importsmapping.hasJs(jspath)) {
                if (async) {
                    var _ol = function (e) {
                        e.target.removeEventListener("load", _ol);
                        e.target.removeEventListener("error", _oe);
                        if (callback)
                            callback.call(e.target, e);
                    };
                    var _oe = function (e) {
                        e.target.removeEventListener("load", _ol);
                        e.target.removeEventListener("error", _oe);
                        if (error)
                            error.call(e.target, e);
                    };
                    var _a = document.createElement("script");
                    _a.src = jspath;
                    _a.type = "text/javascript";
                    if (charset && charset !== "")
                        _a.charset = charset;
                    _a.addEventListener("load", _ol, false);
                    _a.addEventListener("error", _oe, false);
                    document.getElementsByTagName("head")[0].appendChild(_a);
                    loader.importsmapping.addJs(jspath);
                } else {
                    topolr.ajax({
                        url: jspath,
                        dataType: "text",
                        type: "get",
                        async: false,
                        success: function (e) {
                            (new Function("try{" + e + "}catch(e){console.error('[topolr]imports: %s ,path " + jspath + "',e.message);}"))();
                            if (callback) {
                                callback();
                            }
                        },
                        error: function (e) {
                            if (error) {
                                error();
                            }
                        }
                    });
                    loader.importsmapping.addJs(jspath);
                }
            } else {
                if (callback)
                    callback();
            }
            return this;
        },
        image: function (url, callback, error) {
            var _a = document.createElement("img");
            var _ol = function (e) {
                e.target.removeEventListener("load", _ol);
                e.target.removeEventListener("error", _oe);
                if (callback)
                    callback.call(e.target, e);
            };
            var _oe = function (e) {
                e.target.removeEventListener("load", _ol);
                e.target.removeEventListener("error", _oe);
                if (error)
                    error.call(e.target, e);
            };
            _a.src = url;
            _a.addEventListener("load", _ol, false);
            _a.addEventListener("error", _oe, false);
            return this;
        },
        text: function (url, success, error, data) {
            topolr.ajax({
                url: url,
                data: data,
                dataType: "text",
                success: success,
                error: error
            });
            return this;
        },
        json: function (url, success, error, data) {
            topolr.ajax({
                url: url,
                data: data,
                dataType: "json",
                success: success,
                error: error
            });
            return this;
        },
        load: function (mapping, onload, onprogress, onerror) {//{js:[],css:[],dom:[],json:[]}
            if (mapping) {
                var que = new queue();
                for (var i in mapping) {
                    for (var j in mapping[i]) {
                        que.add(function (a, b) {
                            var q = this;
                            loader[b.type](b.path, function (e) {
                                q.next();
                            }, function (e) {
                                if (onerror)
                                    onerror.call(q, b.type, b.path);
                            });
                        }, null, {type: i, path: mapping[i][j]});
                    }
                }
                que.complete(function () {
                    if (onload)
                        onload();
                }).progress(function (k) {
                    if (onprogress)
                        onprogress({
                            total: k.total,
                            runed: k.runed,
                            progress: Math.floor((k.runed / k.total) * 100)
                        });
                }).run();
            } else {
                if (onload) {
                    onload();
                }
            }
        }
    };
    topolr.loader = function () {
        return loader;
    };

    var template = function (temp) {
        this._code = template.code(temp);
        this._fn = template.compile(this._code);
    };
    template.a = /&lt;%/g;
    template.b = /%&gt;/g;
    template.c = /&quot;/g;
    template.d = /<%|%>/g;
    template.e = /^=.*;$/;
    template.f = />[\s]+</g;
    template.g = /\r\n/g;
    template.h = /\n/g;
    template.j = /\r/g;
    template.code = function (temp) {
        var fn = "var out='';";
        temp.replace(template.f, "><").replace(template.g, "").replace(template.h, "").replace(template.j, "").replace(template.a, "<%").replace(template.b, "%>").split(template.d).forEach(function (e, index) {
            e = e.replace(/"/g, '\\"');
            index % 2 !== 0 ? (template.e.test(e) ? (fn += "out+" + e) : (fn += e)) : (fn += "out+=\"" + e + "\";");
        });
        fn += "return out;";
        return fn;
    };
    template.compile = function (code) {
        try {
            return  new Function("data", "fn", code);
        } catch (e) {
            console.error("[template error] " + e.message);
            console.info("[template result] " + code);
            return function () {
                return "";
            };
        }
    };
    template.prototype.render = function (data, fn) {
        return this._fn(data, fn);
    };
    template.prototype.code = function () {
        return this._code;
    };
    template.prototype.fn = function () {
        return this._fn;
    };
    topolr.template = function () {
        var temp = Array.prototype.slice.call(arguments).join("");
        return new template(temp);
    };
    query.prototype.template = function () {
        var temp = new template(ths.html()), ths = this;
        return {
            render: function (data, fn) {
                ths.html(temp.render(data, fn));
                return ths;
            },
            compile: function (data, fn) {
                return temp.render(data, fn);
            }
        };
    };
    query.prototype.predefined = function (name, args) {
        var a = query.prototype[name];
        if (a) {
            var b = Array.prototype.slice.call(arguments);
            b.splice(0, 1);
            return a.call(this, b);
        } else {
            return this;
        }
    };

    if(chrome&&chrome.runtime&&chrome.runtime.onConnect) {
        var connecterclient=function (name) {
            var ths=this;
            this.handler={};
            this.port=chrome.extension.connect({name:name});
            this.port.onMessage.addListener(function (msg,sender) {
                var type=msg.type,result={};
                if(ths.handler[type]){
                    ths.handler[type](msg.data,function(info){
                        ths.port.postMessage(info);
                    });
                }
            });
            this.port.onDisconnect.addListener(function (connect) {
                console.log(" sub disconnect it");
            })
        };
        connecterclient.prototype.bind=function (type,fn) {
            this.handler[type]=fn;
            return this;
        };
        connecterclient.prototype.unbind=function (type) {
            delete this.handler[type];
            return this;
        };
        connecterclient.prototype.send=function (type,data) {
            this.port.postMessage({
                type:type,
                data:data
            });
            return this;
        };
        var connecter={
            connects:{},
            handler:{},
            allhandler:{},
            bind:function (name,type,fn) {
                if(!connecter.handler[name]){
                    connecter.handler[name]={};
                }
                connecter.handler[name][type]=fn;
                return connecter;
            },
            bindAll:function (type,fn) {
                connecter.allhandler[type]=fn;
                return this;
            },
            unbindAll:function (type) {
                delete connecter.allhandler[type];
                return this;
            },
            unbind:function (name,type) {
                if(connecter.handler[name]){
                    delete connecter.handler[name][type];
                }
                return connecter;
            },
            send:function (name,type,data) {
                if(connecter.connects[name]){
                    connecter.connects[name].postMessage({
                        type:type,
                        data:data
                    });
                }
                return connecter;
            },
            sendAll:function(type,data){
                for(var i in connecter.connects){
                    connecter.connects[i].postMessage({
                        type:type,
                        data:data
                    });
                }
            }
        };
        chrome.runtime.onConnect.addListener(function (connect) {
            connecter.connects[connect.name] = connect;
            connect.onMessage.addListener(function (message, sender) {
                var type = message.type, name = sender.name;
                if (connecter.handler[name] && connecter.handler[name][type]) {
                    var t = connecter.handler[name][type];
                    if (t) {
                        t(message.data, function (info) {
                            sender.postMessage(info);
                        });
                    }
                }
                if (connecter.allhandler[type]) {
                    connecter.allhandler[type].call(connecter, message.data, function (info) {
                        sender.postMessage(info);
                    });
                }
            });
            connect.onDisconnect.addListener(function (connect) {
                delete connecter.connects[connect.name];
            })
        });
        var handler={};
        window.addEventListener("message",function (e) {
            var data=e.data.data,id=e.data.id;
            if(handler[id]){
                handler[id](data);
                delete handler[id];
            }
        });
        var sandbox={
            ready:false,
            _queue:[],
            request:function (type,data,fn) {
                var id=Math.random().toString(36).slice(2, 12);
                handler[id]=fn;
                if(!sandbox.ready){
                    if(!document.getElementById("sandbox")) {
                        var iframe = document.createElement("iframe");
                        iframe.src = chrome.runtime.getURL("app/base/lib/sandbox.html");
                        iframe.style.cssText = "display:none";
                        iframe.id = "sandbox";
                        document.body.appendChild(iframe);
                        iframe.addEventListener("load", function () {
                            sandbox.ready = true;
                            for (var i = 0; i < sandbox._queue.length; i++) {
                                iframe.contentWindow.postMessage(sandbox._queue[i], "*");
                            }
                        });
                    }
                    sandbox._queue.push({
                        type:type,
                        data:data,
                        id:id
                    });
                }else {
                    var a = document.getElementById("sandbox");
                    a.contentWindow.postMessage({
                        type: type,
                        data: data,
                        id: id
                    }, "*");
                }
            }
        };
        topolr.sandbox=sandbox;
        topolr.ports=function () {
            return connecter;
        };
        topolr.port=function (name) {
            return new connecterclient(name);
        }
        topolr.source=function (obj,fn) {
            var source={},queu=new queue();
            queu.complete(function () {
                fn&&fn(source);
            });
            for(var i in obj){
                queu.add(function (a,b) {
                    topolr.ajax({
                        url:b.url,
                        type:"get",
                        dataType:'text',
                        success:function (a) {
                            source[b.name]=a;
                            queu.next();
                        }
                    });
                },function (a,b) {
                    this.next();
                    source
                },{
                    name:i,
                    url:chrome.runtime.getURL(obj[i])
                });
            }
            queu.run();
        };
        topolr.ascss=function (str) {
            var _a = document.createElement("style");
            _a.setAttribute("media", "screen");
            _a.setAttribute("type","text/css");
            _a.appendChild(document.createTextNode(str));
            document.getElementsByTagName("head")[0].appendChild(_a);
        }
    }
    topolr.fn = query.prototype;
    window.topolr = topolr;
    window.$ = topolr;
})();