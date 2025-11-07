const drinksContainer = document.getElementById('drinksContainer');
const searchInput = document.getElementById('searchInput');
const drinkType = document.getElementById('drinkType');
const randomBtn = document.getElementById('randomBtn');
const pageInfo = document.getElementById('pageInfo');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const searchBtn = document.getElementById('searchBtn');

const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const popupImg = document.getElementById('popupImg');
const popupTitle = document.getElementById('popupTitle');
const popupIngredients = document.getElementById('popupIngredients');
const popupInstructions = document.getElementById('popupInstructions');
const popupContent = document.querySelector('.popup-content');

let allDrinks = [];
let currentPage = 1;
const drinksPerPage = 8;

// Back to All Drinks button
const backPopupBtn = document.createElement('button');
backPopupBtn.textContent = 'Back to All Drinks';
backPopupBtn.classList.add('back-btn');
Object.assign(backPopupBtn.style, {
  marginTop: '1.5rem',
  padding: '0.8rem 1.2rem',
  backgroundColor: '#0078ff',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background 0.3s',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto'
});
backPopupBtn.addEventListener('mouseenter', () => (backPopupBtn.style.backgroundColor = '#005fcc'));
backPopupBtn.addEventListener('mouseleave', () => (backPopupBtn.style.backgroundColor = '#0078ff'));

// Append it at the bottom of popup content
popupContent.appendChild(backPopupBtn);

// Fetch ALL drinks (A–Z)
async function fetchAllDrinks() {
  allDrinks = [];
  for (let i = 97; i <= 122; i++) {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${String.fromCharCode(i)}`);
    const data = await res.json();
    if (data.drinks) allDrinks = allDrinks.concat(data.drinks);
  }
  currentPage = 1;
  displayDrinks();
}

// Display drinks for the current page
function displayDrinks() {
  drinksContainer.innerHTML = '';
  const start = (currentPage - 1) * drinksPerPage;
  const end = start + drinksPerPage;
  const paginated = allDrinks.slice(start, end);

  paginated.forEach(drink => {
    const card = document.createElement('div');
    card.className = 'drink-card';
    card.innerHTML = `
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
      <h3>${drink.strDrink}</h3>
    `;
    card.addEventListener('click', () => showPopup(drink));
    drinksContainer.appendChild(card);
  });

  const totalPages = Math.ceil(allDrinks.length / drinksPerPage);
  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  document.getElementById("Header").classList.remove('hidden');
}

// Popup display (fetches full info if missing)
async function showPopup(drink) {
  document.getElementById("Header").classList.add('hidden');
  if (!drink.strInstructions && drink.idDrink) {
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
    const data = await res.json();
    drink = data.drinks[0];
  }

  popupImg.src = drink.strDrinkThumb;
  popupTitle.textContent = drink.strDrink;

  popupIngredients.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      const li = document.createElement('li');
      li.textContent = `${measure || ''} ${ingredient}`;
      popupIngredients.appendChild(li);
    }
  }

  popupInstructions.textContent = drink.strInstructions || 'No instructions available.';

  popup.classList.add('active');
}

// Close popup
closePopup.addEventListener('click', () => {
  popup.classList.remove('active');
  document.getElementById("Header").classList.remove('hidden');
});

// Back to All Drinks button inside popup
backPopupBtn.addEventListener('click', () => {
  popup.classList.remove('active');
  searchInput.value = '';
  drinkType.value = 'all';
  currentPage = 1;
  fetchAllDrinks();
  document.getElementById("Header").classList.remove('hidden');
});

// Pagination
prevPage.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayDrinks();
    document.getElementById("Header").classList.remove('hidden');
  }
});

nextPage.addEventListener('click', () => {
  const totalPages = Math.ceil(allDrinks.length / drinksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayDrinks();
    document.getElementById("Header").classList.remove('hidden');
  }
});

// Search
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    fetchAllDrinks();
    return;
  }

  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  allDrinks = data.drinks || [];
  currentPage = 1;
  displayDrinks();
});

searchBtn.addEventListener('click', async () => {
  const query = searchInput.value;
  if (!query) {
    fetchAllDrinks();
    return;
  }

  console.log('Searching for:', query);

  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  allDrinks = data.drinks || [];
  currentPage = 1;
  displayDrinks();
});

// Filter by Category
drinkType.addEventListener('change', async () => {
  const selected = drinkType.value;
  if (selected === 'all') {
    fetchAllDrinks();
    return;
  }

  const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(selected)}`);
  const data = await res.json();
  allDrinks = data.drinks || [];
  currentPage = 1;
  displayDrinks();
});

// Random
randomBtn.addEventListener('click', async () => {
  const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
  const data = await res.json();
  showPopup(data.drinks[0]);
});

// Initial Load
fetchAllDrinks();
document.getElementById("Header").classList.remove('hidden');
