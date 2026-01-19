/**
 * FoodLogPage Class - Manages food log page
 */
export class FoodLogPage {
  constructor(foodLog, router) {
    this.foodLog = foodLog;
    this.router = router;
    this.currentDate = new Date().toISOString().split("T")[0];
    this.init();
  }

  /**
   * Initialize the page
   */
  init() {
    this.setupEventListeners();
    this.render();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Clear food log button
    let clearBtn = document.getElementById("clear-foodlog");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearFoodLog();
      });
    }

    // Quick action buttons
    document.querySelectorAll(".quick-log-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let text = btn.textContent.trim();
        if (text.includes("Meal")) {
          this.router.navigate("home");
        } else if (text.includes("Product") || text.includes("barcode")) {
          this.router.navigate("scanner");
        }
      });
    });
  }

  /**
   * Render the food log page
   */
  render() {
    this.updateDate();
    this.renderProgress();
    this.renderLoggedItems();
    this.renderWeeklyOverview();
    this.renderWeeklyStats(); 
  }

  /**
   * Update date display
   */
  updateDate() {
    let dateElement = document.getElementById("foodlog-date");
    if (dateElement) {
      let date = new Date(this.currentDate);
      let options = { weekday: "long", month: "short", day: "numeric" };
      dateElement.textContent = date.toLocaleDateString("en-US", options);
    }
  }

  /**
   * Render progress bars
   */
  renderProgress() {
    let progress = this.foodLog.getProgress(this.currentDate);

    // Calories
    let caloriesSection = document.querySelector(
      "#foodlog-today-section .bg-emerald-50",
    );
    if (caloriesSection) {
      let progressBar = caloriesSection.querySelector(
        ".bg-gray-200 .bg-emerald-500",
      );
      let text = caloriesSection.querySelector(".text-gray-500");
      if (text) text.remove();
      let percentText = caloriesSection.querySelector(".text-emerald-600");
      let currentValueText = caloriesSection.querySelector(
        ".font-bold.text-emerald-600",
      );
      let goalText = caloriesSection.querySelector('.text-gray-500');
if (goalText) goalText.style.display = 'none';


      if (progressBar) {
        progressBar.style.width = `${progress.calories.percentage}%`;
      }
      if (text) {
        text.textContent = `/ ${progress.calories.goal} kcal`;
      }
      if (percentText) {
        percentText.textContent = `${Math.round(progress.calories.percentage)}%`;
      }
      if (currentValueText) {
        currentValueText.textContent = `${Math.round(progress.calories.current)} kcal`;
      }
    }

    // Protein
    let proteinSection = document.querySelector(
      "#foodlog-today-section .bg-blue-50",
    );
    if (proteinSection) {
      let progressBar = proteinSection.querySelector(
        ".bg-gray-200 .bg-blue-500",
      );
      let text = proteinSection.querySelector(".text-gray-500");
      let percentText = proteinSection.querySelector(".text-blue-600");
      let currentValueText = proteinSection.querySelector(
        ".font-bold.text-blue-600",
      );

      if (progressBar) {
        progressBar.style.width = `${progress.protein.percentage}%`;
      }
      if (text) {
        text.textContent = `/ ${progress.protein.goal} g`;
      }
      if (percentText) {
        percentText.textContent = `${Math.round(progress.protein.percentage)}%`;
      }
      if (currentValueText) {
        currentValueText.textContent = `${Math.round(progress.protein.current)} g`;
      }
    }

    // Carbs
    let carbsSection = document.querySelector(
      "#foodlog-today-section .bg-amber-50",
    );
    if (carbsSection) {
      let progressBar = carbsSection.querySelector(
        ".bg-gray-200 .bg-amber-500",
      );
      let text = carbsSection.querySelector(".text-gray-500");
      let percentText = carbsSection.querySelector(".text-amber-600");
      let currentValueText = carbsSection.querySelector(
        ".font-bold.text-amber-600",
      );

      if (progressBar) {
        progressBar.style.width = `${progress.carbs.percentage}%`;
      }
      if (text) {
        text.textContent = `/ ${progress.carbs.goal} g`;
      }
      if (percentText) {
        percentText.textContent = `${Math.round(progress.carbs.percentage)}%`;
      }
      if (currentValueText) {
        currentValueText.textContent = `${Math.round(progress.carbs.current)} g`;
      }
    }

    // Fat
    let fatSection = document.querySelector(
      "#foodlog-today-section .bg-purple-50",
    );
    if (fatSection) {
      let progressBar = fatSection.querySelector(".bg-gray-200 .bg-purple-500");
      let text = fatSection.querySelector(".text-gray-500");
      let percentText = fatSection.querySelector(".text-purple-600");
      let currentValueText = fatSection.querySelector(
        ".font-bold.text-purple-600",
      );

      if (progressBar) {
        progressBar.style.width = `${progress.fat.percentage}%`;
      }
      if (text) {
        text.textContent = `/ ${progress.fat.goal} g`;
      }
      if (percentText) {
        percentText.textContent = `${Math.round(progress.fat.percentage)}%`;
      }
      if (currentValueText) {
        currentValueText.textContent = `${Math.round(progress.fat.current)} g`;
      }
    }
  }

  /**
   * Render logged items list
   */
  renderLoggedItems() {
    let container = document.getElementById("logged-items-list");
    if (!container) return;

    let entries = this.foodLog.getEntriesByDate(this.currentDate);
    let countElement = container.parentElement.querySelector("h4");
    let clearBtn = document.getElementById("clear-foodlog");

    if (countElement) {
      countElement.textContent = `Logged Items (${entries.length})`;
    }

    if (clearBtn) {
      clearBtn.style.display = entries.length > 0 ? "block" : "none";
    }

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="mb-4">
            <i class="fa-solid fa-utensils text-6xl text-gray-300"></i>
          </div>
          <p class="text-gray-900 font-semibold mb-1">No food logged today</p>
          <p class="text-sm text-gray-500 mb-6">Start tracking your nutrition by logging meals or scanning products</p>
          <div class="flex gap-3 justify-center">
            <button class="empty-log-meal-btn bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              <i class="fa-solid fa-plus"></i>
              Browse Recipes
            </button>
            <button class="empty-scan-product-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              <i class="fa-solid fa-barcode"></i>
              Scan Product
            </button>
          </div>
        </div>
      `;

      // Add event listeners for these new buttons
      let mealBtn = container.querySelector(".empty-log-meal-btn");
      let scanBtn = container.querySelector(".empty-scan-product-btn");

      if (mealBtn) {
        mealBtn.addEventListener("click", () => {
          this.router.navigate("home");
        });
      }

      if (scanBtn) {
        scanBtn.addEventListener("click", () => {
          this.router.navigate("scanner");
        });
      }

      return;
    }

    container.innerHTML = entries
      .map((entry) => this.createEntryCard(entry))
      .join("");

    // Add remove button listeners
    container.querySelectorAll(".remove-entry-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let entryId = btn.dataset.entryId;
        this.removeEntry(entryId);
      });
    });
  }

  /**
   * Create entry card HTML
   */
  createEntryCard(entry) {
    let nutrition = entry.nutrition || {};
    let typeLabel = entry.type === "meal" ? "Recipe" : "Product";
    let time = new Date(entry.timestamp || Date.now()).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      },
    );

    return `
      <div class="bg-white border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-4">
          <img
            src="${entry.image || "https://via.placeholder.com/60"}"
            alt="${entry.name}"
            class="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-1">
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 truncate">${entry.name}</h4>
                <div class="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                  <span>1 serving</span>
                  <span>•</span>
                  <span class="text-emerald-600">${typeLabel}</span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">${time}</p>
              </div>
              <div class="flex items-center gap-4 ml-4">
                <div class="text-right">
                  <p class="text-2xl font-bold text-emerald-600">${Math.round(nutrition.calories || 0)}</p>
                  <p class="text-xs text-gray-500">kcal</p>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <div class="text-center">
                    <p class="font-semibold text-gray-700">${Math.round(nutrition.protein || 0)}g</p>
                    <p class="text-xs text-gray-500">P</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700">${Math.round(nutrition.carbs || 0)}g</p>
                    <p class="text-xs text-gray-500">C</p>
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-700">${Math.round(nutrition.fat || 0)}g</p>
                    <p class="text-xs text-gray-500">F</p>
                  </div>
                </div>
                <button class="remove-entry-btn text-gray-400 hover:text-red-500 transition-colors ml-2" data-entry-id="${entry.id}" title="Remove">
                  <i class="fa-solid fa-trash text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Remove entry from food log
   */
  removeEntry(entryId) {
    Swal.fire({
      title: "Remove Entry?",
      text: "Are you sure you want to remove this entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, remove it",
    }).then((result) => {
      if (result.isConfirmed) {
        this.foodLog.removeEntry(entryId);
        this.render();
        Swal.fire("Removed!", "Entry has been removed.", "success");
      }
    });
  }

  /**
   * Clear food log for current date
   */
  clearFoodLog() {
    Swal.fire({
      title: "Clear All Entries?",
      text: `Are you sure you want to clear all entries for ${this.currentDate}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, clear all",
    }).then((result) => {
      if (result.isConfirmed) {
        this.foodLog.clearDate(this.currentDate);
        this.render();
        Swal.fire("Cleared!", "All entries have been removed.", "success");
      }
    });
  }

  /**
   * Render weekly overview cards
   */
 renderWeeklyOverview() {
  const container = document.querySelector("#weekly-chart");
  if (!container) return;

  const weekData = this.getLast7DaysData();
  const allLogs = this.foodLog.getAllEntries() || [];

  container.innerHTML = `
    <div class="w-full">
      <h3 class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
      </h3>
      <div class="grid grid-cols-7 gap-4">
        ${weekData
          .map((day) => {
            const dateObj = new Date(day.date);
            const dayNum = dateObj.getDate();
            const itemsCount = allLogs.filter((e) => {
              if (!e.timestamp) return false;
              return (
                new Date(e.timestamp).toISOString().split("T")[0] === day.date
              );
            }).length;
            const isToday = day.date === new Date().toISOString().split("T")[0];

            return `
              <div class="text-center py-4 transition-all duration-200 ${
                isToday
                  ? "bg-indigo-100 border border-indigo-300 rounded-xl"
                  : "bg-gray-50 rounded-xl"
              }">
                <p class="text-xs text-gray-500 mb-1">${day.dayName}</p>
                <p class="text-sm font-semibold text-gray-700 mb-2">${dayNum}</p>
                <div>
                  <p class="text-2xl font-bold ${
                    day.calories > 0 ? "text-gray-900" : "text-gray-300"
                  } mb-0.5">${day.calories}</p>
                  <p class="text-xs ${
                    day.calories > 0 ? "text-gray-400" : "text-gray-300"
                  }">kcal</p>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}



isInLast7Days(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  const diff = (today - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 7;
}renderWeeklyStats() {
  const container = document.getElementById("weekly-stats");
  if (!container) return;

  const weekData = this.getLast7DaysData();

  const totalCalories = weekData.reduce((s, d) => s + d.calories, 0);
  const weeklyAverage = Math.round(totalCalories / 7);


  const totalItems = weekData.reduce((sum, d) => {
    const entries = this.foodLog.getEntriesByDate(d.date);
    return sum + entries.length;
  }, 0);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <div class="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <i class="fa-solid fa-chart-line text-emerald-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Weekly Average</p>
          <p class="text-xl font-bold text-gray-900">${weeklyAverage} kcal</p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-utensils text-blue-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Items This Week</p>
          <p class="text-xl font-bold text-gray-900">${totalItems} items</p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <i class="fa-solid fa-bullseye text-purple-600 text-xl"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">Days On Goal</p>
          <p class="text-xl font-bold text-gray-900">0 / 7</p>
        </div>
      </div>

    </div>
  `;
}

  /**
   * Get last 7 days data
   */
  getLast7DaysData() {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[date.getDay()];

      const entries = this.foodLog.getEntriesByDate(dateStr);
      const calories = entries.reduce((sum, entry) => {
        return sum + (entry.nutrition?.calories || 0);
      }, 0);

      days.push({
        date: dateStr,
        dayName: dayName,
        calories: Math.round(calories),
      });
    }

    return days;
  }

  /**
   * Check if day is today
   */
  isToday(dateStr) {
    let today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  }

  /**
   * Show the food log section
   */
  show() {
    // Hide all other sections
    let allSections = [
      "all-recipes-section",
      "meal-categories-section",
      "search-filters-section",
      "meal-details",
      "products-section",
    ];
    allSections.forEach((id) => {
      let section = document.getElementById(id);
      if (section) section.style.display = "none";
    });

    // Show food log section
    let foodlogSection = document.getElementById("foodlog-section");
    if (foodlogSection) {
      foodlogSection.style.display = "block";
    }

    // Update header
    this.updateHeader(
      "Food Log",
      "Track and monitor your daily nutrition intake",
    );

    // Re-render to refresh data
    this.render();
  }

  /**
   * Update page header
   */
  updateHeader(title, subtitle) {
    let headerTitle = document.querySelector("#header h1");
    let headerSubtitle = document.querySelector("#header p");

    if (headerTitle) headerTitle.textContent = title;
    if (headerSubtitle) headerSubtitle.textContent = subtitle;
  }
}
