const AuthService = {
    isLoggedIn: false,
    login: function() { this.isLoggedIn = true },
    logout: function() { this.isLoggedIn = false },
    defineIsLoggedIn: function() {
        this.isLoggedIn = localStorage.hasOwnProperty('auth-token');
    }
};

export default AuthService;