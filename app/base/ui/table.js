(function () {
    $.fn.table=function (option,fn) {
        return new table($(this),option,fn);
    };
    var table=function (dom,option,fn) {
        var ths=this;
        this.dom=dom;
        this.option=$.extend({
            head:[{name:"aa",width:100,key:""}],
            data:[]
        },option);
        $.source({
            table:"app/base/ui/template/table.html",
            style:"app/base/ui/style/table.css"
        },function (source) {
            $.ascss(source.style);
            var template=source.table;
            var _data=[];
            for(var i=0;i<ths.option.head.length;i++){
                var a=ths.option.head[i],cols=[];
                for(var t=0;t<ths.option.data.length;t++){
                    var val=ths.option.data[t][a.key],rowclass="";
                    if(a.hook){
                        val=a.hook(val,ths.option.data[t]);
                    }
                    if(a.rowClass){
                        rowclass=a.rowClass(val,ths.option.data[t]);
                    }
                    cols.push({
                        value:val,
                        className:rowclass
                    });
                }
                _data.push({
                    name:a.name,
                    key:a.key,
                    width:a.width,
                    className:a.className,
                    cols:cols
                });
            }
            console.log(_data);
            $.sandbox.request("template",{
                template:source.table,
                data:_data
            },function (template) {
                ths.dom.html(template);
                fn&&fn.call(ths);
            });
        });
    };
    table.prototype.focusItem=function (num) {
        console.log("====>"+num);
        this.dom.find(".table-body-col").each(function () {
            $(this).children().each(function (i) {
                if(i==num/1){
                    $(this).addClass("focus");
                }else{
                    $(this).removeClass("focus");
                }
            });
        })
    };
    table.prototype.loseFoucus=function () {
        this.dom.find(".table-body-col").each(function () {
            $(this).children().each(function (i) {
                $(this).removeClass("focus");
            });
        })
    };
})();