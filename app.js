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

app.get('/', (req, res)=>{
    res.json('Successful')
})
//Student registration
app.post('/register', (req, res)=>{
    const { first_name, last_name, username, user_password, date_of_birth, country, province, city, address, email, } = req.body

	let is_valid = true;
	if(!(firstname && typeof firstname === 'string')) is_valid = false;

	if(!is_valid){
		return res.json({
			error: true,
			response: 'invalid form data!'
		})
	}

    console.log(req.body);

    const response = await knex('users').insert({ first_name, last_name, username, user_password, date_of_birth, country, province, city, address, email})

	if(!response.error){
		sendEmail(email)
		return res.json({
			error: false,
			response: 'success!'
		})
	} else {
		return res.json({
			error: true,
			response: response.error
		})
	}
})

//Login
app.get('/login', (req, res)=>{
    res.json('Welcome to login page')
})

app.post('/login', async (req, res)=>{
    const { email, user_password } = req.body
    
    try {
        const data = await knex('users').where({email: email, user_password: user_password}).first().then(row => row)
        console.log(data)
        if (data.length != 0){
            res.redirect('/account/:id')
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
app.post('/account/:id/enroll', async(req, res)=>{

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