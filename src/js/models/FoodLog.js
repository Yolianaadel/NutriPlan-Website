/**
 * FoodLog Class - Manages food log data and storage
 */
export class FoodLog {
  constructor() {
    this.storageKey = 'nutriplan_foodlog';
    this.goalsKey = 'nutriplan_goals';
    this.dailyGoals = null;

    this.loadGoals();
  }

  /* =========================
     Goals
  ========================== */

  loadGoals() {
    let saved = localStorage.getItem(this.goalsKey);
    if (saved) {
      try {
        this.dailyGoals = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading goals:', e);
        this.dailyGoals = null;
      }
    }
  }

  setGoals(goals) {
    this.dailyGoals = goals;
    localStorage.setItem(this.goalsKey, JSON.stringify(goals));
  }

  getGoals() {
    return this.dailyGoals;
  }

  /* =========================
     Entries helpers
  ========================== */

  getAllEntries() {
    try {
      let stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading entries:', e);
      return [];
    }
  }

  getEntriesByDate(date) {
    let allEntries = this.getAllEntries();

    return allEntries.filter(entry => {
      if (!entry.date) return false;
      return entry.date.split('T')[0] === date;
    });
  }

  /* =========================
     CRUD operations
  ========================== */

  addEntry(entry) {
    let entries = this.getAllEntries();

    entry.date = new Date().toISOString().split('T')[0];

    entries.push(entry);
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  removeEntry(entryId) {
    let entries = this.getAllEntries();
    let filtered = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  clearDate(date) {
    let entries = this.getAllEntries();

    let filtered = entries.filter(entry => {
      if (!entry.date) return true;
      return entry.date.split('T')[0] !== date;
    });

    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  /* =========================
     Nutrition calculations
  ========================== */

  getDateTotals(date) {
    let entries = this.getEntriesByDate(date);

    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };

    entries.forEach(entry => {
      if (entry.nutrition) {
        totals.calories += entry.nutrition.calories || 0;
        totals.protein += entry.nutrition.protein || 0;
        totals.carbs += entry.nutrition.carbs || 0;
        totals.fat += entry.nutrition.fat || 0;
        totals.fiber += entry.nutrition.fiber || 0;
        totals.sugar += entry.nutrition.sugar || 0;
      }
    });

    return totals;
  }

  getProgress(date) {
    let totals = this.getDateTotals(date);

    // always return a safe object (no UI crash)
    if (!this.dailyGoals) {
      return {
        calories: { current: totals.calories, goal: null, percentage: 0 },
        protein: { current: totals.protein, goal: null, percentage: 0 },
        carbs: { current: totals.carbs, goal: null, percentage: 0 },
        fat: { current: totals.fat, goal: null, percentage: 0 }
      };
    }

    return {
      calories: {
        current: totals.calories,
        goal: this.dailyGoals.calories,
        percentage: Math.min(
          (totals.calories / this.dailyGoals.calories) * 100,
          100
        )
      },
      protein: {
        current: totals.protein,
        goal: this.dailyGoals.protein,
        percentage: Math.min(
          (totals.protein / this.dailyGoals.protein) * 100,
          100
        )
      },
      carbs: {
        current: totals.carbs,
        goal: this.dailyGoals.carbs,
        percentage: Math.min(
          (totals.carbs / this.dailyGoals.carbs) * 100,
          100
        )
      },
      fat: {
        current: totals.fat,
        goal: this.dailyGoals.fat,
        percentage: Math.min(
          (totals.fat / this.dailyGoals.fat) * 100,
          100
        )
      }
    };
  }

  getWeeklyOverview() {
    let weekData = [];
    let today = new Date();

    for (let i = 6; i >= 0; i--) {
      let date = new Date(today);
      date.setDate(date.getDate() - i);

      let dateStr = date.toISOString().split('T')[0];

      weekData.push({
        date: dateStr,
        totals: this.getDateTotals(dateStr),
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    return weekData;
  }
}
