(function () {
    var STATE_CLOSE="close";
    var STATE_OPEN="open";
    var watcher=function (option) {
        this.option=$.extend({
            host:"localhost",
            port:9229,
            circle:3000,
            enable:true,
            closewin:true,
            onopen:null,
            onclose:null,
            onrefresh:null,
            onerror:null
        },option);
        this._timeout=null;
        this._state=STATE_CLOSE;
        this._error=false;
        this.winid=null;
    };
    watcher.watch=function () {
        var ths=this;
        try {
            if (this.option.enable) {
                this._timeout = 0;
                this._ajax = $.ajax({
                    url: "http://" + this.option.host + ":" + this.option.port + "/json",
                    type: "get",
                    dataType: "json",
                    success: function (data) {
                        ths._error=false;
                        if (ths.option.enable) {
                            ths._timeout = setTimeout(function () {
                                watcher.watch.call(ths);
                            }, ths.option.circle);
                            if(data[0].devtoolsFrontendUrl) {
                                if (ths._state === STATE_CLOSE) {
                                    ths._state = STATE_OPEN;
                                    ths.option.onopen && ths.option.onopen.call(ths, data[0]);
                                }else{
                                    ths.option.onrefresh&&ths.option.onrefresh.call(ths,data[0]);
                                }
                            }
                        } else {
                            clearTimeout(ths._timeout);
                            ths._timeout = null;
                        }
                    },
                    error: function () {
                        ths._error=false;
                        if (ths.option.enable) {
                            ths._timeout = setTimeout(function () {
                                watcher.watch.call(ths);
                            }, ths.option.circle);
                            if (ths._state === STATE_OPEN) {
                                ths._state = STATE_CLOSE;
                                ths.option.onclose && ths.option.onclose.call(ths);
                            }
                        } else {
                            clearTimeout(ths._timeout);
                            ths._timeout = null;
                        }
                    }
                });
            }
        }catch(e){
            this._error=true;
            this._state=STATE_CLOSE;
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    };
    watcher.prototype.run=function () {
        if(this._timeout===null) {
            watcher.watch.call(this);
        }
        return this;
    };
    watcher.prototype.start=function () {
        this.option.enable=true;
        if(this._timeout===null) {
            watcher.watch.call(this);
        }
        return this;
    };
    watcher.prototype.stop=function () {
        this.option.enable=false;
        clearTimeout(this._timeout);
        this._timeout=null;
        this.winid=null;
        this._state=STATE_CLOSE;
        return this;
    };
    watcher.prototype.getState=function () {
        return this._state;
    };
    watcher.prototype._bind=function (type,fn) {
        if(type==="open"||type==="close"||type==="error"||type==="refresh"){
            this.option["on"+type]=fn;
        }
        return this;
    };
    watcher.prototype.reset=function () {
        this.winid=null;
        this._state=STATE_CLOSE;
        this._error=false;
        clearTimeout(this._timeout);
        this._timeout = null;
        this.run();
    };

    var container=function () {
        this._map={};
        this._onopen=null;
        this._onclose=null;
        this._onrefresh=null;
    };
    container.createWatcher=function (option) {
        var ths=this;
        var _watcher = new watcher(option);
        _watcher._bind("open", function (data) {
            ths._onopen && ths._onopen.call(this, data);
        })._bind("close", function () {
            ths._onclose && ths._onclose.call(this, {
                port: this.option.port,
                host:this.option.host
            });
        })._bind("error",function () {
            ths._onerror&&ths._onerror.call(this);
        })._bind("refresh",function (data) {
            ths._onrefresh&&ths._onrefresh.call(this,data);
        });
        return _watcher;
    };
    container.prototype.has=function (host,port) {
        return this._map[host+":"+port]!==undefined;
    },
    container.prototype.add=function (option) {
        var ths=this,key=option.host+":"+option.port;
        if(!this.has(option.host,option.port)) {
            var _watcher = container.createWatcher.call(this,option);
            this._map[key] = _watcher;
            _watcher.run();
            return true;
        }else{
            return false;
        }
    };
    container.prototype.edit=function (host,port,option) {
        var key=host+":"+port;
        if(this._map[key]){
            var watcher=this._map[key];
            $.extend(watcher.option,option);
            if(watcher.option.enable){
                watcher.start();
            }else{
                watcher.stop();
            }
            return true;
        }else{
            return false;
        }
    };
    container.prototype.remove=function (host,port) {
        var key=host+":"+port;
        if(this._map[key]){
            this._map[key].stop();
            delete this._map[key];
            return true;
        }
        return false;
    };
    container.prototype.get=function (host,port) {
        var key=host+":"+port;
        return this._map[key];
    };
    container.prototype.getAll=function () {
        var a=[];
        for(var i in this._map){
            a.push(this._map[i]);
        }
        return a;
    };
    container.prototype.bind=function (type,fn) {
        if(type==="open"||type==="close"||type==="error"||type==="refresh"){
            this["_on"+type]=fn;
        }
        return this;
    };
    container.prototype.stopAll=function () {
        for(var i in this._map){
            this._map[i].stop();
        }
        return this;
    };
    container.prototype.stop=function (host,port) {
        var key=host+":"+port;
        if(this._map[key]){
            this._map[key].stop();
        }
        return this;
    };
    container.prototype.start=function (host,port) {
        var key=host+":"+port;
        if(this._map[key]){
            this._map[key].start();
        }
        return this;
    };
    container.prototype.startAll=function () {
        for(var i in this._map){
            this._map[i].start();
        }
    };
    container.prototype.getAllOptions=function () {
        var result=[];
        for(var i in this._map){
            var ops=this._map[i].option,r={};
            for(var t in ops){
                if(!$.is.isFunction(ops[t])) {
                    r[t] = ops[t];
                }
            }
            r.error=this._map[i]._error;
            result.push(r);
        }
        return result;
    };
    container.prototype.getWatcherStates=function () {
        var result=[];
        for(var i in this._map){
            var ops=this._map[i].option,r={};
            console.log(this._map[i].winid);
            for(var t in ops){
                if(!$.is.isFunction(ops[t])) {
                    r[t] = ops[t];
                }
            }
            r.error=this._map[i]._error;
            r.state=(this._map[i].winid!==null);
            result.push(r);
        }
        console.log(result);
        return result;
    };
    container.prototype.getByWinid=function (id) {
        for(var i in this._map){
            if(this._map[i].winid===id){
                return this._map[i];
            }
        }
        return null;
    }
    window.NodeWatcherContainer=function () {
        return new container();
    }
})();