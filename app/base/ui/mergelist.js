(function () {
    $.fn.mergelist=function (option,fn) {
        return new mergelist($(this),option,fn);
    };
    var mergelist=function (dom,option,fn) {
        var ths=this;
        this.dom=dom;
        this.option=$.extend({
            data:[]
        },option);
        $.source({
            mergelist:"app/base/ui/template/mergelist.html",
            style:"app/base/ui/style/mergelist.css"
        },function (source) {
            $.ascss(source.style);
            $.sandbox.request("template",{
                template:source.mergelist,
                data:ths.option
            },function (template) {
                ths.dom.html(template);
                ths.dom.find(".mergelist-item-head").each(function () {
                    $(this).click(function () {
                        $(this).parent().toggleClass("close");
                    });
                });
                fn&&fn.call(ths);
            });
        });
    }
})();