//pokemon array
let allPokemon = [];


//HTML elements
const grid = document.getElementById('poke-grid');
const searchInput = document.getElementById('pk-search');
const loader = document.querySelector('.loader');
const notFound = document.querySelector('.not-found-container');
const nameFilter = document.querySelector('.filter');
const searchBtn = document.querySelector('.search-btn');

var typesArray = [];



function fecthData(){
    showLoader();
    fetchAllPokemonData();
}
let offset = 0;
const limit = 20;
let loading = false;

async function fetchAllPokemonData() {
    if (loading) return; 
    loading = true;
    showLoader();

    try {
        const cachedData = localStorage.getItem('allPokemon');
        
        
        if (cachedData && offset === 0 && !(window.innerHeight + window.scrollY >= document.body.offsetHeight - 100)) {
            console.log('Using cached data');
            allPokemon = JSON.parse(cachedData);

            offset += allPokemon.length;

            console.log('Fetching data from API');
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);

            if (!response.ok) {
                throw new Error("Could not fetch resources");
            }

            const data = await response.json();

            const compactData = [];

            for (const element of data.results) {
                const responseSingle = await fetchSinglePokemonData(element.name);
                if (!responseSingle) {
                    throw new Error("Could not fetch resource for " + element.name);
                }
                compactData.push({
                    id: responseSingle.id,
                    name: responseSingle.name,
                    types: responseSingle.types,
                    stats: responseSingle.stats
                });
            }

            allPokemon = allPokemon.concat(compactData);
            allPokemon.forEach(createPokemonCard);
            
            
            localStorage.setItem('allPokemon', JSON.stringify(allPokemon));

            offset += limit;
        } else {
            console.log('Fetching data from API');
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);

            if (!response.ok) {
                throw new Error("Could not fetch resources");
            }

            const data = await response.json();
            await fetchEachPokemonData(data.results);

            
            localStorage.setItem('allPokemon', JSON.stringify(allPokemon));

            offset += limit;
            console.log(offset);
        }
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
        loading = false;
    }
}

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        fetchAllPokemonData();
    }
});

