function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getFormat(){ /*Перевод даты в необходимый формат YYYY-MM-DD*/
	var res = {
		date : Number(this.getDate()) < 10 ? "0" + this.getDate() : this.getDate(),
		month: Number(this.getMonth()+1) < 10 ? "0" + Number(this.getMonth()+1) : this.getMonth()+1,
		year : Number(this.getFullYear())
	};
	return res.year + "-" + res.month + "-" + res.date;
}

function calcData(){ //Date format 2017-12-15 YYYY-MM-DD Считает разницу в месяцах
	var needDate = date.split("-"),
		currDate = new Date(),
		dateNow = {
			day: currDate.getDate(),
			month: currDate.getMonth()+1,
			year: currDate.getFullYear()
		},
		needDate = {
			day: +date.split("-")[2],
			month: +date.split("-")[1],
			year: +date.split("-")[0]
		},
		month = 0;
		if((dateNow.year > needDate.year)&&(dateNow.month >= needDate.month)&&(dateNow.day >= needDate.day)){
			month = (dateNow.year - needDate.year) * 12;
			month = month + (dateNow.month - needDate.month);
		}else if((dateNow.year > needDate.year)&&(dateNow.month < needDate.month)){
			month = (dateNow.year - needDate.year - 1) * 12;
			month = month + dateNow.month + (12 - needDate.month);
		}else if((dateNow.year == needDate.year) && (dateNow.month > needDate.month)){
			month = month + (dateNow.month-1 - needDate.month);
		}
		if((needDate.day < dateNow.day)&&(needDate.month != dateNow.month)){
			month++;
		}
		return month;
}