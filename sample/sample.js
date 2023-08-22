const route=require('express').Router()



route.get('/sample',(req,res)=>{
    res.sendFile('login.html')
})


module.exports=route