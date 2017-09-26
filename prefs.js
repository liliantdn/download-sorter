function filter_element(p) {
    let r = document.getElementById('filter_prototype').cloneNode(true);
    r.id = '';
    r.getElementsByClassName('regexp')[0].value = p.regexp;
    r.getElementsByClassName('folder')[0].value = p.folder;
    return r;
}

function new_filter() {
    let e = document.getElementById('filters');
    e.appendChild(filter_element({regexp: '', folder: ''}));
}

function save_prefs() {
    let filters = document.getElementById('filters').getElementsByClassName('filter');
    let prefs = {filters: []};
    for (let filter of filters) {
        prefs.filters.push({
                regexp: filter.getElementsByClassName('regexp')[0].value,
                folder: filter.getElementsByClassName('folder')[0].value
            });
    }
    
    browser.storage.sync.set({'prefs': prefs});
}

function load() {
    let e = document.getElementById('filters');
    e.innerHTML = "";
    browser.storage.sync.get({'prefs': {filters: []}}).then((v) => {
            for (let filter of v.prefs.filters) {
                e.appendChild(filter_element(filter));
            }
        });
    
};

window.addEventListener('load', load);
document.getElementById('save').addEventListener('click', save_prefs);
document.getElementById('new').addEventListener('click', new_filter);