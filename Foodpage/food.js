const apiBase = "https://www.themealdb.com/api/json/v1/1/";
const recipesContainer = document.getElementById("recipes");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const randomBtn = document.getElementById("randomBtn");
const typeSelect = document.getElementById("typeSelect");
const countrySelect = document.getElementById("countrySelect");

let currentMeals = [];
let currentPage = 1;
const itemsPerPage = 8;

/* -------------------------
   Helper: render with paging
   ------------------------- */
function renderMeals() {
  recipesContainer.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const mealsToShow = currentMeals.slice(start, end);

  if (!mealsToShow || mealsToShow.length === 0) {
    recipesContainer.innerHTML = "<p>No results found.</p>";
    document.getElementById("pageInfo").innerText = `Page 0`;
    return;
  }

  mealsToShow.forEach(meal => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" data-id="${meal.idMeal}">
      <h3>${meal.strMeal}</h3>
    `;

    card.querySelector("img").addEventListener("click", () => showMealDetails(meal.idMeal));

    recipesContainer.appendChild(card);
  });

  document.getElementById("pageInfo").innerText = `Page ${currentPage}`;
}

// Show meal details in modal
function showMealDetails(mealId) {
  document.getElementById("Header").classList.add('hidden');
  fetch(`${apiBase}lookup.php?i=${mealId}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];
      const modal = document.getElementById("recipeModal");
      const modalImg = document.getElementById("modalImg");
      const modalTitle = document.getElementById("modalTitle");
      const modalIngredients = document.getElementById("modalIngredients");
      const modalInstructions = document.getElementById("modalInstructions");

      modalImg.src = meal.strMealThumb;
      modalTitle.textContent = meal.strMeal;

      // Collect ingredients + measurements
      modalIngredients.innerHTML = "";
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          const li = document.createElement("li");
          li.textContent = `${ingredient} - ${measure}`;
          modalIngredients.appendChild(li);
        }
      }

      modalInstructions.textContent = meal.strInstructions;

      modal.style.display = "flex";
      document.body.style.overflow = "hidden"; // prevent background scroll
    });
}

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("recipeModal").style.display = "none";
  document.body.style.overflow = "auto";
  document.getElementById("Header").classList.remove('hidden');
});

document.getElementById("closeX").addEventListener("click", () => {
  document.getElementById("recipeModal").style.display = "none";
  document.body.style.overflow = "auto";
  document.getElementById("Header").classList.remove('hidden');
});

/* -------------------------
   Pagination buttons
   ------------------------- */
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

/* -------------------------
   Basic fetchers
   ------------------------- */
// Search by text (returns full meal objects)
async function fetchMealsBySearch(query = "") {
  try {
    const res = await fetch(`${apiBase}search.php?s=${encodeURIComponent(query)}`);
    const data = await res.json();
    currentMeals = data.meals || [];
    currentPage = 1;
    renderMeals();
  } catch (err) {
    console.error("search error:", err);
    currentMeals = [];
    renderMeals();
  }
}

// Fetch list by filter (category or area) - returns the array from filter.php (lighter objects)
async function fetchListByFilter(paramKey, value) {
  try {
    const res = await fetch(`${apiBase}filter.php?${paramKey}=${encodeURIComponent(value)}`);
    const data = await res.json();
    return data.meals || []; // might be null -> return []
  } catch (err) {
    console.error("filter fetch error:", err);
    return [];
  }
}

/* -------------------------
   Combined filter logic
   ------------------------- */
async function applyFilters() {
  const category = typeSelect.value;
  const area = countrySelect.value;

  // If both empty → fallback to current search (or default fetch)
  if (!category && !area) {
    // preserve the current search input if any
    const q = searchInput.value.trim();
    await fetchMealsBySearch(q);
    return;
  }

  // If only category selected:
  if (category && !area) {
    const list = await fetchListByFilter("c", category);
    currentMeals = list; // items contain idMeal, strMeal, strMealThumb
    currentPage = 1;
    renderMeals();
    return;
  }

  // If only area selected:
  if (area && !category) {
    const list = await fetchListByFilter("a", area);
    currentMeals = list;
    currentPage = 1;
    renderMeals();
    return;
  }

  // BOTH selected -> fetch both lists and intersect by idMeal
  const [listByCategory, listByArea] = await Promise.all([
    fetchListByFilter("c", category),
    fetchListByFilter("a", area)
  ]);

  // convert one list to a lookup for fast intersection
  const idsArea = new Set((listByArea || []).map(m => m.idMeal));
  const intersection = (listByCategory || []).filter(m => idsArea.has(m.idMeal));

  // use intersection result (may be empty)
  currentMeals = intersection;
  currentPage = 1;
  renderMeals();
}

/* -------------------------
   Dropdowns and event wiring
   ------------------------- */
async function loadDropdowns() {
  try {
    // categories
    const catRes = await fetch(`${apiBase}list.php?c=list`);
    const catData = await catRes.json();
    if (catData.meals) {
      catData.meals.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.strCategory;
        opt.textContent = cat.strCategory;
        typeSelect.appendChild(opt);
      });
    }

    // areas
    const areaRes = await fetch(`${apiBase}list.php?a=list`);
    const areaData = await areaRes.json();
    if (areaData.meals) {
      areaData.meals.forEach(area => {
        const opt = document.createElement("option");
        opt.value = area.strArea;
        opt.textContent = area.strArea;
        countrySelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("error loading dropdowns:", err);
  }
}

// When either dropdown changes, apply combined logic
typeSelect.addEventListener("change", () => {
  // reset page index and run combined logic
  currentPage = 1;
  applyFilters();
});
countrySelect.addEventListener("change", () => {
  currentPage = 1;
  applyFilters();
});

/* -------------------------
   Search, random and init
   ------------------------- */
searchBtn.addEventListener("click", () => {
  // when user searches manually, clear filters visually (if you want) or keep them
  // here we'll clear the selects to avoid conflicting expectations
  typeSelect.value = "";
  countrySelect.value = "";
  fetchMealsBySearch(searchInput.value.trim());
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    typeSelect.value = "";
    countrySelect.value = "";
    fetchMealsBySearch(searchInput.value.trim());
  }
});

randomBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${apiBase}random.php`);
    const data = await res.json();
    currentMeals = data.meals || [];
    currentPage = 1;
    // clear filters because random is independent
    typeSelect.value = "";
    countrySelect.value = "";
    renderMeals();
  } catch (err) {
    console.error("random error:", err);
  }
});

/* -------------------------
   Initialize app
   ------------------------- */
(async function init() {
  await loadDropdowns();
  // initial fetch: empty search to show some default list (search.php?s= returns many)
  await fetchMealsBySearch("");
})();