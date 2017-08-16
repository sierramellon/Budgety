//Budget Controller
var budgetController = (function() {
  
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
             this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
           
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
     var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
       allItems: {
            exp: [],
            inc: []
        },
       totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percetage: -1
    
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
            
            if (type === 'exp'){
                newItem = new Expense(ID,des,val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id) {
            console.log('into deleteItem');
            var ids, index;
            console.log(data.allItems);
            console.log(type);
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            console.log('ids is ' + ids);
            console.log('search id is ' + id);
            index = ids.indexOf(id);
            console.log('index is ' +index);
            if(index >= 0){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            //calculat total income and expense
             calculateTotal('exp');
             calculateTotal('inc');
            
            //calculate the budget: income-epenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income we spent
            if(data.totals.inc >0) {
                data.percetage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages:function() {
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percetage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
})();


// UI Controller
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            
            if(int.length > 3){
                 int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
            }
               
            dec = numSplit[1];
            
            type === 'exp' ? sign = '-' : sign = '+';
            
            return sign +' ' + int + '.' + dec;
        };
        
     var nodeListForEach = function(list,callback){
                for (var i = 0; i < list.length; i++){
                    callback(list[i],i);
                }
            };
    
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value, 
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                
                 html =  ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div</div>';
            }
          
            // replace the placeholder text with some actual data
            console.log(obj.id);
            newHtml = html.replace('%id%', obj.id);
            console.log(obj.description);
            newHtml = newHtml.replace('%description%', obj.description);
            console.log(newHtml);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            // insert the html into the DOM
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type ='exp';
            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExp,'exp');
           
            
            if (obj.percentage > 0){
                 document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage+'%';
            }else {
                 document.querySelector(DOMstrings.percentageLable).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },
        
        displayMonth: function() {
            var now, year, month;
            
            now = new Date();
            
            var months = ['January', 'February' , 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();


//Global app controller
var controller = (function(budgetCtrl, UICtrl) {
  
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
        // 'enter' key
        if(event.keyCode === 13 || event.which === 13){
          ctrlAddItem();
      }
    });
      
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
  };

  var updateBudget = function() {
       //1. calculate the budget
       budgetCtrl.calculateBudget();
      
       //2. return the budget
       var budget = budgetCtrl.getBudget();
      
       //3. display the budget on the UI
       UICtrl.displayBudget(budget);
  };
 
  var ctrlAddItem = function() {
      var input, newItem;
      
       //1. get the input data
       input = UICtrl.getinput();
       
      if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            //2. add the item to the budget controller
           newItem = budgetCtrl.addItem(input.type, input.description, input.value);

           //3. add the item to the ui
           UICtrl.addListItem(newItem, input.type);

          // clear the fields
          UICtrl.clearFields();

          // calculate and update budget
          updateBudget();
          
          // calcualte and update percentage
          updatePercentages();
      }
    
  };
    
  var updatePercentages = function() {
      // 1. calculate the percentages
      budgetCtrl.calculatePercentages();
      //2. read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();
      //3. update the UI with new percentages
      UICtrl.displayPercentages(percentages);
  };
    
  var ctrlDeleteItem = function(event){
      var itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      console.log(itemID);
      
      if(itemID) {
          // inc-1
          splitID = itemID.split('-');
          type = splitID[0];
          ID = parseInt(splitID[1]);
          
          console.log(type);
          console.log('pased int id is' + ID);
          //1. delete the item from data structure
          budgetCtrl.deleteItem(type,ID);
          
          //2. delete item from UI
          UICtrl.deleteListItem(itemID);
          
          //3. update and show the new budget
          updateBudget();
          
          // calcualte and update percentages
          updatePercentages();
      }
  };
    
  return {
      init: function() {
        console.log('applcation started');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
        setupEventListeners();
      }
  };
        
   
    
})(budgetController,UIController);

controller.init();