function parsePage() {
    var comicsInfo = {};

    var headline = $(".page_headline");

    var tmp = headline.text().split(" - ");
    comicsInfo.series = /(.+)\s+\(\d+\)/.exec(tmp[0])[1];
    comicsInfo.num = tmp[1];

    comicsInfo.title = headline.nextAll(".page_subheadline").text().slice(1, -1);

    var creatorsTable = headline.siblings("table").first().find("strong").first();
    comicsInfo = extractCreators(creatorsTable, comicsInfo);
    //cover date
    var dt = $(".page_link[href^='coverdate.php']").text();
    var date = new Date(dt.trim());

    comicsInfo.year = date.getFullYear();
    comicsInfo.month = date.getMonth() + 1;

    //find ids for writers and pencillers
    var writers = {
        found: [],
        not_found: []
    };

    var defs = [];
    defs.push($.get("https://fantlab.ru/getautorstag/", {getautors: comicsInfo.writer.join(",")}, function(data) {
        var ents = data.split(/,\s*/);
        $.each(ents, function(index, val) {
            if (val.startsWith("[")) {
                writers.found.push(/\[autor=(\d+)\]/.exec(val)[1]);
            } else {
                writers.not_found.push(val);
            }
        });
    }));

    var artists = {
        found: [],
        not_found: []
    };
    $.each(comicsInfo.penciller, function(index, value) {
        var art = value.split(" - ")[0];
        defs.push($.get("https://fantlab.ru/search-mini-art", {searchq: art}, function(data) {
            var links = $(".search-result_left a", data);
            if (links.length == 1) {
                artists.found.push(/importStrArts\(\'(\d+)\'/.exec(links.attr("onClick"))[1]);
            } else {
                artists.not_found.push(art);
            }
        }));
    });

    $.when.apply($, defs).then(function( data, textStatus, jqXHR ) {
        chrome.runtime.sendMessage({action: "fillComics", comics: comicsInfo, writers: writers, artists: artists});
    });
};

function extractCreators(header, comicsInfo) {
    var type = /(\w+)\(/.exec(header.text())[1].toLowerCase();
    var creators = [];
    header.nextUntil("strong", "a").each(function(index) {
        creators.push($(this).text());
    });

    comicsInfo[type] = creators;

    var nextHeader = header.nextAll("strong").first();
    if (nextHeader.length > 0) {
        return extractCreators(nextHeader, comicsInfo);
    } else {
        return comicsInfo;
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.action == "run") {
        parsePage();
    }
});

chrome.runtime.sendMessage({action: "show"});
