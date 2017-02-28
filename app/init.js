var getNodeInfo = function () {
    if (window.topolr && $ === topolr) {
        if ($($0).hasClass("incache")) {
            if ($($0).data("-view-")) {
                return $($0).data("-view-");
            }
        }
    }
    return {Mes: "it is not a topolr module"};
};
chrome.devtools.panels.elements.createSidebarPane("Module", function (sidebar) {
    function updateElementProperties() {
        sidebar.setExpression("(" + getNodeInfo.toString() + ")()");
    }
    updateElementProperties();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
});
chrome.devtools.panels.create("Topolr", "logo/16.png", "pages/devtools.html");