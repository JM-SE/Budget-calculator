//////////////////////////////////////////
/////////// Budget Controller ////////////
//////////////////////////////////////////

const budgetController = (function() {

    const Expense = function(id, description, value, label) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        this.label = label;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    const Income = function(id, description, value, label) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.label = label;
    }

    const calculateTotal = type => {
        let sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;
        })
        data.totals[type] = sum;
    }

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val, lab) {
            let newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val, lab);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val, lab);
            }

            // Push item into data structure
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },
        deleteItem: function(type, id) {
            const ids = data.allItems[type].map(current => {
                return current.id;
            })

            const index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },
        calculateBudget: function() {

            // Calculate total inc & exp
            calculateTotal('exp')
            calculateTotal('inc')

            // Calculare budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp

            // Calculate percentage of inc spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc));
        },
        getPercentages: function() {
            const allPerc = data.allItems.exp.map(cur => {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                inc: data.allItems.inc,
                exp: data.allItems.exp,
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        filterIncItems: function(label) {
            let filterIncSum = 0;
            label = document.getElementById('selectorLabelInc').value

            data.allItems.inc.forEach(obj => {
                if (label === obj.label) {
                    filterIncSum += obj.value
                }
                return filterIncSum
            })
            return filterIncSum;
        },
        filterExpItems: function(label) {
            let filterExpSum = 0;
            label = document.getElementById('selectorLabelExp').value

            data.allItems.exp.forEach(obj => {
                if (label === obj.label) {
                    filterExpSum += obj.value
                }
                return filterExpSum
            })
            return filterExpSum;
        },
        testing: function() {
            console.log(data);
        }
    }

})();

//////////////////////////////////////////
//////////// UI Controller ///////////////
//////////////////////////////////////////

const UIController = (function(budgetCtrl) {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        itemLabel: '.add__label',
        addLabelBox: 'add__new--label',
        addLabelCheck: '.add__btn--label',
        selectorLabel: '.sel__label',
        incLabelFilter: document.getElementById('selectorLabelInc').value,
        expLabelFilter: document.getElementById('selectorLabelExp').value,
        filterBudget: document.getElementById('filterBudget'),
        percentageFilter: document.getElementById('percentageFilter'),
    }

    const formatNumber = (num, type) => {
        num = Math.abs(num).toFixed(2);
        const numSplit = num.split('.');
        let int = numSplit[0];
        const dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const labelNameDisplay = (label) => {
        // Segun obj.label hacer que el elemento tome el textContent del selector para mostrar en el item.

        if (label !== 'empty') {

            return capitalizeFirstLetter(label);

        } else if (label === '') {
            return '---';

        } else {
            return '---';

        }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                label: document.querySelector(DOMstrings.itemLabel).value,
            }
        },
        addListItem: function(obj, type) {
            let html, newHTML, element;

            // 1.Create HTML w/placeholder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__cont"><div class="item__description">%description%</div><div class="item__label label__inc">%label%</div></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__cont"><div class="item__description">%description%</div><div class="item__label label__exp">%label%</div></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // 2.Replace placeholder with data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%label%', labelNameDisplay(obj.label));
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // 3.Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);


        },
        deleteListItem: function(selectorID) {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {

            const fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            const fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = '';
            });

            fieldsArr[0].focus();

        },
        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function() {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ]

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function() {
            const fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        displayAddLabel: function() {
            document.getElementById('labelAddBox').style.display = 'inline-block';
            document.getElementById('labelAddBtn').style.display = 'inline-block';
        },
        addLabelToDOM: function() {
            const newLabel = document.getElementById('labelAddBox').value;
            const newChildLabel = document.createElement('option');
            newChildLabel.textContent = capitalizeFirstLetter(newLabel)
            const newChildLabelSelectorInc = document.createElement('option');
            newChildLabelSelectorInc.textContent = capitalizeFirstLetter(newLabel)
            const newChildLabelSelectorExp = document.createElement('option');
            newChildLabelSelectorExp.textContent = capitalizeFirstLetter(newLabel)
            document.querySelector(DOMstrings.itemLabel).appendChild(newChildLabel)
            document.getElementById('selectorLabelInc').appendChild(newChildLabelSelectorInc)
            document.getElementById('selectorLabelExp').appendChild(newChildLabelSelectorExp)
            document.getElementById('labelAddBox').style.display = 'none';
            document.getElementById('labelAddBtn').style.display = 'none';
        },
        displayIncFilters: function() {

            const num = budgetCtrl.filterIncItems()
            filterBudget.textContent = formatNumber(num, 'inc')
            const budget = budgetCtrl.getBudget();
            const budgetEl = budget.totalInc
            const result = ((num / budgetEl) * 100).toFixed(0)
            percentageFilter.textContent = result + '%';


        },
        displayExpFilters: function() {

            const num = budgetCtrl.filterExpItems()
            filterBudget.textContent = formatNumber(num, 'exp')

            const budget = budgetCtrl.getBudget();
            const budgetEl = budget.totalExp
            const result = ((num / budgetEl) * 100).toFixed(0)
            percentageFilter.textContent = result + '%';

        },
        getDOMstrings: () => DOMstrings
    }

})(budgetController);

//////////////////////////////////////////
///////// Global App Controller //////////
//////////////////////////////////////////

const controller = (function(budgetCtrl, UICtrl) {

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', event => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        document.getElementById('labelAdd').addEventListener('click', UICtrl.displayAddLabel)

        document.getElementById('labelAddBtn').addEventListener('click', UICtrl.addLabelToDOM)

        document.getElementById('incFilterBtn').addEventListener('click', UICtrl.displayIncFilters)

        document.getElementById('expFilterBtn').addEventListener('click', UICtrl.displayExpFilters)

    }

    const updateBudget = () => {

        // 1.Calculate budget
        budgetCtrl.calculateBudget();

        // 2.Return budget
        const budget = budgetCtrl.getBudget();

        // 3.Display budget on UI
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = () => {

        // 1.Calculate %
        budgetCtrl.calculatePercentages();

        // 2.Read % from budget ctrl
        const percentages = budgetCtrl.getPercentages();

        // 3.Update UI
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = () => {

        // 1.Get field input data
        const input = UICtrl.getInput();

        if (input.description != '' && !isNaN(input.value) && input.value > 0) {

            // 2.Add item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.label);

            // 3.Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4.Clear fields
            UICtrl.clearFields();

            // 5.Calc & update budget
            updateBudget();

            // 6.Calc & update %
            updatePercentages()

            // 7.Save to LocalStorage

            // LocalStorage sólo guarda strings
            // Hay que guardar todos los datos string por string.
            // Habria que hacer una megafuncion que cargue cuando se llame en el init y que haga display en el UI.
            // Primero probar con los item list a ver si podemos crear una funcion que cree un item de las listas con los strings que se guardan.

            // For > itemList.id, itemList.description, itemList.value, itemList.label > addListItem(obj, type)

        }
    };

    const ctrlDeleteItem = event => {
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            const splitID = itemID.split('-');
            const type = splitID[0];
            const ID = parseInt(splitID[1]);

            // 1.Delete item from data struct.
            budgetCtrl.deleteItem(type, ID);

            // 2.Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3.Update and show new budget
            updateBudget()

            // 4.Calc & update %
            updatePercentages()
        }
    }


    return {
        init: function() {
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();



// LocalStorage
// Guardar toda la info necesaria
// Opciones del array labels