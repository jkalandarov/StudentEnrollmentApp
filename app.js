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

//Send email for new users
const sendEmail =(email)=>{
    return json(`Activation link sent to ${email}`)
}

//Send activation link again
const reactivation = (email)=>{
    return json(`Activation link sent to ${email}`)
}

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

app.get('/login', (req, res)=>{
    res.json('Welcome to login page')
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

app.listen(PORT, ()=>console.log(`Server started listening on port ${PORT}`))