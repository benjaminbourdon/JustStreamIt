const url_api = "http://127.0.0.1:8000/api/v1/"
const movies_fields = ["id", "url", "imdb_url", "title", "year", "imdb_score", "votes", "image_url", "directors", "actors", "writers", "genres"]

async function getMovies(sort_by = null, reverse=false, limit = 7, genre=null) {
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
    console.log(url);

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
    const hero_title = document.querySelector(".hero__title");
    hero_title.textContent = movie.title

    const image_url = movie.image_url;
    if (image_url != null){
        const hero_preview = document.querySelector(".hero__preview");
        hero_preview.src = image_url;
    }
}

function addVignette(parent, movie){
    const vignette = document.createElement('div');
    vignette.classList.add("carroussel__vignette");

    const balise_title = document.createElement("h3");
    balise_title.textContent = movie.title
    vignette.appendChild(balise_title);

    const balise_image = document.createElement("img");
    balise_image.src = movie.image_url
    balise_image.alt = 'Affiche du film "' + movie.title + '"';
    vignette.appendChild(balise_image);

    parent.appendChild(vignette);
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

    movies.forEach(element => {addVignette(carroussel, element)});
}

async function displayBetterMovies() {
    const betterMovies = await getMovies(sort_by="imdb_score", reverse =true);
    const betterMovie = betterMovies[0];

    editHero(betterMovie)

    addCarroussel(document.getElementById("better-movies"), betterMovies.slice(1,), title="Films les mieux notés")
}



async function displayCategoryCarroussel(category, title=null) {
    const movies = await getMovies(sort_by="imdb_score", reverse =true, limit=7, genre=category);
    
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


async function main() {
    await displayBetterMovies();
    await displayCategoryCarroussel("comedy")
}
main()