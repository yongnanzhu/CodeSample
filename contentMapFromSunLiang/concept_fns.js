//all javascript functions for concept maps
//to do
//d.name change to two lines or only show the fixed width of string and show all when hover
// bar chart for count

function loadData(data){

// sort the data -- TODO: have multiple sort options
outer = data.outer;
data.outer = Array(outer.length);


var i1 = 0;
var i2 = outer.length - 1;
for (var i = 0; i < data.outer.length; ++i)
{
    if (i % 2 == 1)
	data.outer[i2--] = outer[i];    //the even data   e.g there are 10 outers, data.outer from 5 to 10 will store even outer data
    else
	data.outer[i1++] = outer[i];	// the odd data
}  



//console.log(data.outer.reduce(function(a,b) { return a + b.related_links.length; }, 0) / data.outer.length);


// from d3 colorbrewer: 
// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
var colors = ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
var color = d3.scale.linear()
    .domain([60, 220])
    .range([colors.length-1, 0])
    .clamp(true);


var rect_width = 40;
var rect_height = 14;

var link_width = "1px"; 

var il = data.inner.length;
var ol = data.outer.length;

var diameter ;
if(ol>500 || il>200){
    diameter = 1800;
}
else if((ol>250 && ol<500) || (il>100)){
    diameter = 1400; 
}
else{
    diameter = 1000;
}

diameter = diameter > il*rect_height ? diameter : il*rect_height;

//diameter = il*rect_height;
//console.log('total size:'+ol);
var inner_y = d3.scale.linear()
    .domain([0, il])
    .range([-(il * rect_height)/2, (il * rect_height)/2]);

//mid = (data.outer.length/2.0)
var outer_x;
if (ol>500){
    outer_x = d3.scale.linear()
    .domain([0, ol/6, ol/6, ol/3, ol/3, 1/2*ol, 1/2*ol, 2/3*ol,2/3*ol, 5/6*ol, 5/6*ol, ol])   // by index
    .range([10, 170, 190 ,350, 10, 170, 190 ,350, 10, 170, 190 ,350]);  
}
else if(ol>250 && ol<500){
    outer_x = d3.scale.linear()
    .domain([0, ol/4, ol/4, ol/2, ol/2, 3/4*ol, 3/4*ol, ol])   // by index
    .range([10, 170, 190 ,350, 10, 170, 190 ,350]); 
}
else{
    outer_x = d3.scale.linear()
    .domain([0, ol/2, ol/2, ol])   // by index
    .range([10, 170, 190 ,350]);   
}


var outer_y = d3.scale.linear()
    .domain([0, data.outer.length])
    .range([0, diameter / 2 - 120]);


// setup positioning
data.outer = data.outer.map(function(d, i) { 
    d.x = outer_x(i);     // by index
    if (ol>500){
	if (i>2/3*ol){
	   d.y = diameter/2.3; 
	}
	else if(i>1/3*ol){
	   d.y = diameter/3;  
	}
	else{
	   d.y = diameter/4;  
	}
    }
    else if(ol>250 && ol<500){
	if (i>ol/2){
	    d.y = diameter/(2.5);
	}
	else{
	d.y = diameter/4;
	}
    }
    else{
	d.y = diameter/3;
    }
    d.clickFlag = false;   //see whether data is clicked or not; default value is false.
    
    return d;
});

data.inner = data.inner.map(function(d, i) { 
    d.x = -(rect_width / 2);
    d.y = inner_y(i);
    d.clickFlag = false;   //see whether data is clicked or not; default value is false.
    return d;
});



var diagonal = d3.svg.diagonal()
    .source(function(d) { return {"x": d.outer.y * Math.cos(projectX(d.outer.x)), 
                                  "y": -d.outer.y * Math.sin(projectX(d.outer.x))}; })            
    .target(function(d) { return {"x": d.inner.y + rect_height/2,
                                  "y": d.outer.x > 180 ? d.inner.x : d.inner.x + rect_width}; })
    .projection(function(d) { return [d.y, d.x]; });
  
function projectX(x)
{
    return ((x - 90) / 180 * Math.PI) - (Math.PI/2);
}  
  

var width = 2000;
var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed); //Yongnan
var svg = d3.select("body").append("svg")
    .attr("id",'svgID')  //to get the svg data!
    .attr("width", diameter>width?diameter:width)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")")
    .call(zoom);  //Yongnan
    var zoomContainer = svg.append("g");
    function zoomed() {
        zoomContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }//Yongnan
    // inner nodes
    var maxInnerLinks = d3.max(data.inner, function(d){
        return d.related_links.length;
    });//Yongnan
    var maxOuterLinks = d3.max(data.outer, function(d){
        return d.related_links.length;
    });//Yongnan

