const pages = {
    '': {
        path: '',
        content: '',
        isLoaded: false,
    },
    'dndlist.html': {
        path: '',
        content: '',
        isLoaded: false,
    },
    'table.html': {
        path: '',
        content: '',
        isLoaded: false,
    },
    'json.html': {
        path: '',
        content: '',
        isLoaded: false,
    },
};

const toggleSideNav = () => {
    let sideNav = $('#side-nav');
    if (sideNav.hasClass('hidden')) {
        sideNav.toggleClass('hidden');
        setTimeout(() => {
            sideNav.toggleClass('menu-visible');
        }, 50);
    } else {
        sideNav.toggleClass('menu-visible');
        setTimeout(() => {
            sideNav.toggleClass('hidden');
        }, 200);
    }
};

const fetchPosts = () => {
    const domain = 'https://jsonplaceholder.typicode.com'
    const numOfPosts = 10;
    const page = Math.floor(Math.random() * 5) + 1;
    const options = {
        mode: 'cors',
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    };
    const url = `${domain}/posts?_page=${page}&_limit=${numOfPosts}`;
    fetch(url, options)
        .then(response => response.json())
        .then(posts => $('#posts').html(posts.map(post => `<li class="list-group-item"><h3>${post.title}</h3><p>${post.body}</p></li>`)))
        .catch(error => $('#posts').html('<strong>There was an error</strong>'));
}

const applyTheWeirdSelector = () => {
    $('.a li').toggleClass('bg-warning');
    $('.a .b a').parent().toggleClass('bg-warning');
};

const recolorTable = () => {
    $('#table tr').removeClass('gray');
    $('#table tr').removeClass('white');
    $('#table tr:odd').addClass('gray');
    $('#table tr:even').addClass('white');
}


const removeRow = buttonPressed => {
    let row = $(buttonPressed).parent().parent();       // button -> td -> tr
    row.fadeOut(200, () => {
        setTimeout(() => {
            row.remove();
            recolorTable();
        }, 50);
    });
}

const addRow = () => {      // ikr
    let table = $('#table');
    table.append('<tr><td>Sample data</td><td>Sample data</td><td>Sample data</td><td>Sample data</td><td><button class="btn btn-danger">Remove</button></td></tr>');
    $(table[0].firstElementChild.lastElementChild.lastElementChild.firstElementChild).click(function () { removeRow(this) });
    $(table[0].firstElementChild.lastElementChild).editableTableWidget();
    $('#table td:last-child').on('click keypress dblclick', () => false); // disable editing
    recolorTable();
};


const registerEventHandlers = () => {   // some of them are page specific and pages are loaded dynamically
    // Posts Page
    $('#loadPostsBtn').click(fetchPosts);

    // Dnd Page
    $('#sortable').sortable({
        revert: true
    });
    $('#draggable').draggable({
        connectToSortable: "#sortable",
        helper: "clone",
        revert: "invalid",
    });
    $('ul', 'li').disableSelection();

    $('#applySelectorBtn').click(applyTheWeirdSelector);

    // Table page
    $('#addRowBtn').click(addRow);
    $('#table button').click(function () { removeRow(this) });
    createEditableTable();
};

const createEditableTable = () => {
    $('#table').editableTableWidget();
    $('#table td:last-child').on('click keypress dblclick', () => false); // disable editing
    recolorTable();
};


const createDynamicContent = path => {
    if (path.startsWith('/'))
        path = path.slice(1);
    const content = {
        'json.html': () => { fetchPosts(); },
        'dndlist.html': () => { },
        'table.html': () => { },
        '': () => { }
    };
    content[path]();
};

const changePage = path => {
    const strippedLocationPathname = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;
    const strippedPath = path.startsWith('/') ? path.slice(1) : path;

    let content = $('#content');
    let page = pages[strippedLocationPathname];
    page.content = content.html();
    page = pages[strippedPath];

    content.hide();

    if (pages[strippedPath].isLoaded) {
        content.html(page.content);
        registerEventHandlers();
        content.fadeIn(250);
        history.replaceState({ from: strippedLocationPathname }, path, path);
        return;
    }

    content.load(`${path} #content`, () => {
        content.fadeIn(250);
        history.replaceState({ from: strippedLocationPathname }, path, path);
        registerEventHandlers();
        createDynamicContent(path);
        page.isLoaded = true;
    });
};

$(() => {

    $('#content').hide();
    changePage(location.pathname);

    $('#hamburger').click(() => {
        toggleSideNav();
    });

    let w = $(window);
    w.resize(_.debounce(() => {     // if we have side menu open and we resize window to > mobile size, hide it
        if (w.width() > 480 && !$('#side-nav').hasClass('hidden')) {
            toggleSideNav();
        }
    }, 150));

    $('a.nav-link, a.navbar-brand').click(function (e) {
        e.preventDefault();
        let navButton = $(this);
        const path = navButton.attr('href');
        if ($('#side-nav')[0].contains(navButton[0])) {
            toggleSideNav();
        }
        changePage(path);
    });

    window.onpopstate = e => {
        changePage(location.pathname);
    }

});

