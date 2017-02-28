(function (io) {
    var socketer={
        socket:null,
        handler:{},
        uuid:"",
        init:function (path) {
            if(!path){
                path='http://localhost:8099';
            }
            var socket = io.connect(path);
            socket.on('connect', function () {
                socketer.handler["connect"]&&socketer.handler["connect"].call(socketer);
            });
            socket.on('disconnect', function () {
                socketer.handler["disconnect"]&&socketer.handler["disconnect"].call(socketer);
            });
            socket.on("uuid",function (a) {
                socketer.uuid=a;
            });
            socket.on("message",function (info) {
                var type=info.type;
                var data=info.data;
                if(socketer.handler[type]){
                    socketer.handler[type].call(socketer,data,function (msg) {
                        msg.uuid=socketer.uuid;
                        socket.emit("message",msg);
                    });
                }
            });
            socketer.socket=socket;
            return socketer;
        },
        bind:function (type,fn) {
            socketer.handler[type]=fn;
            return socketer;
        },
        unbind:function (type) {
            delete socketer.handler[type];
            return this;
        },
        send:function (type,data) {
            socketer.socket.emit("message",{
                type:type,
                data:data
            });
        }
    };
    Socketer=socketer;
})(window.io);