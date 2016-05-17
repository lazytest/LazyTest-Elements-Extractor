var clipboard = new Clipboard('.btn');

clipboard.on('success', function(e) {
    alert("代码已复制到剪贴板！");
    console.log(e);
});

clipboard.on('error', function(e) {
    alert("代码复制失败，请重试！");
    console.log(e);
});

var controlInfoArray = new Array();

var parentMenu;

var extractSelectedMenu = -1;

chrome.runtime.onMessage.addListener(function(message) {
    if (message == "ONLOAD") {
        chrome.contextMenus.removeAll();

        parentMenu = chrome.contextMenus.create({
            "title": "LazyTest Elements Extractor",
            "type": "normal", //菜单项类型 "checkbox", "radio","separator"
            "contexts": ["all"], //菜单项影响的页面元素 "anchor","image"
            "onclick": function () {
            } //单击时的处理函数
        });

        chrome.contextMenus.create({
            "parentId": parentMenu,
            "title": "Extract All",
            "type": "normal", //菜单项类型 "checkbox", "radio","separator"
            "contexts": ["all"], //菜单项影响的页面元素 "anchor","image"
            "onclick": function () {
                chrome.tabs.query({active: true}, function (tab) {
                    chrome.tabs.sendMessage(tab[0].id, "TriggerAll");
                });
            } //单击时的处理函数
        });
    } else if (message == "rmSingleMenu") {
        if (extractSelectedMenu != -1) {
            chrome.contextMenus.remove(extractSelectedMenu, function(){});
        }
    } else if (message instanceof Array) {
        controlInfoArray = message;

        if (extractSelectedMenu != -1) {
            chrome.contextMenus.remove(extractSelectedMenu, function(){});
        }

        extractSelectedMenu = chrome.contextMenus.create({
            "parentId": parentMenu,
            "title": "Extract Selected",
            "type": "normal", //菜单项类型 "checkbox", "radio","separator"
            "contexts": ["all"], //菜单项影响的页面元素 "anchor","image"
            "onclick": function () {
                chrome.tabs.query({active: true}, function (tab) {
                    chrome.tabs.sendMessage(tab[0].id, controlInfoArray);
                });
            } //单击时的处理函数
        });
    } else {
        document.getElementById("foo").value = message;

        var e = document.createEvent("MouseEvents");
        e.initEvent("click", true, true);
        document.getElementById("copy").dispatchEvent(e);
    }
});
