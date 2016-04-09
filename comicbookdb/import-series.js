$(function() {
    var headerRow = $("u a:contains('Issue')").parents("tr").first();
    headerRow.prepend("<td><input type='checkbox' id='headerCB'/></td>");

    headerRow.closest("table").find("tr:visible").slice(1).prepend("<td><input type='checkbox' class='issueCB'/></td>");
    headerRow.closest("table").find("tr:hidden").prepend("<td></td>");

    $("#headerCB").click(function() {
        $(".issueCB").prop("checked", $(this).prop("checked"));
    });

    $(".page_headline").next("strong").after(" <button id='fl-import'><img src='"+ chrome.runtime.getURL("fl.png") + "'/></button>");
    $("#fl-import").click(function() {
        var comics = [];
        var pages = [];
        $(".issueCB:checked").parent().next("td").find("a.page_link").each(function() {
            pages.push(
                $.get({
                    url: $(this).get(0).href,
                    beforeSend: function(xhr) {
                        xhr.overrideMimeType('text/html; charset=windows-1252');
                    },
                    success: function(data) {
                        comics.push(parsePage($("<div/>").append(data)));
                    }
                })
            );
        });

        $.when.apply($, pages).then(function() {
            console.log(comics);
            findCreatorIdsAndRun(comics);
        });
    });
});
