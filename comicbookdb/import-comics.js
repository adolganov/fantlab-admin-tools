$(function() {
    $(".page_headline").after(" <button id='fl-import'><img src='"+ chrome.runtime.getURL("fl.png") + "'/></button>");
    $("#fl-import").click(function() {
        var comicsInfo = parsePage($("body"));
        findCreatorIdsAndRun(comicsInfo);
    });
});
