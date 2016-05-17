var webElements = new Array(new Array(),new Array());
var m=0;

/*
设置固定表头
*/
(function ($) {
    $.fn.extend({
        FixedHead: function (options) {
            var op = $.extend({ tableLayout: "auto" }, options);
            return this.each(function () {
                var $this = $(this); //指向当前的table
                var $thisParentDiv = $(this).parent(); //指向当前table的父级DIV，这个DIV要自己手动加上去
                $thisParentDiv.wrap("<div id='hoverTableFixed' class='fixedtablewrap' style='border-radius:4px;'></div>").parent().css(
                    { "position": "relative", "overflow": "hidden", "width": "98%", "height": "85%", "margin": "0 auto", "border": "1px solid #348dd9" }); //在当前table的父级DIV上，再加一个DIV
                if (document.documentElement.clientHeight <= 765) {
                    $("#hoverTableFixed").css("height", "80%");
                }

                var x = $thisParentDiv.position();

                var fixedDiv = $("<div id='hoverTableHeadFixed' class='fixedheadwrap' style='clear:both;overflow:hidden;z-index:999999999;position:absolute;background-color: rgb(255, 255, 255);' ></div>")
                    .insertBefore($thisParentDiv)//在当前table的父级DIV的前面加一个DIV，此DIV用来包装tabelr的表头
                    .css({ "width": "100%", "left": x.left, "top": x.top });

                var $thisClone = $this.clone(true);
                $thisClone[0].id = "webelementsFixed";
                $thisClone.css("width", $this[0].scrollWidth + 20);
                
                // $thisClone.find("tbody").remove(); //复制一份table，并将tbody中的内容删除，这样就仅余thead，所以要求表格的表头要放在thead中
                while ($thisClone[0].children.length >= 2) {
                    $thisClone[0].removeChild($thisClone[0].children[$thisClone[0].children.length - 1])
                }
                $thisClone.appendTo(fixedDiv); //将表头添加到fixedDiv中

                // $this.css({ "marginTop": 0, "table-layout": op.tableLayout });
                //当前TABLE的父级DIV有水平滚动条，并水平滚动时，同时滚动包装thead的DIV
                $thisParentDiv.scroll(function () {
                    fixedDiv[0].scrollLeft = $(this)[0].scrollLeft;
                });

                //因为固定后的表头与原来的表格分离开了，难免会有一些宽度问题
                //下面的代码是将原来表格中每一个TD的宽度赋给新的固定表头
                var $fixHeadTrs = $thisClone.find("thead tr");
                var $orginalHeadTrs = $this.find("thead");
                $fixHeadTrs.each(function (indexTr) {
                    var $curFixTds = $(this).find("th");
                    var $curOrgTr = $orginalHeadTrs.find("tr:eq(" + indexTr + ")");
                    $curFixTds.each(function (indexTd) {
                        $(this).css("width", $curOrgTr.find("th:eq(" + indexTd + ")").width() + 1 + (indexTd == $curFixTds.length - 1 ? 20 : 0));
                        // $(this)[0].setAttribute("style", $(this)[0].getAttributeValue("style") + "clientWidth:" + $curOrgTr.find("th:eq(" + indexTd + ")")[0].clientWidth);
                        // $(this)[0].style.clientWidth = $curOrgTr.find("th:eq(" + indexTd + ")")[0].clientWidth;
                    });
                });
                
                $thisParentDiv.scroll(function() {
                    document.getElementById("hoverTableFixed").scrollLeft = this.scrollLeft;
                });
            });
        }
    });
})(jQuery);

// getExternalCss(document);

function getAllElements() {
    m=0;
    webElements = new Array(new Array(),new Array());

    //获取最外层的元素
    getWebElements(document);

    //获取各个iframe里的元素
    $("iframe").each(function(){
        if (this.contentWindow.document.domain == window.document.domain) {
            if(this.name!=null && this.name!="" && this.name!=undefined){
                getWebElements(window.frames[this.name].document);
                return true;
            }
            if(this.id!=null && this.id!="" && this.id!=undefined){
                getWebElements(window.frames[this.id].contentDocument);
            }
        }
    });

    //获取各个frame里的元素
    $("frame").each(function(){
        if (this.contentWindow.document.domain == window.document.domain) {
            if (this.name != null && this.name != "" && this.name != undefined) {
                getWebElements(window.frames[this.name].document);
                return true;
            }
            if (this.id != null && this.id != "" && this.id != undefined) {
                getWebElements(window.frames[this.id].contentDocument);
            }
        }
    });
}

