//Global Variables to hold data before/after filtering
let globalData =[];
let data;
let characterChart, seasonTimeline, wordCloud;
let lastCharacter = "";
let curSeason = [];
let curEpisode = [];
//Read data
d3.csv('data/First_248_Episodes.csv').then(thisdata => {
  var loading = document.getElementById("loading"); 
  loading.classList.add("loading"); // Add loading message
  setTimeout(function(){

    thisdata.forEach(d => {
      globalData.push(d)
    });

    data = globalData;

    // get .svg-container height (first row)
    var svgContainer = document.getElementsByClassName("svg-container");
    var svgContainerHeight = svgContainer.item(0).clientHeight - 5;

    //Create Character chart
    characterChart = new CharacterBrush({
      'parentElement': '#character',
      'containerHeight': svgContainerHeight,
      'containerWidth': window.innerWidth/3.0,
      }, getCharacter(data),(filterData) => {

        if(lastCharacter == ""){
          lastCharacter = filterData;
        }
        else{
          lastCharacter = ""
        }
        
        updateCharts();
    }); 

    //Create Character chart
    seasonTimeline = new SeasonTimeline({
      'parentElement': '#season',
      'containerHeight': svgContainerHeight,
      'containerWidth': window.innerWidth/1.5,
      }, getSeasonTimeline(data),(season,episode) => {
        var val = d3.select('#dropdown')._groups[0][0].value
        if(val == "season"){
          if(curEpisode != []){
            curEpisode = [];
          }
          if(curSeason.includes(parseInt(season))){
            curSeason = curSeason.filter(d => d != parseInt(season))
          }
          else{
            curSeason.push(parseInt(season))
          }
        } else {
          if(curSeason != []){
            curSeason = [];
          }
          if(curEpisode.includes(episode)){
            curEpisode = curEpisode.filter(d => d != episode)
          }
          else{
            curEpisode.push(episode)
          }  
        }
        
        updateCharts();
    }); 

    // get .svg-container2 height (second row)
    var svgContainer2 = document.getElementsByClassName("svg-container2");
    var svgContainer2Height = svgContainer2.item(0).clientHeight - 5;

    console.log("svgContainer2Height: ", svgContainer2Height)
    //Create Character chart
    wordCloud = new WordCloud({
      'parentElement': '#cloud',
      'containerHeight': svgContainer2Height,
      'containerWidth': window.innerWidth/3.0,
    }, data);


    loading.classList.remove("loading"); // Remove loading message
  }, 120) // Use setTimeout to delay the loading message (prevent null classlist error)
})
.catch(error => console.error(error));

//Log Data
console.log("Here is the data: ", globalData);
d3.select("#button1").on("click", resetCharts);
//Always work with "data" object now, unless resetting to original data set (globalData)
data = globalData;

function updateCharts(){
  var loading = document.getElementById("loading");
  loading.classList.add("loading");
  setTimeout(function() {
    data = globalData;
    if(lastCharacter != ""){
      data = data.filter(d => d.raw_character_text == lastCharacter)
    }
    var filterBy = null;
    if(curSeason.length > 0){
      filterBy = "season"
      data = data.filter(d => curSeason.includes(parseInt(d.season))) 
    }
    if(curEpisode.length > 0){
      filterBy = "episode"
      data = data.filter(d => curEpisode.includes(parseInt(d.episode_id))) 
    }
    characterChart.data = getCharacter(data,filterBy);
    characterChart.updateVis();
    seasonTimeline.data = getSeasonTimeline(globalData,filterBy);
    seasonTimeline.updateVis();

    loading.classList.remove("loading");
  }, 100);
}

//function to reset charts to originl data
function resetCharts(){
    var loading = document.getElementById("loading");
    loading.classList.add("loading");
    setTimeout(function() {
    curSeason = [];
    curEpisode = [];
    characterChart.data = getCharacter(globalData);
    characterChart.updateVis();
    seasonTimeline.data = getSeasonTimeline(globalData);
    seasonTimeline.updateVis();
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

function getSeasonTimeline(thisData,filterType){
  let returnData =[];
  //{x0: episode -1, x1: episode, lines:lines, season:seasonColor}
  let seasonColor = ["#2ad6a0","#01abac","#00b4f4","#0099ff","#0072ff","#9557e2","#c733b8","#df0088","#e20058","#d62a2a","#e65120"]
  let baseSeasonColor = ["#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080","#808080"]
  if(filterType == "episode"){
    for(var i = 0; i < 248; i++){
      var color = "#808080"
      if(curEpisode.includes(i+1)){
        color = seasonColor[globalData.filter(d => parseInt(d.episode_id) === i+1)[0].season - 1]
      }
      var thisEpisode = thisData.filter(d => parseInt(d.episode_id) === i+1)
      if(thisEpisode.length == 0){
         returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: globalData.filter(d => parseInt(d.episode_id) === i+1)[0].season, season: color})
      }
      else{
        returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: thisEpisode[0].season, season: color})
      }
    }
  }
  else if(filterType == "season"){
    for(var i = 0; i < 248; i++){
      var color = "#808080"
      var thisSeason = globalData.filter(d => parseInt(d.episode_id) === i+1)[0].season
      if(curSeason.includes(parseInt(thisSeason))){
        color = seasonColor[thisSeason- 1]
      }
      var thisEpisode = thisData.filter(d => parseInt(d.episode_id) === i+1)
      if(thisEpisode.length == 0){
         returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: globalData.filter(d => parseInt(d.episode_id) === i+1)[0].season, season: color})
      }
      else{
        returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: thisEpisode[0].season, season: color})
      }
    }
  }
  else{
    for(var i = 0; i < 248; i++){
      var thisEpisode = thisData.filter(d => parseInt(d.episode_id) === i+1)
      if(thisEpisode.length == 0){
         returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: globalData.filter(d => parseInt(d.episode_id) === i+1)[0].season, season: "#808080"})
      }
      else{
        returnData.push({x0: i +.5, x1: i+1.5, lines:thisEpisode.length, seasonText: thisEpisode[0].season, season: seasonColor[thisEpisode[0].season - 1]})
      }
    }
  }
  return returnData
}