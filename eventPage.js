chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if (request.action == "show") {
        chrome.pageAction.show(sender.tab.id);
    } else if (request.action == "fillComics") {
        if (request.writers.not_found.length > 0 || request.artists.not_found.length > 0) {

        } else {
            chrome.tabs.create({url: "https://fantlab.ru/autor" + request.writers.found[0] + "/addwork"}, function (tab) {
                var handler = function (tabId, changeInfo) {
                    if (tabId === tab.id && changeInfo.status === "complete") {
                        chrome.tabs.onUpdated.removeListener(handler);
                        chrome.tabs.sendMessage(tab.id, request);
                    }
                };

                chrome.tabs.onUpdated.addListener(handler);
                chrome.tabs.sendMessage(tab.id, request, function (response) {
                    if (response.ack === true)
                        chrome.tabs.onUpdated.removeListener(handler);
                });
            });
        }
    }
});

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "run"});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    console.log(tabId + " / " + changeInfo.status);
});
