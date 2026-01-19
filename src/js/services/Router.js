export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.init();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Handle initial route
    this.handleRoute();
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path, state = {}) {
    // Use hash routing to avoid server issues
    let cleanPath = path.replace(/^\/+|\/+$/g, '') || 'home';
    window.location.hash = `#${cleanPath}`;
    this.handleRoute();
  }

  handleRoute() {
    // Get route from hash
    let hash = window.location.hash.replace('#/', '').replace('#', '');
    let cleanPath = hash || 'home';
    
    if (this.routes[cleanPath]) {
      this.currentRoute = cleanPath;
      this.routes[cleanPath]();
      return;
    }

    let dynamicRoute = Object.keys(this.routes).find(route => {
      if (!route.includes(':')) return false;
      let routePattern = route.replace(/:\w+/g, '([^/]+)');
      let regex = new RegExp(`^${routePattern}$`);
      return regex.test(cleanPath);
    });

    if (dynamicRoute) {
      let routePattern = dynamicRoute.replace(/:\w+/g, '([^/]+)');
      let regex = new RegExp(`^${routePattern}$`);
      let matches = cleanPath.match(regex);
      
      if (matches) {
        this.currentRoute = dynamicRoute;
        let params = this.extractParams(dynamicRoute, matches);
        this.routes[dynamicRoute](params);
        return;
      }
    }

    if (this.routes['home']) {
      this.currentRoute = 'home';
      this.routes['home']();
    }
  }

  extractParams(route, matches) {
    let params = {};
    let paramNames = route.match(/:\w+/g) || [];
    
    paramNames.forEach((param, index) => {
      let key = param.replace(':', '');
      params[key] = matches[index + 1];
    });
    
    return params;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}