//************************* selectedNode*************************
var selectedObj = {};
    selectedObj.related_nodes = [];
    selectedObj.related_links = [];

//*************************subset data********************
var subsetObj = {};
    subsetObj.inner = [];
    subsetObj.outer = [];
    subsetObj.links = [];
//*************************remove array data********************   
var removeObj = {};
    removeObj.related_nodes = [];
    removeObj.related_links = [];
  
//*************************links
var link = zoomContainer.attr('class', 'links').selectAll(".link")
    .data(data.links)
  .enter().append('path')
    .attr('class', 'link')
    .attr('id', function(d) { return d.id })
    .attr("d", diagonal)   //how to understand??????????
    .attr('stroke', function(d) { return get_color(d.inner.name); })   // not function very well
    .attr('fill','none')
    .attr('stroke-width', link_width)
    .on("contextmenu",function (d,i) {
      //create tooltips
	var position = d3.mouse(this)
        tooltip = get_tooltip(d);
        d3.event.preventDefault();
        //console.log((Math.cos((d.x-90)/180*Math.PI)*d.y+diameter/2)+'*'+(Math.sin((d.x-90)/180*Math.PI)*d.y+diameter/2))
        tooltip.html(function () {
                            return format_name(d,true);
                        });
	
	$('#'+d.id+'-tprm').click(function(){
	    $('#'+d.id+'-tp').remove();
	});
      //console.log('top'+(position[1]+diameter/2)+ ' left:'+(position[0]+diameter/2));
    $('#'+d.id+'-tp').dialog({
	width: "auto",
        height: "auto"
      });
	  
      //return tooltip
      //  .transition()
      //  .duration(2000)
      //  .style("border","1px #ccc solid")
      //  .style("opacity", 0.9)
      //  .style("top", (position[1] + diameter/2) + "px")
      //  .style("left", (position[0] + diameter/2 + 40) + "px");
    });


// outer nodes

var onode = zoomContainer.selectAll(".outer_node")
    .data(data.outer)
  .enter().append("g")
    .attr("class", "outer_node")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .on("click", nodeclick)
    .on("contextmenu",function (d, i) {
      //create tooltips
        tooltip = get_tooltip(d);
        d3.event.preventDefault();
        //console.log((Math.cos((d.x-90)/180*Math.PI)*d.y+diameter/2)+'*'+(Math.sin((d.x-90)/180*Math.PI)*d.y+diameter/2))
        tooltip.html(function () {
                            return format_name(d,false);
                        });
      //console.log(svg.style("height"));
      //console.log('y:'+d.y+ svg.style("height")/2+20+' x:'+d.x+ svg.style("height")/2+20);
	$('#'+d.id+'-tprm').click(function(){
	    $('#'+d.id+'-tp').remove();
	});
	
        $('#'+d.id+'_rm').click(function(){  //remove button clicked
          select_Node(d);
          $(".tooltip").remove();
          //$("#subnode").append('<div>Previous Data: <button id="goback">GO</button></div>');
          //$("#goback").click(function(){
          //  d3.select("svg").remove();
          //  $("#menuID").remove();
          //  loadData(data);
          //});

          });
	
    $('#'+d.id+'-tp').dialog({
	width: "auto",
        height: "auto"
      }); 
      
      //return tooltip
      //  .transition()
      //  .duration(2000)
      //  .style("border","1px #ccc solid")
      //  .style("opacity", 0.9)
      //  .style("top", (Math.sin((d.x-90)/180*Math.PI)*d.y+diameter/2) + "px")
      //  .style("left", (Math.cos((d.x-90)/180*Math.PI)*d.y+diameter/2 + 40) + "px");
    });


 
