const path = require('path');

module.exports = {
    
    //helper to get path to uploads folder
    uploadDir: path.join(__dirname, '../public/uploads/'),

    isEmpty: (obj)=>{
        //loop through all the objects
        for(let key in obj){
            //if this object has any properties
            if(obj.hasOwnProperty(key)){
                return false;
            }
        }
        return true;
    }

}