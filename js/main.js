//Global Variables to hold data before/after filtering
let globalData =[];
let data;
let characterChart;
//Read data
d3.csv('data/First_248_Episodes.csv')
  .then(thisdata => {
    var loading = document.getElementById("loading"); 
    loading.classList.add("loading"); // Add loading message
    setTimeout(function(){
      thisdata.forEach(d => {
        globalData.push(d)
      });

      data = globalData;

    // get .svg-container height
    var svgContainer = document.getElementsByClassName("svg-container");
    var svgContainerHeight = svgContainer.item(0).clientHeight - 5;

      //Create Character chart
    characterChart = new CharacterBrush({
      'parentElement': '#character',
      'containerHeight': svgContainerHeight,
      'containerWidth': window.innerWidth/3.0,
      }, getCharacter(data),(filterData) => {
        //TO DO
    }); 

      loading.classList.remove("loading"); // Remove loading message
   }, 120) // Use setTimeout to delay the loading message (prevent null classlist error)
})
.catch(error => console.error(error));

//Log Data
console.log("Here is the data: ", globalData);

//Always work with "data" object now, unless resetting to original data set (globalData)
data = globalData;

function updateCharts(){
  var loading = document.getElementById("loading");
  loading.classList.add("loading");
  setTimeout(function() {
    loading.classList.remove("loading");
  }, 100);
}

//function to reset charts to originl data
function resetCharts(){
    var loading = document.getElementById("loading");
    loading.classList.add("loading");
    setTimeout(function() {
      loading.classList.remove("loading");
    }, 100);
  }

function getCharacter(thisData,filterType){
  let returnData =[];

  let limit = 0;
  if(filterType == null){
    limit = 40;
  }
  if(filterType == "season"){
    limit = 10;
  }
  if(filterType == "episode"){
    limit = 0;
  }
  //get array of unique Characters
 const groupedData = d3.group(thisData, d => d.raw_character_text);
 let uniqueCharacters = Array.from(groupedData);
 let newArray = uniqueCharacters.map(([name, lines]) => ({ name, lines: lines.length }));
 newArray = newArray.sort((a, b) => d3.descending(a.lines, b.lines));
 newArray = newArray.filter(d => d.lines >= limit);
 returnData = newArray.map((d, i) => ({ ...d, id: i }));
 return returnData
}