/*-----------------Begining of the 'view' class---------------*/

var view = {
	initView: function(){
	},
	clearTable: function(targetTable){
		var table = $("#" + targetTable),
			tableRows = $(table).find("tr");
			for(var i = 1;i<tableRows.length;i++){
				$(tableRows[i]).remove();
			}
	},
	showTable:function(){
		var mainArr = arguments,
			simpleArr = [];
		for(var i = 0;i < mainArr.length;i++){
			if(mainArr[i].length!=0){
				var simpleArr = mainArr[i];
				arr_type = simpleArr[0].type;
				view.clearTable("table-"+arr_type);
				for(var j = 0;j < simpleArr.length; j++){
					view.addTableRow(simpleArr[j],arr_type);
				}
				$("#table-"+arr_type).fadeIn("slow");
			}
		}
	},
	addTableRow: function(row,type){
		var currRow = document.createElement("tr");
		for(key in row){
			if(key != "type"){
				var currCell = document.createElement("td");
				currCell.innerHTML = row[key];
			}
			$(currRow).append(currCell);
		}
		$("#table-"+type).append(currRow);
	},
	clearFormData:function(butt){ // Очистка полей формы
		var formId = "#add-" + $(butt).parent().parent().find("form")[0].id.split("-")[1] + "-form",
			inputs = $(formId).find("input, textarea,select");
		for(var i = 0;i<inputs.length;i++){
			if(inputs[i].type == "select-one"){
				inputs[i].selectedIndex  = 0;
			}else inputs[i].value = "";
		}

	},
	showPocket: function(pocket){
		var parentDiv = $("#cash_row");
		for(key in pocket[0]){
			if(pocket[0][key] != "0"){
				$("#"+key).parent().parent().parent().css("display","block");
				$("#"+key).text(pocket[0][key]);
			}
		}
	},
	showErrMessage: function(errObj,butt){
		var res_str = "",
			err_p = $(butt).parent().find("p");
		if(errObj.emptyFields) res_str = res_str + "Не все поля заполнены<br>";
		if(errObj.wrongSumm) res_str = res_str + "Неверно указана сумма<br>";
		if(errObj.wrongPercent) res_str = res_str + "Неверно указана процентная ставка"
		
		$(err_p[0]).fadeOut(100,function(){
			err_p.html(res_str);
			$(err_p[0]).fadeIn();
		});
		
		
	},
	hideErrMessage: function(butt){
		var err_p = $(butt).find("p");
		err_p.fadeOut();
	}	

};

/*-----------------End of the 'view' class---------------*/