function getWebElements(root){
    var inputTagElements = $(root).find("input");
    $(inputTagElements).each(function(){
        if(/*(this.type=="submit" || this.type=="text" || this.type=="password" || this.type=="image"
            || this.type=="checkbox" || this.type=="radio" || this.type=="button" || this.type=="reset") &&*/ this.type != "hidden" && this.style.display != "none"
            && (!this.id || (this.id != "setOpacity" && this.id != "closeHover" && this.id != "pageBeanPkgName" && this.id != "pageBeanName" && this.id != "genBeansCode"
                && this.id != "chooseAllEle" && this.id != "chooseNoneEle" && this.id != "closeSingleTable" && this.id != "genSingleCode" && this.id != "singleNameInput" && this.id != "singleDescInput"))
            && (!this.name || (this.name != "singleCheckbox"))
            && window.getComputedStyle(this).getPropertyValue("display") != "none"
            && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none") {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            //暂时根据readonly区别是否是日历控件
            if(this.type=="text" && this.readOnly){
                webElements[m][4] = "Calendar";
            }else if(this.type == "submit" || this.type == "reset" || this.type == "button" || this.type == "image") {
                webElements[m][4] = "Click";
            }else if(this.type == "checkbox" || this.type == "radio"){
                webElements[m][4] = "Check";
            }else if(this.type == "file"){
                webElements[m][4] = "FileInput";
            }else{
                webElements[m][4] = "Text";
            }
            m++;
        }
    });

    var buttonTagElements = $(root).find("button");
    $(buttonTagElements).each(function(){
        if (window.getComputedStyle(this).getPropertyValue("display") != "none" && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none") {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            webElements[m][4] = "Click";
            m++;
        }
    });

    var textareaElements = $(root).find("textarea");
    $(textareaElements).each(function(){
        if (window.getComputedStyle(this).getPropertyValue("display") != "none" && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none") {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            webElements[m][4] = "Text";
            m++;
        }
    });

    var selectElements = $(root).find("select");
    $(selectElements).each(function(){
        if (window.getComputedStyle(this).getPropertyValue("display") != "none" && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none") {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            webElements[m][4] = "Select";
            m++;
        }
    });

    var aTagElements = $(root).find("a");
    $(aTagElements).each(function(){
        if (window.getComputedStyle(this).getPropertyValue("display") != "none" && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none") {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            webElements[m][4] = "Click";
            m++;
        }
    });

    var aTagElements = $(root).find("table");
    $(aTagElements).each(function(){
        if (window.getComputedStyle(this).getPropertyValue("display") != "none" && window.getComputedStyle(this.parentNode).getPropertyValue("display") != "none"
                && (!this.id || (this.id != "webelements" && this.id != "webelementsFixed" ))) {
            webElements[m]=[];
            webElements[m][0] = this;
            webElements[m][1] = showRules(this);
            webElements[m][2] = getXpath(this);
            webElements[m][3] = getFrameNameByElement(this);
            webElements[m][4] = "Table";
            m++;
        }
    });
}


// function getExternalCss(document){
//   var linkTagElements = $(document).find("link");
//   $(linkTagElements).each(function(){
//     if(this.href.indexOf(".css")!=-1 && this.href!==null && this.href!=="" && this.href!==undefined){
//       webElements[m]=[];
//       webElements[m][0]=this.href;
//       webElements[m][4]="link";
//       m++
//     }
//   });
// }

//展示规则过滤
function showRules(e){
    var htmlText;
    if(e.parentNode.nodeName.toLowerCase()!="form" && e.parentNode.children.length<=3){
        htmlText = e.parentNode.outerHTML;
    }else if(e.nodeName.toLowerCase()=="input" && e.type=="text" && $(e).prev()[0] && $(e).prev()[0].tagName.toLowerCase()=="label"){
        htmlText =  $(e).prev()[0].outerHTML;
        htmlText = e.outerHTML + htmlText;
    }else{
        htmlText = e.outerHTML;
    }
    return htmlText;
}

function getAttributeValue(e,attrName){
    var attrs = e.attributes;
    var filter = new Array();
    filter.push(attrName);
    for(var i=0; i<attrs.length; i++){
        if(filter.indexOf(attrs[i].name)!=-1 && attrs[i].value!==null && attrs[i].value!=="" && attrs[i].value!==undefined){
            return attrs[i].value;
        }
    }
    return -1;
}

function getXpath(e){

    var attrs = e.attributes;
    frameName = getFrameNameByElement(e);

    var id = e.id;
    var name = e.name;
    var nodeName = e.nodeName.toLowerCase();

    var ap = getAllXpath(e);

    var xpathArray = new Array();
    var i = 0;
    var flag = true;
    var tempXpath;

    if(getAttributeValue(e,"id")!=-1){
        tempXpath = "//" + nodeName + "[@id='" + id + "']";
        xpathArray.push(tempXpath);
        if(isUnique(tempXpath)==1){
            flag =false;
        }
    }

    if(getAttributeValue(e,"name")!=-1){
        tempXpath ="//" + nodeName + "[@name='" + name + "']";
        xpathArray.push(tempXpath);
        if(isUnique(tempXpath)==1){
            flag =false;
        }
    }

    tempXpath = getXpathByText(e);
    if(tempXpath!=null){
        xpathArray.push(tempXpath);
        if(isUnique(tempXpath)==1){
            flag =false;
        }
    }

//    var filter = ["value","title","href","class","style"];
    var filter = ["value","title","class","style"];
    getXpathByAttr(filter,attrs,xpathArray,nodeName);

    if(flag){
        tempXpath= getXpathByParent(e);
        if(tempXpath!=null && tempXpath!=ap){
            xpathArray.push(tempXpath);
        }

        tempXpath = getXpathByChlid(e);
        if(tempXpath!=null && tempXpath!=ap){
            xpathArray.push(tempXpath);
        }

        tempXpath = getXpathByBrother(e);
        if(tempXpath!=null && tempXpath!=ap){
            xpathArray.push(tempXpath);
        }
    }

    xpathArray.push(ap);
    var temp = sort(xpathArray);
    xpathArray = temp;

    var rtnXpathArray = new Array();

    var xpathSize = xpathArray.length >= 3 ? 3 : xpathArray.length;
    for (var k = 0; k < xpathSize; k++) {
        rtnXpathArray.push(xpathArray[k]);
    }

    return rtnXpathArray;
}

