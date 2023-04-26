const url_api = "http://127.0.0.1:8000/api/v1/"
const movies_fields = ["id", "url", "imdb_url", "title", "year", "imdb_score", "votes", "image_url", "directors", "actors", "writers", "genres"]
const nb_movies_by_category = 7;

async function getMovie(id) {
    const url = url_api + "titles/" + id
    const result = await fetch(url);
    if (result==null) {
        console.warn(`Tentative échouée d'accès à ${url}`);
        return;
    }
    return await result.json();
}

async function getMovies(sort_by = null, reverse=false, limit = nb_movies_by_category, genre=null) {
    let url = url_api + "titles/";

    let addons = []
    if (sort_by != null && movies_fields.includes(sort_by)) {
        if (reverse){
            sort_by = "-" + sort_by
        }
        addons.push("sort_by=" + sort_by);
    }
    if (genre != null) {
        addons.push("genre=" + genre);
    }
    if (addons.length > 0) {
        url = url + "?" + addons.join("&")
    }

    let movies = [];

    do {
        let result = await fetch(url);
        result = await result.json();
        movies = movies.concat(result["results"])

        url = result["next"];
    } while (movies.length < limit && url != undefined && url != null);

    return movies.slice(0,limit);
}

function editHero(movie){
    const image_url = movie.image_url;

    const balise_hero = document.querySelector(".hero");
    balise_hero.dataset.movieId = movie.id;
    document.styleSheets[0].insertRule(`.hero:before {background-image: url("${image_url}");`);
    balise_hero.addEventListener("click", ()=> {openModaleWindow(balise_hero);});

    const hero_title = document.querySelector(".hero__title");
    hero_title.textContent = movie.title

    if (image_url != null){
        const hero_preview = document.querySelector(".hero__preview");
        image = hero_preview.querySelector("img")
        image.src = image_url;
    }
}

function addVignette(parent, movie){
    const vignette = document.createElement('div');
    vignette.classList.add("carroussel__vignette");
    vignette.dataset.movieId= movie.id;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    const balise_title = document.createElement("h3");
    balise_title.textContent = movie.title
    overlay.appendChild(balise_title);
    vignette.appendChild(overlay);

    const balise_image = document.createElement("img");
    balise_image.src = movie.image_url
    balise_image.alt = 'Affiche du film "' + movie.title + '"';
    vignette.appendChild(balise_image);

    parent.appendChild(vignette);

    vignette.addEventListener("click", async function() {await openModaleWindow(this)} );
}

function addCarroussel(node, movies, title=null){
    if (title != null){
        const balise_title = document.createElement('h2');
        balise_title.textContent = title;
        node.appendChild(balise_title);
    }
    const carroussel = document.createElement("div");
    carroussel.classList.add("carroussel");
    node.appendChild(carroussel)

    const before = document.createElement("div");
    before.classList.add("before");
    before.innerText = '<';
    carroussel.appendChild(before);
    
    const main_carroussel = document.createElement("div");
    main_carroussel.classList.add("carroussel__main");
    carroussel.appendChild(main_carroussel)

    const after = document.createElement("div");
    after.classList.add("after");
    after.innerText = '>';
    carroussel.appendChild(after);

    movies.forEach(element => {addVignette(main_carroussel, element)});

    before.addEventListener("click", ()=>scrollCarroussel(main_carroussel, dir=-1));
    after.addEventListener("click", ()=>scrollCarroussel(main_carroussel, dir=1));
}

async function displayBetterMovies() {
    const betterMovies = await getMovies(sort_by="imdb_score", reverse =true);
    const betterMovie = betterMovies[0];

    editHero(betterMovie)

    addCarroussel(document.getElementById("better-movies"), betterMovies.slice(1,), title="Films les mieux notés")
}

async function displayCategoryCarroussel(category, title=null) {
    const movies = await getMovies(sort_by="imdb_score", reverse =true, limit=nb_movies_by_category, genre=category);
    
    const balise_section = document.createElement("section");
    balise_section.classList.add("category");
    const balise_main = document.querySelector("main");
    balise_main.appendChild(balise_section);
    
    const balise_title = document.createElement("h2");
    if (title) {
        balise_title.textContent = title
    } else {
        balise_title.textContent = category
    }
    balise_section.appendChild(balise_title);
    
    addCarroussel(balise_section, movies);
}

function scrollCarroussel(carroussel, dir=1) {
    let dx = carroussel.firstChild.offsetWidth;
    if (dir<0) {
        dx *= -1;
    }
    carroussel.scrollBy(dx,0);
}

async function openModaleWindow(node) {
    const movieId = node.dataset.movieId;
    const movie = await getMovie(movieId);
    
    const modale = document.querySelector(".modale");
    
    let innerHTML = [
        '<button class="modale__closebutton">&times; Fermer</button>',
        `<h3>${movie.title}</h3>`,
        `<p>${movie.description}</p>`,
        `<img class="modale__image" src='${movie.image_url}' alt='Affiche du film "${movie.title}"'>`,
        '<table class="modale__content"><tbody>',
        `<tr><th>Genre(s)</th><th>${movie.genres.join(', ')}</th></tr>`,
        `<tr><th>Date de sortie</th><th>${movie.date_published}</th></tr>`,
        `<tr><th>Score Imdb</th><th>${movie.imdb_score} (sur ${movie.votes} votes)</th></tr>`,
        `<tr><th>"Rated"</th><th>${movie.rated}</th></tr>`,
        `<tr><th>Réalisateur(s)</th><th>${movie.directors.join(', ')}</th></tr>`,
        `<tr><th>Durée</th><th>${movie.duration} minutes</th></tr>`,
        `<tr><th>Pays d'origine</th><th>${movie.countries.join(', ')}</th></tr>`,
        `<tr><th>Résultat au Box Office</th><th>${movie.worlwide_gross_income}</th></tr>`,
        '</tbody></table>',
    ]
    modale.innerHTML= innerHTML.join('');
    modale.classList.remove("modale--closed")
    addCloseModaleEvent()
}

function addCloseModaleEvent() {
    const balise_close = document.querySelector(".modale__closebutton");
    const modale = document.querySelector(".modale");
    balise_close.addEventListener("click", function() { modale.classList.add("modale--closed")})
}
async function main() {
    await displayBetterMovies();
    await displayCategoryCarroussel("Animation")
    await displayCategoryCarroussel("Sci-Fi", title="Science-fiction")
    await displayCategoryCarroussel("Comedy", title="Comédie")
}
main()
