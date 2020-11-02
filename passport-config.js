//Para version local de passport, ya que se puede con Google o más
const LocalStrategy = require('passport-local').Strategy

//Traemos bcrypt para comparar pass
const bcrypt = require('bcrypt')



//Información de passport
async function initialize(passport, getUserByEmail, getUserById){
    //Función para autenticar usuario
    const authenticateUser = async (email,password,done) => {
        //Obtenemos el usuario según email
        const user = getUserByEmail(email)
        
        // Si el usuario es null pero trajo algo, no hubo error, pero no hay data
        if(user == null){
            return done(null, false, {message:'No hay usuario para ese email'})
        }

        try{
            //Comparamos contraseña ingresada con la contraseña del usuario
            if(await bcrypt.compare(password, user.password)){
                //Si existe contraseña
                return done(null, user)//Retornamos el usuario
            }else{
                //Si no existe contraseña
                return done(null, false, {message:'Contraseña incorrecta'})
            }
        }
        catch(e){
            //Hubo error
            return done(e)
        }
    }


    passport.use(new LocalStrategy({ usernameField: 'email' },
        authenticateUser))
    passport.serializUser((user, done) => done(null, user.id))
    passport.deserializUser((id, done) => {
        return done(null, getUserById(id))
    })
}

//Exportamos función
module.exports = initialize