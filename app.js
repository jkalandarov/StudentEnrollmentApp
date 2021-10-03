const { json } = require('express');
const express = require('express')
const mysql = require('mysql2/promise')
const app = express()
const PORT = 3000

//Database connection
const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'root',
      password : 'password',
      database : 'student_registration'
    }
  });

app.use(express.json())

app.get('/', (req, res)=>{
    res.json('Successful')
})
/* ====== FUNCTIONS ====== */
//Send email for new users
const sendEmail =(email)=>{
    return json(`Activation link sent to ${email}`)
}

//Send activation link again
const reactivation = (email)=>{
    return json(`Activation link sent to ${email}`)
}

//Check User for login
const checkUser = async (login, password)=>{
    const data = await knex('users').where({email: login, user_password: password}).first().then(row => row)
    console.log(data);
    if (data.length != 0){
        return true
    }
}

//Enroll in a courses

const enroll_course = ({object}) =>{
    const mapped_data = req.body.courses.map(course => ({
        ...course, 
        user_id: req.body.user_id,
        user_name: req.body.user_name,
        email: req.body.email,
    }))
    
    knex('enrollment').insert(mapped_data)
}


/*===========================================*/

//Student registration
app.post('/register', (req, res)=>{
    const {...registration_data} = req.body
    console.log(registration_data);

    knex('users').insert(registration_data)
    .then((result)=>{
        console.log(result)
    })
    .then(sendEmail(result.email))
})

//Login
app.get('/login', (req, res)=>{
    res.json('Welcome to login page')
})

app.post('/login', async (req, res)=>{
    const {...login_data} = req.body
    console.log(login_data)
    try {
        if (await checkUser(login_data.email, login_data.user_password)){
            res.redirect('/login')
        } 
    } catch (error) {
        console.error(error.message)
    }
})

//Account Verification
app.get('/verification/:user_id', (req, res)=>{
    const user_id = req.params.user_id
    const status = knex('users').where({user_id: 1}).first().then((row) => row)
    status.then(function(result) {
        if (result.acc_status === 'not verified') {
            knex('users').update({acc_status: 'verified'}).where('user_id', '=', user_id)
            .then(message => console.log(message))
        }
     })
})


//Enroll
app.post('/enroll', async(req, res)=>{
    // const enroll_data = req.body
    // console.log(enroll_data);

    const mapped_data = req.body.courses.map(course => ({
        ...course, 
        user_id: req.body.user_id,
        username: req.body.user_name,
        email: req.body.email,
    }))
    
    const results = await knex('enrollment').insert(mapped_data)
    
    console.log(results)
})


app.listen(PORT, ()=>console.log(`Server started listening on port ${PORT}`))