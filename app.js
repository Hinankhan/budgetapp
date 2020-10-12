//Budget controller
let BudgetController = (function(){
    let Income = function(id,description,value,date){
        this.id = id
        this.description = description
        this.value = value
        this.date = date
    }
    let Expense = function(id,description,value,date){
        this.id = id
        this.description = description
        this.value = value
        this.date = date
        this.percentage = -1
    }

    Expense.prototype.calcpercenatges = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome ) * 100) 
        }else{
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    let calculateTotal = function(type){
        let sum = 0
        data.allItems[type].forEach(function(current){
            sum  = sum + current.value
        })
        data.totals[type] = sum
        /*
        here is how calculation works
        sum = 0
        [200, 300 ,400] => assuming this array
        sum = 0 + 200
        sum = 200 + 300
        sum = 500 + 400
        sum = 900
        */
    }
    // here we need a data structure to store all the data incomes as well as expenses
    let data = {
        allItems:{
            inc:[],
            exp:[]
        },
        totals: {
            inc:0,
            exp:0
        },
        budget: 0, // here we store the  calculated budget 
        percentage : -1 // -1 is a non existent value means there is no incomes or expenses
    }
    return {
        addItem: function(type,des,val,date){
            let newItem,Id

            //create new id
            if(data.allItems[type].length > 0){
                Id = data.allItems[type][data.allItems[type].length-1].id + 1
            }
            else {
                Id = 0
            }
            
            
            //create new item based on 'inc' or 'exp' type 

            if(type === 'exp'){
                newItem = new Expense(Id,des,val,date)
            }
            else if(type === 'inc'){
               newItem = new Income(Id,des,val,date)
            }

            //push into our data structure
            data.allItems[type].push(newItem)

            //return the new element
            return newItem
        },

        // here we delete the data structure delete the item 

        deleteStructure: function(type,id){
           /*
            suppose we receive id of 3
            [1,2,3,4,5] so in array the third item is actually 4 based on 0 index in this case we will delete incorrect item
            data.allitems[type][id]//wont work
           */
            let ids,index
           ids = data.allItems[type].map(function(current) { //map returns the unmodified array
                return current.id
            })
            
           index = ids.indexOf(id)
           if(index !== -1){
            data.allItems[type].splice(index, 1)// here the item is deleted in array
           }
        },
        calculateBudget: function(){
            //calculate the total incomes and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // calculate the budget incomes - expenses and we store data in datastructure budget
            data.budget = data.totals.inc - data.totals.exp

            //calculate the percentage of income that we spent and we store data in datastructure percentage
            if(data.totals.inc > 0){
                
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
                // 200 / 100 = 0.5 * 100 = spent 50%

            }else {
                data.percentage = -1
            }
          
        },

        // calculate percentages

        calculatePercentages: function(){
            /*
            income =100
            expenses = a = 10, b = 20 ,C = 40
            10/100 = 10%
            20/100 = 20%
            40/100 = 40%
            */
           data.allItems.exp.forEach(function(current){
               current.calcpercenatges(data.totals.inc)
           })

        },

        //get percentages

        getPercentages: function(){
            let allperc
            allperc = data.allItems.exp.map(function(current){
                return current.getPercentage()
            })
            return allperc
        },
        getBudget : function(){
            return {
                budget:data.budget,
                Incomes:data.totals.inc,
                expenses:data.totals.exp,
                percentage:data.percentage
            }
        },
        testing:function(){
            console.log(data)
        }
    }

    

})()


