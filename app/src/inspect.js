var tab=function (option) {
    var ops={
        id:"",
        template:"",
        container:null
    }
    this.option=$.extend(ops,option);
    this.children=[];
    if(this.option.override){
        for(var i in this.option.override){
            this[i]=this.option.override[i];
        }
    }
};
tab.prototype.getContainer=function () {
    return this.option.container;
};
tab.prototype.init=function () {
};
tab.prototype.show=function () {
    this.dom.show();
};
tab.prototype.hide=function () {
    this.dom.hide();
};
tab.prototype.getId=function () {
    return this.option.id;
};
tab.prototype.addChild=function (tab) {
    tab.init();
    this.children.push(tab);
    return this;
};
tab.prototype.getChild=function (id) {
    for(var i=0;i<this.children.length;i++){
        if(this.children[i].getId()===id){
            return this.children[i];
        }
    }
    return null;
};
tab.prototype.showOffline=function () {
    this.dom.addClass("showmask");
};
tab.prototype.hideOffline=function () {
    this.dom.removeClass("showmask");
};

var tabs=function (items) {
    var ths=this;
    this._list={};
    this._current="";
    this._items=items;
    items.each(function () {
        $(this).click(function () {
            ths.switchTab($(this).attr("action"));
        });
    });
};
tabs.prototype.createTab=function (option) {
    var a=new tab(option);
    this._list[a.getId()]=a;
    a.init();
    return a;
};
tabs.prototype.getTab=function (id) {
    return this._list[id];
};
tabs.prototype.switchTab=function (id) {
    for (var i in this._list) {
        if (i !== id) {
            if (i === this._current) {
                this._list[i].ondeactive && this._list[i].deactive();
            }
            this._list[i].hide();
        } else {
            this._current = i;
            console.log(this._list[i])
            this._list[i].show();
            this._list[i].onactive && this._list[i].onactive();
        }
    }
    this._items.each(function () {
        var ac = $(this).attr("action");
        if (ac === id) {
            $(this).addClass("focus");
        } else {
            $(this).removeClass("focus");
        }
    });
    return this;
};

$.inspecter.addAction("check",function () {
    return window.topolr!==undefined;
});

