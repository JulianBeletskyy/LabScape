const AuthService = {
    // isLoggedIn: false,
    isLoggedIn: true, //TODO for temp purpose
    login: function() { this.isLoggedIn = true },
    logout: function() { this.isLoggedIn = false },
    defineIsLoggedIn: function() {
        this.isLoggedIn = localStorage.hasOwnProperty('auth-token');
    }
};

export default AuthService;