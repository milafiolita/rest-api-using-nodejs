const express = require('express');
const router = express.Router();
const moment = require('moment');
const env = process.env.NODE_ENV || 'development';
const connection = require('./connection');

function formatDateForMySQL(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
/* GET | get all data student */
router.get('/', function(req, res, next) {
  // Do the query to get data.
  connection.query('SELECT * FROM students', function(error, rows, fields) {
    if (error) {
      res.send(JSON.stringify({
        "status": 500,
        "error": error
      }));
    } else {
      res.send(JSON.stringify({
        "status": 200,
        "data": rows
      }));
    }
  });
});

/* POST | insert data student */
router.post('/input', function(req, res) {
  var postData  = {
    student_id: req.body.student_id,
    name: req.body.name,
    address: req.body.address,
    date_of_birth: formatDateForMySQL(req.body.date_of_birth),
    admission_date: new Date(),
    gender: req.body.gender,
    student_email: req.body.student_email
  };

  connection.query('INSERT INTO students SET ?', postData, function (error, results, fields) {
    if (error) {
      res.send(JSON.stringify({
        "status": 500,
        "error": error
      }));
    } else {
      res.send(JSON.stringify({
        "status": 200,
        "data": results
      }));
    }
  });
});

/* DELETE | delete data student */
router.delete('/delete/:id', function (req, res) {
  connection.query('DELETE FROM students WHERE student_id = ?', [req.params.id], function(error, results) {
    if (error) {
      res.send(JSON.stringify({
        "status": 500,
        "error": error
      }));
    } else {
      res.send(JSON.stringify({
        "status": 200,
        "data": results
      }));
    }
  });
});

/* PUT | edit data student */
router.put('/edit/:id', function(req, res){
  connection.query('UPDATE students SET student_id = ?, name = ?, address = ?, gender = ?, date_of_birth = ?, admission_date = ?, student_email = ? WHERE student_id = ?', 
    [
      req.body.student_id, 
      req.body.name, 
      req.body.address, 
      req.body.gender, 
      req.body.date_of_birth,
      req.body.student_email,
      req.params.id
    ], 
    function (error, results, fields) {
			if (error) {
        res.send(JSON.stringify({
          "status": 500,
          "error": error
        }));
      } else {
        res.send(JSON.stringify({
          "status": 200,
          "data": results
        }));
      }
		});
});

module.exports = router;