function getFrameNameByElement(e) {
    var frame;
    var frameName = "";
    var flag = true;
    $("iframe").each(function(){
        if(e.ownerDocument === this.contentWindow.document) {
            frame = this;
            if(frame.name!=null && frame.name!="" && frame.name!=undefined){
                frameName = frame.name;
            }else{
                frameName = frame.id;
            }
            flag = false;
        }
    });
    if(flag){
        $("frame").each(function(){
            if(frame.name!=null && frame.name!="" && frame.name!=undefined) {
                frame = this;
                if(frame.name!=null){
                    frameName = frame.name;
                }else{
                    frameName = frame.id;
                }
            }
        });
    }
    return frameName;
}

//获取绝对路径
function getAllXpath(e) {

    var xpath = "";

    while (e.nodeName.toLowerCase() != "html") {
        var indexNode = getIndexOfElement(e);
        if( indexNode != null ){
            xpath = "/" + indexNode + xpath;
            e = e.parentNode;;
        }else{
            return false;
        }
    }
    if (xpath.substring(0, 2) != "//") { xpath = "/html" + xpath; }
    return xpath;
}

function getXpathByParent(e){

    var xpath = "";
    var size = 0;

    while (e.nodeName.toLowerCase() != "html") {

        var node = e.nodeName;
        node = node.toLowerCase();
        var tempXpath = getXpathByText(e);

        if(getAttributeValue(e,"id")!=-1){
            xpath = "//" + node + "[@id='" + e.id + "']" + xpath;
        }else if(getAttributeValue(e,"name")!=-1){
            xpath = "//" + node + "[@name='" + e.name + "']" + xpath;
        }else if(getAttributeValue(e,"title")!=-1){
            xpath = "//" + node + "[@title='" + getAttributeValue(e,"title") + "']" + xpath;
        }else if(tempXpath!=null && isUnique(tempXpath)==1){
            xpath = tempXpath + xpath;
        }else{
            var indexNode = getIndexOfElement(e);
            if( indexNode != null ){
                xpath = "/" + indexNode + xpath;
            }else{
                return false;
            }
        }
        if(isUnique(xpath)==1)
        {
            break;
        }
        size++;
        e = e.parentNode;
    }
    if (xpath.substring(0, 2) != "//") {
        xpath = "/html" + xpath;
    }
    return xpath;
}

function getXpathByChlid(e){

    var xpath = "";

    if (e.childElementCount>0) {

        var node = e.nodeName.toLowerCase();
        xpath = "/parent::" + node;

        var children = e.children;
        var i = 0;

        while(i<children.length) {

            node = children[i].nodeName.toLowerCase();

            if(getAttributeValue(children[i],"id")!=-1){
                xpath = "//" + node + "[@id='" + getAttributeValue(children[i],"id") + "']" + xpath;
                return xpath;
            }
            if(getAttributeValue(children[i],"name")!=-1){
                xpath = "//" + node + "[@name='" + getAttributeValue(children[i],"id") + "']" + xpath;
                return xpath;
            }
            if(getAttributeValue(children[i],"title")!=-1){
                xpath = "//" + node + "[@title='" + getAttributeValue(children[i],"title") + "']" + xpath;
                return xpath;
            }
            var tempXpath = getXpathByText(children[i]);
            if(tempXpath!=null && isUnique(tempXpath)==1){
                xpath = tempXpath + xpath;
                return xpath;
            }
            i++;
        }
    }
    return null;
}


function getXpathByBrother(e){

    var parent = e.parentNode;
    var children = $(parent).children();

    if (children.size() > 2) {

        var xpath = "";
        var flag = false;

        children.each(function(i) {

            if (this != e) {

                childNode = children[i].nodeName.toLowerCase();

                if(getAttributeValue(this,"id")!=-1){
                    xpath = "//" + childNode + "[@id='" + this.id + "']" + xpath;
                    flag = true;
                    return false;
                }
                if(getAttributeValue(this,"name")!=-1){
                    xpath = "//" + childNode + "[@name='" + this.name + "']" + xpath;
                    flag = true;
                    return false;
                }
                if(getAttributeValue(this,"title")!=-1){
                    xpath = "//" + childNode + "[@title='" + getAttributeValue(this,"title") + "']" + xpath;
                    flag = true;
                    return false;
                }
                var tempXpath = getXpathByText(e);
                if(tempXpath!=null&& isUnique(tempXpath)==1){
                    xpath = tempXpath + xpath;
                    flag = true;
                    return false;
                }
            }
        });
        if (flag) {
            var node = getIndexOfElement(e);
            var parentNode = parent.nodeName.toLowerCase();
            xpath = xpath + "/parent::" + parentNode + "/" + node;
            return xpath;
        }
    }
    return null;
}


