const apiKey = "8051b1d996d2d173457036b889830eec";
const unit = "metric";
const lang = "es";

const inputCity = document.getElementById('inputCity');
const form = document.getElementById('climaForm');
const errorMesagge = document.getElementById('errorMessage');
const authActionsContainer = document.getElementById('header-auth-actions');

const contenedorFav = document.getElementById("city-fav");
const contenedorDefault = contenedorFav.innerHTML;

// Variable global para almacenar la lista de favoritos
let userFavoritesList = []; 

const nombresRopa = {
    "abrigo": "Abrigo Grueso",
    "botas-agua": "Botas de Agua",
    "botas": "Calzado Cerrado",
    "bufanda": "Bufanda",
    "calzado": "Calzado Cómodo",
    "camiseta-corta": "Camiseta / Blusa Ligera",
    "chaqueta": "Chaqueta / Cazadora",
    "chubasquero": "Chubasquero / Impermeable",
    "gafas-sol": "Gafas de Sol",
    "gorro": "Gorro",
    "guantes": "Guantes",
    "pantalon-corto": "Pantalón Corto / Falda",
    "pantalon-largo": "Pantalón Largo / Jeans",
    "pantalon-liviano": "Pantalón Liviano / Jeans",
    "pantalon-termico": "Pantalón Térmico",
    "paraguas": "Paraguas",
    "protector-solar": "Protector Solar",
    "rompe-vientos": "Rompevientos",
    "sueter": "Suéter",
    "termica": "Ropa Térmica",
    "botella-agua": "Hidratación"
};

// SECCIÓN 1: GESTIÓN DE DATOS

async function loadFavorites() {
    const user = localStorage.getItem('currentUser');
    
    if (user) {
        const userData = JSON.parse(user);
        try {
            const response = await fetch(`http://localhost:3000/api/favorites/${userData.id}`);
            if (response.ok) {
                const data = await response.json();
                userFavoritesList = data.favorites; 
            }
        } catch (error) {
            console.error("Error cargando favoritos de BD", error);
        }
    } else {
        const localFavs = localStorage.getItem('guestFavorites');
        if (localFavs) {
            userFavoritesList = JSON.parse(localFavs);
        }
    }
    renderFavoritesInitial(); 
}

async function toggleFavorite(cityName, isAdding) {
    const user = localStorage.getItem('currentUser');

    if (isAdding) {
        if (!userFavoritesList.includes(cityName)) userFavoritesList.push(cityName);
    } else {
        userFavoritesList = userFavoritesList.filter(c => c !== cityName);
    }

    if (user) {
        const userData = JSON.parse(user);
        const endpoint = 'http://localhost:3000/api/favorites';
        const method = isAdding ? 'POST' : 'DELETE'; 

        try {
            await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id, cityName: cityName })
            });
        } catch (error) {
            console.error("Error actualizando favorito en BD", error);
        }
    } else {
        localStorage.setItem('guestFavorites', JSON.stringify(userFavoritesList));
    }
}