//UI controller 
let UiController = (function(){
   let DomStrings = {
       inputType : '.add__type',
       inputDescription : '.add__description',
       inputValue : '.add__value',
       inputDate : '.add__date',
       inputButton:'.add__btn',
       incomeContainer: ".income__list",
       expensesContainer: ".expenses__list",
       budgetLabel: ".budget__value",
       incomeLabel: ".budget__income--value",
       ExpenseLabel: ".budget__expenses--value",
       budgetPercentage: ".budget__expenses--percentage",
       container: ".container",
       percentagesLabel:".item__percentage",
       dateLabel: ".budget__title--month"

   }
        
        let formatNumber = function(num,type){
            /*
            + or - before the number
            2 decimal at the end
            comma seperating the thousands
            2000 => + 2,000.00
            2310.4567 => + 2,310.46
            */
        let numSplit,int,dec
        mum = Math.abs(num)// math.absolute function removes the sign of the number gives us a absolute number
        num = num.toFixed(2)
        numSplit = num.split('.')
        int = numSplit[0]
        dec = numSplit[1]
        if(int.length > 3){
            int =  int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3) //input 23510 output 23,510
        }
        return (type === 'exp'? '-' : '+') +' '+ int +'.'+ dec
        }
        let nodelistForeach = function(list,callback){
            for(let i = 0; i < list.length; i++){
                callback(list[i],i)
            }
        }
    return {
        inputData: function(){
            return {
            type:document.querySelector(DomStrings.inputType).value,
            description:document.querySelector(DomStrings.inputDescription).value,
            value:parseFloat(document.querySelector(DomStrings.inputValue).value),
            date:document.querySelector(DomStrings.inputDate).value
            }
        },
        addListItem:function(obj,type){
            let html,newHtml,element

            //crate html string with a placeholder text

            if(type === 'inc'){
                element = DomStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="item__date">%date%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DomStrings.expensesContainer
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="item__date">%date%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
            }

            //replace the place holder text with some actual data

            newHtml = html.replace('%id%',obj.id)
            newHtml = newHtml.replace('%description%',obj.description)
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type))
            newHtml = newHtml.replace('%date%',obj.date)

            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
            
        },

        //here we delete an item from the UI

        deleteListItem: function(selectorID){
            let el
          el = document.getElementById(selectorID)
          el.parentNode.removeChild(el)
        },
        // clearing the fields after we enter the data 

         clearFileds : function(){
             let fields,fieldsArr
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue)
            fieldsArr = Array.prototype.slice.call(fields)
            fieldsArr.forEach(function(current,index,array){
            current.value = ""
            })
            fieldsArr[0].focus()

         },
         // here we display the budget to the ui
         displayBudget: function(obj){
             let type
             obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type)
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.Incomes,'inc')
            document.querySelector(DomStrings.ExpenseLabel).textContent = formatNumber(obj.expenses,'exp')

            if(obj.percentage > 0){
                document.querySelector(DomStrings.budgetPercentage).textContent = obj.percentage + '%'
            }else{
                document.querySelector(DomStrings.budgetPercentage).textContent =  '---'
            }
         },

         //here we display the percentages on the ui

         displayPercentages: function(percentages){
           let fields = document.querySelectorAll(DomStrings.percentagesLabel)
           
           nodelistForeach(fields,function(current,index){
               if(percentages[index] > 0){
                current.textContent = percentages[index] + '%'
               }else{
                   current.textContent ='---'
               }
           })
         },

         // here we display the date
         
         displayDate: function(){
             let now,year,months,month
             now = new Date()
             months = ['Janauary', 'February', 'March','April','May','June','July','August','September','October','November','December']
             month = now.getMonth()
            year = now.getFullYear()
             document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year
         },
         
         // here we add some classes to the UI

         changedType: function(){
         let fields =  document.querySelectorAll(
                DomStrings.inputType + ',' + DomStrings.inputDescription +',' + DomStrings.inputValue + ','+ DomStrings.inputDate
            )
            nodelistForeach(fields, function(current){
                current.classList.toggle('red-focus')
            })
            document.querySelector(DomStrings.inputButton).classList.toggle('red')
         },
       
            getDomStrings: function(){
                return DomStrings
            }
        
    }

})()


// Global app controller
let AppController = (function(BudgetCntrl, Uicntrl){
    //all the event listeners are in this function
    let setupEventListners = function(){
    let Dom = Uicntrl.getDomStrings()
    document.querySelector(Dom.inputButton).addEventListener('click',clicked)
    // if enter is pressed 
    document.addEventListener('keypress',function(event){
     if(event.keyCode === 13 || event.which === 13){
        clicked()
     }
 })
    document.querySelector(Dom.container).addEventListener('click',deleteItem)
    document.querySelector(Dom.inputType).addEventListener('change',Uicntrl.changedType)
    }

    let updateBudget = function(){
        //1. calculate the budget
        BudgetCntrl.calculateBudget()

        //2. return budget
        let budget = BudgetCntrl.getBudget()

        //3. Display the budget on the Ui
       Uicntrl.displayBudget(budget)
    }

    let updatePercentages = function(){
        //1. calculate  the percentages
        BudgetCntrl.calculatePercentages()

        //2. read percentages from the budget controller
       let percentages = BudgetCntrl.getPercentages()

        //3.display percentages on the UI
         Uicntrl.displayPercentages(percentages)
    }
  
    let clicked = function(){
        //1. get the feild input data
        let input = Uicntrl.inputData()

        //here if  condition checks wether there is data in feilds are not if not we dont need to print empty fields

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
            let newItem = BudgetCntrl.addItem(input.type,input.description,input.value,input.date)
            //3. Add the item to the ui
            Uicntrl.addListItem(newItem,input.type)
            //4. clearing the fields after entering data
            Uicntrl.clearFileds()
            //5. calculate and update budget
            updateBudget()
            //6. calculate and update percentages
            updatePercentages()
        }
    }

    let deleteItem = function(event){
       let itemID,itemArr,ID,type
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemID){
            itemArr = itemID.split('-')
            type = itemArr[0]
            ID = parseInt( itemArr[1])
            console.log(type,ID)
           

            //1. Delete the item from data structure
            BudgetCntrl.deleteStructure(type, ID)

            //2.Delete the item from the ui
            Uicntrl.deleteListItem(itemID)

            //3.calculate and update the budget
            updateBudget()

            //4. calculate and update percentages
            updatePercentages()
        }
        


    }
  return {
      init : function(){
          console.log('Application has started')
          Uicntrl.displayDate()
          Uicntrl.displayBudget( {
            budget:0,
            Incomes:0,
            expenses:0,
            percentage:-1
        })
          setupEventListners()
      }
  }
 

})(BudgetController,UiController)
AppController.init()