function getXpathByText(e) {

    var text = $(e).contents().filter(function(){ return this.nodeType === 3;}).text();

    text = $.trim(text);

    if(text!=null && text!="" && text!=undefined){
        var nodeName = e.nodeName.toLowerCase();
        var xpath = "";
        var subText;
        var flag = false;

        for (var i = 5; i <= 50; i = i+5){
            subText = text.substring(0,i);
            subText = subText.replace(/\"/g,"");
            subText = subText.replace(/(^s*)|(s*$)/g,"");
            xpath = "//" + nodeName + "[contains(text(),'" + subText + "')]"
            if (isUnique(xpath)==1) {
                flag = true;
                break;
            }
        }
        return xpath;

    }else{
        return null;
    }
}

//根据属性生成xpath
function getXpathByAttr(filter,attrs,xpathArray,nodeName){
    var temp;
    for(var j=0; j<attrs.length; j++){
        if(filter.indexOf(attrs[j].name)!=-1 && attrs[j].value!=null){
            temp ="//" + nodeName + "[contains(@" + attrs[j].name + ",'" + attrs[j].value + "')]";
            xpathArray.push(temp);
        }
    }
}


//获取属性值
function getAttributeValue(e,attrName){
    var attrs = e.attributes;
    var filter = new Array();
    filter.push(attrName);
    for(var i=0; i<attrs.length; i++){
        if(filter.indexOf(attrs[i].name)!=-1 && attrs[i].value!==null && attrs[i].value!=="" && attrs[i].value!==undefined){
            return attrs[i].value;
        }
    }
    return -1;
}

//根据是否唯一排序
function sort(xpathArray){
    var temp1 = new Array();
    var temp;
    for (x in xpathArray) {
        temp = xpathArray[x];
        if(isUnique(temp)==1){
            temp1.push(temp);
        }
    };

    return temp1;
}

/*
 *result：2不唯一，1唯一，0不存在
 */
function isUnique(xpath){
    var unique;
    var elements;
    
    try {
        if (frameName!="") {
            elements = document.evaluate(xpath,frames[frameName].document || frames[frameName].contentDocument,null,XPathResult.ANY_TYPE,null);
        }else{
            elements = document.evaluate(xpath,document,null,XPathResult.ANY_TYPE,null);
        }
    } catch (err) {
        return 0;
    }

    var i = 0;
    while(elements.iterateNext()!=null){
        if(i>1){
            return 2;
        }else{
            i++;
        }
    }
    return i;
}

function getIndexOfElement(e){

    var node = e.nodeName.toLowerCase();
    var parent = e.parentNode;
    var children = $(parent).children(node);

    if (children.size() > 1) {
        var good = false;
        children.each(function(i) {
            if (this == e) {
                node = node + "[" + (i+1) + "]";
                good = true;
                return false;
            }
        });
        if(!good){
            console.log("Can't find child, something is wrong with your dom : " + node);
            return null;
        }
    }
    return node;
}

//chrome.extension.sendRequest(webElements);

chrome.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
    if (message == "TriggerAll") {
        showLinks();
    } else {
        showSingleElement(message);
    }
}

function genSingleXpathList(singleXpathArray) {
    var xpathListString = "";

    for (var xpath in singleXpathArray) {
        if (xpath > 0) {
            xpathListString += "<br/>";
        }

        var checkBox = "<input type='checkbox' checked='checked' name='singleCheckbox' style='font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;' value=\"" + singleXpathArray[xpath] + "\">";
        var label = "<label style='float:none;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;white-space:nowrap;nowrap:nowrap;' title=\"" + singleXpathArray[xpath] + "\">" + (singleXpathArray[xpath].length > 45 ? singleXpathArray[xpath].substr(0, 42) + "..." : singleXpathArray[xpath]) + "</label>";

        xpathListString += checkBox + label;
    }

    return xpathListString
}