onode.append("circle")
    .attr('id', function(d) { return d.id })
    .attr('fill','#fff')
    .attr('stroke','steelblue')
    .attr('stroke-width','1.5px')
    .attr('pointer-events','all')
    .attr("r", 4.5)
    .attr("class",'highlight')
    .attr("stroke","#315B7E")
    .attr("stroke-width","2px");
  
//onode.append("circle")
//    .attr('r', 20)
//    .attr('visibility', 'hidden');

    onode.append('rect')     //Yongnan
        .attr('class', function(d){
            if(d.rateLimit !==undefined && d.rateLimit)     //You need to set rateLimit attribute
            {
                return "rateLimit";
            }
            else
            {
                return "normal";
            }
        })
        .attr('width', function(d){
            if(maxOuterLinks==0)
                return 0;
            return Math.floor(rect_width * d.related_links.length /maxOuterLinks)
        })
        .attr('x', function(d) { return 5; })
        .attr('y', function(d) { return -3; })
        .attr('height', 6)
        .attr('id', function(d) { return "outRect"+d.id; })
        .attr('fill', function(d) {
            return "#f46d43";
        });


onode.append("text")
	.attr('id', function(d) { return d.id + '-txt'; })
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
    .text(function(d) { return trimLabel(d.name,'outer'); });
  
// inner nodes

var inode = zoomContainer.selectAll(".inner_node")
    .data(data.inner)
  .enter().append("g")
    .attr("class", "inner_node")
    .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"})
    .on("click", nodeclick)  // add array
    .on("contextmenu",function (d, i) {
      //create tooltips
      tooltip = get_tooltip(d);
      d3.event.preventDefault();
      tooltip.html(function () {
                            return format_name(d,false);
                        });
      $('#'+d.id+'-tprm').click(function(){
	    $('#'+d.id+'-tp').remove();
	});
	
      $('#'+d.id+'_rm').click(function(){
          select_Node(d);
          $(".tooltip").remove();
          });
      $('#'+d.id+'_rz').click(function(){
	var size = $('#'+d.id+'_ls').val();
	//console.log(d3.select('#'+d.id).datum());
	if (typeof(parseInt(size)) == 'number'){
	    //$('#'+d.id+'-txt').text('oooop');
	    $('#'+d.id+'-txt').text(String(d3.select('#'+d.id).datum().name).substr(0,size) + "...").css("font-size","12px");
	    
	}
	else{
	   alert ('Please give me number!'); 
	}
       });
       
    $('#'+d.id+'-tp').dialog({
	width: "auto",
        height: "auto"
      });    
    
//	return tooltip
//        .style("border","1px #ccc solid")
//        .style("opacity", 0.9)
        //.style("top", (d.y + diameter/2) + "px")
        //.style("left", (d.x + diameter/2+75) + "px");
        //
	
      //return tooltip
      //  .transition()
      //  .duration(2000)
      //  .style("border","1px #ccc solid")
      //  .style("opacity", 0.9)
      //  .style("top", (d.y + diameter/2) + "px")
      //  .style("left", (d.x + diameter/2+75) + "px");
    });


    
inode.append('rect')
    .attr('class', function(d){        //Yongnan
        if(d.rateLimit !==undefined && d.rateLimit)     //You need to set rateLimit attribute
        {
            return "rateLimit";
        }
        else
        {
            return "normal";
        }
    })
    .attr('width', function(d){       //Yongnan
        if(maxInnerLinks==0)
            return 0;
        return Math.floor(rect_width * d.related_links.length /maxInnerLinks)
    })
    .attr('height', rect_height)
    .attr('id', function(d) { return d.id; })
    .attr('stroke', function(d) {
        return "#000000";
    })
    .attr('fill', function(d) { return get_color(d.name); })
    .attr('pointer-events', 'all');
    //.attr('class', 'highlight')
    //.attr('stroke', '#315B7E')
    //.attr('stroke-width','2px');
  
