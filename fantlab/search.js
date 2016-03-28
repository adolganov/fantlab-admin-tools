$(function () {
    new Clipboard("#copy-id");
    $(".search-results a")
        .not(":has(img)")
        .filter(function(index) { return this.text.trim().length > 0; })
        .after(function() {
            return " <button id='copy-id' data-clipboard-text='" + /\d+/.exec(this.href)[0]  + "'>id</button>";
        });
});