function showSingleElement(controlInfoArray) {
    if (document.getElementById("hoverWebEle")) {
        document.getElementById("hoverWebEle").style.display = "none";
    }

    var node = $("#hoverSingleEle");

    if (node.size() === 0) {
        $(document.body).append("<div id='hoverSingleEle'>" +
            "<br><div id='hoverSingleTable' style='width:95%;height:88%;overflow:auto;margin:0 auto;'>" +
            "<table style='width: 100%;box-sizing:content-box;table-layout: auto;border:1px solid #348dd9;border-radius: 4px;white-space:nowrap;background-color: transparent;border-collapse: collapse;border-spacing: 0;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<tr><td style='width: 30%;table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: bold;'>Frame</td>" +
            "<td style='width: 70%;table-layout: auto;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<div id='singleFrame'>" + controlInfoArray[0] + "</div></td></tr>" +
            "<tr><td style='width: 30%;table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: bold;'>控件类型</td>" +
            "<td style='width: 70%;table-layout: auto;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<div id='singleType'>" + controlInfoArray[1] + "</td></tr>" +
            "<tr><td style='width: 30%;table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: bold;'>XPATH</td>" +
            "<td style='width: 70%;table-layout: auto;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<div id='singleXpath' style='width:300px;overflow:hidden;'>" + genSingleXpathList(controlInfoArray[2]) + "</div>" +
            "</td></tr>" +
            "<tr><td style='width: 30%;table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: bold;'>控件名称</td>" +
            "<td style='width: 70%;table-layout: auto;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<div id='singleName'><input type='text' id='singleNameInput' style='width:100%;border: 1px solid #348dd9;border-radius: 4px;font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;' value='" + controlInfoArray[3] + "'></div>" +
            "</td></tr>" +
            "<tr><td style='width: 30%;table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: bold;'>控件描述</td>" +
            "<td style='width: 70%;table-layout: auto;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;'>" +
            "<div id='singleDesc'><input type='text' id='singleDescInput' style='width:100%;border: 1px solid #348dd9;border-radius: 4px;font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;' value='" + controlInfoArray[3] + "'></div>" +
            "</td></tr>" +
            "</table></div>" +
            "<input id='closeSingleTable' type='button' value='关闭' onclick='document.getElementById(\"hoverSingleEle\").style.display=\"none\"' style='font-size:14px;color:#ffffff;border-radius: 10px;width:90px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "&nbsp;&nbsp;&nbsp;&nbsp;<input id='genSingleCode' type='button' value='生成代码' style='font-size:14px;color:#ffffff;border-radius: 10px;width:90px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "</div>");

        node = $("#hoverSingleEle");

        node
            .css("position", "absolute")
            .css("display", "block")
            .css('background-color', "#ffffff")
            .css('padding', '4px')
            .css('width', "510px")
            .css('height', "360px")
            .css('top', (document.documentElement.clientHeight - 360) / 2 + (document.documentElement.scrollTop || 0) + (document.body.scrollTop || 0))
            .css('left', (document.documentElement.clientWidth - 510) / 2 + (document.documentElement.scrollLeft || 0) + (document.body.scrollLeft || 0))
            .css("z-index", "999999999")
            .css('font-size','14px')
            .css('font-family', '\"Helvetica Neue\", Helvetica, Arial, sans-serif;')
            .css('color', '#333333')
            .css('text-align', 'center')
            .css('overflow', 'auto')
            .css('border','1px solid #348dd9')
            .css('border-radius', '4px')
            .css('opacity', '')
            .css('filter', '')
            .css('box-sizing','content-box')
            .click(function(ev) { ev.stopPropagation(); });

        $("#genSingleCode").click(genSingleCode);

        setInterval(dynamicPosSingle, 200);
    } else {
        document.getElementById("singleFrame").innerText = controlInfoArray[0];
        document.getElementById("singleType").innerText = controlInfoArray[1];
        $("#singleXpath").html(genSingleXpathList(controlInfoArray[2]));
        document.getElementById("singleNameInput").value = controlInfoArray[3];
        document.getElementById("singleDescInput").value = controlInfoArray[3];
    }

    document.getElementById("hoverSingleEle").style.display = "block";
}

// Display all visible links.
function showLinks() {
    if (document.getElementById("hoverSingleEle")) {
        document.getElementById("hoverSingleEle").style.display = "none";
    }

    var node = $("#hoverWebEle");
    if (node.size() === 0)  {
        $(document.body).append("<div id='hoverWebEle'>" +
            "<br><input type='button' id='setOpacity' value='透明' align='center' " +
            "onclick='javascript:" +
            "if(!document.getElementById(\"hoverWebEle\").style.opacity || document.getElementById(\"hoverWebEle\").style.opacity==\"\"){" +
            "document.getElementById(\"hoverWebEle\").style.opacity=\"0.3\";" +
            "document.getElementById(\"hoverWebEle\").style.filter=\"alpha(opacity=30)\";" +
            "document.getElementById(\"setOpacity\").value=\"不透明\";" +
            "}else{" +
            "document.getElementById(\"hoverWebEle\").style.opacity=\"\";" +
            "document.getElementById(\"hoverWebEle\").style.filter=\"\";" +
            "document.getElementById(\"setOpacity\").value=\"透明\";}' style='font-size:14px;color:#ffffff;border-radius: 10px;width:70px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<input type='button' id='closeHover' value='关闭' align='center' " +
            "onclick='javascript:document.getElementById(\"hoverWebEle\").style.display=\"none\";" +
            "document.getElementById(\"setOpacity\").value=\"透明\";' style='font-size:14px;color:#ffffff;border-radius: 10px;width:70px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "<br/>&nbsp;<br/><div id='hoverTable' style='width:100%;height:100%;overflow:auto;margin:0 auto;margin-left:-1px;'><div id='loadingTable' style='margin:0 auto;position:relative;'><br/><br/><br/><br/><p style='font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;font-size:20px;'>Loading...</p></div></div>" +
            "<br/><input id='chooseAllEle' type='button' value='全选' style='font-size:14px;color:#ffffff;border-radius: 10px;width:70px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "&nbsp;&nbsp;<input id='chooseNoneEle' type='button' value='全不选' style='font-size:14px;color:#ffffff;border-radius: 10px;width:70px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "&nbsp;&nbsp;<label style='font-size:14px;font-weight: normal;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>PageBean包名:</label>&nbsp;<input id='pageBeanPkgName' type='text' align='center' value='' style='width:20%;border:1px solid #348dd9;border-radius: 4px;font-size:14px;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;'>" +
            "&nbsp;&nbsp;<label style='font-size:14px;font-weight: normal;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>PageBean类名:</label>&nbsp;<input id='pageBeanName' type='text' align='center' value='' style='width:15%;border:1px solid #348dd9;border-radius: 4px;font-size:14px;;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;'>" +
            "&nbsp;&nbsp;<input id='genBeansCode' type='button' value='生成代码' style='font-size:14px;color:#ffffff;border-radius: 10px;width:90px;-webkit-appearance: button;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;border: 2px solid #348dd9;background-color: #348dd9;padding: 0px;height:20px;'>" +
            "</div>");

        $("#genBeansCode").click(generateJavaCode);
        $("#chooseAllEle").click(chooseAllEle);
        $("#chooseNoneEle").click(chooseNoneEle);

        node = $("#hoverWebEle");

        setInterval(dynamicPos, 200);
    }

    // node.innerHTML = "";

    node
        .css("position", "absolute")
        .css("display", "block")
        .css('background-color', "#ffffff")
        .css('padding', '4px')
        .css('width', document.documentElement.clientWidth * 0.8)
        .css('height', document.documentElement.clientHeight * 0.8)
        .css('top', document.documentElement.clientHeight * 0.1 + (document.documentElement.scrollTop || 0) + (document.body.scrollTop || 0))
        .css('left', document.documentElement.clientWidth * 0.1 + (document.documentElement.scrollLeft || 0) + (document.body.scrollLeft || 0))
        .css("z-index", "999999999")
        .css('font-size','14px')
        .css('font-family', '\"Helvetica Neue\", Helvetica, Arial, sans-serif;')
        .css('color', '#333333')
        .css('text-align', 'center')
        .css('overflow', 'auto')
        .css('border','1px solid #348dd9')
        .css('border-radius', '4px')
        .css('opacity', '')
        .css('filter', '')
        .css('box-sizing','content-box')
        .click(function(ev) { ev.stopPropagation(); });

    node = $("#hoverTable");

    var elementsTable = $("#webelements");
    if (elementsTable.size() == 0) {
        var table = document.createElement("table");
        var thead = document.createElement("thead");
        var header = document.createElement("tr");
        var head0 = document.createElement("th");
        var head1 = document.createElement("th");
        var head2 = document.createElement("th");
        var head3 = document.createElement("th");
        var head4 = document.createElement("th");
        var head5 = document.createElement("th");
        var head6 = document.createElement("th");

        head0.setAttribute("nowrap", "nowrap");
        head0.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;");
        head0.innerText = "序号";

        head1.setAttribute("nowrap", "nowrap");
        head1.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;");
        head1.innerText = "是否生成代码";

        head2.setAttribute("nowrap", "nowrap");
        head2.setAttribute("name", "controlDisplayTd");
        head2.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;width: " + getSuitableWidth() + "px;");
        head2.innerText = "控件展示";

        head3.setAttribute("nowrap", "nowrap");
        head3.setAttribute("name", "controlXpathTd");
        head3.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;width: " + getSuitableWidth() + "px;");
        head3.innerText = "XPATH";

        head4.setAttribute("nowrap", "nowrap");
        head4.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;");
        head4.innerText = "控件名称";

        head5.setAttribute("nowrap", "nowrap");
        head5.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;");
        head5.innerText = "控件描述";

        head6.setAttribute("nowrap", "nowrap");
        head6.setAttribute("style", "box-sizing:content-box;table-layout: auto;white-space:nowrap;text-align:center;border: 1px solid #348dd9;font-weight: bold;padding: 8px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;");
        head6.innerText = "控件类型";

        header.appendChild(head0);
        header.appendChild(head6);
        header.appendChild(head1);
        header.appendChild(head2);
        header.appendChild(head3);
        header.appendChild(head4);
        header.appendChild(head5);

        table.setAttribute("id", "webelements");
        //table.setAttribute("border", "1px");
        table.setAttribute("style", "box-sizing:content-box;table-layout: automatic;border:1px solid #348dd9;border-radius: 4px;white-space:nowrap;background-color: transparent;border-collapse: collapse;border-spacing: 0;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;");
        table.setAttribute("align", "center");

        thead.appendChild(header);

        table.appendChild(thead);

        node.prepend(table);
    }

    elementsTable = document.getElementById('webelements');

    while (elementsTable.children.length >= 2) {
        elementsTable.removeChild(elementsTable.children[elementsTable.children.length - 1])
    }
    
    document.getElementById("loadingTable").style.display = "block";
    
    setTimeout(loadPage, 20);
}
    
    
function loadPage() {
    var elementsTable = document.getElementById('webelements');
    
    getAllElements();

    var allElements = webElements;

    for (var i = 0; i < allElements.length; i++) {
        var row = document.createElement('tr');
        var col0 = document.createElement('td');
        var col1 = document.createElement('td');
        var col2 = document.createElement('td');
        var col3 = document.createElement('td');
        var col4 = document.createElement('td');
        var col5 = document.createElement('td');
        var col6 = document.createElement('td');

        var controlName = allElements[i][0].id ? allElements[i][0].id : (allElements[i][0].name ? allElements[i][0].name : "");
        controlName = controlName.replace(/[^a-zA-Z0-9]/,"");

        col0.innerText = i + 1;
        col0.setAttribute("style", "table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;");
        
        col6.innerText = allElements[i][4];
        col6.setAttribute("style", "table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;");

        var checkbox = document.createElement('input');
        checkbox.checked = controlName == "" ? false : true;
        checkbox.type = 'checkbox';
        checkbox.id = 'checkElements' + i;
        checkbox.value = allElements[i][3] + "|" + allElements[i][4];
        checkbox.setAttribute("style", "font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;");
        col1.appendChild(checkbox);
        col1.setAttribute("style", "table-layout: auto;text-align:center;border: 1px solid #348dd9;padding: 15px;");

        col2.innerHTML = "<div name='controlDisplayDiv' style=\"width: " + getSuitableWidth() + "px;height:50px;overflow:hidden;background-color:rgb(255, 255, 255);z-index:888888888;position:relative;\" onmouseover=\"this.style.overflow='visible'\" onmouseout=\"this.style.overflow='hidden'\">" + allElements[i][1] + "</div>";
        col2.setAttribute("style", "table-layout: auto;white-space:nowrap;text-align:left;border: 1px solid #348dd9;padding: 15px;width: " + getSuitableWidth() + "px;white-space:nowrap;nowrap:nowrap;");
        col2.setAttribute("name", "controlDisplayTd");

        var xpathDiv = document.createElement("div");
        xpathDiv.setAttribute("name", "controlXpathDiv");
        xpathDiv.setAttribute("style", "width: " + getSuitableWidth() + "px;overflow:hidden;background-color:rgb(255, 255, 255);z-index:777777777;white-space:nowrap;nowrap:nowrap;position:relative;");
        xpathDiv.onmouseover = function(){this.style.overflow='visible'};
        xpathDiv.onmouseout = function(){this.style.overflow='hidden'};

        for (var xpath in allElements[i][2]) {
            var checkboxXpath = document.createElement('input');
            checkboxXpath.checked = true;
            checkboxXpath.type = 'checkbox';
            checkboxXpath.name = 'checkboxXpath' + i;
            checkboxXpath.value = allElements[i][2][xpath];
            checkboxXpath.setAttribute("style", "font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;cursor: pointer;");

            var label = document.createElement('label');
            label.setAttribute("style", "float:none;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;white-space:nowrap;nowrap:nowrap;");
            label.innerText = allElements[i][2][xpath];

            var br = document.createElement('br');

            xpathDiv.appendChild(checkboxXpath);
            xpathDiv.appendChild(label);
            xpathDiv.appendChild(br);
        }

        col3.appendChild(xpathDiv);
        col3.setAttribute("name", "controlXpathTd");
        col3.setAttribute("style", "table-layout: auto;white-space:nowrap;text-align:left;border: 1px solid #348dd9;padding: 15px;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;width: " + getSuitableWidth() + "px;");

        var inputControlName = document.createElement("input");
        inputControlName.id = "controlName" + i;
        inputControlName.setAttribute("type", "text");
        inputControlName.setAttribute("style", "border: 1px solid #348dd9;border-radius: 4px;font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;");
        inputControlName.setAttribute("value",controlName);

        col4.appendChild(inputControlName);
        col4.setAttribute("style", "table-layout: auto;white-space:nowrap;text-align:left;border: 1px solid #348dd9;padding: 15px;");

        var inputControlDesc = document.createElement("input");
        inputControlDesc.id = "controlDesc" + i;
        inputControlDesc.setAttribute("type", "text");
        inputControlDesc.setAttribute("style", "border: 1px solid #348dd9;border-radius: 4px;font-size: 100%;margin: 0;vertical-align: middle;*overflow: visible;line-height: normal;font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;font-weight: normal;padding: 0px;height:20px;");
        inputControlDesc.setAttribute("value",controlName);

        col5.appendChild(inputControlDesc);
        col5.setAttribute("style", "table-layout: auto;white-space:nowrap;text-align:left;border: 1px solid #348dd9;padding: 15px;");

        row.appendChild(col0);
        row.appendChild(col6);
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);
        row.appendChild(col5);
        elementsTable.appendChild(row);
    }

    document.getElementById("hoverTable").scrollTop = 0;
    document.getElementById("loadingTable").style.display = "none";
    
    if (!document.getElementById("hoverTableFixed")) {
        $("#webelements").FixedHead({ tableLayout: "fixed" });
    }

    resizeHeader();
}

