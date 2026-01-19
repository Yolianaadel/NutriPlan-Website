import { ProductAPI } from "../api/ProductAPI.js";
import { Product } from "../models/Product.js";


export class ProductScannerPage {
  constructor(productAPI, foodLog, router) {
    this.productAPI = productAPI;
    this.foodLog = foodLog;
    this.router = router;
    this.products = [];
    this.currentFilter = { nutriScore: "", category: "" };

    this.bindDelegatedEvents();
  }

  /* ===================== EVENT DELEGATION ===================== */

  bindDelegatedEvents() {
    document.addEventListener("click", async (e) => {
      /* Search by name */
      if (e.target.id === "search-product-btn") {
        await this.handleSearch();
      }

      /* Barcode lookup */
      if (e.target.id === "lookup-barcode-btn") {
        await this.handleBarcodeLookup();
      }

      /* Nutri-score filter */
      if (e.target.classList.contains("nutri-score-filter")) {
        let grade = e.target.dataset.grade || "";
        this.filterByNutriScore(grade);
      }

      /* Category filter */
      if (e.target.classList.contains("product-category-btn")) {
        let category = e.target.textContent.trim();
        await this.filterByCategory(category);
      }

      /* Add to food log */
      if (e.target.classList.contains("add-to-log-btn")) {
        let barcode = e.target.dataset.barcode;
        let product = this.products.find((p) => p.barcode === barcode);
        if (product) this.addProductToLog(product);
      }
    });
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (e.target.id === "product-search-input") this.handleSearch();
    if (e.target.id === "barcode-input") this.handleBarcodeLookup();
  }
});
  }

  /* ===================== ACTIONS ===================== */

  async handleSearch() {
  let input = document.getElementById("product-search-input");
  console.log("INPUT FOUND:", input);

  let query = input?.value.trim();
  console.log("QUERY:", query);

    if (!query || query.length < 2) {
      Swal.fire("Warning", "Enter at least 2 characters", "warning");
      return;
    }

    this.showLoading();
    this.products = await this.productAPI.searchProductsByName(query);
    this.renderProducts();
    this.updateProductsCount();
  }

  async handleBarcodeLookup() {
    let input = document.getElementById("barcode-input");
    let barcode = input?.value.trim();

    if (!barcode) {
      Swal.fire("Warning", "Enter a barcode", "warning");
      return;
    }

    this.showLoading();
    let product = await this.productAPI.getProductByBarcode(barcode);

    if (!product) {
      Swal.fire("Error", "Product not found", "error");
      return;
    }

    this.products = [product];
    this.renderProducts();
    this.updateProductsCount();
  }

  filterByNutriScore(grade) {
    this.currentFilter.nutriScore = grade.toLowerCase();
    this.renderProducts();
    this.updateProductsCount();
  }
async filterByCategory(category) {
  this.showLoading();

  this.products = await this.productAPI.getProductsByCategory(
    category.toLowerCase()
  );

  this.renderProducts();
  this.updateProductsCount();
}

  /* ===================== UI ===================== */

  showLoading() {
    let grid = document.getElementById("products-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="animate-spin h-10 w-10 border-b-2 border-emerald-600 rounded-full mx-auto"></div>
        </div>`;
    }
  }

  renderProducts() {
    let grid = document.getElementById("products-grid");
    if (!grid) return;

    let list = this.products;

    if (this.currentFilter.nutriScore) {
      list = list.filter(
        (p) =>
          (p.nutriScore || "").toLowerCase() === this.currentFilter.nutriScore,
      );
    }

    if (list.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">No products found</p>`;
      return;
    }

    grid.innerHTML = list.map((p) => this.createProductCard(p)).join("");
  }

  createProductCard(data) {
    let product = new Product(data);

    return `
      <div class="bg-white rounded-xl shadow p-4">
        <img src="${product.image}" class="w-full h-32 object-contain mb-3">
        <h3 class="font-bold">${product.name}</h3>
        <p class="text-sm text-gray-500">${product.brand || ""}</p>
        <button
          class="add-to-log-btn w-full mt-2 bg-emerald-600 text-white py-2 rounded"
          data-barcode="${product.barcode}">
          Add to Food Log
        </button>
      </div>`;
  }

  addProductToLog(data) {
    let product = new Product(data);
    this.foodLog.addEntry(product.toFoodLogEntry());

    Swal.fire({
      icon: "success",
      title: "Added",
      text: product.name,
      timer: 1500,
      showConfirmButton: false,
    });
  }

  updateProductsCount() {
    let el = document.getElementById("products-count");
    if (el) el.textContent = `${this.products.length} products found`;
  }

  /* ===================== ROUTER ===================== */

  show() {
    [
      "all-recipes-section",
      "meal-categories-section",
      "search-filters-section",
      "meal-details",
      "foodlog-section",
    ].forEach((id) => {
      let s = document.getElementById(id);
      if (s) s.style.display = "none";
    });

    document.getElementById("products-section").style.display = "block";

    let h1 = document.querySelector("#header h1");
    let p = document.querySelector("#header p");
    if (h1) h1.textContent = "Product Scanner";
    if (p) p.textContent = "Search packaged foods by name or barcode";
  }
}
