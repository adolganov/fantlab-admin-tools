chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if (request.action == "fillComics") {
        var msg = request;

        if (request.comics.stories.length > 0) {
            var storiesAdded = 0;
            request.comics.stories.forEach(function(story) {
                if (story.writer && story.writer.length > 0) {
                    story.series = request.comics.series;
                    story.year = request.comics.year;
                    story.month = request.comics.month;
                    story.num = "";

                    storiesAdded++;
                    createTabAndSendMessage(
                        {url: "https://fantlab.ru/autor" + request.writers[story.writer[0]] + "/addwork"},
                        {action: "fillComics", comics: story, writers: request.writers, artists: request.artists}
                    );
                }
            });

            if (storiesAdded > 0) {
                if (!request.comics.writer || request.comics.writer.length == 0) {
                    request.comics.writer = request.comics.editor;
                }
                msg = {action: "fillCollection", comics: request.comics, writers: request.writers, artists: request.artists};
            }
        }

        createTabAndSendMessage(
            {url: "https://fantlab.ru/autor" + request.writers[request.comics.writer[0]] + "/addwork"},
            msg
        );
    }
});

function createTabAndSendMessage(url, msg) {
    chrome.tabs.create(url, function (tab) {
        var handler = function (tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === "complete") {
                chrome.tabs.onUpdated.removeListener(handler);
                chrome.tabs.sendMessage(tab.id, msg);
            }
        };

        chrome.tabs.onUpdated.addListener(handler);
        chrome.tabs.sendMessage(tab.id, msg, function (response) {
            if (response.ack === true)
                chrome.tabs.onUpdated.removeListener(handler);
        });
    });
}
