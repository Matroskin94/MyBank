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