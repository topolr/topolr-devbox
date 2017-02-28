(function () {
    var handler={};
    chrome.extension.onRequest.addListener(function (a,sender,sendResponse) {
        var type=a.type,data=a.data;
        if(handler[type]){
            handler[type](data,function (result) {
                console.log("=====>"+result);
                sendResponse(result);
            });
        }
    });
    handler.target=function (id,fnn) {
        var fn=function () {
            if(window.document.getElementsByTagName("body")[0].dataset.builterId===id){
                console.log("this is topolr-builter debug page");
                fnn(true);
            }else{
                fnn(false);
            }

        }
        if (/complete|loaded|interactive/.test(window.document.readyState)) {
            fn();
        } else {
            window.document.addEventListener('DOMContentLoaded', function () {
                fn();
            }, false);
        }
    }
})();
