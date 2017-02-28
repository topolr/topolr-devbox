(function () {
    var handler={};
    window.addEventListener('message', function(e) {
        var type=e.data.type,data=e.data.data,id=e.data.id;
        if(handler[type]){
            var result=handler[type](data);
            e.source.postMessage({
                id:id,
                data:result
            }, e.origin);
        }else{
            console.error("can not find handler type of "+type);
        }
    });
    var sandboxin={
        bind:function (type,fn) {
            handler[type]=fn;
            return this;
        },
        unbind:function (type) {
            delete handler[type];
            return this;
        }
    };
    window.Sandboxin=sandboxin;
})();
(function () {
    Sandboxin.bind("template",function (data) {
        return $.template(data.template).render(data.data);
    });
})();