function dynamicPos() {
    var node = $("#hoverWebEle");
    if (node.size() != 0)  {
        node
            .css('width', document.documentElement.clientWidth * 0.8)
            .css('height', document.documentElement.clientHeight * 0.8)
            .css('top', document.documentElement.clientHeight * 0.1 + (document.documentElement.scrollTop || 0) + (document.body.scrollTop || 0))
            .css('left', document.documentElement.clientWidth * 0.1 + (document.documentElement.scrollLeft || 0) + (document.body.scrollLeft || 0));
    }
}

function dynamicPosSingle() {
    var node = $("#hoverSingleEle");
    if (node.size() != 0)  {
        node
            .css('top', (document.documentElement.clientHeight - 360) / 2 + (document.documentElement.scrollTop || 0) + (document.body.scrollTop || 0))
            .css('left', (document.documentElement.clientWidth  - 510) / 2 + (document.documentElement.scrollLeft || 0) + (document.body.scrollLeft || 0));
    }
}

var genSingleCode = function(e) {
    var singleFrame = document.getElementById("singleFrame").innerText;
    var singleType = document.getElementById("singleType").innerText;

    var singleXpathArray = new Array();

    $("input[name=singleCheckbox]:checked").each(function(){
        singleXpathArray.push("\"" + this.value + "\"");
    });

    if (singleXpathArray.length < 1) {
        alert("请至少选择一个XPATH！");
        return;
    }

    var singleXpath = singleXpathArray.join(", ");

    var singleName = document.getElementById("singleNameInput").value;
    if (singleName == "") {
        alert("请输入控件名称！");
        return;
    }

    var singleDesc = document.getElementById("singleDescInput").value;

    var beanCode = beanTemplate.replace("${xpath}",singleXpath)
        .replace("${frame}",singleFrame)
        .replace("${controlDesc}",singleDesc)
        .replace("${type}",singleType)
        .replace("${controlName}",singleName);

    chrome.runtime.sendMessage(beanCode);
}

