function filter_element(p) {
    let r = document.getElementById('filter_prototype').cloneNode(true);
    r.id = '';
    r.getElementsByClassName('regexp')[0].value = p.regexp;
    r.getElementsByClassName('folder')[0].value = p.folder;
    return r;
}

function new_filter(options) {
    options = options != undefined ? options : {"regexp": '', "folder": ''};
    $('#filters').append(filter_element({regexp: options.regexp, folder: options.folder}));
    save_prefs();
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
    console.log("Saved preferences");
}

function load() {
    let e = $('#filters');
    e.html("");
    browser.storage.sync.get({'prefs': {filters: []}}).then((v) => {
            for (let filter of v.prefs.filters) {
                e.append($(filter_element(filter)).addClass("no-animation"));
            }
        });
    
};

var filterActions = {}

filterActions.delete = function (filter){
    filter.remove();
    save_prefs();
}
filterActions.move_up = function (filter){
    if (filter.prev().length > 0){

        filter.addClass("no-animation").insertBefore(filter.prev());
    }
    save_prefs();
}
filterActions.move_down = function (filter){
    if (filter.next().length > 0){
        filter.addClass("no-animation").insertAfter(filter.next());
    }
    save_prefs();
}

window.addEventListener('load', load);
$("#save").click(save_prefs);
$("#new").click(()=>{new_filter()});
$("#filters")
    .on("click",".filter button",e => {
        let f = filterActions[$(e.currentTarget).attr("action")];
        if (f) f($(e.target).parents(".filter"));
    })
    .on("change","input",save_prefs);
var templates = {
    "image":{
        "regexp":"\\.(jpg|jpeg|png|webp|jfif|svg|gif|tiff|tif)$",
        "folder":"Images"
    },
    "video":{
        "regexp":"\\.(mp4|avi|mov|flv|mkv|webm)$",
        "folder":"Videos"
    },
    "audio":{
        "regexp":"\\.(mp3|wav|flac|aif|aiff|ogg)$",
        "folder":"Audio"
    },
    "doc":{
        "regexp":"\\.(pdf|doc|docx|odt|csv|xls|xlsx|ods|ppt|pptx|odp|xml)$",
        "folder":"Documents"
    },
    "zip":{
        "regexp":"\\.(zip|tar.gz|tar|rar|7z|pea)$",
        "folder":"Archives"
    },
    "ext":{
        "regexp":"\\.()$",
        "folder":""
    },
    "dup":{
        "regexp":"\\((\\d)+\\)",
        "folder":"Duplicates"
    }
}
$("#template").change((e)=>{
    new_filter(templates[$(e.target).val()]);
    $("#template").val("");
})