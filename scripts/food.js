const apiBase = "https://www.themealdb.com/api/json/v1/1/";
const recipesContainer = document.getElementById("recipes");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const randomBtn = document.getElementById("randomBtn");

let currentMeals = [];
let currentPage = 1;
const itemsPerPage = 6;

async function fetchMeals(query = "") {
  const res = await fetch(`${apiBase}search.php?s=${query}`);
  const data = await res.json();
  currentMeals = data.meals || [];
  currentPage = 1;
  renderMeals();
}

function renderMeals() {
  recipesContainer.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const mealsToShow = currentMeals.slice(start, end);

  mealsToShow.forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    `;
    recipesContainer.appendChild(card);
  });

  document.getElementById("pageInfo").innerText = `Page ${currentPage}`;
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderMeals();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(currentMeals.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderMeals();
  }
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  fetchMeals(query);
});

randomBtn.addEventListener("click", async () => {
  const res = await fetch(`${apiBase}random.php`);
  const data = await res.json();
  currentMeals = data.meals;
  currentPage = 1;
  renderMeals();
});

// Load default meals
fetchMeals();