//fetch single pokemon data
async function fetchSinglePokemonData(pokemon) {
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

        if(!response.ok){
            throw new Error(`Could not fetch ${pokemon}'s data`)
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

//fetch each pokemon's data
const fetchEachPokemonData = async (pokemonArr) => {
    try {

        const compactData = [];

        for (const element of pokemonArr) {
            const response = await fetchSinglePokemonData(element.name);
            if (!response) {
                throw new Error("Could not fetch resource for " + element.name);
            }
            compactData.push({
                id: response.id,
                name: response.name,
                types: response.types,
                stats: response.stats
            });
        }
        //grid.innerHTML = '';
        if(offset === 0){
            allPokemon = allPokemon.concat(compactData);
            allPokemon.forEach(createPokemonCard);
            console.log("first condition ran");
        }else{
            allPokemon = allPokemon.concat(compactData);
            compactData.forEach(createPokemonCard);
        }
        
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    }
};





//pokemon card
function createPokemonCard(pokemon) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';

    var typesArray = pokemon.types.map(typeInfo => typeInfo.type.name);

    gridItem.innerHTML = `
        <div class='card'>
            <div class='front'>
                <div class='text-container'>
                    <h3 class='poke-name'>${pokemon.name}</h3>
                    <h4 class='poke-number'># ${pokemon.id}</h4>
                    <div class='type-wrapper'></div>
                </div>
                <div class='image-container'>
                    <img class='poke-image' src='https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg' alt='${pokemon.name}' crossorigin='anonymous'/>
                </div>
            </div>
            <div class='back'>
                <div class='attributes-col'>
                    <p class='atrributes'>HP</p>
                    <p class='atrributes'>Attack</p>
                    <p class='atrributes'>Defense</p>
                </div>
                <div class='stats-col'>
                    <p class='stats'>${pokemon.stats[0].base_stat}</p>
                    <p class='stats'>${pokemon.stats[1].base_stat}</p>
                    <p class='stats'>${pokemon.stats[2].base_stat}</p>
                </div>
                <div class='stats-meter-col'>
                    <span class='stats-meter' style='background-size: ${pokemon.stats[0].base_stat}% 100%; background-image: linear-gradient(${pokemon.stats[0].base_stat <= 40 ? 'red' : pokemon.stats[0].base_stat < 70 ? 'orange' : 'green'}, ${pokemon.stats[0].base_stat <= 40 ? 'red' : pokemon.stats[0].base_stat < 70 ? 'orange' : 'green'});'></span>
                    <span class='stats-meter' style='background-size: ${pokemon.stats[1].base_stat}% 100%; background-image: linear-gradient(${pokemon.stats[1].base_stat <= 40 ? 'red' : pokemon.stats[1].base_stat < 70 ? 'orange' : 'green'}, ${pokemon.stats[0].base_stat <= 40 ? 'red' : pokemon.stats[0].base_stat < 70 ? 'orange' : 'green'});'></span>
                    <span class='stats-meter' style='background-size: ${pokemon.stats[2].base_stat}% 100%; background-image: linear-gradient(${pokemon.stats[2].base_stat <= 40 ? 'red' : pokemon.stats[2].base_stat < 70 ? 'orange' : 'green'}, ${pokemon.stats[0].base_stat <= 40 ? 'red' : pokemon.stats[0].base_stat < 70 ? 'orange' : 'green'});'></span>
                </div>
            </div>
        </div>
        
    `;

    grid.appendChild(gridItem);

    const imgElement = gridItem.querySelector('img');
    const front = gridItem.querySelector('.front');
    const back = gridItem.querySelector('.back');
    const typeWrapper = gridItem.querySelector('.type-wrapper');

    typesArray.forEach(typeName => {
        const pokeType = document.createElement('span');
        pokeType.className = 'poke-type';
        pokeType.textContent = typeName;
        typeWrapper.appendChild(pokeType);
    });

    
    imgElement.onload = function () {
        const colorThief = new ColorThief();
        
        if (imgElement.complete) {
            const dominantColor = colorThief.getColor(imgElement);
            front.style.backgroundColor = `rgb(${dominantColor.join(',')})`;
            back.style.setProperty('--before-color', `rgb(${dominantColor.join(',')})`);
        }
    };

    
    if (imgElement.complete) {
        imgElement.onload();
    }
}

//search method
//searchInput.addEventListener("keyup", handleSearch);

searchBtn.addEventListener("click", handleSearch)

async function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    

    grid.innerHTML = '';


    const filteredPokemons = allPokemon.filter(pokemon =>
        pokemon.name.toLowerCase().startsWith(searchTerm)
    );


    if (filteredPokemons.length > 0) {
        filteredPokemons.forEach(createPokemonCard);
        hideNotFound();
        grid.style.display = 'flex';
    } else {
        try {
            console.log(`Searching for ${searchTerm} in API...`);
            const response = await fetchSinglePokemonData(searchTerm);

            if (!response) {
                throw new Error('Pokemon not found');
            }

            const compactPokemon = {
                id: response.id,
                name: response.name,
                types: response.types,
                stats: response.stats 
            };

            createPokemonCard(compactPokemon);
            grid.style.display = 'flex';
        } catch (error) {
            console.error(error);
            grid.style.display = 'none';
            showNotFound();
        }
        
    }
}



// name filter
nameFilter.addEventListener("click", ()=>{
    if(nameFilter.style.backgroundColor === 'black'){
        grid.innerHTML = '';
        nameFilter.style.backgroundColor = 'white';
        nameFilter.style.color = 'black';
        allPokemon.forEach(createPokemonCard);
        //console.log(allPokemon);
    } else{
        sortByName();
        nameFilter.style.backgroundColor = 'black';
        nameFilter.style.color = 'white';
    }
    
})

function sortByName() {
    let sortedPokemon = [...allPokemon];
    sortedPokemon.sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = '';
    sortedPokemon.forEach(createPokemonCard);
}

// Loader control functions
function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}

// Not found functions

function showNotFound() {
    notFound.style.display = 'flex';
}

function hideNotFound() {
    notFound.style.display = 'none';
}

//fetch call
fecthData();
//localStorage.removeItem('allPokemon');


// const clearCache = document.querySelector('.clear-cache');

// clearCache.addEventListener("click", ()=>localStorage.removeItem('allPokemon'));