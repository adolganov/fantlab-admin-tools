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
        not_found: []
    };

    var defs = [];
    defs.push($.get("https://fantlab.ru/getautorstag/", {getautors: comicsInfo.writer.join(",")}, function(data) {
        var ents = data.split(/,\s*/);
        $.each(ents, function(index, val) {
            if (val.startsWith("[")) {
                var res = /\[autor=(\d+)\](.+)\[/.exec(val);
                writers[res[2]] = res[1];
            } else {
                writers.not_found.push(val);
            }
        });
    }));

    var artists = {
        not_found: []
    };
    $.each(comicsInfo.penciller, function(index, value) {
        var art = value.split(" - ")[0];
        defs.push($.get("https://fantlab.ru/search-mini-art", {searchq: art}, function(data) {
            var links = $(".search-result_left a", data);
            if (links.length == 1) {
                var res = /importStrArts\(\'(\d+)\'/.exec(links.attr("onClick"))[1];
                artists[value] = res;
            } else {
                artists.not_found.push(value);
            }
        }));
    });

    $.when.apply($, defs).then(function( data, textStatus, jqXHR ) {
        if (artists.not_found.length > 0 || writers.not_found.length > 0) {
            var dlg = $("<div id='fantlab-dlg'/>");
            if (writers.not_found.length > 0) {
                dlg.append("<h1>Авторы:</h1>");
                var wList = $("<ul/>");
                $.each(writers.not_found, function (idx, value) {
                    wList.append("<li><label for='aut" + idx + "'>" + value + "</label> <input type='text' id='aut" + idx + "' data='" + value + "'/>");
                });
                dlg.append(wList);
            }
            if (artists.not_found.length > 0) {
                dlg.append("<h1>Художники:</h1>");
                var aList = $("<ul/>");
                $.each(artists.not_found, function (idx, value) {
                    aList.append("<li><label for='art" + idx + "'>" + value + "</label> <input type='text' id='art" + idx + "' data='" + value + "'/>");
                });
                dlg.append(aList);
            }

            dlg.dialog({
                title: "Укажите id",
                modal: true,
                dialogClass: "no-close",
                buttons: {
                    "OK": function() {
                        var auts = {};
                        var arts = {};
                        var valid = true;
                        dlg.find("input").each(function(idx) {
                            var val = $(this).val().trim();
                            if (val.length > 0) {
                                if ($(this)[0].id.startsWith("art")) {
                                    arts[$(this).attr("data")] = val;
                                } else {
                                    auts[$(this).attr("data")] = val;
                                }
                            } else {
                                valid = false;
                            }
                        });

                        if (valid) {
                            $.extend(writers, auts);
                            $.extend(artists, arts);
                            writers.not_found = [];
                            artists.not_found = [];

                            $(this).dialog("close");
                            chrome.runtime.sendMessage({action: "fillComics", comics: comicsInfo, writers: writers, artists: artists});
                        }
                    }
                }
            });
        } else {
            chrome.runtime.sendMessage({action: "fillComics", comics: comicsInfo, writers: writers, artists: artists});
        }
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

$(function() {
    $(".page_headline").after(" <button id='fl-import'><img src='"+ chrome.runtime.getURL("fl.png") + "'/></button>");
    $("#fl-import").click(function() {
        parsePage();
    });
});
