//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//Helper function for calculating Overall Class Grade
var GradeInClass = function(penguin){
        //mean quiz
        var quiz_mean=getMeanQuiz(penguin).toFixed(2);
        
        //mean hw
        var mean_hw = getMeanHW(penguin).toFixed(2);
        
        //mean test
        var mean_test = getMeanTest(penguin).toFixed(2);
        
        //final
        var final_grade = getFinal(penguin).toFixed(2);
        //Grade = (35% final, 30% Mean of Tests, 20% Quizzes, and 15% HW)
    
        var overall_grade= (.35*final_grade)+(.3*mean_test)+(.2*quiz_mean)+(.15*mean_hw)
        
        return overall_grade.toFixed(2);
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var getMeanHW = function(penguin)
{
    var array_grades= penguin.homework.map(function(hw){
        return hw.grade
    })
    return d3.mean(array_grades)
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var getMeanTest = function(penguin)
{
    var array_grades= penguin.test.map(function(exam){
        return exam.grade
    })
    return d3.mean(array_grades)
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var getMeanQuiz = function(penguin)
{
    var array_grades= penguin.quizes.map(function(quiz){
        return quiz.grade
    })
    return d3.mean(array_grades)
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var getFinal = function(penguin)
{
    var finalgrade = penguin.final[0].grade
    return finalgrade
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////



var drawLines = function(penguins,graph,target,
              xScale,yScale,colorScale)
{
    
    var lineGenerator = d3.line()
        .x(function(quiz,index) { return xScale(index);})
        .y(function(quiz)   
        { 
            return yScale(quiz.grade);
        })
        .curve(d3.curveCardinal)
        
    
    /*
    .x(function(num,index){return xScale(index)})
    .y(function(num){return yScale(num)})
    */
    
    
    var lines = d3.select(target)
        .select(".graph")
        .selectAll("g")
        .data(penguins)
        .enter()
        .append("g")
        .attr("class",function(penguin)
        {
            return GradeInClass(penguin);
        })
        .classed("line",true)
        .attr("fill","none")
        .attr("stroke",function(penguin) 
        { 
            return colorScale(GradeInClass(penguin));
        })
        .attr("stroke-width",3)
        .on("mouseover",function(penguin)
        {   
            if(! d3.select(this).classed("off"))
            {
            d3.selectAll(".line")
            .classed("fade",true);
            
            d3.select(this)
                .classed("fade",false)
                .raise(); //move to top
            }
        })
        .on("mouseout",function(penguin)
           {
            if(! d3.select(this).classed("off"))
            {
            
            d3.selectAll(".line")
                .classed("fade",false);
            }
            
        })
    
    lines.append("path")
        .datum(function(penguin) 
            { return penguin.quizes;})
        .attr("d",lineGenerator)
}


var createLabels = function(screen,margins,graph,target)
{
        var labels = d3.select(target)
        .append("g")
        .classed("labels",true)
        
    labels.append("text")
        .text("Grade Over Time")
        .classed("title",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",margins.top)
    
    labels.append("text")
        .text("Week")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",screen.height)
    
    labels.append("g")
        .attr("transform","translate(20,"+ 
              (margins.top+(graph.height/2))+")")
        .append("text")
        .text("Change in Quiz Grade")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("transform","rotate(90)")
    
}


var createAxes = function(screen,margins,graph,
                           target,xScale,yScale)
{
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    var axes = d3.select(target)
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+graph.height)+")")
        .call(xAxis)
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .call(yAxis)
}


var initGraph = function(target,penguins)
{
    //the size of the screen
    var screen = {width:500, height:400};
    
    //how much space will be on each side of the graph
    var margins = {top:15,bottom:40,left:70,right:40};
    
    //generated how much space the graph will take up
    var graph = 
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    
    //set the screen size
    d3.select(target)
        .attr("width",screen.width)
        .attr("height",screen.height)
    
    //create a group for the graph
    var g = d3.select(target)
        .append("g")
        .classed("graph",true)
        .attr("transform","translate("+margins.left+","+
             margins.top+")");
        
    //create scales for all of the dimensions
    
    
    var xScale = d3.scaleLinear()
        .domain([0,penguins[0].quizes.length-1])
        .range([0,graph.width])
    
    
    var lowGrade = d3.min(penguins,function(penguin)
    {
        return d3.min(penguin.quizes, function(quiz){
            return quiz.grade
        })
    })
    
    var highGrade = d3.max(penguins,function(penguin)
    {
        return d3.max(penguin.quizes, function(quiz){
            return quiz.grade
        })
    })
    
    var yScale = d3.scaleLinear()
        .domain([lowGrade,highGrade])
        .range([graph.height,0])
    
    
    var colorScale = d3.scaleSequential()
                        .domain([
                            d3.min(penguins,GradeInClass),
                            d3.max(penguins,GradeInClass)
                                ])
                        .interpolator(d3.interpolateWarm);
    
    
    //create the axis and labels
    createLabels(screen,margins,graph,target);
    createAxes(screen,margins,graph,target,xScale,yScale);
    drawLines(penguins, graph,target,
              xScale,yScale,colorScale);
}


var tablePromise = d3.json("classData.json");

tablePromise.then(function(penguins)
{
    console.log("subject data",penguins);

    initGraph("#weightLines",penguins);
   
},
function(err)
{
   console.log("Error Loading data:",err);
});