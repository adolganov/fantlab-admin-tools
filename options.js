function save_options() {
    var interval = document.getElementById('interval').value;

    chrome.storage.sync.set({
        intervalTime: interval
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Настройки сохранены.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        intervalTime: 200
    }, function(items) {
        document.getElementById('interval').value = items.intervalTime;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
