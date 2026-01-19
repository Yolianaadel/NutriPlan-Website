import { Meal } from '../models/Meal.js';
import { NutritionAPI } from '../api/NutritionAPI.js';

/**
 * MealDetailsPage Class - Manages meal details page
 */
export class MealDetailsPage {
  constructor(mealAPI, foodLog, router) {
    this.mealAPI = mealAPI;
    this.foodLog = foodLog;
    this.router = router;

    // Nutrition API instance
    this.nutritionAPI = new NutritionAPI(
      '48mObQmnPYyGH8fdtprpReoCbTpLkmhvQTQeHWT6'
    );

    this.currentMeal = null;
  }

  /**
   * Show meal details
   */
  async show(mealId) {
    this.showSection();
    this.showLoading();

    const mealData = await this.mealAPI.getMealById(mealId);

    if (!mealData) {
      this.showError();
      return;
    }

    // Create meal model
    this.currentMeal = new Meal(mealData);

    // Get dynamic nutrition from API
    this.currentMeal.nutrition =
      await this.nutritionAPI.analyzeIngredients(
        this.currentMeal.ingredients
      );

    this.renderMealDetails();
    this.setupEventListeners();
  }

  /**
   * Show loading state
   */
  showLoading() {
    let container = document.getElementById('meal-details');
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      `;
    }
  }

  /**
   * Show error state
   */
  showError() {
    let container = document.getElementById('meal-details');
    if (container) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-exclamation-triangle text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">Meal not found</p>
          <button id="back-to-meals-btn" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Back to Recipes
          </button>
        </div>
      `;
    }
  }

  /**
   * Render meal details
   */
  renderMealDetails() {
    if (!this.currentMeal) return;

    let meal = this.currentMeal;
    let container = document.getElementById('meal-details');
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <!-- Back Button -->
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>

        <!-- Hero Section -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.image}" alt="${meal.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area}</span>
                ${meal.tags.map(tag => `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${tag}</span>`).join('')}
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
              <div class="flex items-center gap-6 text-white/90">
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-fire"></i>
                  <span>${meal.nutrition.calories} cal/serving</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Ingredients -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i class="fa-solid fa-list text-emerald-600"></i>
                  Ingredients
                </h2>
                <span class="text-sm text-gray-500">${meal.ingredients.length} items</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${meal.ingredients.map(ing => `
                  <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" class="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500">
                    <span class="flex-1">
                      <span class="font-medium text-gray-900">${ing.measure || ''}</span>
                      <span class="text-gray-700">${ing.ingredient}</span>
                    </span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Instructions -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-book-open text-emerald-600"></i>
                Instructions
              </h2>
              ${this.formatInstructions(meal.instructions).map((step, i) => `
                <div class="flex gap-4 mb-4">
                  <div class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                    ${i + 1}
                  </div>
                  <p class="flex-1 text-gray-700 pt-1">${step}</p>
                </div>
              `).join('')}
            </div>

            <!--  Video Section -->
            ${meal.video ? `
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <iframe
                    src="https://www.youtube.com/embed/${meal.video}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            ` : ''}
          </div>
        <!-- Right Column - Nutrition -->
          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <div id="nutrition-facts-container">
                <p class="text-sm text-gray-500 mb-4">Per serving</p>
                <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <p class="text-sm text-gray-600">Calories per serving</p>
                  <p class="text-4xl font-bold text-emerald-600">${meal.nutrition.calories}</p>
                </div>
            <!-- Macros -->
            <div class="space-y-4">
              ${this.renderNutritionItem('Protein', meal.nutrition.protein, 'emerald')}
              ${this.renderNutritionItem('Carbs', meal.nutrition.carbs, 'blue')}
              ${this.renderNutritionItem('Fat', meal.nutrition.fat, 'purple')}
              ${meal.nutrition.fiber ? this.renderNutritionItem('Fiber', meal.nutrition.fiber, 'orange') : ''}
              ${meal.nutrition.sugar ? this.renderNutritionItem('Sugar', meal.nutrition.sugar, 'pink') : ''}
              ${meal.nutrition.saturatedFat ? this.renderNutritionItem('Saturated Fat', meal.nutrition.saturatedFat, 'red') : ''}
            </div>

            <!-- Other Nutrients -->
            ${meal.nutrition.cholesterol || meal.nutrition.sodium ? `
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Other</h3>
                <div class="grid grid-cols-2 gap-4">
                  ${meal.nutrition.cholesterol ? `
                    <div>
                      <p class="text-xs text-gray-500">Cholesterol</p>
                      <p class="font-semibold text-gray-900">${meal.nutrition.cholesterol}mg</p>
                    </div>
                  ` : ''}
                  ${meal.nutrition.sodium ? `
                    <div>
                      <p class="text-xs text-gray-500">Sodium</p>
                      <p class="font-semibold text-gray-900">${meal.nutrition.sodium}mg</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  formatInstructions(instructions) {
    if (!instructions) return [];
    return instructions
      .split(/\d+\.|\n/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  renderNutritionBar(label, value, color, max) {
    let percentage = Math.min((value / max) * 100, 100);
    return `
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1">
          <span>${label}</span>
          <span>${value}g</span>
        </div>
        <div class="w-full bg-gray-200 h-2 rounded-full">
          <div class="bg-${color}-500 h-2 rounded-full" style="width:${percentage}%"></div>
        </div>
      </div>
    `;
  }

  renderNutritionItem(label, value, color) {
    const roundedValue = Math.round(value);
    return `
      <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-${color}-500"></div>
          <span class="text-gray-700 font-medium">${label}</span>
        </div>
        <span class="text-gray-900 font-bold">${roundedValue}g</span>
      </div>
      <div class="w-full bg-gray-200 h-2 rounded-full mb-2">
        <div class="bg-${color}-500 h-2 rounded-full transition-all" style="width: ${Math.min(roundedValue, 100)}%"></div>
      </div>
    `;
  }

  setupEventListeners() {
    let backBtn = document.getElementById('back-to-meals-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.router.navigate('home'));
    }

    let logBtn = document.getElementById('log-meal-btn');
    if (logBtn && this.currentMeal) {
      logBtn.addEventListener('click', () => {
        this.openLogModal();
      });
    }
  }

  openLogModal() {
    let modal = document.getElementById('log-meal-modal');
    
  
    if (!modal) {
      this.createLogModal();
      modal = document.getElementById('log-meal-modal');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('modal-meal-name').textContent = this.currentMeal.name;
    document.getElementById('modal-meal-image').src = this.currentMeal.image;

    // Reset servings input
    const servingInput = document.getElementById('serving-count');
    servingInput.value = 1;

    const updateNutrition = () => {
      const servings = parseFloat(servingInput.value);

      document.getElementById('modal-calories').textContent =
        Math.round(this.currentMeal.nutrition.calories * servings);

      document.getElementById('modal-protein').textContent =
        Math.round(this.currentMeal.nutrition.protein * servings) + 'g';

      document.getElementById('modal-carbs').textContent =
        Math.round(this.currentMeal.nutrition.carbs * servings) + 'g';

      document.getElementById('modal-fat').textContent =
        Math.round(this.currentMeal.nutrition.fat * servings) + 'g';
    };

    updateNutrition();

    document.getElementById('serving-plus').onclick = () => {
      servingInput.value = (parseFloat(servingInput.value) + 0.5).toFixed(1);
      updateNutrition();
    };

    document.getElementById('serving-minus').onclick = () => {
      if (parseFloat(servingInput.value) > 0.5) {
        servingInput.value = (parseFloat(servingInput.value) - 0.5).toFixed(1);
        updateNutrition();
      }
    };

    servingInput.addEventListener('input', updateNutrition);

    document.getElementById('cancel-log').onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    document.getElementById('confirm-log').onclick = () => {
      const servings = parseFloat(servingInput.value);
      const entry = this.currentMeal.toFoodLogEntry();

      entry.nutrition = {
        calories: this.currentMeal.nutrition.calories * servings,
        protein: this.currentMeal.nutrition.protein * servings,
        carbs: this.currentMeal.nutrition.carbs * servings,
        fat: this.currentMeal.nutrition.fat * servings
      };

      this.foodLog.addEntry(entry);

      modal.classList.add('hidden');
      modal.classList.remove('flex');


      this.showSuccessModal(servings);
    };
  }

  showSection() {
    let sections = [
      'all-recipes-section',
      'meal-categories-section',
      'search-filters-section',
      'products-section',
      'foodlog-section'
    ];

    sections.forEach(id => {
      let el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    let mealDetails = document.getElementById('meal-details');
    if (mealDetails) mealDetails.style.display = 'block';
  }

  /**
   * Create log modal if it doesn't exist
   */
  createLogModal() {
    const existingModal = document.getElementById('log-meal-modal');
    if (existingModal) return;

    const modalHTML = `
      <div id="log-meal-modal" class="hidden fixed inset-0 bg-black/50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6">
            <img id="modal-meal-image" src="" alt="" class="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
              <p id="modal-meal-name" class="text-gray-500 text-sm"></p>
            </div>
          </div>

          <!-- Servings -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
            <div class="flex items-center gap-3">
              <button id="serving-minus" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-minus text-gray-600"></i>
              </button>
              <input type="number" id="serving-count" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
              <button id="serving-plus" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-plus text-gray-600"></i>
              </button>
            </div>
          </div>

          <!-- Nutrition Summary -->
          <div class="bg-emerald-50 rounded-xl p-4 mb-6">
            <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p id="modal-calories" class="text-lg font-bold text-emerald-600">0</p>
                <p class="text-xs text-gray-500">Calories</p>
              </div>
              <div>
                <p id="modal-protein" class="text-lg font-bold text-blue-600">0g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>
              <div>
                <p id="modal-carbs" class="text-lg font-bold text-amber-600">0g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>
              <div>
                <p id="modal-fat" class="text-lg font-bold text-purple-600">0g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button id="cancel-log" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button id="confirm-log" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
              <i class="fa-solid fa-clipboard-list mr-2"></i>
              Log Meal
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
   * Show success modal after logging meal
   */
  showSuccessModal(servings) {
    const totalCalories = Math.round(this.currentMeal.nutrition.calories * servings);
    
    const successModalHTML = `
      <div id="success-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
          <!-- Success Icon -->
          <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Meal Logged!</h2>

          <!-- Message -->
          <p class="text-gray-600 mb-2">
            ${this.currentMeal.name} (${servings} serving${servings > 1 ? 's' : ''}) has been added to your daily log.
          </p>

          <!-- Calories -->
          <div class="text-3xl font-bold text-emerald-600 mb-6">
            +${totalCalories} calories
          </div>
        </div>
      </div>
    `;

    const oldModal = document.getElementById('success-modal');
    if (oldModal) {
      oldModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', successModalHTML);

    setTimeout(() => {
      const modal = document.getElementById('success-modal');
      if (modal) {
        modal.remove();
      }
    }, 3000);
  }
}