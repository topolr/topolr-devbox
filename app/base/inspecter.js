(function () {
    var actions={};
    var getInspectInfo = function (type, data, callback) {
        var fn = actions[type];
        if(fn) {
            chrome.devtools.inspectedWindow.eval("(" + fn.toString() + ")('" + (data || "") + "')", callback);
        }else{
            throw Error("can not find action of "+type);
        }
    };
    var inspecter={
        addAction:function (type,fn) {
            actions[type]=fn;
            return this;
        },
        getResult:function (type,data,fn) {
            var ps=$.promise();
            getInspectInfo(type,data,function (data) {
                ps.resolve(data);
            });
            return ps;
        }
    };
    $.inspecter=inspecter;
})();