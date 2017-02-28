(function () {
    $.source({
        config:"app/src/config/option.json"
    },function (source) {
        var config=JSON.parse(source.config);
        chrome.storage.sync.get(config,function (appoption) {
            var isconnect = false;
            var buildcache = null;
            var buildoption=null;
            var targetId = null;
            var currentTabs = {};
            var util = {
                showNotification: function (option) {
                    var ops = $.extend({
                        title: "build complete",
                        message: "topolr-builter has built the project. \n make:(" + option.data.info.make.length + ")",
                        data: null
                    }, option);
                    $.msgbox.basic("build", {
                        title: ops.title,
                        iconUrl: "../logo/48.png",
                        message: ops.message
                    }, function (box) {
                        box.bind("click", function () {
                            var currentTarget = null;
                            for (var i in currentTabs) {
                                currentTarget = currentTabs[i];
                                break;
                            }
                            if (currentTarget) {
                                chrome.tabs.update(currentTarget.id, {active: true});
                                chrome.windows.get(currentTarget.windowId, function (win) {
                                    chrome.windows.update(win.id, {focused: true});
                                });
                            }
                            box.close();
                        });
                    });
                    for (var i in currentTabs) {
                        chrome.tabs.reload(currentTabs[i].id);
                    }
                },
                checkTab:function (watcher) {
                    if(watcher.winid!==undefined&&watcher.winid!==null){
                        chrome.tabs.get(watcher.winid,function (tab) {
                            if(tab){
                                chrome.tabs.update(watcher.winid,{
                                    pinned:watcher.option.closewin
                                });
                            }
                        });
                    }
                },
                closeTab:function (id) {
                    if(id!==undefined&&id!==null){
                        chrome.tabs.get(id,function (tab) {
                            if(tab){
                                chrome.tabs.remove(id);
                            }
                        });
                    }
                }
            };

            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].id >= 0) {
                        (function (tab) {
                            chrome.tabs.sendRequest(tab.id, {type: "target", data: targetId}, function (e) {
                                if (e && e === true && tab.url.indexOf("chrome://") !== 0) {
                                    currentTabs[tab.id] = tab;
                                }
                            });
                        })(tabs[i]);
                    }
                }
            });
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                if (tab.status === "complete") {
                    chrome.tabs.sendRequest(tabId, {type: "target", data: targetId}, function (e) {
                        if (e && e === true && tab.url.indexOf("chrome://") !== 0) {
                            currentTabs[tabId] = tab;
                        }
                    });
                    var a=watcherContainer.getByWinid(tabId);
                    if(a){
                        $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
                        $.msgbox.basic("inspect", {
                            title: "Connected Node Inspect Process",
                            iconUrl: "../logo/48.png",
                            message: "Connected Node Inspect Process,Click To Switch To The DevTools Window"
                        }, function (box) {
                            box.bind("click", function () {
                                chrome.windows.get(tabId, function (win) {
                                    chrome.windows.update(tabId, {focused: true});
                                });
                                box.close();
                            });
                        });
                    }
                }
            });
            chrome.tabs.onRemoved.addListener(function (id) {
                delete currentTabs[id];
                var a=watcherContainer.getByWinid(id);
                if(a){
                    a.reset();
                    $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
                }
            });

            $.ports().bindAll("state", function (data, response) {
                response({
                    type: "state",
                    data: {
                        connected:isconnect,
                        cache:buildcache,
                        option:buildoption
                    }
                });
            }).bindAll("watcherlist",function (data,response) {
                response({type:"watcherlist",data:watcherContainer.getWatcherStates()});
            }).bind("inspect","addwatcher",function (data,response) {
                var r=watcherContainer.add(data);
                if(r){
                    appoption.nodewatcher=watcherContainer.getAllOptions();
                    chrome.storage.sync.set(appoption,function () {
                        response({type:"watcherlist",data:watcherContainer.getWatcherStates()});
                    });
                }else{
                    response({type:"changeerror",data:"add"});
                }
            }).bind("inspect","editwatcher",function (data,response) {
                var r=watcherContainer.edit(data.host,data.port,data);
                if(r){
                    appoption.nodewatcher=watcherContainer.getAllOptions();
                    util.checkTab(watcherContainer.get(data.host,data.port));
                    chrome.storage.sync.set(appoption,function () {
                        response({type:"watcherlist",data:watcherContainer.getWatcherStates()});
                    });
                }else{
                    response({type:"changeerror",data:"add"});
                }
            }).bind("inspect","removewatcher",function (data,response) {
                var r=watcherContainer.remove(data.host,data.port);
                if(r){
                    appoption.nodewatcher=watcherContainer.getAllOptions();
                    chrome.storage.sync.set(appoption,function () {
                        response({type:"watcherlist",data:watcherContainer.getWatcherStates()});
                    });
                }
            }).bindAll("watcherstart",function (data) {
                watcherContainer.start(data.host,data.port);
                appoption.nodewatcher=watcherContainer.getAllOptions();
                chrome.storage.sync.set(appoption,function () {
                    $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
                });
            }).bindAll("watcherstop",function (data) {
                util.closeTab(watcherContainer.get(data.host,data.port).winid);
                watcherContainer.stop(data.host,data.port);
                appoption.nodewatcher=watcherContainer.getAllOptions();
                chrome.storage.sync.set(appoption,function () {
                    $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
                });
            }).bindAll("watcherfocus",function (data) {
                var watcher=watcherContainer.get(data.host,data.port);
                if(watcher){
                    if(watcher.winid!==undefined){
                        chrome.tabs.update(watcher.winid, {active: true});
                    }
                }
            }).bindAll("editwatcherprop",function (data,response) {
                var r=watcherContainer.edit(data.host,data.port,data);
                if(r){
                    appoption.nodewatcher=watcherContainer.getAllOptions();
                    util.checkTab(watcherContainer.get(data.host,data.port));
                    chrome.storage.sync.set(appoption,function () {
                        $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
                    });
                }
            });

            var watcherContainer=NodeWatcherContainer();
            for(var i=0;i<appoption.nodewatcher.length;i++) {
                watcherContainer.add(appoption.nodewatcher[i]);
            }
            watcherContainer.bind("open",function (data) {
                var ths=this;
                if(this.winid===null) {
                    chrome.tabs.create({
                        index: 0,
                        url: data.devtoolsFrontendUrl,
                        active: true,
                        selected: true,
                        pinned: this.option.closewin
                    }, function (tab) {
                        ths.winid = tab.id;
                    });
                }
            }).bind("refresh",function (data) {
                try {
                    chrome.tabs.update(this.winid, {
                        url: data.devtoolsFrontendUrl,
                        active: true,
                        selected: true,
                        pinned: this.option.closewin
                    });
                }catch (e){
                    chrome.tabs.create({
                        index: 0,
                        url: data.devtoolsFrontendUrl,
                        active: true,
                        selected: true,
                        pinned: this.option.closewin
                    }, function (tab) {
                        ths.winid = tab.id;
                    });
                }
            }).bind("close",function () {
                if(this.option.closewin) {
                    chrome.tabs.remove(this.winid);
                }else{
                    chrome.tabs.update(this.winid,{
                        pinned:false
                    });
                }
            }).bind("error",function () {
                $.ports().sendAll("watcherlist",watcherContainer.getWatcherStates());
            });

            Socketer.init().bind("connect", function () {
                isconnect = true;
                $.ports().sendAll("connect");
            }).bind("disconnect", function () {
                isconnect = false;
                $.ports().sendAll("disconnect");
            }).bind("init", function (data) {
                targetId = data.devId;
                buildcache = data;
                buildoption=data.option;
                util.showNotification({
                    title:"connected topolr-builter",
                    data:data
                });
                $.ports().sendAll("build", buildcache);
            }).bind("build", function (data) {
                buildcache = data;
                $.ports().sendAll("build", data);
                util.showNotification({
                    data:data
                });
            });
        });
    });
})();