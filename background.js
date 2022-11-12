let prefs = null;
// Just a few functions to make the console more readable for me
var c = {};
c.log = function(title,string,style,color){
    let css;
    
    switch(style){
        case 0:
        case undefined:
            css = "font-weight:bold;color:"+(color?color:"#000");
            break;
        case 1:
            css = "font-weight:bold;color:#fff;padding:1px 4px;border-radius:3px;margin-right:3px;background:"+(color?color:"blue");
            break;
    }
    if (string != undefined){
        console.log("%c"+title+" :",css,string);
    } else{
        console.log("%c"+title,css);
    }
    
}
c.success = function(title,string){
    title = title==""?"Success":title;
    c.log(title,string,1,"green");
}
c.error = function(title,string){
    title = title==""?"Error":title;
    c.log(title,string,1,"red");
}
c.warn = function(title,string){
    title = title==""?"Warning":title;
    c.log(title,string,1,"orange");
}

function get_prefs() {
    browser.storage.sync.get({
        'prefs': { filters: [] } 
    }).then((p) => { 
        prefs = p.prefs; 
    });
}

get_prefs();

browser.storage.onChanged.addListener(get_prefs);
const directory_separator = '\\'; //FIXME
function getFilename(path){
    return path.substring(path.lastIndexOf(directory_separator) + 1);
}
function match(path) {
    // let url = new URL(url_string);
    console.log(getFilename(path));
    let filename = getFilename(path);
    return prefs.filters.find(f => {
        try {
            r = new RegExp(f.regexp);
            return r.test(filename);
        } catch(error) {
            c.error("",error);
        }
    });;
}

function rewrite(filter, url_string, path) {
    //Need to figure out a way to remove (1) from filenames
    let filename = getFilename(path);
    console.log(filename);
    // let url = new URL(url_string);
    if (filter.folder) {
        return filter.folder + directory_separator + filename;
    }
    return filename;
}

function rename_download(item) {
    console.log(item);
    let filter = match(item.filename);
    // console.log(filter);
    if (filter) {
        c.success("","Match found.")
        c.log("Filename",getFilename(item.filename));
        c.log("Match",filter);
        
        browser.downloads.onCreated.removeListener(rename_download); //don't get stuck in a loop

        browser.downloads.download({
            url: item.url,
            filename: rewrite(filter, item.url, item.filename)
        }).then(() => {
            browser.downloads.onCreated.addListener(rename_download)
            browser.downloads.cancel(item.id);
            browser.downloads.erase({ id: item.id });
        });

    } else {
        c.warn("","No matches found.")
        c.log("Filename",getFilename(item.filename));
        c.log("Match",filter);
    }
}

browser.downloads.onCreated.addListener(rename_download);