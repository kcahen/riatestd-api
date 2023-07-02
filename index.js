const express = require('express')
const cors = require('cors')
const mysql = require('mysql2');
require('dotenv').config()
const app = express()

app.use(cors())

const connection = mysql.createConnection(process.env.DATABASE_URL)

app.get('/api/pricelists', function (req, res, next) {
    const page = parseInt(req.query.page);
    const per_page = parseInt(req.query.per_page);
    const start_idx = (page - 1) * per_page;
    const sort_column = req.query.sort_column;
    const sort_direction = req.query.sort_direction;
    const search = req.query.search;
    var params = [];

    var sql = 'SELECT * FROM Pricelist';
    if (search){
        sql +=' WHERE test_name LIKE ?'
        params.push('%'+ search +'%' )
    }
    if (sort_column){
        sql +=' ORDER BY '+sort_column+' '+sort_direction;
    }
    sql +=' LIMIT ?, ?'
    params.push(start_idx)
    params.push(per_page);
    connection.execute(sql, params,
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server

      connection.query(
        'SELECT COUNT(test_code) as total FROM Pricelist',
        function(err, count, fields) {
          const total = count[0]['total'];
          const tatal_pages = Math.ceil(total/per_page)
          res.json({
            page: page,
            per_page: per_page, 
            total: total,
            tatal_pages: tatal_pages,
            data: results
        }
      );
    })
      console.log(fields); // fields contains extra meta data about results, if available
    }
  );
})

app.listen(process.env.PORT || 3000)
