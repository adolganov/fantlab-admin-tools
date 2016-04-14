chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if (request.action == "fillComics") {
        var cnt = 0;
        request.comics.forEach(function(comic) {
            var msg = {action: "fillComics", comics: comic, writers: request.writers, artists: request.artists};
            var hasWriter = comic.writer && comic.writer.length > 0;

            if (comic.stories.length > 0) {
                var storiesAdded = 0;
                comic.stories.forEach(function(story) {

                    if (hasWriter || (story.writer && story.writer.length > 0)) {
                        if(!story.writer || story.writer.length == 0) {
                            story.writer = comic.writer;
                        }
                        story.series = comic.series;
                        story.year = comic.year;
                        story.month = comic.month;
                        story.num = "";

                        storiesAdded++;
                        waitThenCreateTabAndSendMessage(
                            {url: "https://fantlab.ru/autor" + request.writers[story.writer[0]] + "/addwork"},
                            {action: "fillComics", comics: story, writers: request.writers, artists: request.artists},
                            cnt
                        );
                        cnt++;
                    }
                });

                if (storiesAdded > 0) {
                    if (!hasWriter) {
                        if (comic.editor && comic.editor.length > 0) {
                            comic.writer = comic.editor;
                        } else {
                            comic.writer = ["AnonymousEditor"];
                            request.writers.AnonymousEditor = 2000;
                        }
                        msg.action = "fillAnthology";
                    } else {
                        msg.action = "fillCollection";
                    }
                }
            }

            waitThenCreateTabAndSendMessage(
                {url: "https://fantlab.ru/autor" + request.writers[comic.writer[0]] + "/addwork"},
                msg,
                cnt
            );
            cnt++;
        });
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

function waitThenCreateTabAndSendMessage(url, msg, delay) {
    setTimeout(createTabAndSendMessage, delay * 200, url, msg);
}
