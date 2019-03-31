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
    const numOfPosts = 20;
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
        .then(posts => $('#posts').html(posts.map(post => `<li class="list-group-item">${post.title}</li>`)))
        .catch(error => $('#posts').html('<strong>There was an error</strong>'));
}

const applyTheWeirdSelector = () => {
    $('.a :not(.b a)').toggleClass('bg-warning');
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
};

const createDynamicContent = path => {
    if (path.startsWith('/'))
        path = path.slice(1);
    content = {
        'json.html': () => {
            fetchPosts();
        },
        'dndlist.html': () => {

        },
        'table.html': () => {

        },
        '': () => {

        }
    };
    content[path]();
};

const changePage = path => {
    let content = $('#content');
    content.hide();
    content.load(`${path} #content`, () => {
        content.fadeIn(250);
        history.replaceState({}, path, path);
        registerEventHandlers();
        createDynamicContent(path);
    });
};

$(() => {

    changePage(location.pathname);

    $('#hamburger').click(() => {
        toggleSideNav();
    });

    let w = $(window);
    w.resize(_.debounce(() => {
        if (w.width() > 480 && !$('#side-nav').hasClass('hidden')) {
            toggleSideNav();
        }
    }, 50));

    $('a.nav-link').click(function (e) {
        e.preventDefault();
        let navButton = $(this);
        const path = navButton.attr('href');
        if ($('#side-nav')[0].contains(navButton[0])) {
            toggleSideNav();
        }
        if (location.pathname.slice(1) !== path) {
            changePage(path);
        }
    });

    window.onpopstate = () => {
        changePage(location.pathname);
    }

});

