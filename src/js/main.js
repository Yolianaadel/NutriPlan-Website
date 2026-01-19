import { MealAPI } from './api/MealAPI.js';
import { ProductAPI } from './api/ProductAPI.js';
// import { Meal } from './models/Meal.js';
// import { Product } from './models/Product.js';
import { FoodLog } from './models/FoodLog.js';
import { Router } from './services/Router.js';
import { HomePage } from './pages/HomePage.js';
import { MealDetailsPage } from './pages/MealDetailsPage.js';
import { ProductScannerPage } from './pages/ProductScannerPage.js';
import { FoodLogPage } from './pages/FoodLogPage.js';


class App {
  constructor() {
    this.mealAPI = null;
    this.productAPI = null;
    this.foodLog = null;
    this.router = null;
    this.homePage = null;
    this.mealDetailsPage = null;
    this.productScannerPage = null;
    this.foodLogPage = null;
  }

  async init() {
    this.hideLoadingOverlay();

    this.mealAPI = new MealAPI();
    this.productAPI = new ProductAPI();
    this.foodLog = new FoodLog();
    this.router = new Router();
    
    this.homePage = new HomePage(this.mealAPI, this.router);
    this.mealDetailsPage = new MealDetailsPage(this.mealAPI, this.foodLog, this.router);
    this.productScannerPage = new ProductScannerPage(this.productAPI, this.foodLog, this.router);
    this.foodLogPage = new FoodLogPage(this.foodLog, this.router);

    this.setupRoutes();
    this.setupSidebarNavigation();
    this.setupHeaderMenuToggle();
    
    this.router.handleRoute();
  }

  setupRoutes() {
    this.router.register('home', () => {
      this.homePage.show();
    });

    this.router.register('meal/:id', (params) => {
      if (params && params.id) {
        this.mealDetailsPage.show(params.id);
      }
    });

    this.router.register('scanner', () => {
      this.productScannerPage.show();
    });

    this.router.register('foodlog', () => {
      this.foodLogPage.show();
    });

    // Default route
    if (!window.location.hash || window.location.hash === '#') {
      this.router.navigate('home');
    }
  }

  setupSidebarNavigation() {
    let navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        navLinks.forEach(l => {
          l.className = l.className.replace('bg-emerald-50 text-emerald-700', 'text-gray-600');
          l.className = l.className.replace('font-semibold', 'font-medium');
        });
        
        link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all';
        
        let linkText = link.textContent.trim();
        if (linkText.includes('Meals') || linkText.includes('Recipes')) {
          this.router.navigate('home');
        } else if (linkText.includes('Product') || linkText.includes('Scanner')) {
          this.router.navigate('scanner');
        } else if (linkText.includes('Food Log')) {
          this.router.navigate('foodlog');
        }
        
        this.closeSidebar();
      });
    });
  }

  setupHeaderMenuToggle() {
    let menuBtn = document.getElementById('header-menu-btn');
    let sidebarOverlay = document.getElementById('sidebar-overlay');
    let sidebarCloseBtn = document.getElementById('sidebar-close-btn');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        this.openSidebar();
      });
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
  }

  openSidebar() {
    let sidebar = document.getElementById('sidebar');
    let sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) {
      sidebar.classList.add('translate-x-0');
      sidebar.classList.remove('-translate-x-full');
    }
    
    if (sidebarOverlay) {
      sidebarOverlay.classList.add('active');
    }
  }

  closeSidebar() {
    let sidebar = document.getElementById('sidebar');
    let sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
    }
    
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('active');
    }
  }

  hideLoadingOverlay() {
    let overlay = document.getElementById('app-loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 500);
      }, 500);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    let app = new App();
    app.init();
  });
} else {
  let app = new App();
  app.init();
}
