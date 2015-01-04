var data = {};
var dataList = [];
var completed=0;
var handles = ['handle'];
var handles_copy = handles.slice(0);
var handle_count = handles.length;
google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(drawChart);
function drawChart() {
    var data = new google.visualization.DataTable();
    console.log(data);
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
      }
    };

    var chart = new google.visualization.LineChart(document.getElementById('ex2'));

    chart.draw(data, options);
}
$(document).ready(function(){
    $("#submit").click(function(){
        var text = document.getElementsByName('handle')[0].value.trim();
        var handle_list = text.split(',');
        data = {};
        dataList = [];
        completed = 0;
        handles = [];
        for (var i=0; i<handle_list.length; i++){
            var temp = handle_list[i].trim();
            if (temp.length>=3)
                handles.push(temp);
        }
        if (handles.length>3){
            alert("More than 3 handles not allowed!");
            return false;
        }
        else if (handles.length==0){
            alert("please enter comma separaed handles to get graph");
            return;
        }
        if (text.charAt(text.length-1) != ',')
            document.getElementsByName('handle')[0].value = text + ', ';
        handles_copy = handles.slice(0);
        handle_count = handles.length;
        
        getRating();
    });
    $("#handle").keyup(function(event){
    if(event.keyCode == 13){
        $("#submit").click();
    }
});
});



function getRating()
{
    if (handles_copy.length>0)
    {
        var handle = handles_copy.pop();
        $.ajax({
            url: 'http://codeforces.com/api/user.rating',
            dataType: 'JSONP',
            data : {
                jsonp:"callback",
                handle:handle
            },
            handle: handle,
            jsonpCallback: 'callback',
            type: 'GET',
            success: function (data1) {
                var current_handle = this.handle;
                if (data1.status == 'OK'){
                    completed++;
                    member = data1.result;
                    console.log(member);
                    for (var j=0; j<member.length; j++){
                        if (member[j].ratingUpdateTimeSeconds in data){
                            temp = data[member[j].ratingUpdateTimeSeconds];
                            temp[current_handle] = member[j].newRating;
                            data[member[j].ratingUpdateTimeSeconds] = temp;
                        }
                        else{
                            temp = {};
                            temp[current_handle] = member[j].newRating;
                            data[member[j].ratingUpdateTimeSeconds] = temp;
                        }
                    }
                }
                //retry only if call limit exceeded
                else if (data1.status == "FAILED" && data1.comment == "Call limit exceeded"){
                    handles_copy.push(this.handle);
                }
                else{
                    completed++;
                }

                if (completed==handle_count)
                {
                    process_data();
                    drawChart();
                    console.log(dataList);
                }
                else
                    getRating();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("error for : " + this.handle)
                handles_copy.push(this.handle);
                getRating();
            }

        });
    }
}


function process_data()
{
    var current_rating = [];
    console.log(handles);
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