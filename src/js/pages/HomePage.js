export class HomePage {
  constructor(mealAPI, router) {
    this.mealAPI = mealAPI;
    this.router = router;
    this.meals = [];
    this.categories = [];
    this.areas = [];
    this.currentFilter = { type: null, value: null };
    this.init();
  }

  async init() {
    await this.loadCategories();
    await this.loadAreas();
    await this.loadMeals();
    this.setupEventListeners();
  }

  async loadCategories() {
    this.categories = await this.mealAPI.getCategories();
    this.renderCategoryFilters();
  }

  async loadAreas() {
    this.areas = await this.mealAPI.getAreas();
    this.renderAreaFilters();
  }

  async loadMeals() {
    this.showLoading();
    
    if (this.currentFilter.type === 'category') {
      this.meals = await this.mealAPI.filterByCategory(this.currentFilter.value);
    } else if (this.currentFilter.type === 'area') {
      this.meals = await this.mealAPI.filterByArea(this.currentFilter.value);
    } else {
      // Get random 25 meals
      this.meals = await this.mealAPI.getRandomMeals(25);
    }
    
    this.hideLoading();
    this.renderMeals();
    this.updateRecipesCount();
  }

  showLoading() {
    let grid = document.getElementById('recipes-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      `;
    }
  }

  hideLoading() {
    // Loading will be replaced by renderMeals
  }

  renderMeals() {
    let grid = document.getElementById('recipes-grid');
    if (!grid) return;

    if (this.meals.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No recipes found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.meals.map(meal => this.createMealCard(meal)).join('');
    
    // Add click listeners
    grid.querySelectorAll('.recipe-card').forEach(card => {
      card.addEventListener('click', () => {
        let mealId = card.dataset.mealId;
        this.router.navigate(`meal/${mealId}`);
      });
    });
  }

  createMealCard(meal) {
    return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.idMeal}">
        <div class="relative h-48 overflow-hidden">
          <img
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            loading="lazy"
          />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${meal.strCategory || 'Food'}
            </span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
              ${meal.strArea || 'International'}
            </span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.strMeal}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.strCategory || 'Food'}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${meal.strArea || 'International'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  renderCategoryFilters() {
    let categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    // Show first 12 categories
    let displayCategories = this.categories.slice(0, 12);
    
    categoriesGrid.innerHTML = displayCategories.map(cat => `
      <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group" data-category="${cat.strCategory}">
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid fa-drumstick-bite"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3>
          </div>
        </div>
      </div>
    `).join('');

    // Add click listeners
    categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        let category = card.dataset.category;
        this.filterByCategory(category);
      });
    });
  }

  renderAreaFilters() {
    let filterSection = document.getElementById('search-filters-section');
    if (!filterSection) return;

    let buttonsContainer = filterSection.querySelector('.flex.items-center.gap-3');
    if (!buttonsContainer) return;

    // Clear existing area buttons (keep "All Recipes")
    let allRecipesBtn = buttonsContainer.querySelector('button');
    buttonsContainer.innerHTML = '';

    // Add "All Recipes" button
    let allBtn = document.createElement('button');
    allBtn.className = this.currentFilter.type === null 
      ? 'px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
    allBtn.textContent = 'All Recipes';
    allBtn.addEventListener('click', () => this.clearFilter());
    buttonsContainer.appendChild(allBtn);

    // Add area buttons (first 10)
    let displayAreas = this.areas.slice(0, 10);
    displayAreas.forEach(area => {
      let btn = document.createElement('button');
      btn.className = this.currentFilter.type === 'area' && this.currentFilter.value === area.strArea
        ? 'px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all'
        : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all';
      btn.textContent = area.strArea;
      btn.addEventListener('click', () => this.filterByArea(area.strArea));
      buttonsContainer.appendChild(btn);
    });
  }

  filterByCategory(category) {
    this.currentFilter = { type: 'category', value: category };
    this.loadMeals();
    this.renderAreaFilters(); // Update button states
  }

  filterByArea(area) {
    this.currentFilter = { type: 'area', value: area };
    this.loadMeals();
    this.renderAreaFilters(); // Update button states
  }

  clearFilter() {
    this.currentFilter = { type: null, value: null };
    this.loadMeals();
    this.renderAreaFilters(); // Update button states
  }

  updateRecipesCount() {
    let countElement = document.getElementById('recipes-count');
    if (countElement) {
      countElement.textContent = `Showing ${this.meals.length} recipe${this.meals.length !== 1 ? 's' : ''}`;
    }
  }

  setupEventListeners() {
    // Search input
    let searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        let query = e.target.value.trim();
        
        if (query.length >= 2) {
          searchTimeout = setTimeout(async () => {
            let results = await this.mealAPI.searchMealsByName(query);
            this.meals = results.slice(0, 25);
            this.renderMeals();
            this.updateRecipesCount();
          }, 500);
        } else if (query.length === 0) {
          this.clearFilter();
        }
      });
    }

    // View toggle buttons
    let gridViewBtn = document.getElementById('grid-view-btn');
    let listViewBtn = document.getElementById('list-view-btn');
    let recipesGrid = document.getElementById('recipes-grid');

    if (gridViewBtn && listViewBtn && recipesGrid) {
      gridViewBtn.addEventListener('click', () => {
        recipesGrid.className = 'grid grid-cols-4 gap-5';
        gridViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
        listViewBtn.className = 'px-3 py-1.5';
      });

listViewBtn.addEventListener('click', () => {
  recipesGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  listViewBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
  gridViewBtn.className = 'px-3 py-1.5';
});
    }
  }

  show() {
    let sections = ['all-recipes-section', 'meal-categories-section', 'search-filters-section'];
    sections.forEach(id => {
      let section = document.getElementById(id);
      if (section) section.style.display = 'block';
    });

    // Hide other sections
    let otherSections = ['meal-details', 'products-section', 'foodlog-section'];
    otherSections.forEach(id => {
      let section = document.getElementById(id);
      if (section) section.style.display = 'none';
    });

    // Update header
    this.updateHeader('Meals & Recipes', 'Discover delicious and nutritious recipes tailored for you');
  }

  updateHeader(title, subtitle) {
    let headerTitle = document.querySelector('#header h1');
    let headerSubtitle = document.querySelector('#header p');
    
    if (headerTitle) headerTitle.textContent = title;
    if (headerSubtitle) headerSubtitle.textContent = subtitle;
  }
}
