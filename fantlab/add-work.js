chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "fillComics") {
        sendResponse({ack: true});
        console.log("fill comics");
        $("#worktypeid").val(41);
        $("#spanarts").css("display", "");

        if(request.writers.found.length > 1) {
            $.each(request.writers.found.slice(1), function(index, value) {
                $("input[name='autor" + String(index + 2) + "id']").val(value);
            });
        }

        $.each(request.artists.found, function(index, value) {
            $("input[name='art" + (index > 0 ? String(index + 1) : "") + "id']").val(value);
        });

        $("input[name='name']").val(
            (request.comics.title.length > 0 ? request.comics.title : request.comics.series) +
                (request.comics.num.startsWith("#") ? " " + request.comics.num : ""));
        $("input[name='year']").val(request.comics.year);
        $("input[name='index']").val(request.comics.month);
    }
});
