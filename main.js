var data = {};
var dataList = [];
var completed=0;

google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);

function drawChart() {

  var data = new google.visualization.DataTable();

  data.addColumn('number', 'X');
  for(var i = 0; i<handles.length ; i++){
    data.addColumn('number', handles[i]);
}

data.addRows(dataList);


var options = {
    width: 1000,
    height: 563,
    hAxis: {
      title: 'Time'
  },
  vAxis: {
      ticks: [1200,1350,1500,1700,1900], 
      title: 'Rating'
  },
  series: {
      1: {curveType: 'function'}
  }
};

var chart = new google.visualization.LineChart(document.getElementById('ex2'));

chart.draw(data, options);
}

function getRating()
{
    handles = ['kuldeepfouzdar', 'venomous', 'chandan111', 'tourist']
    for (var i=0; i<handles.length; i++)
    {
        $.ajax({
            url: 'http://codeforces.com/api/user.rating',
            dataType: 'JSONP',
            data : {
                jsonp:"callback",
                handle:handles[i]
            },
            handle: handles[i],
            jsonpCallback: 'callback',
            type: 'GET',
            success: function (data1) {

                var current_handle = this.handle;
                completed++;
                if (data1.status == 'OK'){
                    member = data1.result;
                    for (var j=0; j<member.length; j++)
                    {
                        //console.log(member[j].ratingUpdateTimeSeconds);
                        if (member[j].ratingUpdateTimeSeconds in data)
                        {
                            temp = data[member[j].ratingUpdateTimeSeconds];
                            temp[current_handle] = member[j].newRating;
                            data[member[j].ratingUpdateTimeSeconds] = temp;
                        }
                        else
                        {
                            temp = {};
                            temp[current_handle] = member[j].newRating;
                            data[member[j].ratingUpdateTimeSeconds] = temp;
                        }
                    }
                }
                if (completed==handles.length)
                {
                    process_data(handles);
                    console.log(dataList);
                }    
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("error for : " + this.handle);
                    completed++;
                if (completed==handles.length)
                {
                    console.log(dataList);
                }  
            }

        });
}
}


function process_data(handles)
{
    var current_rating = [];
    for (var i=0; i<handles.length; i++){
        current_rating.push(1500);
    }
    var count = 0;
    for (var timeStamp in data){
        templist = [];
        templist.push(count);
        count++;
        var temp = data[timeStamp];
        for (var i=0; i<handles.length; i++)
        {
            if (!temp.hasOwnProperty(handles[i]))
                temp[handles[i]] = current_rating[i];
            else
                current_rating[i] = temp[handles[i]];
            
            templist.push(current_rating[i]);
        }
        dataList.push(templist);
        data[timeStamp] = temp;
    }
}

getRating();    
