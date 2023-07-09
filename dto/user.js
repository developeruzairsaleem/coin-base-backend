class UserDto{
    constructor(user){
        this.name=user.name;
        this.username=user.username;
        this._id=user._id;
    }
}


module.exports = UserDto