$.source({
    main:"app/src/template/inspect.html",
    result:"app/src/template/inspect-result.html",
    result_make:"app/src/template/inspect-result-make.html",
    result_output:"app/src/template/inspect-result-output.html",
    result_merge:"app/src/template/inspect-result-merge.html",
    result_page:"app/src/template/inspect-result-page.html",
    inspectwatcher:"app/src/template/inspect-inspectwatcher.html",
    inspectwatcher_option:"app/src/template/inspect-inspectwatcher-option.html",
    pageinspect:"app/src/template/pageinspect.html",
    pageinspect_module:"app/src/template/pageinspect-module.html",
    pageinspect_option:"app/src/template/pageinspect-option.html",
    pageinspect_require:"app/src/template/pageinspect-require.html",
    pageinspect_source:"app/src/template/pageinspect-source.html"
},function (source) {
    var connection=$.port("inspect");
    var items=$("body").html(source.main).find(".inpect-area-list-item");
    var container=$(".inpect-right");
    var tabcontainer=new tabs(items);

    var resultTab=tabcontainer.createTab({
        id:"result",
        template:source.result.trim(),
        container:container,
        override:{
            init:function () {
                var ths=this;
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                    $(this).click(function () {
                        ths.switchTab($(this).attr("action"),$(this));
                    });
                });
            },
            setBuilterOption:function (option) {
                this._buildoption=option;
            },
            getBuilterOption:function () {
                return this._buildoption;
            },
            getTabContainer:function () {
                return this.dom.find(".inpect-tab-body");
            },
            switchTab:function (action,dom) {
                if(!dom) {
                    this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                        if ($(this).attr("action") === action) {
                            dom = $(this);
                            return false;
                        }
                    });
                }
                this.dom.find(".inpect-tab-head-arrow").transition().all().scope().transform().x((dom.get(0).offsetLeft+dom.width()/2-10));
                for(var i=0;i<this.children.length;i++){
                    if(this.children[i].getId()===action){
                        this.children[i].show();
                    }else{
                        this.children[i].hide();
                    }
                }
            },
            setTime:function (time) {
                var a=new Date(time);
                var y=a.getFullYear(),M=a.getMonth()+1,d=a.getDate(),h=a.getHours(),m=a.getMinutes(),s=a.getSeconds();
                var str=(y<10?('0'+y):y)+"-"+
                    (M<10?('0'+M):M)+"-"+
                    (d<10?('0'+d):d)+" "+
                    (h<10?('0'+h):h)+":"+
                    (m<10?('0'+m):m)+":"+
                    (s<10?('0'+s):s);
                this.dom.find(".lasttime").html(str);
            },
            refresh:function (data) {
                console.log(data);
                this.hideOffline();
                var merge=[];
                for(var i in data.merges){
                    var a=data.merges[i];
                    merge.push({
                        name:a.name,
                        path:a.path,
                        done:a.done,
                        size:a.size,
                        packets:data.map.c[a.name.split(".")[0]]
                    });
                }
                this.getChild("make").refresh(data.make,data.mapping);
                this.getChild("output").refresh(data.output,data.mapping);
                this.getChild("merge").refresh(merge,data.mapping);
                this.getChild("page").refresh(data.pages,data.mapping);
                this.setTime(data.time);
            },
            offline:function () {
                this.showOffline();
            },
            online:function () {
                this.hideOffline();
            }
        }
    });
    resultTab.addChild(new tab({
        id:"make",
        template:source.result_make.trim(),
        container:resultTab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.refresh([],{});
            },
            refresh:function (data,mapping) {
                var ths=this;
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:"packet",rowClass:function (a,b) {
                            if(b.error.length>0){
                                return "errorline";
                            }else{
                                return "";
                            }
                        }},
                        {name:"path",width:150,key:"path",className:"path"},
                        {name:"error",width:50,key:"error",hook:function(data){
                            if(data.length>0){
                                return "<span class='numerror'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"error"},
                        {name:"warn",width:50,key:"warn",hook:function(data){
                            if(data.length>0){
                                return "<span class='numwarn'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"warn"}
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths._currentItem=index;
                            ths.showDetail(mapping[data[index].packet]);
                        });
                    });
                    if(ths._currentItem){
                        table.focusItem(ths._currentItem);
                        ths.showDetail(mapping[data[ths._currentItem].packet]);
                    }
                });
                this.dom.find(".inspect-tab-body-state").html("make "+data.length+" packet | time: 06 12:12:10");
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.find(".inpect-tab-body-tab").width(350);
                this.dom.addClass("showdetail");
                this.dom.find(".inpect-tab-body-detail").detail({
                    data:data,
                    focus:ths._detailNum,
                    onclose:function () {
                        ths.dom.find(".inpect-tab-body-tab").width("auto");
                        ths.dom.removeClass("showdetail");
                        ths._table.loseFoucus();
                    },
                    onfocus:function (num) {
                        ths._detailNum=num;
                    }
                });
            }
        }
    }));
    resultTab.addChild(new tab({
        id:"output",
        template:source.result_output.trim(),
        container:resultTab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
            },
            refresh:function (data) {
                this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:""},
                        {name:"path",width:260,key:"outpath",className:"path"},
                        {name:"result",width:50,key:"done",className:"result",hook:function (data) {
                            var str='<div style="color:green;text-align:center;">';
                            if(data===true){
                                str+="<i class='fa fa-check-circle'></i>";
                            }else{
                                str+="<i class='fa fa-times-circle'></i>";
                            }
                            str+="</div>";
                            return str;
                        }}
                    ],
                    data:data
                },function () {
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){

                        });
                    });
                });
                this.dom.find(".inspect-tab-body-state").html(data.length+" files");
            }
        }
    }));
    resultTab.addChild(new tab({
        id:"merge",
        template:source.result_merge.trim(),
        container:resultTab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
            },
            refresh:function (data) {
                console.log(data);
                this.dom.find(".inspect-tab-body-table").mergelist({
                    data:data
                },function () {
                });
                this.dom.find(".inspect-tab-body-state").html("merge "+data.length);
            }
        }
    }));
    resultTab.addChild(new tab({
        id:"page",
        template:source.result_page.trim(),
        container:resultTab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
            },
            refresh:function (data) {
                console.log(data);
                this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"path",width:240,key:"path",className:"path"},
                        {name:"result",width:50,key:"done",className:"result",hook:function (data) {
                            var str='<div style="color:green;text-align:center;">';
                            if(data===true){
                                str+="<i class='fa fa-check-circle'></i>";
                            }else{
                                str+="<i class='fa fa-times-circle'></i>";
                            }
                            str+="</div>";
                            return str;
                        }}
                    ],
                    data:data
                },function () {
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){

                        });
                    });
                });
                this.dom.find(".inspect-tab-body-state").html("edited "+data.length+" pages");
            }
        }
    }));
    resultTab.switchTab("make");

    var pageinspecttab=tabcontainer.createTab({
        id:"pageinspect",
        template:source.pageinspect.trim(),
        container:container,
        override: {
            init: function () {
                var ths = this;
                this.dom = $(this.option.template).appendTo(this.option.container);
                this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                    $(this).click(function () {
                        ths.switchTab($(this).attr("action"),$(this));
                    });
                });
            },
            getTabContainer:function () {
                return this.dom.find(".inpect-tab-body");
            },
            switchTab:function (action,dom) {
                if(!dom) {
                    this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                        if ($(this).attr("action") === action) {
                            dom = $(this);
                            return false;
                        }
                    });
                }
                this.dom.find(".inpect-tab-head-arrow").transition().all().scope().transform().x((dom.get(0).offsetLeft+dom.width()/2-10));
                for(var i=0;i<this.children.length;i++){
                    if(this.children[i].getId()===action){
                        this.children[i].show();
                    }else{
                        this.children[i].hide();
                    }
                }
            }
        }
    });
    pageinspecttab.addChild(new tab({
        id:"module",
        template:source.pageinspect_module.trim(),
        container:pageinspecttab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.refresh([],{});
            },
            refresh:function (data,mapping) {
                var ths=this;
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:"packet",rowClass:function (a,b) {
                            if(b.error.length>0){
                                return "errorline";
                            }else{
                                return "";
                            }
                        }},
                        {name:"path",width:150,key:"path",className:"path"},
                        {name:"error",width:50,key:"error",hook:function(data){
                            if(data.length>0){
                                return "<span class='numerror'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"error"},
                        {name:"warn",width:50,key:"warn",hook:function(data){
                            if(data.length>0){
                                return "<span class='numwarn'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"warn"}
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths._currentItem=index;
                            ths.showDetail(mapping[data[index].packet]);
                        });
                    });
                    if(ths._currentItem){
                        table.focusItem(ths._currentItem);
                        ths.showDetail(mapping[data[ths._currentItem].packet]);
                    }
                });
                this.dom.find(".inspect-tab-body-state").html("make "+data.length+" packet | time: 06 12:12:10");
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.find(".inpect-tab-body-tab").width(350);
                this.dom.addClass("showdetail");
                this.dom.find(".inpect-tab-body-detail").detail({
                    data:data,
                    focus:ths._detailNum,
                    onclose:function () {
                        ths.dom.find(".inpect-tab-body-tab").width("auto");
                        ths.dom.removeClass("showdetail");
                        ths._table.loseFoucus();
                    },
                    onfocus:function (num) {
                        ths._detailNum=num;
                    }
                });
            }
        }
    }));
    pageinspecttab.addChild(new tab({
        id:"option",
        template:source.pageinspect_option.trim(),
        container:pageinspecttab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.refresh([],{});
            },
            refresh:function (data,mapping) {
                var ths=this;
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:"packet",rowClass:function (a,b) {
                            if(b.error.length>0){
                                return "errorline";
                            }else{
                                return "";
                            }
                        }},
                        {name:"path",width:150,key:"path",className:"path"},
                        {name:"error",width:50,key:"error",hook:function(data){
                            if(data.length>0){
                                return "<span class='numerror'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"error"},
                        {name:"warn",width:50,key:"warn",hook:function(data){
                            if(data.length>0){
                                return "<span class='numwarn'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"warn"}
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths._currentItem=index;
                            ths.showDetail(mapping[data[index].packet]);
                        });
                    });
                    if(ths._currentItem){
                        table.focusItem(ths._currentItem);
                        ths.showDetail(mapping[data[ths._currentItem].packet]);
                    }
                });
                this.dom.find(".inspect-tab-body-state").html("make "+data.length+" packet | time: 06 12:12:10");
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.find(".inpect-tab-body-tab").width(350);
                this.dom.addClass("showdetail");
                this.dom.find(".inpect-tab-body-detail").detail({
                    data:data,
                    focus:ths._detailNum,
                    onclose:function () {
                        ths.dom.find(".inpect-tab-body-tab").width("auto");
                        ths.dom.removeClass("showdetail");
                        ths._table.loseFoucus();
                    },
                    onfocus:function (num) {
                        ths._detailNum=num;
                    }
                });
            }
        }
    }));
    pageinspecttab.addChild(new tab({
        id:"require",
        template:source.pageinspect_require.trim(),
        container:pageinspecttab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.refresh([],{});
            },
            refresh:function (data,mapping) {
                var ths=this;
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:"packet",rowClass:function (a,b) {
                            if(b.error.length>0){
                                return "errorline";
                            }else{
                                return "";
                            }
                        }},
                        {name:"path",width:150,key:"path",className:"path"},
                        {name:"error",width:50,key:"error",hook:function(data){
                            if(data.length>0){
                                return "<span class='numerror'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"error"},
                        {name:"warn",width:50,key:"warn",hook:function(data){
                            if(data.length>0){
                                return "<span class='numwarn'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"warn"}
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths._currentItem=index;
                            ths.showDetail(mapping[data[index].packet]);
                        });
                    });
                    if(ths._currentItem){
                        table.focusItem(ths._currentItem);
                        ths.showDetail(mapping[data[ths._currentItem].packet]);
                    }
                });
                this.dom.find(".inspect-tab-body-state").html("make "+data.length+" packet | time: 06 12:12:10");
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.find(".inpect-tab-body-tab").width(350);
                this.dom.addClass("showdetail");
                this.dom.find(".inpect-tab-body-detail").detail({
                    data:data,
                    focus:ths._detailNum,
                    onclose:function () {
                        ths.dom.find(".inpect-tab-body-tab").width("auto");
                        ths.dom.removeClass("showdetail");
                        ths._table.loseFoucus();
                    },
                    onfocus:function (num) {
                        ths._detailNum=num;
                    }
                });
            }
        }
    }));
    pageinspecttab.addChild(new tab({
        id:"source",
        template:source.pageinspect_source.trim(),
        container:pageinspecttab.getTabContainer(),
        override:{
            init:function () {
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.refresh([],{});
            },
            refresh:function (data,mapping) {
                var ths=this;
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"packet",width:260,key:"packet",className:"packet",rowClass:function (a,b) {
                            if(b.error.length>0){
                                return "errorline";
                            }else{
                                return "";
                            }
                        }},
                        {name:"path",width:150,key:"path",className:"path"},
                        {name:"error",width:50,key:"error",hook:function(data){
                            if(data.length>0){
                                return "<span class='numerror'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"error"},
                        {name:"warn",width:50,key:"warn",hook:function(data){
                            if(data.length>0){
                                return "<span class='numwarn'>"+data.length+"</span>";
                            }else{
                                return "-";
                            }
                        },className:"warn"}
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths._currentItem=index;
                            ths.showDetail(mapping[data[index].packet]);
                        });
                    });
                    if(ths._currentItem){
                        table.focusItem(ths._currentItem);
                        ths.showDetail(mapping[data[ths._currentItem].packet]);
                    }
                });
                this.dom.find(".inspect-tab-body-state").html("make "+data.length+" packet | time: 06 12:12:10");
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.find(".inpect-tab-body-tab").width(350);
                this.dom.addClass("showdetail");
                this.dom.find(".inpect-tab-body-detail").detail({
                    data:data,
                    focus:ths._detailNum,
                    onclose:function () {
                        ths.dom.find(".inpect-tab-body-tab").width("auto");
                        ths.dom.removeClass("showdetail");
                        ths._table.loseFoucus();
                    },
                    onfocus:function (num) {
                        ths._detailNum=num;
                    }
                });
            }
        }
    }));
    pageinspecttab.switchTab("module");

    var nodeinspectwatchertab=tabcontainer.createTab({
        id:"nodeinspectwatcher",
        template:source.inspectwatcher.trim(),
        container:container,
        override: {
            init: function () {
                var ths = this;
                this.dom = $(this.option.template).appendTo(this.option.container);
                this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                    $(this).click(function () {
                        ths.switchTab($(this).attr("action"), $(this));
                    });
                });
            },
            getTabContainer:function () {
                return this.dom.find(".inpect-tab-body");
            },
            switchTab:function (action,dom) {
                if(!dom) {
                    this.dom.find(".inpect-tab-head-tabs-tab").each(function () {
                        if ($(this).attr("action") === action) {
                            dom = $(this);
                            return false;
                        }
                    });
                }
                this.dom.find(".inpect-tab-head-arrow").transition().all().scope().transform().x((dom.get(0).offsetLeft+dom.width()/2-10));
                for(var i=0;i<this.children.length;i++){
                    if(this.children[i].getId()===action){
                        this.children[i].show();
                    }else{
                        this.children[i].hide();
                    }
                }
            }
        }
    });
    nodeinspectwatchertab.addChild(new tab({
        id:"option",
        template:source.inspectwatcher_option.trim(),
        container:nodeinspectwatchertab.getTabContainer(),
        override:{
            init:function () {
                var ths=this;
                this.dom=$(this.option.template).appendTo(this.option.container);
                this.dom.find(".inspect-tab-body-btn").click(function () {
                    ths.dom.addClass("showform");
                    if(ths._table){
                        ths._table.loseFoucus();
                    }
                    ths._form=ths.dom.find(".inspect-tab-body-form").form({
                        data:{
                            title:"Add Option",
                            fields:[
                                {type:"input",label:"Host",value:"localhost",name:"host"},
                                {type:"input",label:"Port",value:9229,name:"port"},
                                {type:"option",label:"Circle",value:"3000",name:"circle",option:[
                                    {key:"1s",value:"1000"},
                                    {key:"3s",value:"3000"},
                                    {key:"5s",value:"5000"},
                                    {key:"10s",value:"10000"},
                                    {key:"20s",value:"20000"}
                                ]}
                            ]
                        },
                        onclose:function () {
                            ths.dom.removeClass("showform");
                        },
                        onsave:function () {
                            var r=this.getValue();
                            console.log(JSON.stringify(r));
                            r.circle=r.circle/1;
                            r.enable=true;
                            r.closewin=true;
                            r.port=r.port/1;
                            connection.send("addwatcher",r);
                        }
                    });
                });
            },
            refresh:function (data) {
                var ths=this;
                this.dom.removeClass("showform");
                this._table=this.dom.find(".inspect-tab-body-table").table({
                    head:[
                        {name:"on",width:40,key:"enable",className:"enable",hook:function (data) {
                            if(data){
                                return "<div style='text-align: center'><input type='checkbox' checked/></div>";
                            }else{
                                return "<div style='text-align: center'><input type='checkbox'/></div>";
                            }
                        }},
                        {name:"state",width:50,key:"error",className:"error",hook:function (data) {
                            if(data){
                                return "<div style='text-align: center;color:red;'><i class='fa fa-times-circle'></i></div>";
                            }else{
                                return "<div style='text-align: center;color:forestgreen;'><i class='fa fa-check-circle'></i></div>";
                            }
                        }},
                        {name:"host",width:100,key:"host",className:"packet"},
                        {name:"port",width:100,key:"port",className:"port"},
                        {name:"circle",width:100,key:"circle",className:"circle",hook:function (a) {
                            return a/1000+"s";
                        }},
                        {name:"isclose",width:60,key:"closewin",className:"closewin",hook:function (data) {
                            if(data){
                                return "<div style='text-align: center'><input type='checkbox' checked/></div>";
                            }else{
                                return "<div style='text-align: center'><input type='checkbox'/></div>";
                            }
                        }},
                        {name:"remove",width:60,key:"no",className:"remove",hook:function () {
                            return "<div style='text-align: center'><i class='fa fa-times'></i></div>";
                        }},
                    ],
                    data:data
                },function () {
                    var table=this;
                    this.dom.find(".packet").children().each(function () {
                        $(this).click(function(){
                            var index=$(this).attr("num");
                            table.focusItem(index);
                            ths.showDetail(data[index]);
                        });
                    });
                    this.dom.find(".remove").children().each(function () {
                        $(this).click(function () {
                            var index=$(this).attr("num");
                            connection.send("removewatcher",data[index]);
                        });
                    });
                    this.dom.find(".enable").children().each(function () {
                        $(this).click(function () {
                            var index=$(this).attr("num");
                            connection.send("editwatcher",$.extend(data[index],{
                                enable:$(this).find("input").get(0).checked
                            }));
                        });
                    });
                    this.dom.find(".closewin").children().each(function () {
                        $(this).click(function () {
                            var index=$(this).attr("num");
                            connection.send("editwatcher",$.extend(data[index],{
                                closewin:$(this).find("input").get(0).checked
                            }));
                        });
                    });
                    if(data.length>=5){
                        ths.dom.find(".inspect-tab-body-btn").hide();
                    }else{
                        ths.dom.find(".inspect-tab-body-btn").css("display","inline-block");
                    }
                    ths.dom.find(".inspect-tab-body-total").html(data.length+"/5 watcher");
                });
            },
            showDetail:function (data) {
                var ths=this;
                this.dom.addClass("showform");
                this._form=this.dom.find(".inspect-tab-body-form").form({
                    data:{
                        title:"Edit Option",
                        fields:[
                            {type:"option",label:"Circle",value:data.circle,name:"circle",option:[
                                {key:"1s",value:"1000"},
                                {key:"3s",value:"3000"},
                                {key:"5s",value:"5000"},
                                {key:"10s",value:"10000"},
                                {key:"20s",value:"20000"}
                            ]}
                        ]
                    },
                    onclose:function () {
                        ths.dom.removeClass("showform");
                        ths._table.loseFoucus();
                    },
                    onsave:function () {
                        var r=this.getValue();
                        data.circle=r.circle/1;
                        connection.send("editwatcher",data);
                    }
                });
            },
            showError:function (info) {
                if(this._form) {
                    this._form.showError("already exit the watcher");
                }
            }
        }
    }));
    nodeinspectwatchertab.switchTab("option");

    tabcontainer.switchTab("pageinspect");

    connection.bind("state",function (info,response) {
        var connected=info.connected;
        if(connected){
            resultTab.setBuilterOption(info.option);
            resultTab.refresh(info.cache.info);
        }else{
        }
    }).bind("disconnect",function () {
        resultTab.offline();
    }).bind("connect",function () {
        console.log("-connect-");
    }).bind("build",function (data) {
        resultTab.refresh(data.info);
    }).bind("watcherlist",function (data) {
        nodeinspectwatchertab.getChild("option").refresh(data);
    }).bind("changeerror",function (data) {
        nodeinspectwatchertab.getChild("option").showError(data);
    });
    connection.send("state");
    connection.send("watcherlist");
});
