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
      let count = 0;
      thisdata.forEach(d => {
        if(count<10000){
        globalData.push(d)
      }
      count++
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

function getCharacter(thisData){
  let returnData =[];
  console.log(thisData)
  //get array of unique Characters
 const groupedData = d3.group(thisData, d => d.raw_character_text);
 const uniqueCharacters = Array.from(groupedData.keys());
 for(var obj in uniqueCharacters){
    let justThisCharacter = thisData.filter( d => d.raw_character_text == uniqueCharacters[obj] );
    if(justThisCharacter.length>50){
      returnData.push({"name":uniqueCharacters[obj],"lines":justThisCharacter.length});
    }
  }
  returnData.sort((a, b) => d3.ascending(a.lines, b.lines));
  return returnData
}