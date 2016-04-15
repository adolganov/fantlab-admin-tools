$(function() {
    $("tbody[id$='info']:not(#cycle_info, #mauthor_info) tr:has(a)").
        prepend("<td><input type='checkbox' class='workCB'/></td>");
    $("tbody#cycle_info tr, tbody#mauthor_info tr").prepend("<td/>");
    $("tbody[id$='info']").prev("tbody").find("td[colspan]").attr("colspan", 6);
    $("tbody[id$='info']:not(#cycle_info, #mauthor_info) tr td[colspan]").attr("colspan", 6);
    $("tbody[id$='info'] tr:last").prepend("<td/>");

    $("a:contains(псевдонимы)").after(" | <a href='#' id='add-to-cycle'>добавить в цикл</a>");
    $("#add-to-cycle").click(function() {
        var issues = $(".workCB:checked");
        if (issues.length > 0) {
            var dlg = $("<div/>");
            dlg.append(
                "<label for='cycle-id'>В цикл <input type='text' id='cycle-id' size=7/> добавить</label><ul></ul>"
            );
            var ul = dlg.find("ul");
            issues.each(function() {
                var titles = $(this).closest("tr").find("a").not("a:has(img)");
                var ruTitle = titles.first().text();
                var enTitle = titles.eq(1).text();
                var title = ruTitle.length > 0 ? ruTitle : enTitle;
                var id = /\d+/.exec(titles.first().attr("href"))[0];

                var num = /[#№](\d+)/.exec(enTitle);
                if (!num) {
                    num = /[#№](\d+)/.exec(ruTitle);
                }
                num = num ? num[1] : "";

                ul.append("<li><label for='" + id + "'>" + title +
                          " <input type='text' id='" + id + "' size=4 value='" +
                          num + "' /></label></li>");
            });

            dlg.dialog({
                modal: true,
                title: "Цикл",
                dialogClass: "no-close",
                buttons: {
                    "OK": function () {
                        var cycleId = dlg.find("#cycle-id").val();
                        if (cycleId && cycleId.trim().length > 0) {
                            var url = "/work" + cycleId.trim() + "/work" + cycleId.trim() + "content/addworklink/addworklinkok";
                            var defs = [];
                            var i = 0;
                            dlg.find("li input").each(function() {
                                var self = this;
                                setTimeout(function () {
                                    defs.push($.post(url, {workid: $(self).attr("id"), index: $(self).val().trim()}));
                                }, 100 * i);
                                i++;
                            });

                            var self = this;
                            $.when.apply(this, defs).then(function() {
                                $(self).dialog("close");
                            });
                        }
                    }
                }
            });
        }

        return false;
    });
});