/*-----------------Begining of the 'model' class---------------*/
var model = {
	Transaction: function(date,summ,currency,reason,type){
		this.date = date;
		this.summ = summ;
		this.currency = currency;
		this.reason = reason;
		this.type = type;
	},
	Account: function(date,summ,currency,name,percent,type){
		this.date = date;
		this.summ = summ; // Сумма первоначального вклада
		this.currency = currency;
		this.name = name;
		this.percent = percent;
		this.type = type;
		this.currSumm = summ; //Сумма в пересчёте с процентами

	},
	UserPocket: function(blr,rus,dol,eur,blr_card,rus_card,dol_card,eur_card){
		this.cash_BLR = blr;
		this.cash_RUS = rus;			
		this.cash_DOL = dol;	
		this.cash_EUR = eur;
		this.card_BLR = blr_card;
		this.card_RUS = rus_card;
		this.card_DOL = dol_card;
		this.card_EUR = eur_card;		
		this.type = "pocket";
	},
	initModel: function(){
		model.recountAccount();
		model.createUserPocket();
		model.createChart();
	},
	validateFormData:function(data){
		var res = {
			result: true,
			emptyFields:false,
			wrongSumm:false,
			wrongPercent:false
		};
		for(key in data){
			//console.log("key:" + key);
			//console.log("data:" + data[key]);
			if((data[key] == "" || data[key] == undefined) && key != "type"){
				res.result = false;
				res.emptyFields = true;
			}
			if((!isNumeric(data[key]))&&(data[key] != "") && ((key == "summ")||(key == "percent"))){
				res.result = false;
				if(key == "summ") res.wrongSumm = true;
				if(key == "percent") res.wrongPercent = true;
			}
		}
		return res;
	},
	getFormFields: function(form){ //Чтение полей формы
		var inputs = $(form).find("input, textarea, select"),
			ress_arr = [],
			ress_obj = {};
		for(var i = 0; i < inputs.length; i++){
			ress_arr[i] = inputs[i].value;
		}
		if(inputs.length == 3){
			ress_obj = new model.Transaction(getFormat.call(new Date()),ress_arr[0],ress_arr[1],ress_arr[2]);
		}else{
			ress_obj = new model.Account(ress_arr[0],ress_arr[1],ress_arr[2],ress_arr[3],ress_arr[4]);	
		}
		return ress_obj;
	},
	recountAccount: function(){/*Пересчёт процентов на банковском счёте*/
		var accounts = model.getFromStorage("account");
		for(var i = 0;i < accounts.length;i++){
			var tmpAcc = accounts[i];
				monthPassed = calcDate(tmpAcc.date),
				currSumm = +accounts[i].summ,
				currPercent = +accounts[i].percent;
			for(var j = 0;j<monthPassed;j++){
				currSumm = currSumm + (currSumm * (currPercent/100/12));
			}
			tmpAcc.currSumm = Math.round(currSumm * 100) / 100;
			localStorage.setItem("account["+ i +"]",JSON.stringify(tmpAcc));
		}
	},
	updatePocket: function(pocket,obj){ /*Увеличение и уменьшение средств в кошельке*/
		if(obj.type == "cost"){	
			pocket["cash_"+obj.currency] = Number(pocket["cash_"+obj.currency]) - Number(obj.summ); 	
		}else if(obj.type == "income"){
			pocket["cash_"+obj.currency] = Number(pocket["cash_"+obj.currency]) + Number(obj.summ);
		}
		return pocket;
	},
	updateGraph: function(graph,obj){//grapf == array obj - расход или дохход/*Обновление данных граффика*/
		var currDate = Number(new Date().getDate());
		//console.log("Udating graph");
		//console.log(obj.date);
		for(var i = 0;i<=currDate;i++){
			if(i == Number(obj.date.split("-")[2])){
				if(obj.type == "cost"){	
					graph[i] = graph[i] - Number(obj.summ);
				}else if(obj.type == "income"){
					graph[i] = graph[i] + Number(obj.summ);
				}
			}
			if(((graph[i] == undefined)||(graph[i] == 0))&& i!=0){
				console.log("graph["+i+"-1]:"+graph[i-1]);
				graph[i] = graph[i-1];
			}

		}
		fillChart(graph);
		return graph;
	},
	createUserPocket: function(){ /*Создание кошелька пользователя*/
		if(!localStorage.getItem("pocket[0]")){
			var pocket = new model.UserPocket(1500,0,500,0,1000,0,0,0),
				pocketJSON = JSON.stringify(pocket);
			localStorage.setItem("pocket[0]",pocketJSON);
			localStorage.setItem("pocketNum",1);
		}
	},
	createChart: function(){ /*Созддание таблицы (с взятием данных из localStorage)*/
		var chartData = model.getFromStorage("graph"),
			pocket = model.getFromStorage("pocket");
			dateNow = new Date().getDate();
			//console.log("chartData");
			//console.log(chartData);
		if(chartData[0].length == 0){
			var graphData = [];
			for(var i = 0;i<Number(dateNow);i++){
				graphData[i] = 0;
				if(i == Number(dateNow)-1){
					graphData[i+1] = pocket[0].cash_BLR;
				}
			}
			fillChart(graphData);
			model.saveToStorage(graphData,"graph");
		}else if(chartData[0].length-1 > dateNow){
			chartData[0] = [];
			for(var i = 0;i<=dateNow;i++){
				chartData[0][i] = pocket[0].cash_BLR;
			}
			fillChart(chartData[0]);
			delete localStorage["graphNum"];
			delete localStorage["graph[0]"];
			model.saveToStorage(chartData[0],"graph");
		}else{
			if(chartData[0].length - 1 < dateNow){
				for(var i = chartData[0].length;i<=dateNow;i++){
					chartData[0][i] = chartData[0][i-1]
				}
			}
			fillChart(chartData[0]);
		}

	},
	saveToStorage: function(obj,type){ // Сохранение в localStorage
		var typeNum = 0;
		if(localStorage.getItem(type + "Num") != null){
			typeNum = localStorage.getItem(type + "Num");
		}else{
			localStorage.setItem(type + "Num",0);
		}
		obj.type = type;
		var sObj = JSON.stringify(obj),
			pocket = model.getFromStorage("pocket")[0],
			graph = model.getFromStorage("graph")[0];
		localStorage.setItem(type+"["+typeNum+"]", sObj);
		localStorage.setItem((type + "Num"),+typeNum + 1);
		localStorage.setItem("pocket[0]", JSON.stringify(model.updatePocket(pocket,obj)));
		if(obj.type == "income" || obj.type == "cost"){
			localStorage.setItem("graph[0]",JSON.stringify(model.updateGraph(graph,obj)));
		}
	},
	getFromStorage:function(type){ /*чтение из localStorage*/
		var typeNum = localStorage.getItem(type + "Num"),
			tmpStr = type,
			objField = "",
			ressArr = [];
		for(var i = 0;i<typeNum;i++){
			var tmpObj = null/*(type == "cost" || type == "income") ? new model.Transaction() : 
				(type == "account") ? new model.Account() : new model.UserPocket()*/;
			tmpStr = tmpStr + "[" + i + "]";
			tmpObj = JSON.parse(localStorage.getItem(tmpStr));
			tmpStr = type;
			ressArr[i] = tmpObj;
		}
		return ressArr;
	}
};

