$(function () {
    $(".search-results a")
        .not("a:has(img)")
        .not(".more-link-block a")
        .filter(function(index) { return this.text.trim().length > 0; })
        .after(function() {
            return " <button class='id-btn' data-clipboard-text='" + /\d+/.exec(this.href)[0]  + "'>id</button>";
        });

    new Clipboard(".id-btn");
});