var generateJavaCode = function(e) {
    if ($("#pageBeanName").val() == "") {
        alert("请输入PageBean类名");
        $("#pageBeanName").focus();
        return;
    }

    var beans = [];
    
    var controlNames = [];
    
    var controlDescs = [];

    var flag = true;

    $("input[id^='checkElements']:checked").each(function () {
        if (!flag) {
            return;
        }

        var id = this.id;
        var rowId = parseInt(this.id.replace("checkElements", "")) + 1;

        var frame = this.value.split("|")[0];
        var type = this.value.split("|")[1];

        var xpathCheckboxName = this.id.replace("checkElements", "checkboxXpath");
        var checkedXpathArray = [];
        $("input[name=" + xpathCheckboxName + "]:checked").each(function(){
            checkedXpathArray.push("\"" + this.value + "\"");
        });

        if (checkedXpathArray.length == 0) {
            alert("第" + rowId + "行请至少选择1个XPATH!");
            flag = false;
            return;
        }

        var checkedXpath = checkedXpathArray.join(", ");

        var controlName = document.getElementById(this.id.replace("checkElements", "controlName")).value;

        if (!controlName || controlName == "") {
            alert("第" + rowId + "行请输入控件名称!");
            document.getElementById(this.id.replace("checkElements", "controlName")).focus();
            flag = false;
            return;
        }
        
        if ($.inArray(controlName, controlNames) >= 0) {
            alert("第" + rowId + "行控件名称重复，请修改!");
            document.getElementById(this.id.replace("checkElements", "controlName")).focus();
            flag = false;
            return;
        } else {
            controlNames.push(controlName);
        }

        var controlDesc = document.getElementById(this.id.replace("checkElements", "controlDesc")).value;
        
        if (controlDesc && controlDesc != "") {
            if ($.inArray(controlDesc, controlDescs) >= 0) {
                alert("第" + rowId + "行控件描述重复，请修改!");
                document.getElementById(this.id.replace("checkElements", "controlDesc")).focus();
                flag = false;
            return;
            } else {
                controlDescs.push(controlDesc);
            }
        }

        var bean = [];
        bean[0] = checkedXpath;
        bean[1] = frame;
        bean[2] = controlDesc;
        bean[3] = type;
        bean[4] = controlName;

        beans.push(bean);
    });

    if (beans.length <= 0) {
        alert("请至少选择一个需要生成的控件!");
        flag = false;
    }

    if (!flag) {
        return;
    }

    var javaCode = "";

    if ($("#pageBeanPkgName").val() != "")
    {
        javaCode += packageTemplate.replace("${packageName}", $("#pageBeanPkgName").val());
    }

    javaCode += importTemplate;

    var beanCode = "";
    for (var i = 0; i < beans.length; i++) {
        beanCode += beanTemplate.replace("${xpath}",beans[i][0])
                                  .replace("${frame}",beans[i][1])
                                  .replace("${controlDesc}",beans[i][2])
                                  .replace("${type}",beans[i][3])
                                  .replace("${controlName}",beans[i][4]);
    }

    var classCode = classTemplate.replace("${className}",$("#pageBeanName").val())
                                    .replace("${className}",$("#pageBeanName").val())
                                    .replace("${beans}", beanCode);

    javaCode += classCode;

    var downLoadLink = document.createElement('a');

    var content = new Blob([javaCode]);

    var evt = document.createEvent("HTMLEvents");

    evt.initEvent("click");

    downLoadLink.download = $("#pageBeanName").val() + ".java";

    downLoadLink.href = URL.createObjectURL(content);

    downLoadLink.dispatchEvent(evt);
};

