const express = require('express');
var bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) =>{
    res.send('Hello World');
})
app.post('/split-payment/compute', (req, res) => {
//  console.log(req.body);
 const { ID, Amount, Currency, CustomerEmail, SplitInfo } = req.body;

 let Balance = Amount;
 let currentBalance = 0
 let SplitBreakdown = [];
 let sortInfo = [];

 const sortItems = (items) => {
 const constants = [{value:"FLAT",index: 1},{value: "PERCENTAGE",index: 2} , {value:"RATIO", index: 3}]
 let totalRatio = 0;
   for(let i = 0; i < items.length; i++){
       if(items[i].SplitType === constants[0].value){
           items[i].index = constants[0].index
       }
       if(items[i].SplitType === constants[1].value){
         items[i].index = constants[1].index
       }
         if(items[i].SplitType === constants[2].value){
         items[i].index = constants[2].index
         totalRatio = totalRatio + Number(items[i].SplitValue);
       }
   }

   items.sort((a,b) =>  a.index - b.index)
   return { items, totalRatio };
 }

sortInfo = sortItems(SplitInfo);
// console.log(sortInfo);

const {items, totalRatio}= sortInfo;

 for (let i = 0; i < items.length; i++) {
  const { SplitType, SplitValue, SplitEntityId } = items[i];
    if(SplitType === 'FLAT'){
       Balance  =  Balance - SplitValue;
       SplitBreakdown.push({SplitEntityId, SplitValue: SplitValue});
    }
    if(SplitType === 'PERCENTAGE'){
         const percentageValue = Balance * SplitValue / 100;
         Balance = Balance - percentageValue;
         SplitBreakdown.push({SplitEntityId, SplitValue: percentageValue});
    }
    if(SplitType === 'RATIO'){
        currentBalance = currentBalance === 0? Balance : currentBalance;
        const ratioValue = currentBalance * SplitValue / totalRatio;
        Balance = Balance - ratioValue;
        SplitBreakdown.push({SplitEntityId, SplitValue: ratioValue})   
    }
 }

res.status(200).json({
    ID,
    Balance: Balance,
    SplitBreakdown
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