inode.append("text")
    .attr('id', function(d) { return d.id + '-txt'; })
    .attr('text-anchor', 'middle')
    .attr("transform", "translate(" + rect_width/2 + ", " + rect_height * .75 + ")")
    .text(function(d) { return trimLabel(d.name,'inner'); })    //d.name change to two lines or only show the fixed width of string and show all when hover
    .each(function (d) {
        d.bx = this.getBBox().x;
        d.by = this.getBBox().y;
        d.bwidth = this.getBBox().width;
        d.bheight = this.getBBox().height;
    });

    
    
    

d3.select(self.frameElement).style("height", diameter - 150 + "px");




var FizzyText = function() {
  this.saveData = function(){
            var data_download = '';
            //console.log("save current data!");
            data.links.forEach(function(d){
              data_download = data_download + d.inner.name + '\t' + d.outer.name + '\n';
              //console.log(d.inner.name + '\t' + d.outer.name + '\n');
            });
            $.post('save.php',{data:data_download,type:'subset'}, function(file){   //here type:subset is txt file type
                window.location.href = "download.php?path="+ file;
              });
    };
  this.svg = function(){
    		var img_download = '';
		img_download = document.getElementById("svgID");
	    
		var svg_xml =(new XMLSerializer).serializeToString(img_download);
		//console.log(svg_xml);

		$.post('save.php',{data:svg_xml,type:'svg'}, function(file){   //here type:subset is txt file type
		    window.location.href = "download.php?path="+ file;
		});
    };
  this.svgToPNG = function(){
	window.open("http://image.online-convert.com/convert-to-png");
    
    };
  //var _this = this;
  //console.log(this);
  this.subset = function(){
    if(window.gui_flag){
	alert('can not subset anymore!');
	return;
    }
    
    if(subsetObj.inner.length&&subsetObj.outer.length){
        d3.select("svg").remove();
        $("#menuID").remove();
        $(".tooltip").remove();
	$(".main").remove();  //remove the old gui
	window.gui_flag = true;
	window._data = data;
	
        loadData(subsetObj);
	
    }
    else{
	alert("Please selected nodes and edges!");
    }
    
  };
  
  if(window.gui_flag){
      this.goBack = function(){
	    if(!window.gui_flag){
		alert ("Already original data, can not go back any more!");
		return;
	    }
                d3.select("svg").remove();
		$(".main").remove();  //remove the old gui
                loadData(window._data);
                subsetObj = {};
                subsetObj.inner = [];
                subsetObj.outer = [];
                subsetObj.links = [];
                selectedObj = {};
                selectedObj.related_nodes = [];
                selectedObj.related_links = [];
		window.gui_flag = false;
	};
    }
  
};

  var text = new FizzyText();
  var gui = new dat.GUI();
  gui.add(text,'saveData').name('Save Data');
  var f1 = gui.addFolder('Save Image');
  f1.add(text, 'svg').name('Save as SVG');
  f1.add(text, 'svgToPNG').name('SVG to PNG');
  gui.add(text,'subset').name('Subset Data');
  if(window.gui_flag){
    gui.add(text,'goBack').name('Previous Graph');
  }