var packageTemplate = "package ${packageName};\r\n\r\n";

var importTemplate = "import lazy.test.ui.annotations.*;\r\n" +
                        "import lazy.test.ui.beans.PageBean;\r\n" +
                        "import lazy.test.ui.controls.*;\r\n" +
                        "import lazy.test.ui.browser.BrowserEmulator;\r\n\r\n";

var beanTemplate = "    @Xpath(xpath={${xpath}})\r\n" +
                      "    @Frame(frame=\"${frame}\")\r\n" +
                      "    @Description(description=\"${controlDesc}\")\r\n" +
                      "    public ${type} ${controlName};\r\n\r\n";

var classTemplate = "public class ${className} extends PageBean {\r\n\r\n" +
                        "${beans}" +
                        "    public ${className}(BrowserEmulator be) { super(be); }\r\n\r\n" +
                        "}";

var chooseAllEle = function(e) {
    $("input[id^='checkElements']").each(function () {
        this.checked = true;
    })
}

var chooseNoneEle = function(e) {
    $("input[id^='checkElements']:checked").each(function () {
        this.checked = false;
    })
}

$(window).resize(resizeHeader);

function resizeHeader() {
    if (document.getElementById("hoverWebEle") && document.getElementById("hoverWebEle").style.display == "none") {
        return;
    }

    $("td[name=controlDisplayTd]").each(function(){
            this.style.width = getSuitableWidth() + "px";
        });
        
    $("th[name=controlDisplayTd]").each(function(){
            this.style.width = getSuitableWidth() + 14 + "px";
        });
        
    $("div[name=controlDisplayDiv]").each(function(){
            this.style.width = getSuitableWidth() + "px";
        });
        
    $("td[name=controlXpathTd]").each(function(){
            this.style.width = getSuitableWidth() + "px";
        });
        
    $("th[name=controlXpathTd]").each(function(){
            this.style.width = getSuitableWidth() + 14 + "px";
        });
        
    $("div[name=controlXpathDiv]").each(function(){
            this.style.width = getSuitableWidth() + "px";
        });

    if (document.documentElement.clientHeight > 765) {
        $("#hoverTableFixed").css("height", "85%");
    } else {
        $("#hoverTableFixed").css("height", "80%");
    }
        
    // if ($("#webelementsFixed")[0] && $("#webelements")[0]) {
    //     $("#webelementsFixed").css("width", $("#webelements")[0].scrollWidth + 20);
    // }
    
    setTimeout(resetHeaderWidth, 20);
}

function resetHeaderWidth() {
    if ($("#webelementsFixed")[0] && $("#webelements")[0]) {
        $("#webelementsFixed").css("width", $("#webelements")[0].scrollWidth + 20);
    }
}

function getSuitableWidth() {
    var clientWidth = document.documentElement.clientWidth;
    
    if (clientWidth >= 1500) {
        return Math.floor(document.documentElement.clientWidth * 0.225);
    } else {
        return Math.floor(document.documentElement.clientWidth * 0.14);
    }
}