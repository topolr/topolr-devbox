(function () {
    var boxs={};

    var box=function (id) {
        this._id=id;
        this._onclick=null;
        this._onclose=null;
        this._onbtnclick=null;
    };
    box.prototype.bind=function (type,fn) {
        var type="_on"+type;
        this[type]=fn;
        return this;
    };
    box.prototype.close=function (fn) {
        delete boxs[this._id];
        chrome.notifications.clear(this._id,function () {
            fn&&fn();
        });
    };
    box.prototype.update=function (option,fn) {
        chrome.notifications.update(this._id,option,function () {
            fn&&fn();
        });
    };
    chrome.notifications.onClosed.addListener(function (id) {
        if(boxs[id]){
            boxs[id]._onclose&&boxs[id]._onclose();
        }
    });
    chrome.notifications.onClicked.addListener(function (id) {
        if(boxs[id]){
            boxs[id]._onclick&&boxs[id]._onclick();
        }
    });
    chrome.notifications.onButtonClicked.addListener(function (id) {
        if(boxs[id]){
            boxs[id]._onbtnclick&&boxs[id]._onbtnclick();
        }
    });

    var msgbox={
        basic:function (id,option,fn) {
            msgbox.create(id,"basic",option,fn);
        },
        list:function (id,option,fn) {
            if(!option.items){
                option.items=[];
            }
            msgbox.create(id,"basic",option,fn);
        },
        create:function (id,type,option,fn) {
            var ops={
                type:type,
                iconUrl:option.icon?chrome.runtime.getURL(option.icon):"",
                title:"title",
                message:"message",
                buttons:[]
            };
            $.extend(ops,option);
            chrome.notifications.create(id, ops, function(id) {
                var _box=new box(id);
                boxs[id]=_box;
                fn&&fn(_box);
            });
        }
    };
    topolr.msgbox=msgbox;
})();