//var menu = d3.select("body")
//          .append("div")
//          .attr ("id","menuID")
//          .style("width","150px")
//	  .style("height","150px")
//          .style("top","5px")
//          .style("left","5px")
//          .style("padding","5px")
//	  .style("opacity",0.9)
//          .style("position", "absolute")
//          .style("z-index", "200")
//          .text("Menu");
//
//      menu.append("div")
//          .text ("Data: ")
//          .append("button")
//          .attr("id","save")
//          .text("Save")
//          .on("click",function(){
//            var data_download = '';
//            //console.log("save current data!");
//            data.links.forEach(function(d){
//              data_download = data_download + d.inner.name + '\t' + d.outer.name + '\n';
//              //console.log(d.inner.name + '\t' + d.outer.name + '\n');
//            });
//            $.post('save.php',{data:data_download,type:'subset'}, function(file){   //here type:subset is txt file type
//                window.location.href = "download.php?path="+ file;
//              });
//            //dataSave(data); //////////////////////here you are!
//            
//          });
//	  
//      menu.append("div")
//          .text ("Image: ")
//          .append("button")
//          .text("Save")
//          .on("click",function(){
//	    var position = d3.mouse(this)
////            var img_download = '';
//	    //console.log("save current data!"+d);
//	    tooltip = get_tooltip(false);
//	    tooltip.html('<div><b>Step1:</b>'
//			 +'<div>Save as <button id="toSVG">SVG</button></div></br>'
//			 +'<div><b>Step2:</b></div>'
//			 +'<div>SVG to <a href="http://image.online-convert.com/convert-to-png" target="_blank"><button>PNG</button></a>');
//	    $('#img-tprm').click(function(){
//		$('#img-tp').remove();
//	    });
//	    $('#toSVG').click(function(){
//		var img_download = '';
//		img_download = document.getElementById("svgID");
//	    
//		var svg_xml =(new XMLSerializer).serializeToString(img_download);
//		//console.log(svg_xml);
//
//		$.post('save.php',{data:svg_xml,type:'svg'}, function(file){   //here type:subset is txt file type
//		    window.location.href = "download.php?path="+ file;
//		});
//	    });
//	    
//	    $('#img-tp').dialog({
//		width: "300px",
//		height: "auto"
//	    });
//		
//	//    return tooltip
//	//	.transition()
//	//	.duration(2000)
//	//	.style("border","1px #ccc solid")
//	//	.style("opacity", 0.9)
//	//	.style("top",   (position[1]+20)+"px")
//	//	.style("left",  (position[0]+20)+"px");
//
//
//            //dataSave(data); //////////////////////here you are!
//            
//          });
//	  
//      menu.append("div")
//          .text("Node: ")
//          .attr("id","subnode")
//          .append("button")
//          //.attr("id","subset")
//          .text ('Subset')
//          .on("click",function(){
//            if(subsetObj.inner.length&&subsetObj.outer.length){
//	      //console.log('subsetobj:');
//              //console.log(subsetObj);
//              d3.select("svg").remove();
//              $("#menuID").remove();
//	      $(".tooltip").remove();
//              loadData(subsetObj);
//              d3.select("#menuID").append("div")
//              .text("Previous Data: ")
//              .append("button")
//              .on("click",function(){
//                d3.select("svg").remove();
//                $("#menuID").remove();
//                loadData(data);
//                subsetObj = {};
//                subsetObj.inner = [];
//                subsetObj.outer = [];
//                subsetObj.links = [];
//                selectedObj = {};
//                selectedObj.related_nodes = [];
//                selectedObj.related_links = [];
//                
//              })
//              .text("GO");
//              
//            }
//            else{
//              alert("Please selected nodes and edges!");
//            }
//          });


          

//remove highlighted nodes and edges
//document.body.addEventListener("click", function() {
$("#svgID")[0].addEventListener("click", function() {
    //console.log("clsvg");
    bgclick(selectedObj);
    subsetObj = {};
    subsetObj.inner = [];
    subsetObj.outer = [];
    subsetObj.links = [];
    // change all selected nodes'clickFlag  to default false
    //console.log(selectedObj.related_nodes);
    for (var i = 0; i < selectedObj.related_nodes.length; i++){
	//console.log(d3.select("#"+selectedObj.related_nodes[i]));
	if (d3.select("#"+selectedObj.related_nodes[i])[0][0] != null){
	    d3.select("#"+selectedObj.related_nodes[i]).datum().clickFlag = false;
	}
    }
    selectedObj = {};
    selectedObj.related_nodes = [];
    selectedObj.related_links = [];
    //tooltip.style("opacity", 0);
    $(".tooltip").remove();

});



    
////*************************small functions*************************
function get_tooltip(d)
{
    if (d){
	var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
	    .attr("id", d.id+'-tp')
	    .attr("title","Tool")
	    //.style("width","150px")
	    //.style("height","200px")
//	    .style("overflow","scroll")
//            .style("border-radius", "6px")
//	    .style("background-color","#fff")
//	    .style("font-family","arial, helvetica, sans-serif")
//	    .style("padding-top","5px")
//	    .style("padding-left","5px")
//	    //.style("opacity",0.9)
//            .style("position", "absolute")
            .style("z-index", "200");	
    }
    else{
	var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
	    .attr("id", 'img-tp')
	    .attr("title","Tool")
//	    .style("width","150px")
//	    .style("height","200px")
//	    .style("overflow","scroll")
//            .style("border-radius", "6px")
//	    .style("background-color","#fff")
//	    .style("font-family","arial, helvetica, sans-serif")
//	    .style("padding-top","5px")
//	    .style("padding-left","5px")
//	    .style("opacity",0.9)
//            .style("position", "absolute")
            .style("z-index", "200");
    }

            
    return tooltip;
}
    
