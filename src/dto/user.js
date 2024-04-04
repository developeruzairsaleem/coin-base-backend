class UserDto{
    constructor(user){
        this.name=user.name;
        this.username=user.username;
        this._id=user._id;
        this.email=user.email;
        this.profilePhoto = user.profilePhoto;
    }
}


module.exports = UserDto