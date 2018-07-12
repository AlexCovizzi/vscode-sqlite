function paginator(config) {

    // get/make an element for storing the page numbers in
    var box;
    if (!(config.box instanceof Element)) {
        config.box = document.createElement("div");
    }
    box = config.box;

    // get/make function for getting table's rows
    /*
    if (typeof config.get_rows != "function") {
        config.get_rows = function () {
            var tableId = config.tableId
            var table = document.getElementById(tableId);
            var tbody = table.getElementsByTagName("tbody")[0]||table;

            // get all the possible rows for paging
            // exclude any rows that are just headers or empty
            children = tbody.children;
            var trs = [];
            for (var i=0;i<children.length;i++) {
                if (children[i].nodeType = "tr") {
                    if (children[i].getElementsByTagName("td").length > 0) {
                        trs.push(children[i]);
                    }
                }
            }

            return trs;
        }
    }
    var get_rows = config.get_rows;
    var trs;
    if (tables[index] === undefined) {
        rows = get_rows();
    }
    trs = rows;
    */

    var trs = document.getElementById(config.tableId).getElementsByTagName("tbody")[0].children;
    var lastPage = config['lastPage'];
    

    // get/set rows per page
    if (typeof config.rows_per_page == "undefined") {
        var selects = box.getElementsByTagName("select");
        if (typeof selects != "undefined" && (selects.length > 0 && typeof selects[0].selectedIndex != "undefined")) {
            config.rows_per_page = selects[0].options[selects[0].selectedIndex].value;
        } else {
            config.rows_per_page = 10;
        }
    }
    var rows_per_page = config.rows_per_page;

    // get/set current page
    if (typeof config.page == "undefined") {
        config.page = 1;
    }
    var page = config.page;

    // get page count
    var pages = (rows_per_page > 0)? Math.ceil(trs.length / rows_per_page):1;
    if (pages === 1) return;

    // check that page and page count are sensible values
    if (pages < 1) {
        pages = 1;
    }
    if (page > pages) {
        page = pages;
    }
    if (page < 1) {
        page = 1;
    }

    config.page = page;
 
    // hide rows not on current page and show the rows that are
    if (rows_per_page > 0) {
        if (lastPage !== undefined) {
            for (var i=(lastPage-1)*rows_per_page; i<lastPage*rows_per_page; i++) {
                trs[i].style.display = "none";
            }
        } else {
            for(var i=0; i<trs.length; i++) {
                trs[i].style.display = "none";
            }
        }

        for (var i=(page-1)*rows_per_page; i<page*rows_per_page; i++) {
            trs[i].style.display = "";
        }
    } else {
        for(var i=0; i<trs.length; i++) {
            trs[i].style.display = "";
        }
    }

    config.lastPage = page;

    trs = null;

    // page button maker functions
    config.active_class = config.active_class||"active";
    if (typeof config.box_mode != "function" && config.box_mode != "list" && config.box_mode != "buttons") {
        config.box_mode = "button";
    }

    var make_button = function (symbol, index, config, disabled, active) {
        var button = document.createElement("button");
        button.innerHTML = symbol;
        button.addEventListener("click", function (event) {
            event.preventDefault();
            if (this.disabled != true) {
                config.page = index;
                paginator(config);
            }
            return false;
        }, false);
        if (disabled) {
            button.disabled = true;
        }
        if (active) {
            button.className = config.active_class;
        }
        return button;
    }
    
    // make page button collection
    var page_box = document.createElement(config.box_mode == "list"?"ul":"div");
    if (config.box_mode == "list") {
        page_box.className = "pagination";
    }

    var left = make_button("&#10094;", (page>1?page-1:1), config, (page == 1), false);
    page_box.appendChild(left);

    for (var i=1;i<=pages;i++) {
        var li = make_button(i, i, config, false, (page == i));
        page_box.appendChild(li);
    }

    var pageInput = document.createElement("input");
    pageInput.type = "number";
    pageInput.max = pages;
    pageInput.min = 1;
    pageInput.value = page;
    pageInput.onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            e.preventDefault();
            config.page = parseInt(this.value);
            paginator(config);
            return false;
        }
    }
    page_box.appendChild(pageInput);

    var pageSpan = document.createElement("span");
    pageSpan.innerText = '/'+pages;
    pageSpan.style = "padding:4px 0;opacity: 0.6;"
    page_box.appendChild(pageSpan);

    var right = make_button("&#10095;", (pages>page?page+1:page), config, (page == pages), false);
    page_box.appendChild(right);
    if (box.childNodes.length) {
        while (box.childNodes.length > 1) {
            box.removeChild(box.childNodes[0]);
        }
        box.replaceChild(page_box, box.childNodes[0]);
    } else {
        box.appendChild(page_box);
    }

    // make rows per page selector
    /*
    if (!(typeof config.page_options == "boolean" && !config.page_options)) {
        if (typeof config.page_options == "undefined") {
            config.page_options = [
                { value: 5,  text: '5'   },
                { value: 10, text: '10'  },
                { value: 20, text: '20'  },
                { value: 50, text: '50'  },
                { value: 100,text: '100' },
                { value: 0,  text: 'All' }
            ];
        }
        var options = config.page_options;
        var select = document.createElement("select");
        for (var i=0;i<options.length;i++) {
            var o = document.createElement("option");
            o.value = options[i].value;
            o.text = options[i].text;
            select.appendChild(o);
        }
        select.value = rows_per_page;
        select.addEventListener("change", function () {
            config.rows_per_page = this.value;
            paginator(config);
        }, false);
        box.appendChild(select);
    }

    // status message
    var stat = document.createElement("span");
    stat.innerHTML = "On page " + page + " of " + pages
        + ", showing rows " + (((page-1)*rows_per_page)+1)
        + " to " + (trs.length<page*rows_per_page||rows_per_page==0?trs.length:page*rows_per_page)
        + " of " + trs.length;
    box.appendChild(stat);
    */

    // run tail function
    if (typeof config.tail_call == "function") {
        config.tail_call(config);
    }

    return box;
}