function get_color(name)    // *** this function is not so useful for non-numeric data
{
    var c = Math.round(color(name));
    if (isNaN(c))
        return '#dddddd';	// fallback color

    return colors[c];
}

// Can't just use d3.svg.diagonal because one edge is in normal space, the
// other edge is in radial space. Since we can't just ask d3 to do projection
// of a single point, do it ourselves the same way d3 would do it.  




function nodeclick(d)
{
    // bring to front
    //should I go from data or class value???????????????????????
    if (d.clickFlag){
	d.clickFlag = !d.clickFlag;
	//console.log('double click node');
	
	    // remove selected nodes from selected object and it's related nodes
	    for (var i = 0; i < selectedObj.related_nodes.length; i++){
		if (selectedObj.related_nodes[i] == d.id){
		    removeObj.related_nodes.push(d.id);
		    selectedObj.related_nodes.splice(i,1);  //remove all clicked nodes in the selected obj

		}
	    }
	    for (var i = 0; i < d.related_nodes.length; i++){
		for (var j = 0; j < selectedObj.related_nodes.length; j++){
		    if (selectedObj.related_nodes[j] == d.related_nodes[i]){
			selectedObj.related_nodes.splice(j,1);
			removeObj.related_nodes.push(d.related_nodes[i]);
			break;   // only remove one related nodes in case another selected node share the same related nodes
		    }
		}
	    }
	    //remove edges all remove no need to consider shared edges
	    for (var i = 0; i < d.related_links.length; i++){
		for (var j = 0; j < selectedObj.related_links.length; j++){
		    if(selectedObj.related_links[j] == d.related_links[i]){
			selectedObj.related_links.splice(j,1);
			removeObj.related_links.push(d.related_links[i]);
		    }
		}
	    }
	    //console.log('remove----selected obj');
	    //console.log(removeObj);
	    //console.log(selectedObj);
	    // remove the color from double clicked nodes and its related nodes
	    // remove the color from removeObj, if element in it is not in selectedObj, make the color grey, and then empty the removeObj.
	    for (var i = 0; i < removeObj.related_nodes.length; i++){
		var flag = false; // remove the color, not in shared nodes
		for (var j = 0; j< selectedObj.related_nodes.length; j++ ){
		    if (selectedObj.related_nodes[j] == removeObj.related_nodes[i]){
			flag = true;
			//console.log('shared nodes');
			//console.log(selectedObj.related_nodes[j]);
		    }
		}
		if (flag){
		    continue;
		}
		else{
		    if (removeObj.related_nodes[i].indexOf('i')>-1){
			for (var k = 0;  k< subsetObj.inner.length; k++){
			    if (subsetObj.inner[k].id == removeObj.related_nodes[i]){
				subsetObj.inner.splice(k,1);
			    }
			}
		    }
		    else{
			for (var k = 0;  k< subsetObj.outer.length; k++){
			    if (subsetObj.outer[k].id == removeObj.related_nodes[i]){
				subsetObj.outer.splice(k,1);
			    }
			}
		    }
		    
		    d3.select("#"+removeObj.related_nodes[i]).classed('highlight', false);
		    d3.select("#"+removeObj.related_nodes[i]).attr('stroke', '#dddddd');
		}
	    }
	    // also need to remove all the edeges color of clicked one
	    for (var i = 0; i < removeObj.related_links.length; i++){
		//remove link from subsetObj
		for (var j = 0; j < subsetObj.links.length; j++){
		    if (subsetObj.links[j].id == removeObj.related_links[i]){
			subsetObj.links.splice(j,1);
		    }
		}
		//remove color of clicked node's related edges
		d3.select('#' + removeObj.related_links[i]).attr('stroke-width', link_width);
		d3.select('#' + removeObj.related_links[i]).attr('stroke', '#dddddd');
	    }
	    
	    //empty removeObj
	    removeObj.related_nodes = [];
	    removeObj.related_links = [];
	    
    }
    else{
    
        var flag_node_type = 1;  // click inner
        d3.selectAll('.links .link').sort(function(a, b){ return d.related_links.indexOf(a.id); });
        d.clickFlag = !d.clickFlag;
        if (d.id.indexOf('i')>-1){
          subsetObj.inner.push(d);  //here we need to remove the node.x  and node.y
          flag_node_type = 1;
	    }
        else{
          subsetObj.outer.push(d);
          flag_node_type = 0;
	    }
        
        if (flag_node_type){// inner node clicked, related nodes are outer nodes
	    console.log('want to check!');
	    console.log(d);
	    console.log('end!');
          for (var i = 0; i < d.related_nodes.length; i++)
	    {  // subset related nodes
		for (var j = 0; j < data.outer.length; j++){
                    if (data.outer[j].id == d.related_nodes[i]){
    		    //subset group click flag should be false???????????????????
			if (subsetObj.outer.indexOf(data.outer[j])>-1){
			    continue;
			}else{
			    subsetObj.outer.push(data.outer[j]);
			}
                      
		      //console.log('outer node---new method');
                    }
		}
		//console.log('outer node---new method');
		//console.log(d3.select('#'+d.related_nodes[i]).datum());    //don't know why it's not working
		//subsetObj.outer.push(d3.select('#'+d.related_nodes[i]).datum());
            //add nodes
    	
		selectedObj.related_nodes.push(d.related_nodes[i]);
    	
		//d3.select('#' + d.related_nodes[i]).datum().flag;
    	
		d3.select('#' + d.related_nodes[i]).classed('highlight', true);
		d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'bold');
	        
	    }
        }
        else{
            //outer node clicked
    	    
    	    for (var i = 0; i < d.related_nodes.length; i++)
    	    {
    		for (var j = 0; j < data.inner.length; j++){
    		    if (data.inner[j].id == d.related_nodes[i]){
			if (subsetObj.inner.indexOf(data.inner[j])>-1){
			    continue;
			}else{
			    subsetObj.inner.push(data.inner[j]);
			}
    			
    		    }
			}
    	      //add nodes
    		selectedObj.related_nodes.push(d.related_nodes[i]);
    		//console.log("duplicated inner node?");
    		//console.log(selectedObj.related_nodes);
		d3.select('#' + d.related_nodes[i]).classed('highlight', true);
    		d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'bold');
    		//if (d3.select('#' + d.related_nodes[i]).attr("clickFlag") == undefined){
    		//    d3.select('#' + d.related_nodes[i]).attr("clickFlag",1);
    		//}
    		//else{
    		//    d3.select('#' + d.related_nodes[i]).attr("clickFlag",(parseFloat(d3.select('#' + d.related_nodes[i]).attr("clickFlag"))+1));
    		//}
      
	    }
	

	}

        //console.log(d);
        for (var i = 0; i < d.related_links.length; i++)
        {
            for (var j = 0; j < data.links.length; j++){
              if (data.links[j].id == d.related_links[i]){
                subsetObj.links.push(data.links[j]);
              }
	    }
            selectedObj.related_links.push(d.related_links[i]);
            d3.select('#' + d.related_links[i]).attr('stroke-width', '5px');
            d3.select('#' + d.related_links[i]).attr('stroke', 'red');  // add the red color (modified by myself)
        }
        //console.log("before double click selectedObj");
        //console.log(selectedObj);
        
        }
    
    
    
    d3.event.stopPropagation();
    //console.log('subsetObj');
    //console.log(subsetObj);
}

