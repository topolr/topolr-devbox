$.source({
    result:"app/src/template/popup-result.html"
},function (source) {
    var connection=$.port("popup");
    connection.bind("state",function (info,response) {
        var connected=info.connected;
        if(connected){
            $(".popup-state").removeClass("fail");
        }else{
            $(".popup-state").addClass("fail");
        }
    }).bind("disconnect",function () {
        $(".popup-state").addClass("fail");
    }).bind("connect",function () {
        $(".popup-state").removeClass("fail");
    }).bind("watcherlist",function (data) {
        $.sandbox.request("template",{
            template:source.result,
            data:data
        },function (template) {
            var dom=$(".popup-watcher").html(template);
            dom.find(".popup-watcher-item-c").each(function () {
                $(this).click(function () {
                    var host=$(this).dataset("host"),port=$(this).dataset("port"),enable=$(this).dataset("enable");
                    if(enable===true||enable==="true"){
                        connection.send("watcherstop", {
                            host:host,
                            port:port/1
                        });
                    }else {
                        connection.send("watcherstart", {
                            host:host,
                            port:port/1
                        });
                    }
                });
            });
            dom.find(".popup-watcher-item-d").each(function () {
                $(this).click(function () {
                    var host=$(this).dataset("host"),port=$(this).dataset("port"),closewin=$(this).dataset("closewin");
                    var r={
                        host:host,
                        port:port/1
                    };
                    if(closewin===true||closewin==="true"){
                        r.closewin=false;
                    }else{
                        r.closewin=true;
                    }
                    connection.send("editwatcherprop",r);
                });
            });
            dom.find(".popup-watcher-item.item").each(function () {
                $(this).click(function () {
                    var host=$(this).dataset("host"),port=$(this).dataset("port");
                    connection.send("watcherfocus",{
                        host:host,
                        port:port/1
                    });
                });
            });
        });
    }).bind("watchererror",function (option) {
        $("item").each(function () {
            var host=$(this).dataset("host"),port=$(this).dataset("port");
            if(host==option.host&&port==option.port){
                $(this).addClass("haserror");
            }else{
                $(this).removeClass("haserror");
            }
        });
    });
    connection.send("state");
    connection.send("watcherlist");
});