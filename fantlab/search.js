$(function () {
    $(".search-results a")
        .not("div.cover a")
        .not("div.live a")
        .not(".more-link-block a")
        .filter(function(index) { return this.text.trim().length > 0; })
        .after(function() {
            return " <button class='id-btn' data-clipboard-text='" + /\d+/.exec(this.href)[0]  + "'>id</button>";
        });

    new Clipboard(".id-btn");
});