// click background, normalize all highlighted lines of selected nodes
function bgclick(d)
{   
    if (d.related_nodes == null){
	return;
    }
    //console.log('selectedNode');
    //console.log(d);
    for (var i = 0; i < d.related_nodes.length; i++)
    {
	//console.log('relatedNodes:'+d.related_nodes[i]);
	//console.log('relatedNodes:'+d3.select('#' + d.related_nodes[i]).);
	
        d3.select('#' + d.related_nodes[i]).classed('highlight', false);
	
        d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'normal');
    }
    //console.log(d3.select(this));
    
    
    for (var i = 0; i < d.related_links.length; i++)
    {
        d3.select('#' + d.related_links[i]).attr('stroke-width', link_width);
	d3.select('#' + d.related_links[i]).attr('stroke', '#dddddd');
    }
    //console.log('I am in bgclick function');
    // //empty seleted Object
    d = {};
}

// tooltip function
function format_name(d,edge)
{
  //console.log(name)
  if (edge){
    //console.log(d);
    var menu_pop ='<div>Gene: ' + d.inner.name + '</div>'
	+ '<div> symbol: ' + d.outer.name + '</div>'
        + '<div>Link To : <a href="http://www.ncbi.nlm.nih.gov/gquery/?term=' + d.inner.name + '+' + d.outer.name + '" target = "_blank"><button>NCBI</button></a></div>'
	+ '<div>Link To : <a href="http://biotm.cis.udel.edu/udelafc/getSentencePage.php?user=liang&pass=SentencesForLiang&redirect=yes&gene=' + d.inner.name + '&term=' + d.outer.name + '" target = "_blank"><button>eGIFT</button></a></div>';
  }
  else{
    var name = d.name;
    var menu_pop ='<div> Title: ' + name + '</div>'
        + '<div>Link To : <a href="http://www.ncbi.nlm.nih.gov/gquery/?term='+name+'" target = "_blank"><button>NCBI</button></a></div>'
        + '<div>Node : <button id='+d.id+'_rm>Remove</button></div>'
	+ '<div>Label Size: <input type="text" id='+d.id+'_ls size="2"><lable> characters </lable><button id='+d.id+'_rz>Resize</button></div>';
    
  }

	   
  //remove selected nodes and related edges
  
  return  menu_pop;

  
}

    function select_Node (d){
        //get the nodes and node connected edges
        if(d.id.indexOf('i')>-1){
          for (var i = 0; i < data.inner.length; i++){
            if (data.inner[i].id == d.id){
              //console.log('match inner');
	          data.inner.splice(i,1);
            }
          }
        }
        
        
        //if outer nodes
        if(d.id.indexOf('o')>-1){
          //console.log(d.id);
	      for (var i = 0; i < data.outer.length; i++){
            //console.log(data.outer[i].id);
            if (data.outer[i].id == d.id){
              //console.log('match outer');
              
	          data.outer.splice(i,1);
            }
          }
        }
        //console.log(d.related_links);
        for (var i = 0; i < data.links.length; i++){
          //console.log(data.links[i].id);
	      for (var j = 0; j < d.related_links.length; j++){
            if (data.links[i].id == d.related_links[j]){
              data.links.splice(i,1);
            }
          }
        }
        
        d3.select("svg").remove();  //remove svg
	//$("#menuID").remove();  //remove div menu
	$(".main").remove();  //remove the old gui
        loadData(data);
        //tooltip.remove();
      }
      
    function trimLabel(label,type) {
	if (type == 'inner'){
            if (label.length > 1135) {
                return String(label).substr(0,1135) + "...";
            }
            else {
                return label;
            }
	}else{
	    if (label.length > 200) {
                return String(label).substr(0,200) + "...";
            }
            else {
                return label;
            }
	}
    }

}