// SCROLL AJUSTADO
function scrollToClima() {
    setTimeout(() => {
        const element = document.getElementById("contenedor-clima");
        if (element) {
            const headerOffset = 150; 
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, 100);
}

function renderFavoritesInitial() {
    if (userFavoritesList.length === 0) return;

    let cardsContainer = document.getElementById('city-cards-container');

    if (!cardsContainer) {
        contenedorFav.innerHTML = `
            <section class="fav-click-flex">
                <header class="flex-heart">
                    <i class="fas far fa-heart icon-heart"></i>
                    <h2 class="city-title">Ciudades Favoritas</h2>
                </header>
                <div id="city-cards-container" class="city-cards-grid"></div>
            </section>
        `;
        cardsContainer = document.getElementById('city-cards-container');
    }
    
    userFavoritesList.forEach(city => {
        if (cardsContainer.querySelector(`[data-city-name="${city}"]`)) return;

        const card = document.createElement('article');
        card.className = 'data-card bg-fav fav-card-item';
        card.setAttribute('data-city-name', city);
        
        card.innerHTML = `
            <div class="div-flex div-flex2">
                <i class="eye fas fa-eye" data-city-name="${city}"></i>
                <h2 class="h2-city-fav">${city}</h2>
                <i class="heart fas fa-heart heart-click" data-city-name="${city}"></i>
            </div>
        `;

        cardsContainer.appendChild(card);

        const newHeart = card.querySelector('.heart');
        const newEye = card.querySelector('.eye');
        
        setupRemoveFavoriteEvent(newHeart, null, city);
        
        newEye.addEventListener('click', () => {
             inputCity.value = city;
             const event = new Event('submit');
             form.dispatchEvent(event);
             scrollToClima(); 
        });
    });
}

// SECCIÓN 2: LÓGICA DE CLIMA Y ROPA

function obtenerRopa(cityName, tempActual, sensTermica, humedad, viento, condicion, descCondicion, nubes, icono) {
    let ropaRecomendada = [];

    if (tempActual < -10 || sensTermica < -10) {
        ropaRecomendada.push('termica', 'abrigo', 'pantalon-termico', 'bufanda', 'guantes', 'gorro', 'botas');
        if (condicion === 'Snow' || condicion === 'Rain') ropaRecomendada.push('chubasquero');
    }
    else if (tempActual < 0 && sensTermica < 0 && viento > 15 && humedad > 70 && nubes > 80 && (condicion === 'Snow' || condicion === 'Clouds')) {
        ropaRecomendada.push('termica', 'abrigo', 'pantalon-termico', 'bufanda', 'guantes', 'gorro', 'chubasquero', 'botas');
    }
    else if (tempActual >= 0 && tempActual <= 5 && sensTermica < 5 && viento >= 10 && viento <= 20 && (condicion === 'Clear' || condicion === 'Clouds') && humedad >= 50 && humedad <= 80 && nubes >= 50 && nubes <= 100) {
        ropaRecomendada.push('abrigo', 'sueter', 'pantalon-termico', 'botas');
    }
    else if (tempActual >= 6 && tempActual <= 10 && sensTermica >= 5 && sensTermica <= 10 && viento < 15 && humedad >= 50 && humedad <= 80 && nubes >= 60 && nubes <= 100) {
        ropaRecomendada.push('chaqueta', 'sueter', 'pantalon-largo', 'botas');
    }
    else if (tempActual >= 11 && tempActual <= 15 && sensTermica >= 10 && sensTermica <= 15 && viento < 20 && (condicion === 'Clear' || condicion === 'Clouds') && humedad >= 40 && humedad <= 70 && nubes >= 30 && nubes <= 70) {
        ropaRecomendada.push('chaqueta', 'sueter', 'pantalon-liviano', 'calzado');
    }
    else if (tempActual >= 16 && tempActual <= 20 && sensTermica >= 15 && sensTermica <= 20 && viento < 25 && (condicion === 'Clear' || condicion === 'Clouds') && humedad >= 40 && humedad <= 60 && nubes >= 20 && nubes <= 60) {
        ropaRecomendada.push('camiseta-corta', 'pantalon-liviano', 'calzado');
    }
    else if (tempActual >= 21 && tempActual <= 25 && sensTermica >= 20 && sensTermica <= 25 && viento < 20 && (condicion === 'Clear' || condicion === 'Clouds') && humedad >= 40 && humedad <= 60 && nubes >= 0 && nubes <= 50) {
        ropaRecomendada.push('camiseta-corta', 'pantalon-corto', 'gafas-sol');
    }
    else if (tempActual >= 26 && tempActual <= 30 && sensTermica >= 26 && sensTermica <= 32 && viento < 15 && condicion === 'Clear' && humedad >= 30 && humedad <= 50 && nubes >= 0 && nubes <= 40) {
        ropaRecomendada.push('camiseta-corta', 'pantalon-corto', 'gafas-sol', 'protector-solar');
    }
    else if (tempActual > 30 && sensTermica > 33 && viento < 15 && condicion === 'Clear' && humedad < 40 && nubes < 30) {
        ropaRecomendada.push('camiseta-corta', 'pantalon-corto', 'gafas-sol', 'protector-solar', 'botella-agua');
    }
    else if (tempActual >= 15 && tempActual <= 25 && sensTermica < 20 && viento > 30 && humedad >= 40 && humedad <= 70 && nubes >= 30 && nubes <= 70) {
        ropaRecomendada.push('rompe-vientos', 'camiseta-corta', 'pantalon-liviano', 'calzado');
    }
    else if (tempActual < 15 && sensTermica < 10 && viento > 25 && (condicion === 'Rain' || condicion === 'Drizzle') && humedad > 70 && nubes > 70) {
        ropaRecomendada.push('chubasquero', 'pantalon-largo', 'botas-agua');
    }
    else if (tempActual >= 10 && tempActual <= 20 && sensTermica < 15 && viento < 15 && (condicion === 'Rain' || condicion === 'Drizzle') && humedad > 80 && nubes > 80) {
        ropaRecomendada.push('chubasquero', 'paraguas', 'botas-agua');
    }
    else if (tempActual > 25 && sensTermica > 28 && viento < 20 && (condicion === 'Rain' || condicion === 'Drizzle') && humedad > 80 && nubes > 80) {
        ropaRecomendada.push('camiseta-corta', 'pantalon-corto', 'chubasquero', 'paraguas');
    }
    else if (tempActual < 5 && sensTermica < 0 && viento < 10 && condicion === 'Clear' && humedad < 60 && nubes < 30) {
        ropaRecomendada.push('abrigo', 'gorro', 'bufanda', 'pantalon-largo', 'botas');
    }
    else {
        if (tempActual < 0) ropaRecomendada.push('termica', 'abrigo', 'pantalon-termico', 'bufanda', 'guantes', 'gorro', 'botas');
        else if (tempActual >= 0 && tempActual < 10) ropaRecomendada.push('pantalon-largo', 'chaqueta', 'sueter', 'botas');
        else if (tempActual >= 10 && tempActual < 20) ropaRecomendada.push('pantalon-liviano', 'camiseta-corta', 'chaqueta', 'calzado');
        else if (tempActual >= 20 && tempActual < 25) ropaRecomendada.push('pantalon-liviano', 'camiseta-corta', 'calzado');
        else ropaRecomendada.push('pantalon-corto', 'camiseta-corta');

        if (condicion === 'Rain' || condicion === 'Drizzle' || condicion === 'Thunderstorm' || condicion === 'Mist') ropaRecomendada.push('chubasquero', 'paraguas', 'botas-agua');
        if (condicion === 'Clear' && tempActual > 20) ropaRecomendada.push('protector-solar', 'gafas-sol');
        if (viento > 20) ropaRecomendada.push('rompe-vientos');
        if (sensTermica < tempActual - 5 && tempActual > 5) ropaRecomendada.push('sueter');
        if (tempActual > 30) ropaRecomendada.push('botella-agua');
    }

    let html = ``;
    const prendasUnicas = [...new Set(ropaRecomendada)];

    prendasUnicas.forEach(item => {
        const altText = nombresRopa[item] || item;
        html += `
        <figure class="figure-clothes">
            <img class="img-clothes" src="/assets/ropa/${item}.png" alt="${altText} icono">
            <figcaption class="figcaption">${altText}</figcaption>
        </figure>`;
    });

    return html;
}

// SECCIÓN 3: VISUALIZACIÓN Y EVENTOS PRINCIPALES

function mostrarDatosClima(cityName, tempActual, sensTermica, humedad, viento, condicion, descCondicion, nubes, icono) {
    const contenedor = document.getElementById("contenedor-clima")
    const urlIcono = `https://openweathermap.org/img/wn/${icono}@2x.png`;

    contenedor.innerHTML = `
        <section class="data-container">
            <article class="data-card max-height">
                <header class="div-flex">
                    <h2>${cityName}</h2>
                    <i class="heart fas fa-heart" data-city-name="${cityName}"></i>
                </header>

                <div class="icons-groups">
                    <figure class="figure-clothes">
                        <img class="img-clothes" src="${urlIcono}" alt="${condicion}">
                        <figcaption class="figcaption">${descCondicion}</figcaption>
                    </figure>
                    <figure class="figure-clothes">
                        <img class="img-clothes" src="/assets/icons/termometro.png" alt="temperatura icon">
                        <figcaption class="figcaption">${tempActual} Cº</figcaption>
                    </figure>
                    <figure class="figure-clothes">
                        <img class="img-clothes" src="/assets/icons/humedad.png" alt="humedad icon">
                        <figcaption class="figcaption">${humedad} %</figcaption>
                    </figure>
                    <figure class="figure-clothes">
                        <img class="img-clothes" src="/assets/icons/viento.png" alt="viento icon">
                        <figcaption class="figcaption">${viento} m/s</figcaption>
                    </figure>
                </div>
            </article>

            <article class="data-card">
                <header class="div-flex">
                    <h2>Ropa recomendada</h2>
                </header>
                <div class="icons-groups">
                    ${obtenerRopa(cityName, tempActual, sensTermica, humedad, viento, condicion, descCondicion, nubes, icono)}
                </div>
            </article>
        </section>
    `

    const hearts = contenedor.getElementsByClassName('heart')

    if (userFavoritesList.includes(cityName)) {
        hearts[0].classList.add("heart-click");
    }

    const cityCardTemplate = `
        <article class="data-card bg-fav fav-card-item" data-city-name="${cityName}">
            <div class="div-flex div-flex2">
                <i class="eye fas fa-eye" data-city-name="${cityName}"></i>
                <h2 class="h2-city-fav">${cityName}</h2>
                <i class="heart fas fa-heart heart-click" data-city-name="${cityName}"></i>
            </div>
        </article>
    `

    for (const heart of hearts) {
        heart.addEventListener("click", async function() {
            
            const isAdding = !this.classList.contains("heart-click");
            await toggleFavorite(cityName, isAdding); 

            this.classList.toggle("heart-click")

            let cardsContainer = contenedorFav.querySelector('#city-cards-container');

            if (this.classList.contains("heart-click")) {

                if (cardsContainer === null) {
                    contenedorFav.innerHTML = `
                        <section class="fav-click-flex">
                            <header class="flex-heart">
                                <i class="fas far fa-heart icon-heart"></i>
                                <h2 class="city-title">Ciudades Favoritas</h2>
                            </header>
                            <div id="city-cards-container" class="city-cards-grid">
                            </div>
                        </section>
                    `
                    cardsContainer = contenedorFav.querySelector('#city-cards-container');
                }

                if (!cardsContainer.querySelector(`[data-city-name="${cityName}"]`)) {
                    cardsContainer.insertAdjacentHTML('beforeend', cityCardTemplate);

                    const newCard = cardsContainer.lastElementChild; // Selecciona la última tarjeta agregada
                    const newFavHeart = newCard.querySelector('.heart');
                    const newEye = newCard.querySelector('.eye');
                    // -----------------------------------------------------------------------------

                    setupRemoveFavoriteEvent(newFavHeart, heart, cityName);

                    if(newEye) {
                         newEye.addEventListener('click', () => {
                            inputCity.value = cityName;
                            form.dispatchEvent(new Event('submit'));
                            scrollToClima(); 
                       });
                    }
                }

            } else {
                const cityCardToRemove = contenedorFav.querySelector(`.fav-card-item[data-city-name="${cityName}"]`);
                if (cityCardToRemove) {
                    cityCardToRemove.remove();
                }

                if (cardsContainer && cardsContainer.children.length === 0) {
                    contenedorFav.innerHTML = contenedorDefault
                }
            }
        })
    }
}

function setupRemoveFavoriteEvent(favHeart, originalHeart, cityName) {
    favHeart.addEventListener('click', async function() {
        
        await toggleFavorite(cityName, false); 
        this.closest('.data-card').remove();

        if (originalHeart) {
            originalHeart.classList.remove("heart-click");
        } else {
            const mainHeart = document.querySelector(`.heart[data-city-name="${cityName}"]`);
            if(mainHeart) mainHeart.classList.remove("heart-click");
        }

        const cardsContainer = document.getElementById('city-cards-container');
        if (cardsContainer && cardsContainer.children.length === 0) {
            contenedorFav.innerHTML = contenedorDefault;
        }
    });
}

async function fetchData(event) {
    event.preventDefault()

    const rawCityName = inputCity.value.trim();
    if (rawCityName === "") {
        errorMesagge.innerHTML = "<p class='error-color'>Escribe el nombre de una ciudad.<p>"
        return document.getElementById("contenedor-clima").innerHTML = "";
    }
    const cityName = rawCityName[0].toUpperCase() + rawCityName.slice(1).toLowerCase()
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&lang=${lang}&appid=${apiKey}`;


    try {
        errorMesagge.innerHTML = ""
        const response = await fetch(apiUrl)

        if (!response.ok) {
            if (response.status === 404) {
                errorMesagge.innerHTML = "<p class='error-color'>No se ha encontrado esa ciudad.<p>"
                return document.getElementById("contenedor-clima").innerHTML = "";
            }
            throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()

        const tempActual = data.main.temp
        const sensTermica = data.main.feels_like
        const humedad = data.main.humidity
        const viento = data.wind.speed
        const condicion = data.weather[0].main
        const descCondicion = data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1).toLowerCase()
        const nubes = data.clouds.all
        const icono = data.weather[0].icon

        mostrarDatosClima(cityName, tempActual, sensTermica, humedad, viento, condicion, descCondicion, nubes, icono)

    } catch(error) {
        errorMesagge.innerHTML = `La aplicación no está funcionando`
    }
}

form.addEventListener('submit', fetchData)


function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');

    if (user && authActionsContainer) {
        const userData = JSON.parse(user);

        authActionsContainer.innerHTML = `
            <span class="text-secondary">Hola, ${userData.username}!</span>
            <button id="logoutButton" class="button button-login anim">
                <i class="i fas fa-sign-out-alt"></i>Cerrar Sesión
            </button>
        `;

        document.getElementById('logoutButton').addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadFavorites(); 
});