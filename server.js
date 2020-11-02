//Si no estamos en producción solo en desarrollo
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express')
const app = express()
//Usamos bcrypt para manejo de contraseñas seguras instalado por > npm i bcrypt
const bcrypt = require('bcrypt')
//Se importa sola passport
const passport = require('passport')
//Usamos passport para autenticación >npm i passport passport-local express-session express-flash
const flash = require('express-flash')
//Para manejo de sesiones
const session = require('express-session')
//Para que funcione app.delete con formulario instalamos >npm i method-override
const methodOverride = require('method-override')


//Pedimos función de archivo de passport
const initializePassport = require('./passport-config')

// inicializamos funcion importada IMPORTANTE USAR NUESTROS DATOS PROPIOS
initializePassport(
    passport,
    //FUNCION
    email => 
    //Se busca en arreglo users un usuario con el mismo email
    users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//Para guardar usuarios
const users = []

//Para ejs: Podemos usar ejs en el template, y pasar datos entre server y vista
app.set('view-engine', 'ejs')
//Para sacar info de formularios
app.use(express.urlencoded({extended:false}))
//Flash para mostrar cosas por pantalla
app.use(flash())
//Session para autenticación
app.use(session({
    //Lo sacamos de .env
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//RUTAS, mostramos index solamente si está autenticado
app.get('/', checkAuthenticated, (req, res)=>{
    res.render('index.ejs', {name:req.user.name})
})


app.get('/login',checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs')
})

//Para paso de parámetros con POST
app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})

//Para paso de parámetros con POST
app.post('/register',checkNotAuthenticated, async (req, res)=>{
    //Intentaremos registrar un usuario
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            //Pedimos valores del "name" en el campo determinado del formulario
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        //Si todo sale bien te vas al login
        res.redirect('/login')
    }
    catch{
        //Si sale mal te redirige a redirect
        res.redirect('/register')
    }
    console.log(users)
})

//Para que funcione con formulario instalamos. Para que podamos usar delete en forms >npm i method-override
app.delete('/logout', (req,res)=> {
    req.logOut()
    res.redirect('/login')
})


//FUNCIONES

//Para comprobar usuarios logueados
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    //Si no está autenticado se va al login
    res.redirect('login')
}

//Para comprobar usuarios no logueados
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        //Si está se va a home
        return res.redirect('/')
    }

    //Si no está autenticado se va, Se usa en login, registro
    next()
}

app.listen(3000)