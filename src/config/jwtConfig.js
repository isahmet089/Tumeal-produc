module.exports = {
    accessToken: {
      secret:
        process.env.JWT_ACCESS_SECRET ||
        "53cea5b4979e78712a1ce6ea22afd9c760109fd6691ff10357e2e8d31f39cda1",
      expiresIn: "30m", 
    },
    refreshToken: {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        "cc36f232c2018bf3ea6b0f448c46bf3863f707eb621a36da120b8fe81b47f4e4",
      expiresIn: "7d", 
    },
    accessTokenDashboard: {
      secret:
        process.env.JWT_ACCESS_SECRET_DASHBOARD ||
        "53cea5b4979e78712a1ce6ea22afd9c760109fd6691ff10357e2e8d31f39cda1dd",
      expiresIn: "30m", 
    },
    refreshTokenDashboard: {
      secret:
        process.env.JWT_REFRESH_SECRET_DASHBOARD ||
        "cc36f232c2018bf3ea6b0f448c46bf3863f707eb621a36da120b8fe81b47f4e4as",
      expiresIn: "7d", 
    },
  };
  