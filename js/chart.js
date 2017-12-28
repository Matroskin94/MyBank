function fillDates(num){
    var ressArr = [];
    for(var i = 1;i<=num;i++){
        ressArr[i] = i;
    }
    return ressArr;
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function fillChart(dataArr){
    for(var i = 0;i<dataArr.length;i++){
        chart.data.datasets[0].data[i] = dataArr[i];
    }
    chart.update();
}

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: fillDates(30),
        datasets: [{
            label: "December costs",
            borderColor: 'rgb(255, 99, 132)',
            data: [],
        }]
    },
    // Configuration options go here
    options: {
    }
});
//chart.data.datasets[0].data[2] = 50; // Would update the first dataset's value of 'March' to be 50
//chart.update();



