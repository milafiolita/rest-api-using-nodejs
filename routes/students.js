const express = require('express');
const router = express.Router();
const connection = require('./connection');
const moment = require('moment');
const axios = require('axios');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

function formatDateForMySQL(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
/* GET data student */
router.get('/', function(req, res, next) {
	// Make a request for a user with a given ID
	axios.get(config.server.host+'/api/students')
	.then(function (response) {
		res.render('index', {title: 'Student List', data: response.data.data});
	})
	.catch(function (error) {
		console.log(error);
	});
});

/* GET tampilkan form data student */
router.get('/input', function(req, res, next) {
  // Render index.pug page using array 
  res.render('input');
});

router.post('/input', function(req, res, next) {
	axios.post(config.server.host+'/api/students/input', {
  	student_id: req.body.student_id,
  	name: req.body.name,
  	address: req.body.address,
  	date_of_birth: formatDateForMySQL(req.body.date_of_birth),
  	admission_date: new Date(),
  	gender: req.body.gender,
  	student_email: req.body.student_email
  })
  .then(function (response) {
		console.log(response);
		if(response.data.status === 200) {
			res.redirect('/');
		}
  })
  .catch(function (error) {
    console.log(error);
  });

  // // Render index.pug page using array 
  // res.render('form_student', {title: 'Add Student'});
});

router.post('/edit', function(req, res) {
	var name = req.body.name;
	var address = req.body.address;
	var gender = req.body.gender;
	var date_of_birth = formatDateForMySQL(req.body.date_of_birth);
	var student_email = req.body.student_email;
	var student_id = req.body.student_id;
  var studentOldId = req.body.student_id;

  var postData  = {
    student_id: student_id, 
    name: name, 
    address: address, 
    gender: gender, 
		date_of_birth: date_of_birth,
		student_email: student_email
	};

	if(studentOldId !== undefined && studentOldId !== '') {
    connection.query('UPDATE students SET student_id = ?, name = ?, address = ?, gender = ?, date_of_birth = ?, student_email = ? WHERE student_id = ?', 
    [student_id, name, address, gender, date_of_birth, student_email, studentOldId], 
    function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	} else {
		connection.query('INSERT INTO students SET ?', postData, function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	}
});

router.get('/:id', function(req, res){
  connection.query('SELECT * FROM students WHERE student_id = ?', 
  [req.params.id], function(err, rows, fields) {
		if(err) throw err
		
		// if user not found
		if (rows.length <= 0) {
				res.redirect('/students')
		} else { 
			var studentDoB = moment(rows[0].date_of_birth).format('YYYY-MM-DD');
			var admission_date = moment(rows[0].admission_date).format('DD-MM-YYYY');

			// if user found
			// render to views/index.pug template file
			res.render('edit', {
				student_id: rows[0].student_id,
				sname: rows[0].name,
				saddress: rows[0].address,
				sgender: rows[0].gender,
				sdob: studentDoB,
				admission_date: admission_date,
				student_email: rows[0].student_email,
				oldId: rows[0].student_id
			})
		}            
	});
});

router.post('/delete/:id', function (req, res) {
  axios.delete(config.server.host+'/api/students/delete/'+req.params.id)
  .then(function (response) {
    if (response.data.status === 200) {
      res.redirect('/students');
    }
  })
  .catch (function (err) {
    console.log(err);
  });
});


module.exports = router;
