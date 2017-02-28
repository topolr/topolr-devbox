(function () {
    $.fn.form=function (option,fn) {
        return new form($(this),option,fn);
    };
    var form=function (dom,option,fn) {
        var ths=this;
        this.dom=dom;
        this.option=$.extend({
            data:[],
            onclose:null,
            onsave:null
        },option);
        $.source({
            form:"app/base/ui/template/form.html",
            style:"app/base/ui/style/form.css"
        },function (source) {
            $.ascss(source.style);
            $.sandbox.request("template",{
                template:source.form,
                data:ths.option.data
            },function (template) {
                ths.dom.html(template);
                ths.dom.find(".form-item-head").each(function () {
                    $(this).click(function () {
                        $(this).parent().toggleClass("close");
                    });
                });
                ths.dom.find(".form-head-close").click(function () {
                    ths.option.onclose&&ths.option.onclose.call(ths);
                });
                ths.dom.find(".form-foot-submit").click(function () {
                    ths.option.onsave&&ths.option.onsave.call(ths);
                });
                fn&&fn.call(ths);
            });
        });
    };
    form.prototype.getValue=function () {
        var r={};
        this.dom.find(".form-body-field-input").each(function () {
            var input=$(this).find("input");
            if(input.length===0){
                input=$(this).find("select");
            }
            var name=input.attr("name"),value=input.val();
            r[name]=value;
        });
        return r;
    };
    form.prototype.showError=function (info) {
        this.dom.find(".form-body-error").html(info).show();
    };
    form.prototype.hideError=function () {
        this.dom.find(".form-body-error").hide();
    }
})();