/*-----------------End of the 'model' class---------------*/


/*-----------------Begining of the 'controller' class---------------*/

var controller = {
	initControler:function(){
		model.initModel();
		view.showTable(model.getFromStorage("cost"),model.getFromStorage("income"),model.getFromStorage("account"));
		view.showPocket(model.getFromStorage("pocket"));
	},
	saveForm: function(){
		var formType = this.id.split("-")[1],
			data = model.getFormFields($("#add-"+ formType +"-form")),
			validation = model.validateFormData(data);
		if(validation.result){
			$("#add-"+formType+"-modal").modal('hide');
			view.hideErrMessage("#save-"+formType);
			view.addTableRow(data,formType);
			view.clearFormData(this);
			//model.saveToStorage(data, formType);
		}else view.showErrMessage(validation,"#save-"+formType);
		
	},
	closeForm: function(){
		view.hideErrMessage(this);
		view.clearFormData(this);
	}


};

/*-----------------End of the 'controller' class---------------*/



$(document).ready(function() {

	var app = {
		init: function(){
			this.main();
			this.ivent();
		},
		main:function(){
			controller.initControler();
		},
		ivent: function(){
			var add_cost_but = document.getElementById("save-cost"),
				add_income_but = document.getElementById("save-income"),
				add_account_but = document.getElementById("save-account"),
				close_modal = document.getElementsByClassName("modal");
			add_cost_but.onclick = controller.saveForm;
			add_income_but.onclick = controller.saveForm;
			add_account_but.onclick = controller.saveForm;
			$(close_modal).on('hide.bs.modal',controller.closeForm);
			
		}		
	};
	app.init();
	
});