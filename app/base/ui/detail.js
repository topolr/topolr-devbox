(function () {
    $.fn.detail=function (option,fn) {
        return new detail($(this),option,fn);
    };
    var detail=function (dom,option,fn) {
        var ths=this;
        this.dom=dom;
        this.option=$.extend({
            data:{},
            focus:0,
            onclose:null,
            onfocus:null
        },option);
        $.source({
            mergelist:"app/base/ui/template/detail.html",
            style:"app/base/ui/style/detail.css"
        },function (source) {
            $.ascss(source.style);
            var _error=0,_warn=0;
            for(var i=0;i<ths.option.data.length;i++){
                _error+=ths.option.data[i].makeerrormessage.length;
                _warn+=ths.option.data[i].makewarnmessage.length;
            }
            $.sandbox.request("template",{
                template:source.mergelist,
                data:{
                    data:ths.option.data,
                    error:_error,
                    warn:_warn
                }
            },function (template) {
                ths.dom.html(template);
                ths.dom.find(".detail-body-item-area-head").each(function () {
                    $(this).click(function () {
                        $(this).parent().toggleClass("close");
                    });
                });
                ths.dom.find(".detail-head-close").click(function () {
                    ths.option.onclose&&ths.option.onclose.call(ths);
                });
                ths.dom.find(".detail-head-item").each(function () {
                    $(this).click(function () {
                        var num=0,ts=$(this);
                        ths.dom.find(".detail-head-item").each(function (i) {
                            $(this).removeClass("active");
                            if($(this).get(0)===ts.get(0)){
                                num=i;
                            }
                        });
                        $(this).addClass("active");
                        ths.dom.find(".detail-body-item").each(function () {
                            $(this).removeClass("active");
                        });
                        ths.dom.find(".detail-body-item").eq(num).addClass("active");
                        ths.option.onfocus&&ths.option.onfocus(num);
                    });
                }).eq(ths.option.focus||0).click();
                fn&&fn.call(ths);
            });
        });
    }
})();