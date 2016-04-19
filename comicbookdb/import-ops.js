function parsePage(html) {
    var comicsInfo = {};

    var headline = html.find(".page_headline");

    var tmp = headline.text().split(" - ");
    comicsInfo.series = /(.+)\s+\(\d+\)/.exec(tmp[0])[1];
    comicsInfo.num = tmp[1];

    comicsInfo.title = headline.nextAll(".page_subheadline").text().slice(1, -1);

    var creatorsTable = headline.siblings("table").first().find("strong").first();
    comicsInfo = extractCreators(creatorsTable, comicsInfo);
    //cover date
    var dt = html.find(".page_link[href^='coverdate.php']").text();
    var date = new Date(dt.trim());

    comicsInfo.year = date.getFullYear();
    comicsInfo.month = date.getMonth() + 1;

    comicsInfo.stories = [];
    //Multiple stories
    html.find("a[href^='issue_story_edit']").prev().each(function(idx) {
        var story = {};
        story.title = $(this).find("strong").text().slice(1, -1);
        extractCreators($(this).nextAll("strong").eq(1), story);

        comicsInfo.stories.push(story);
    });

    return comicsInfo;
}

function findCreatorIdsAndRun(comics) {
    if (!$.isArray(comics)) comics = [comics];

    var writersList = [];
    var artistsList = [];
    $.each(comics, function (idx, comicsInfo) {
        writersList = writersList.concat(allCreators(comicsInfo, "writer"));
        if (!comicsInfo.writer) {
            writersList = writersList.concat(comicsInfo.editor);
        }

        artistsList = artistsList.concat(allCreators(comicsInfo, "penciller"));
    });

    writersList = distinct(writersList);
    artistsList = distinct(artistsList);

    var writers = {
        not_found: []
    };

    var defs = [];
    defs.push($.get("https://fantlab.ru/getautorstag/", {getautors: writersList.join(",")}, function(data) {
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
    $.each(artistsList, function(index, value) {
        defs.push($.get("https://fantlab.ru/search-mini-art", {searchq: value}, function(data) {
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
                    aList.append("<li><label for='art" + idx + "'>" + value +
                                 " <input type='text' id='art" + idx +
                                 "' size=7 data='" + value + "'/></label>");
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
                            chrome.runtime.sendMessage({action: "fillComics", comics: comics, writers: writers, artists: artists});
                        }
                    }
                }
            });
        } else {
            chrome.runtime.sendMessage({action: "fillComics", comics: comics, writers: writers, artists: artists});
        }
    });
}

function extractCreators(header, comicsInfo) {
    if (header.length == 0 || header.text().startsWith("Character")) {
        return comicsInfo;
    }

    var type = /(\w+)\(/.exec(header.text())[1].toLowerCase();
    var creators = [];
    header.nextUntil("strong", "a").each(function(index) {
        creators.push($(this).text().split(" - ")[0].replace(/\s["'][^'"]+['"]\s/gi, " "));
    });

    comicsInfo[type] = creators;

    return extractCreators(header.nextAll("strong").first(), comicsInfo);
}


function allCreators(comicsInfo, creatorType) {
    var creatorsList = comicsInfo[creatorType] ? comicsInfo[creatorType] : [];
    $.each(comicsInfo.stories, function (idx, value) {
        if (value[creatorType]) {
            creatorsList = creatorsList.concat(value[creatorType]);
        }
    });

    return creatorsList;
}

function distinct(array) {
    return array.filter(function(itm,i,a) {
        return i == a.indexOf(itm);
    });
}
