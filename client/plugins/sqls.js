
export const sqls = {

    get_paymentAgency_cir : function(options){
        //optionsは
        //[paid] trueなら支払い済みを検索,falseならまだ支払いしてないものを。
        let sql = 'SELECT come_in_records_id, customer_id, come_in_name, '
        sql = sql + 'actual_deposit_amount, DATE_FORMAT(actual_deposit_date, "%Y/%m/%d") as actual_deposit_date, come_in_schedules_id, '
        sql = sql + 'case WHEN come_in_schedules_id IS NULL THEN "false" ELSE "TRUE" END as matched, '
        sql = sql + 'delete_flag, DATE_FORMAT(created_at,"%Y/%m/%d %H:%i:%s") as created_at, importfile_id FROM come_in_records'
        
        const paid = options.paid
        //paid判定
        switch(paid){
            case 'false':
              sql = sql + ' WHERE come_in_schedules_id IS NULL;'
              break
            case 'true':
              sql = sql + ' WHERE come_in_schedules_id IS NOT NULL;'
              break
            }

        return sql
    },

    post_paymentAgency_cir:{
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
  }

}
