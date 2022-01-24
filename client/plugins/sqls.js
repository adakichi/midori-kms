const moment = require('moment')
export const sqls = {
    //CIR -----------------------------------------------
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////

    get_payment_agency_cir : function(options){
        //optionsは
        //[paid] trueなら支払い済みを検索,falseならまだ支払いしてないものを。
        //[importfileId]がある場合はimportfile_id検索追加
        console.log('options:',options)
        let sql = 'SELECT come_in_records_id, customer_id, come_in_name, '
        sql = sql + 'actual_deposit_amount, DATE_FORMAT(actual_deposit_date, "%Y/%m/%d") as actual_deposit_date, come_in_schedules_id, '
        sql = sql + 'case WHEN come_in_schedules_id IS NULL THEN "false" ELSE "TRUE" END as matched, '
        sql = sql + 'delete_flag, DATE_FORMAT(created_at,"%Y/%m/%d %H:%i:%s") as created_at, importfile_id, file_row_number FROM come_in_records'
        
        const paid = options.paid
        //paid判定
        switch(paid){
            case 'false':
              sql = sql + ' WHERE come_in_schedules_id IS NULL'
              break
            case 'true':
              sql = sql + ' WHERE come_in_schedules_id IS NOT NULL'
              break
            }
        if(options.deleteFlag){
          switch(options.deleteFlag){
            case'true':
              if(sql.indexOf('WHERE')){
                sql = sql + ' AND delete_flag = 1'
              } else {
                sql = sql + ' WHERE delete_flag = 1'
              }
              break
            case'false':
              if(sql.indexOf('WHERE')){
                sql = sql + ' AND delete_flag = 0'
              } else {
                sql = sql + ' WHERE delete_flag = 0'
              }
              break
            case'both':
              //何もしないよ
          }
        }
        if(options.importfileId){
          sql = sql + ' AND importfile_id = ' + options.importfileId
        }
        sql = sql + ';'
        console.log(sql)
        return sql
    },

    post_payment_agency_cir:{
      //2つの関数
      //importFile用　と　sir用
      //戻り値はsqlとvaluesArrayです。

      convertImportFile:function(fileinfo,...optioins){
        //dataObjの中身はfileinfoとdataに分けられる。
        const importfileSql = ' insert into importfile_for_come_in_records (name, download_date, total_amount, count, bankname,imported_number) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE imported_number = VALUES(imported_number);'
        const fileinfoArray =[
          fileinfo.name,
          fileinfo.downloadDate,
          fileinfo.totalAmount,
          fileinfo.count,
          fileinfo.bankName,
          fileinfo.imported
        ] 
        
        const result = {
          sql:importfileSql,
          valuesArray:fileinfoArray,
        }
        return result
    },

    convertCir:function(valuesArray,fileinfoId,...options){

      const convertInsertValArray = function(objData,insertId){
        return objData.map(obj=>{
          const customerId = obj.customer_id === ''? null : obj.customer_id
          return [
            customerId,
            obj.come_in_name,
            obj.actual_deposit_amount,
            obj.actual_deposit_date,
                insertId,
            obj.id
          ]
        })
      }
      
      const insertValArray = convertInsertValArray(valuesArray, fileinfoId)      

      //※バルクインサートの方が早いらしいのでSQLの[(?)]を追記するループを作成。
      let cirSql = ' insert ignore into come_in_records (customer_id,come_in_name, actual_deposit_amount, actual_deposit_date, importfile_id, file_row_number) VALUES (?)'
      for(let i = 1; i < insertValArray.length ; i++){
        cirSql = cirSql + ',(?)'
      }
      
      cirSql = cirSql + ';'

      const result = {
        sql:cirSql,
        valuesArray:insertValArray
      }
      return result
    }
  },


  //CIS
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////


  get_payment_agency_cis:function(options){
    //options[from,until,searchType]
    //optionにfromとuntilがある場合はその範囲
    //片方だけの場合は片方のみ。
    //無い場合には今日から30日で取得する。
    console.log('get payment~ options:',options)
    let from = ''
    let until = ''
    let sql = 'SELECT cis.come_in_schedules_id, cis.customer_id, date_format(payment_day, "%Y/%m/%d")as payment_day, '
        sql = sql + 'expected_amount, come_in_records_id, customers.name, customers.kana, customers.bank_account_name, customers.lu_id FROM come_in_schedules as cis '
        sql = sql + 'INNER JOIN customers on cis.customer_id = customers.customer_id '

    //from until オプションの判定
    if(options.from && options.until){
      sql = sql + 'WHERE cis.payment_day BETWEEN "' + options.from + '" AND "' + options.until + '"'
    } else if(options.until){
      sql = sql + 'WHERE cis.payment_day < "' + options.until + '"'
    } else if(options.from){
      sql = sql + 'WHERE cis.payment_day > "' + options.from + '"'
    } else {
      from = moment().format('YYYY-MM-DD')
      until = moment().add(30,'days').format('YYYY-MM-DD')
      sql = sql + 'WHERE cis.payment_day BETWEEN "' + from + '" AND "' + until + '"'
    }

    if(options.searchType){
      switch(options.searchType){
        case 'kana':
          sql = sql + ' AND customers.kana LIKE "%' + options.searchText + '%"'
          break
        case 'jyunin':
          sql = sql + ' AND cis.customer_id = ' + options.searchText
          break
        case 'kingaku':
          sql = sql + ' AND expected_amount = ' + options.searchText
          break
        }
    }

    //入金済みかどうかのオプション
    if(options.isMatched){
      switch(options.isMatched){
        case 'false':
          sql = sql + ' AND come_in_records_id IS NULL '
          break
        case 'true':
          sql = sql + ' AND come_in_records_id IS NOT NULL '
          break
        case 'both':
          //何もしない。
          break
        }
    }
    sql = sql + ' ORDER BY payment_day;'
    console.log('sql',sql)
    return sql
  },

  get_payment_agency_customer_payment_schedules(options){

    // const id = options.id
    // const from = options.from 
    // const until = options.until
    // const isPaidDate = options.isPaidDate
    // const isExpectedDate = options.isExpectedDate
    let sql = ''
    let values = []
    console.log(options)
    if(options.id == 0){
      sql = 'SELECT ps.payment_schedule_id, ps.payment_account_id,ps.amount,date_format(ps.date, "%Y/%m/%d")as date, '
      sql = sql + 'date_format(ps.paid_date,"%Y%m%d")as paid_date , date_format(ps.expected_date,"%Y%m%d")as expected_date ,cu.name,'
      sql = sql + 'bankcode, branchcode, kind, account_number, account_holder , creditors.creditor_name FROM payment_schedules as ps '
      sql = sql + 'INNER JOIN payment_accounts as pa ON ps.payment_account_id = pa.payment_account_id '
      sql = sql + 'INNER JOIN customers as cu ON pa.customer_id = cu.customer_id '
      sql = sql + 'INNER JOIN creditors ON pa.creditor_id = creditors.creditor_id '
      sql = sql + 'WHERE ps.date BETWEEN ? AND ? '
      values.push(options.from)
      values.push(options.until)
      if(options.isPaidDate == 'true'){
        sql = sql + 'AND ps.paid_date is NOT NULL '
      } else if(options.isExpectedDate == 'true'){
        sql = sql + 'AND ps.expected_date is NOT NULL AND ps.paid_date is NULL '
      }
      sql = sql + 'ORDER BY date;'
    } else {
      sql = 'SELECT ps.payment_schedule_id, ps.payment_account_id,ps.amount,date_format(ps.date, "%Y/%m/%d")as date, '
      sql = sql + 'date_format(ps.paid_date,"%Y%m%d")as paid_date, date_format(ps.expected_date,"%Y%m%d")as expected_date, '
      sql = sql + 'pa.creditor_id , creditors.creditor_name FROM payment_schedules as ps INNER JOIN payment_accounts as pa ON ps.payment_account_id = pa.payment_account_id '
      sql = sql + 'INNER JOIN creditors on pa.creditor_id = creditors.creditor_id '
      sql = sql + 'WHERE customer_id = ? ORDER BY date;'
      values.push(options.id)
    }
    return {sql:sql,values:values}  
  },

  importfile_select:function(options){
    const downloadDate = options.downloadDate
    const bankname = options.bankName
    let sql = 'SELECT * , date_format(download_date, "%Y/%m/%d")as date FROM importfile_for_come_in_records '
    if(downloadDate){
      const from = downloadDate.from
      const until = downloadDate.until
      if(from && until){
        sql = sql + 'WHERE downloadDate "' + from + '" BETWEEN "' + until + '" '
      } else if(from){
        sql = sql + 'WHERE downloadDate < "' + from + '" '
      } else if(until){
        sql = sql + 'WHERE downloadDate > "' + until + '" '
      }
    }

    //bankname
    if(bankname !== 'all'){
      if(sql.indexOf('WHERE')){
        sql = sql + 'AND bankname = "' + bankname + '" '
      } else {
        sql = sql + 'WHERE bankname = "' + bankname + '" '
      }
    }
    console.log('bankname',bankname)
    console.log('date',downloadDate)
    sql = sql + ' ORDER BY date DESC;'
    return sql
  },

  searchCustomers:function(value,options){
    //オプションはサーチタイプのみ
    let sql = ''
    let convertedValue = value
    switch(options.searchType){
      case 'all':
        sql = 'SELECT * FROM customers'
        break
      case 'jyunin':
        sql = 'SELECT * FROM customers WHERE customer_id = ? ;'
        break
      case 'lu':
        sql = 'SELECT * FROM customers WHERE lu_id = ? ;'
        break
      case 'namae':
        sql = 'SELECT * FROM customers WHERE name LIKE ? ;'
        convertedValue = '%' + value + '%'
        break
      case 'kana':
        sql = 'SELECT * FROM customers WHERE kana LIKE ? ;'
        convertedValue = '%' + value + '%'
        break
      }
      console.log(sql)
    return {value:convertedValue,sql:sql}
  }

}
