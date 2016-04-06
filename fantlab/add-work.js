chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "fillComics") {
        sendResponse({ack: true});

        $("#worktypeid").val(41);
        $("#spanarts").css("display", "");

        fillInfo(request);

        $.each(request.comics.penciller, function(index, value) {
            $("input[name='art" + (index > 0 ? String(index + 1) : "") + "id']").val(request.artists[value] + " (" + value + ")");
        });
    }

    if (request.action === "fillCollection") {
        sendResponse({ack: true});

        $("#worktypeid").val(17);
        fillInfo(request);
    }
});

function fillInfo(request) {
    if(request.comics.writer.length > 1) {
        $.each(request.comics.writer.slice(1), function(index, value) {
            $("input[name='autor" + String(index + 2) + "id']").val(request.writers[value] + " (" + value + ")");
        });
    }

    $("input[name='name']").val(
        (request.comics.title.length > 0 ? request.comics.title : request.comics.series) +
            (request.comics.num.startsWith("#") ? " " + request.comics.num : ""));
    $("input[name='year']").val(request.comics.year);
    $("input[name='index']").val(request.comics.month);
}
