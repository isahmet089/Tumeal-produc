const bcrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
    
    } catch (error) {
      
    }
};
const loginUser = async (req, res) => {

}
const logoutUser = async (req, res) => {

}



module.exports = {
    registerUser,
    loginUser,
    logoutUser
}





